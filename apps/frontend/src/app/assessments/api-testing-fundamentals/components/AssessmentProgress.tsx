'use client';

import type { AssessmentSection, AssessmentSectionScore } from '../types';

export default function AssessmentProgress({
  sections,
  currentSectionSlug,
  scores,
}: {
  sections: AssessmentSection[];
  currentSectionSlug: string;
  scores: AssessmentSectionScore[];
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Progreso del assessment
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Cada nivel se guarda por separado y se corrige al enviarlo.
          </p>
        </div>
        <div className="text-right text-sm text-slate-300">
          {scores.length}/{sections.length} niveles corregidos
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {sections.map((section) => {
          const sectionScore = scores.find(
            (score) => score.section_id === section.id
          );
          const isCurrent = section.slug === currentSectionSlug;

          return (
            <div
              key={section.id}
              className={`rounded-2xl border px-4 py-3 ${
                isCurrent
                  ? 'border-cyan-400/40 bg-cyan-400/10'
                  : sectionScore
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Nivel {section.order_index}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-100">
                {section.title.replace(/^Nivel \d+:\s*/, '')}
              </h3>
              <p className="mt-2 text-xs text-slate-400">
                {sectionScore
                  ? `${sectionScore.score}/${section.max_score} pts`
                  : `${section.max_score} pts`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
