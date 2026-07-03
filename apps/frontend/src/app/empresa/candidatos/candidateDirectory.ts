export type CandidateProfile = {
  id: string;
  display_name: string | null;
  email?: string | null;
  role?: string | null;
  country?: string | null;
  istqb_level?: string | null;
  github_profile?: string | null;
  qa_skills?: string[] | null;
  disponibilidad?: CandidateAvailability | null;
  open_to_work?: boolean | null;
  talent_visible_to_empresas?: boolean | null;
};

export type CandidateAvailability = 'activo' | 'pasivo' | 'no_disponible';

export type CandidateResult = {
  id: string;
  user_id: string | null;
  participant_name: string | null;
  participant_email: string | null;
  exam_type: string;
  percentage: number;
  passed: boolean;
  created_at: string;
};

export type FavoriteRow = {
  id: string;
  candidate_id: string;
  notes: string | null;
  created_at: string;
};

export type TalentCandidate = {
  userId: string;
  name: string;
  contactEmail?: string | null;
  role: string | null;
  country: string | null;
  istqbLevel: string | null;
  githubProfile: string | null;
  qaSkills: string[];
  disponibilidad: CandidateAvailability;
  visibleToEmpresas: boolean;
  bestScore: number;
  bestExamType: string;
  passedAssessments: number;
  totalAssessments: number;
  lastActivityAt: string;
  favoriteId: string | null;
  favoriteCreatedAt: string | null;
  favoriteNotes: string | null;
};

export type TalentCandidateFilters = {
  search?: string;
  istqbLevel?: string;
  country?: string;
  availability?: CandidateAvailability | 'all';
  skills?: string[];
};

export const QA_SKILL_OPTIONS = [
  'Selenium',
  'Cypress',
  'Playwright',
  'Postman',
  'k6',
  'JMeter',
  'SQL',
  'API Testing',
  'Exploratory Testing',
  'Git',
  'CI/CD',
];

export const AVAILABILITY_LABELS: Record<CandidateAvailability, string> = {
  activo: 'Activo',
  pasivo: 'Pasivo',
  no_disponible: 'No disponible',
};

export function getCandidateKey(result: CandidateResult) {
  return result.user_id ?? result.participant_email ?? result.id;
}

export function buildFavoriteMap(favorites: FavoriteRow[]) {
  return new Map(
    favorites.map((favorite) => [favorite.candidate_id, favorite])
  );
}

export function buildTalentDirectory(
  results: CandidateResult[],
  profiles: CandidateProfile[],
  favorites: FavoriteRow[] = []
) {
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const favoriteMap = buildFavoriteMap(favorites);
  const grouped = new Map<string, CandidateResult[]>();

  for (const result of results) {
    if (!result.user_id) continue;
    const profile = profileMap.get(result.user_id);
    if (!profile?.talent_visible_to_empresas) continue;

    const rows = grouped.get(result.user_id) ?? [];
    rows.push(result);
    grouped.set(result.user_id, rows);
  }

  return Array.from(grouped.entries())
    .map(([userId, candidateResults]) => {
      const profile = profileMap.get(userId)!;
      const sorted = [...candidateResults].sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      const best = sorted[0];
      const favorite = favoriteMap.get(userId) ?? null;

      return {
        userId,
        name: profile.display_name || best.participant_name || 'Sin nombre',
        role: profile.role ?? null,
        country: profile.country ?? null,
        istqbLevel: profile.istqb_level ?? null,
        githubProfile: profile.github_profile ?? null,
        qaSkills: profile.qa_skills ?? [],
        disponibilidad:
          profile.disponibilidad ??
          (profile.open_to_work ? 'activo' : 'no_disponible'),
        visibleToEmpresas: Boolean(profile.talent_visible_to_empresas),
        bestScore: Number(best.percentage ?? 0),
        bestExamType: best.exam_type,
        passedAssessments: candidateResults.filter((result) => result.passed)
          .length,
        totalAssessments: candidateResults.length,
        lastActivityAt: candidateResults.reduce(
          (latest, result) =>
            new Date(result.created_at).getTime() > new Date(latest).getTime()
              ? result.created_at
              : latest,
          best.created_at
        ),
        favoriteId: favorite?.id ?? null,
        favoriteCreatedAt: favorite?.created_at ?? null,
        favoriteNotes: favorite?.notes ?? null,
      } satisfies TalentCandidate;
    })
    .sort((a, b) => {
      const availabilityRank: Record<CandidateAvailability, number> = {
        activo: 0,
        pasivo: 1,
        no_disponible: 2,
      };
      if (
        availabilityRank[a.disponibilidad] !==
        availabilityRank[b.disponibilidad]
      ) {
        return (
          availabilityRank[a.disponibilidad] -
          availabilityRank[b.disponibilidad]
        );
      }
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      return (
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime()
      );
    });
}

export function filterTalentCandidates(
  candidates: TalentCandidate[],
  filters: TalentCandidateFilters
) {
  const query = filters.search?.trim().toLowerCase();
  const skills = filters.skills?.filter(Boolean) ?? [];

  return candidates.filter((candidate) => {
    const matchesSearch =
      !query ||
      candidate.name.toLowerCase().includes(query) ||
      (candidate.role?.toLowerCase().includes(query) ?? false) ||
      (candidate.country?.toLowerCase().includes(query) ?? false) ||
      (candidate.istqbLevel?.toLowerCase().includes(query) ?? false) ||
      candidate.qaSkills.some((skill) => skill.toLowerCase().includes(query));
    const matchesLevel =
      !filters.istqbLevel ||
      filters.istqbLevel === 'all' ||
      candidate.istqbLevel === filters.istqbLevel;
    const matchesCountry =
      !filters.country ||
      filters.country === 'all' ||
      candidate.country === filters.country;
    const matchesAvailability =
      !filters.availability ||
      filters.availability === 'all' ||
      candidate.disponibilidad === filters.availability;
    const matchesSkills =
      skills.length === 0 ||
      skills.some((skill) => candidate.qaSkills.includes(skill));

    return (
      matchesSearch &&
      matchesLevel &&
      matchesCountry &&
      matchesAvailability &&
      matchesSkills
    );
  });
}
