import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GamificationEvent,
  AchievementCriteria,
} from './constants/xp-events.enum';
import {
  GrantXpResponseDto,
  RankingEntryDto,
  RankingResponseDto,
  UserGamificationProfileDto,
} from './dto/gamification.dto';

export interface GrantXpParams {
  userId: number;
  eventType: GamificationEvent | string;
  source: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  // AIQUAA serves a LATAM audience; daily boundaries (check-ins, streaks)
  // must be computed in Paraguay time, not UTC, or users who study at night
  // lose their streak when UTC rolls over to the next day.
  private static readonly PY_TIMEZONE = 'America/Asuncion';

  constructor(private readonly prisma: PrismaService) {}

  /** Current calendar date in Paraguay timezone as YYYY-MM-DD. */
  private paraguayDateString(date: Date = new Date()): string {
    // 'en-CA' locale formats as YYYY-MM-DD.
    return date.toLocaleDateString('en-CA', {
      timeZone: GamificationService.PY_TIMEZONE,
    });
  }

  /**
   * Level formula: level n requires 50 * n * (n-1) XP.
   * Level 1: 0 XP, Level 2: 100, Level 3: 300, Level 4: 600, Level 5: 1000, Level 10: 4500
   * Inverse: solve 50n(n-1) <= xp  →  n = floor((1 + sqrt(1 + 4*xp/50)) / 2)
   */
  calculateLevel(totalXp: number): number {
    if (totalXp <= 0) return 1;
    const n = Math.floor((1 + Math.sqrt(1 + (4 * totalXp) / 50)) / 2);
    return Math.max(1, n);
  }

  xpRequiredForLevel(level: number): number {
    return 50 * level * (level - 1);
  }

  xpToNextLevel(totalXp: number): number {
    const currentLevel = this.calculateLevel(totalXp);
    const nextLevelXp = this.xpRequiredForLevel(currentLevel + 1);
    return Math.max(0, nextLevelXp - totalXp);
  }

  async grantXp(params: GrantXpParams): Promise<GrantXpResponseDto> {
    const { userId, eventType, source, sourceId, metadata } = params;

    const rule = await this.prisma.xpRule.findFirst({
      where: { eventType, isActive: true },
    });

    if (!rule) {
      this.logger.warn(`No active XP rule for event: ${eventType}`);
      const userXp = await this.getOrCreateUserXp(userId);
      return {
        xpGranted: 0,
        newTotal: userXp.totalXp,
        newLevel: userXp.level,
        newAchievements: [],
        alreadyProcessed: false,
      };
    }

    // Idempotency: same sourceId + eventType never grants twice
    const deduplicationKey = sourceId ? `${eventType}:${sourceId}` : undefined;

    if (deduplicationKey) {
      const already = await this.prisma.xpHistory.findFirst({
        where: { userId, deduplicationKey },
      });
      if (already) {
        const userXp = await this.getOrCreateUserXp(userId);
        return {
          xpGranted: 0,
          newTotal: userXp.totalXp,
          newLevel: userXp.level,
          newAchievements: [],
          alreadyProcessed: true,
        };
      }
    }

    // Daily limit guard
    if (rule.dailyLimit !== null && rule.dailyLimit !== undefined) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const todayCount = await this.prisma.xpHistory.count({
        where: {
          userId,
          eventType,
          createdAt: { gte: todayStart, lt: tomorrowStart },
        },
      });

      if (todayCount >= rule.dailyLimit) {
        const userXp = await this.getOrCreateUserXp(userId);
        this.logger.debug(
          `Daily limit reached for ${eventType} user=${userId} (${todayCount}/${rule.dailyLimit})`
        );
        return {
          xpGranted: 0,
          newTotal: userXp.totalXp,
          newLevel: userXp.level,
          newAchievements: [],
          alreadyProcessed: false,
        };
      }
    }

    // Persist XP grant in a transaction.
    // The xpHistory insert is the source of truth for idempotency: a unique
    // constraint on (userId, deduplicationKey) makes the dedup atomic, closing
    // the race between the findFirst() check above and this write when two
    // requests arrive simultaneously (e.g. a double-click).
    let updatedUserXp;
    try {
      updatedUserXp = await this.prisma.$transaction(async (tx) => {
        await tx.xpHistory.create({
          data: {
            userId,
            xpRuleId: rule.id,
            eventType,
            xpAmount: rule.xpAmount,
            source,
            sourceId: sourceId ?? null,
            deduplicationKey: deduplicationKey ?? null,
            metadata: metadata ?? undefined,
          },
        });

        const upserted = await tx.userXp.upsert({
          where: { userId },
          create: {
            userId,
            totalXp: rule.xpAmount,
            lastActivityAt: new Date(),
            level: this.calculateLevel(rule.xpAmount),
          },
          update: {
            totalXp: { increment: rule.xpAmount },
            lastActivityAt: new Date(),
          },
        });

        const newLevel = this.calculateLevel(upserted.totalXp);
        if (newLevel !== upserted.level) {
          return tx.userXp.update({
            where: { userId },
            data: { level: newLevel },
          });
        }
        return upserted;
      });
    } catch (error: any) {
      // P2002 = unique constraint violation: a concurrent request already
      // granted this exact event. Treat it as an idempotent no-op.
      if (error?.code === 'P2002' && deduplicationKey) {
        const userXp = await this.getOrCreateUserXp(userId);
        this.logger.debug(
          `Duplicate XP grant ignored (race): user=${userId} key=${deduplicationKey}`
        );
        return {
          xpGranted: 0,
          newTotal: userXp.totalXp,
          newLevel: userXp.level,
          newAchievements: [],
          alreadyProcessed: true,
        };
      }
      throw error;
    }

    this.logger.log(
      `XP granted: user=${userId} event=${eventType} xp=${rule.xpAmount} total=${updatedUserXp.totalXp}`
    );

    // Check achievements after XP grant (non-blocking path for caller)
    const newAchievements = await this.checkAndGrantAchievements(
      userId,
      eventType
    );

    return {
      xpGranted: rule.xpAmount,
      newTotal: updatedUserXp.totalXp,
      newLevel: updatedUserXp.level,
      newAchievements,
      alreadyProcessed: false,
    };
  }

  async processDailyCheckin(userId: number): Promise<{
    xpGranted: number;
    newTotal: number;
    newLevel: number;
    currentStreak: number;
    newAchievements: any[];
    alreadyCheckedIn: boolean;
  }> {
    const today = this.paraguayDateString(); // YYYY-MM-DD in Paraguay time
    const deduplicationKey = `${GamificationEvent.DAILY_LOGIN}:${today}`;

    const already = await this.prisma.xpHistory.findFirst({
      where: { userId, deduplicationKey },
    });

    if (already) {
      const userXp = await this.getOrCreateUserXp(userId);
      return {
        xpGranted: 0,
        newTotal: userXp.totalXp,
        newLevel: userXp.level,
        currentStreak: userXp.currentStreak,
        newAchievements: [],
        alreadyCheckedIn: true,
      };
    }

    // Update streak
    const userXp = await this.getOrCreateUserXp(userId);
    const newStreak = this.computeNewStreak(
      userXp.lastActivityAt,
      userXp.currentStreak
    );

    await this.prisma.userXp.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(userXp.longestStreak, newStreak),
      },
    });

    // Grant daily XP
    const result = await this.grantXp({
      userId,
      eventType: GamificationEvent.DAILY_LOGIN,
      source: 'PLATFORM',
      sourceId: today,
    });

    // Streak milestone bonus
    let streakAchievements: any[] = [];
    if (newStreak >= 7) {
      const weekKey = `week-${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))}`;
      const streakResult = await this.grantXp({
        userId,
        eventType: GamificationEvent.STREAK_7_DAYS,
        source: 'PLATFORM',
        sourceId: weekKey,
      });
      streakAchievements = streakResult.newAchievements;
    }

    const finalUserXp = await this.getOrCreateUserXp(userId);

    return {
      xpGranted: result.xpGranted,
      newTotal: finalUserXp.totalXp,
      newLevel: finalUserXp.level,
      currentStreak: newStreak,
      newAchievements: [...result.newAchievements, ...streakAchievements],
      alreadyCheckedIn: false,
    };
  }

  private computeNewStreak(
    lastActivityAt: Date | null,
    currentStreak: number
  ): number {
    if (!lastActivityAt) return 1;

    // Compare calendar days in Paraguay time so a session at 21:00 PY (00:00
    // UTC next day) still counts as "today" and doesn't break the streak.
    const todayStr = this.paraguayDateString();
    const lastStr = this.paraguayDateString(new Date(lastActivityAt));

    if (lastStr === todayStr) {
      return currentStreak; // same day, keep streak
    }

    const diffDays = Math.round(
      (Date.parse(`${todayStr}T00:00:00Z`) -
        Date.parse(`${lastStr}T00:00:00Z`)) /
        86_400_000
    );

    if (diffDays === 1) {
      return currentStreak + 1; // consecutive day
    }
    return 1; // gap > 1 day (or clock skew), reset
  }

  private async checkAndGrantAchievements(
    userId: number,
    triggeredByEventType: string
  ): Promise<any[]> {
    try {
      const [achievements, unlocked] = await Promise.all([
        this.prisma.achievement.findMany({ where: { isActive: true } }),
        this.prisma.userAchievement.findMany({
          where: { userId },
          select: { achievementId: true },
        }),
      ]);

      const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
      const locked = achievements.filter((a) => !unlockedIds.has(a.id));
      if (locked.length === 0) return [];

      const [
        userXp,
        istqbCompletedCount,
        istqbPassedCount,
        allpairsCount,
        allpairsLargeCount,
        loginCount,
      ] = await Promise.all([
        this.prisma.userXp.findUnique({ where: { userId } }),
        this.prisma.xpHistory.count({
          where: { userId, eventType: GamificationEvent.ISTQB_COMPLETED },
        }),
        this.prisma.xpHistory.count({
          where: { userId, eventType: GamificationEvent.ISTQB_PASSED },
        }),
        this.prisma.xpHistory.count({
          where: { userId, eventType: GamificationEvent.ALLPAIRS_GENERATED },
        }),
        this.prisma.xpHistory.count({
          where: { userId, eventType: GamificationEvent.ALLPAIRS_LARGE_RESULT },
        }),
        this.prisma.xpHistory.count({
          where: { userId, eventType: GamificationEvent.DAILY_LOGIN },
        }),
      ]);

      const stats: Record<string, number> = {
        [AchievementCriteria.ISTQB_COMPLETED_COUNT]: istqbCompletedCount,
        [AchievementCriteria.ISTQB_PASSED_COUNT]: istqbPassedCount,
        [AchievementCriteria.ALLPAIRS_COUNT]: allpairsCount,
        [AchievementCriteria.ALLPAIRS_LARGE_COUNT]: allpairsLargeCount,
        [AchievementCriteria.DAILY_LOGIN_COUNT]: loginCount,
        [AchievementCriteria.STREAK_DAYS]: userXp?.currentStreak ?? 0,
        [AchievementCriteria.USER_LEVEL]: userXp?.level ?? 1,
      };

      const newlyUnlocked: any[] = [];

      for (const achievement of locked) {
        const statValue = stats[achievement.criteriaType] ?? 0;
        const meets =
          achievement.criteriaValue !== null &&
          achievement.criteriaValue !== undefined &&
          statValue >= achievement.criteriaValue;

        if (!meets) continue;

        try {
          const userAchievement = await this.prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              source: triggeredByEventType,
              xpAwarded: achievement.xpBonus,
            },
            include: { achievement: true },
          });

          this.logger.log(
            `Achievement unlocked: user=${userId} achievement=${achievement.key}`
          );

          // Grant bonus XP for achievement (idempotent via dedup key)
          if (achievement.xpBonus > 0) {
            await this.prisma.$transaction(async (tx) => {
              const deduplicationKey = `${GamificationEvent.ACHIEVEMENT_BONUS}:${achievement.id}`;
              const already = await tx.xpHistory.findFirst({
                where: { userId, deduplicationKey },
              });
              if (already) return;

              await tx.xpHistory.create({
                data: {
                  userId,
                  eventType: GamificationEvent.ACHIEVEMENT_BONUS,
                  xpAmount: achievement.xpBonus,
                  source: 'ACHIEVEMENT',
                  sourceId: achievement.id.toString(),
                  deduplicationKey,
                },
              });

              const updated = await tx.userXp.upsert({
                where: { userId },
                create: { userId, totalXp: achievement.xpBonus },
                update: { totalXp: { increment: achievement.xpBonus } },
              });

              const newLevel = this.calculateLevel(updated.totalXp);
              await tx.userXp.update({
                where: { userId },
                data: { level: newLevel },
              });
            });
          }

          newlyUnlocked.push(userAchievement);
        } catch (err: any) {
          // Race condition: another process already granted it — safe to ignore
          if (err?.code !== 'P2002') {
            this.logger.error(
              `Failed to grant achievement ${achievement.key}: ${err.message}`
            );
          }
        }
      }

      return newlyUnlocked;
    } catch (err: any) {
      // Achievement check failures must never break the main XP flow
      this.logger.error(
        `Achievement check failed for user=${userId}: ${err.message}`
      );
      return [];
    }
  }

  async getUserProfile(userId: number): Promise<UserGamificationProfileDto> {
    const [userXp, achievementCount, recentAchievements, recentXp] =
      await Promise.all([
        this.getOrCreateUserXp(userId),
        this.prisma.userAchievement.count({ where: { userId } }),
        this.prisma.userAchievement.findMany({
          where: { userId },
          orderBy: { unlockedAt: 'desc' },
          take: 5,
          include: {
            achievement: {
              select: {
                name: true,
                icon: true,
                category: true,
                difficulty: true,
              },
            },
          },
        }),
        this.prisma.xpHistory.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            eventType: true,
            xpAmount: true,
            source: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      totalXp: userXp.totalXp,
      level: userXp.level,
      xpToNextLevel: this.xpToNextLevel(userXp.totalXp),
      currentStreak: userXp.currentStreak,
      longestStreak: userXp.longestStreak,
      lastActivityAt: userXp.lastActivityAt,
      achievementCount,
      recentAchievements,
      recentXp,
    };
  }

  async getPublicRanking(
    page: number = 1,
    limit: number = 50
  ): Promise<RankingResponseDto> {
    // Cap limit to prevent abuse
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [total, entries] = await Promise.all([
      this.prisma.userXp.count({
        where: { user: { deletedAt: null } },
      }),
      this.prisma.userXp.findMany({
        where: { user: { deletedAt: null } },
        orderBy: { totalXp: 'desc' },
        skip,
        take: safeLimit,
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      }),
    ]);

    // Fetch achievement counts in a single batch query
    const userIds = entries.map((e) => e.userId);
    const achievementCounts = await this.prisma.userAchievement.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: { achievementId: true },
    });
    const countMap = new Map(
      achievementCounts.map((c) => [c.userId, c._count.achievementId])
    );

    // Fetch main badge (first achievement by difficulty: LEGENDARY > HARD > MEDIUM > EASY)
    const mainBadges = await this.prisma.userAchievement.findMany({
      where: { userId: { in: userIds } },
      include: { achievement: { select: { icon: true, difficulty: true } } },
      orderBy: { achievement: { difficulty: 'desc' } },
      distinct: ['userId'],
    });
    const badgeMap = new Map(
      mainBadges.map((b) => [b.userId, b.achievement.icon])
    );

    const data: RankingEntryDto[] = entries.map((entry, index) => ({
      position: skip + index + 1,
      displayName: entry.user.name ?? 'Anónimo',
      avatarUrl: entry.user.avatarUrl,
      totalXp: entry.totalXp,
      level: entry.level,
      achievementCount: countMap.get(entry.userId) ?? 0,
      lastActivityAt: entry.lastActivityAt,
      mainBadge: badgeMap.get(entry.userId) ?? null,
    }));

    return {
      data,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  private async getOrCreateUserXp(userId: number) {
    return this.prisma.userXp.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }
}
