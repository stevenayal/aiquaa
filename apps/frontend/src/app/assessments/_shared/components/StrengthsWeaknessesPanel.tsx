'use client';

export default function StrengthsWeaknessesPanel({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'strength' | 'weakness' | 'recommendation';
}) {
  const palette =
    tone === 'strength'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50'
      : tone === 'weakness'
        ? 'border-amber-500/20 bg-amber-500/10 text-amber-50'
        : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-50';

  return (
    <div className={`rounded-3xl border p-5 ${palette}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-slate-950/30 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
