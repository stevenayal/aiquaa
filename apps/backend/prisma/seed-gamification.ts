import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const XP_RULES = [
  {
    eventType: 'ISTQB_COMPLETED',
    xpAmount: 50,
    description: 'Completar simulador ISTQB (modo EXAM)',
    dailyLimit: 3,
  },
  {
    eventType: 'ISTQB_PASSED',
    xpAmount: 100,
    description: 'Aprobar simulador ISTQB (score >= umbral de aprobación)',
    dailyLimit: 3,
  },
  {
    eventType: 'ISTQB_HIGH_SCORE',
    xpAmount: 150,
    description: 'Obtener 90% o más en simulador ISTQB',
    dailyLimit: 3,
  },
  {
    eventType: 'ALLPAIRS_GENERATED',
    xpAmount: 40,
    description: 'Generar un set de casos de prueba con All Pairs',
    dailyLimit: 5,
  },
  {
    eventType: 'ALLPAIRS_LARGE_RESULT',
    xpAmount: 80,
    description: 'Generar más de 20 combinaciones válidas con All Pairs',
    dailyLimit: 3,
  },
  {
    eventType: 'DAILY_LOGIN',
    xpAmount: 20,
    description: 'Primer uso de la plataforma en el día',
    dailyLimit: 1,
  },
  {
    eventType: 'STREAK_7_DAYS',
    xpAmount: 200,
    description: 'Racha de 7 días consecutivos de uso de la plataforma',
    dailyLimit: 1,
  },
];

const ACHIEVEMENTS = [
  {
    key: 'FIRST_SIMULATOR',
    name: 'Primer Simulador Completado',
    description: 'Completá tu primer simulador ISTQB en modo examen.',
    criteriaType: 'ISTQB_COMPLETED_COUNT',
    criteriaValue: 1,
    xpBonus: 50,
    icon: '🎯',
    category: 'ISTQB',
    difficulty: 'EASY',
  },
  {
    key: 'CERTIFICATION_ON_THE_WAY',
    name: 'Certificación en Camino',
    description: 'Aprobá 5 simuladores ISTQB. La certificación está cerca.',
    criteriaType: 'ISTQB_PASSED_COUNT',
    criteriaValue: 5,
    xpBonus: 200,
    icon: '📜',
    category: 'ISTQB',
    difficulty: 'MEDIUM',
  },
  {
    key: 'ISTQB_MASTER',
    name: 'Maestro ISTQB',
    description: 'Aprobá 20 simuladores ISTQB. Sos un experto en testing.',
    criteriaType: 'ISTQB_PASSED_COUNT',
    criteriaValue: 20,
    xpBonus: 500,
    icon: '🏆',
    category: 'ISTQB',
    difficulty: 'HARD',
  },
  {
    key: 'FIRST_ALLPAIRS',
    name: 'Primer All Pairs Generado',
    description: 'Generá tu primer set de casos de prueba con All Pairs.',
    criteriaType: 'ALLPAIRS_COUNT',
    criteriaValue: 1,
    xpBonus: 30,
    icon: '🔀',
    category: 'ALLPAIRS',
    difficulty: 'EASY',
  },
  {
    key: 'COVERAGE_STRATEGIST',
    name: 'Estratega de Cobertura',
    description: 'Generá 50 sets de casos de prueba con All Pairs.',
    criteriaType: 'ALLPAIRS_COUNT',
    criteriaValue: 50,
    xpBonus: 300,
    icon: '🗺️',
    category: 'ALLPAIRS',
    difficulty: 'MEDIUM',
  },
  {
    key: 'CASE_EXPLORER',
    name: 'Explorador de Casos',
    description: 'Generá más de 20 combinaciones en un set 10 veces.',
    criteriaType: 'ALLPAIRS_LARGE_COUNT',
    criteriaValue: 10,
    xpBonus: 150,
    icon: '🔍',
    category: 'ALLPAIRS',
    difficulty: 'MEDIUM',
  },
  {
    key: 'CONSISTENT_TESTER',
    name: 'Tester Constante',
    description:
      'Usá la plataforma 30 días distintos. La práctica hace al maestro.',
    criteriaType: 'DAILY_LOGIN_COUNT',
    criteriaValue: 30,
    xpBonus: 250,
    icon: '📅',
    category: 'STREAK',
    difficulty: 'MEDIUM',
  },
  {
    key: 'STREAK_7_DAYS',
    name: 'Racha de 7 Días',
    description: 'Usá la plataforma 7 días consecutivos.',
    criteriaType: 'STREAK_DAYS',
    criteriaValue: 7,
    xpBonus: 200,
    icon: '🔥',
    category: 'STREAK',
    difficulty: 'EASY',
  },
  {
    key: 'TOP_10_COMMUNITY',
    name: 'Top 10 Comunidad',
    description: 'Alcanzá el top 10 del ranking de la comunidad Aiquaa.',
    criteriaType: 'USER_LEVEL',
    criteriaValue: 10,
    xpBonus: 500,
    icon: '⭐',
    category: 'COMMUNITY',
    difficulty: 'HARD',
  },
  {
    key: 'QA_ON_THE_RISE',
    name: 'QA en Ascenso',
    description: 'Alcanzá el nivel 5. Tu carrera en QA está despegando.',
    criteriaType: 'USER_LEVEL',
    criteriaValue: 5,
    xpBonus: 300,
    icon: '🚀',
    category: 'GENERAL',
    difficulty: 'MEDIUM',
  },
];

export async function seedGamification() {
  console.log('🎮 Seeding gamification data...');

  // Upsert XP rules
  for (const rule of XP_RULES) {
    await prisma.xpRule.upsert({
      where: { eventType: rule.eventType },
      update: {
        xpAmount: rule.xpAmount,
        description: rule.description,
        dailyLimit: rule.dailyLimit,
      },
      create: rule,
    });
  }
  console.log(`  ✅ ${XP_RULES.length} XP rules seeded`);

  // Upsert achievements
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        name: achievement.name,
        description: achievement.description,
        criteriaType: achievement.criteriaType,
        criteriaValue: achievement.criteriaValue,
        xpBonus: achievement.xpBonus,
        icon: achievement.icon,
        category: achievement.category,
        difficulty: achievement.difficulty,
      },
      create: achievement,
    });
  }
  console.log(`  ✅ ${ACHIEVEMENTS.length} achievements seeded`);
}

// Standalone execution
if (require.main === module) {
  seedGamification()
    .catch((e) => {
      console.error('❌ Gamification seed failed:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
