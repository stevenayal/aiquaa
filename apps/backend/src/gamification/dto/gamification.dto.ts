import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TrackAllPairsDto {
  @ApiProperty({
    description: 'Número de combinaciones generadas',
    example: 25,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  combinationsCount!: number;
}

export class DailyCheckinResponseDto {
  @ApiProperty()
  xpGranted!: number;

  @ApiProperty()
  newTotal!: number;

  @ApiProperty()
  newLevel!: number;

  @ApiProperty()
  currentStreak!: number;

  @ApiProperty({ type: [Object] })
  newAchievements!: any[];

  @ApiProperty()
  alreadyCheckedIn!: boolean;
}

export class RankingEntryDto {
  @ApiProperty()
  position!: number;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty()
  totalXp!: number;

  @ApiProperty()
  level!: number;

  @ApiProperty()
  achievementCount!: number;

  @ApiPropertyOptional({ nullable: true })
  lastActivityAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  mainBadge!: string | null;
}

export class RankingResponseDto {
  @ApiProperty({ type: [RankingEntryDto] })
  data!: RankingEntryDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  totalPages!: number;
}

export class UserGamificationProfileDto {
  @ApiProperty()
  totalXp!: number;

  @ApiProperty()
  level!: number;

  @ApiProperty()
  xpToNextLevel!: number;

  @ApiProperty()
  currentStreak!: number;

  @ApiProperty()
  longestStreak!: number;

  @ApiPropertyOptional({ nullable: true })
  lastActivityAt!: Date | null;

  @ApiProperty()
  achievementCount!: number;

  @ApiProperty({ type: [Object] })
  recentAchievements!: any[];

  @ApiProperty({ type: [Object] })
  recentXp!: any[];
}

export class GrantXpResponseDto {
  @ApiProperty()
  xpGranted!: number;

  @ApiProperty()
  newTotal!: number;

  @ApiProperty()
  newLevel!: number;

  @ApiProperty({ type: [Object] })
  newAchievements!: any[];

  @ApiProperty()
  alreadyProcessed!: boolean;
}

export class RankingQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50;
}
