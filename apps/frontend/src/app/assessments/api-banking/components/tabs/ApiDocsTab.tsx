import { EndpointCard } from '../EndpointCard';
import {
  getApiChallengeTarget,
  type ApiChallengeTargetId,
} from '../../data/apiChallengeTargets';

interface Props {
  apiTarget: ApiChallengeTargetId;
}

export function ApiDocsTab({ apiTarget }: Props) {
  const target = getApiChallengeTarget(apiTarget);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Base URL:{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
              {target.baseUrl}
            </code>
          </p>
          <a
            href={target.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Abrir documentacion oficial
          </a>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {target.recommendedFor}
        </p>
        {target.apiKeyNote && (
          <p className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/10 dark:text-blue-300">
            {target.apiKeyNote}
          </p>
        )}
      </div>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Endpoints sugeridos
        </h2>
        <div className="space-y-2">
          {target.endpoints.map((ep) => (
            <EndpointCard key={`${ep.method}-${ep.path}`} {...ep} />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Requests de referencia
        </h2>
        <div className="space-y-1">
          {target.sampleRequests.map((request) => (
            <code
              key={request}
              className="block rounded bg-slate-100 px-2 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {request}
            </code>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Como se evalua tu evidencia
        </h2>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
          {target.evaluationHints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
