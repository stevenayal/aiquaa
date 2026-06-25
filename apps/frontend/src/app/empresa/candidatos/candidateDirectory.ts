export type CandidateProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
  role?: string | null;
  country?: string | null;
  istqb_level?: string | null;
  github_profile?: string | null;
  open_to_work?: boolean | null;
  talent_visible_to_empresas?: boolean | null;
};

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
  email: string | null;
  role: string | null;
  country: string | null;
  istqbLevel: string | null;
  githubProfile: string | null;
  openToWork: boolean;
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
        name:
          profile.display_name ||
          best.participant_name ||
          profile.email ||
          best.participant_email ||
          'Sin nombre',
        email: profile.email ?? best.participant_email ?? null,
        role: profile.role ?? null,
        country: profile.country ?? null,
        istqbLevel: profile.istqb_level ?? null,
        githubProfile: profile.github_profile ?? null,
        openToWork: Boolean(profile.open_to_work),
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
      if (Number(b.openToWork) !== Number(a.openToWork)) {
        return Number(b.openToWork) - Number(a.openToWork);
      }
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      return (
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime()
      );
    });
}
