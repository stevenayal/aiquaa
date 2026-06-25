'use client';

import { useState } from 'react';
import { Timer } from './Timer';
import { OverviewTab } from './tabs/OverviewTab';
import { ApiDocsTab } from './tabs/ApiDocsTab';
import { TestCasesTab } from './tabs/TestCasesTab';
import { BugReportsTab } from './tabs/BugReportsTab';
import { SummaryTab } from './tabs/SummaryTab';
import { SubmitTab } from './tabs/SubmitTab';
import { useAttempt } from '../hooks/useAttempt';
import { API_CHALLENGE_MIN_SUMMARY_CHARS } from '../data/apiChallengeTargets';

const LEFT_TABS = ['Overview', 'API Docs'] as const;
const RIGHT_TABS = ['Test Cases', 'Hallazgos', 'Resumen', 'Enviar'] as const;

type LeftTab = (typeof LEFT_TABS)[number];
type RightTab = (typeof RIGHT_TABS)[number];

export function ChallengeLayout() {
  const [leftTab, setLeftTab] = useState<LeftTab>('Overview');
  const [rightTab, setRightTab] = useState<RightTab>('Test Cases');
  const attempt = useAttempt();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            API Testing Challenge
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
            Semi Senior
          </span>
        </div>
        <div className="flex items-center gap-3">
          {attempt.candidateName && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {attempt.candidateName}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>⏱</span>
            <Timer
              startedAt={attempt.startedAt ?? undefined}
              warnAtMinutes={100}
            />
          </div>
          <div className="text-xs text-slate-400 flex gap-2">
            <span>{attempt.testCases.length} casos</span>
            <span>{attempt.bugReports.length} bugs</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[40%] min-w-[300px] flex flex-col border-r border-slate-200 dark:border-slate-700">
          <div className="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
            {LEFT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  leftTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {leftTab === 'Overview' && (
              <OverviewTab apiTarget={attempt.apiTarget} />
            )}
            {leftTab === 'API Docs' && (
              <ApiDocsTab apiTarget={attempt.apiTarget} />
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
            {RIGHT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  rightTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
                {tab === 'Test Cases' && attempt.testCases.length > 0 && (
                  <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full px-1">
                    {attempt.testCases.length}
                  </span>
                )}
                {tab === 'Hallazgos' && attempt.bugReports.length > 0 && (
                  <span className="ml-1 text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full px-1">
                    {attempt.bugReports.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {rightTab === 'Test Cases' && (
              <TestCasesTab
                testCases={attempt.testCases}
                onAdd={attempt.addTestCase}
                onRemove={attempt.removeTestCase}
              />
            )}
            {rightTab === 'Hallazgos' && (
              <BugReportsTab
                apiTarget={attempt.apiTarget}
                bugReports={attempt.bugReports}
                onAdd={attempt.addBugReport}
                onRemove={attempt.removeBugReport}
              />
            )}
            {rightTab === 'Resumen' && (
              <SummaryTab
                summary={attempt.summary}
                onChange={attempt.setSummary}
              />
            )}
            {rightTab === 'Enviar' && (
              <SubmitTab
                attemptId={attempt.attemptId}
                testCasesCount={attempt.testCases.length}
                bugReportsCount={attempt.bugReports.length}
                hasSummary={
                  attempt.summary.trim().length >=
                  API_CHALLENGE_MIN_SUMMARY_CHARS
                }
                onSubmit={attempt.submit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
