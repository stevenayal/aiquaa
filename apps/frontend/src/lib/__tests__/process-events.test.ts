import { describe, expect, it } from 'vitest';
import {
  getEffectiveProcessStatus,
  isEventSort,
  isProcessFinished,
  sortEvents,
  summarizeEvent,
  type EventSummary,
} from '../process-events';

const NOW = new Date('2026-09-15T12:00:00Z').getTime();
const past = '2026-09-01T00:00:00Z';
const future = '2026-10-01T00:00:00Z';
const soon = '2026-09-20T00:00:00Z';

describe('getEffectiveProcessStatus', () => {
  it('marks active processes past their deadline as expired', () => {
    expect(
      getEffectiveProcessStatus({ status: 'active', expires_at: past }, NOW)
    ).toBe('expired');
  });

  it('keeps active processes without deadline or with future deadline', () => {
    expect(getEffectiveProcessStatus({ status: 'active' }, NOW)).toBe('active');
    expect(
      getEffectiveProcessStatus({ status: 'active', expires_at: future }, NOW)
    ).toBe('active');
  });

  it('does not touch closed or draft processes', () => {
    expect(
      getEffectiveProcessStatus({ status: 'closed', expires_at: past }, NOW)
    ).toBe('closed');
    expect(getEffectiveProcessStatus({ status: 'draft' }, NOW)).toBe('draft');
  });
});

describe('isProcessFinished', () => {
  it('treats closed and expired as finished', () => {
    expect(isProcessFinished({ status: 'closed' }, NOW)).toBe(true);
    expect(isProcessFinished({ status: 'active', expires_at: past }, NOW)).toBe(
      true
    );
    expect(isProcessFinished({ status: 'active' }, NOW)).toBe(false);
    expect(isProcessFinished({ status: 'draft' }, NOW)).toBe(false);
  });
});

describe('summarizeEvent', () => {
  it('counts statuses and finds the nearest open deadline', () => {
    const s = summarizeEvent(
      [
        { status: 'active', expires_at: future },
        { status: 'active', expires_at: soon },
        { status: 'active', expires_at: past },
        { status: 'closed' },
        { status: 'draft' },
      ],
      NOW
    );
    expect(s).toMatchObject({
      total: 5,
      open: 2,
      expired: 1,
      closed: 1,
      draft: 1,
      nextExpiry: new Date(soon).getTime(),
      finished: false,
    });
  });

  it('is finished only when every process is closed or expired', () => {
    expect(
      summarizeEvent(
        [{ status: 'closed' }, { status: 'active', expires_at: past }],
        NOW
      ).finished
    ).toBe(true);
    expect(summarizeEvent([], NOW).finished).toBe(false);
    expect(summarizeEvent([{ status: 'draft' }], NOW).finished).toBe(false);
  });
});

describe('sortEvents', () => {
  const groups = [
    { id: 'a', name: 'Bootcamp', created_at: '2026-01-01T00:00:00Z' },
    { id: 'b', name: 'alfa', created_at: '2026-03-01T00:00:00Z' },
    { id: 'c', name: 'Zeta', created_at: '2026-02-01T00:00:00Z' },
    { id: 'd', name: 'Cerrado', created_at: '2026-04-01T00:00:00Z' },
  ];
  const summaries = new Map<string, EventSummary>([
    ['a', summarizeEvent([{ status: 'active', expires_at: soon }], NOW)],
    [
      'b',
      summarizeEvent(
        [
          { status: 'active', expires_at: future },
          { status: 'active', expires_at: future },
        ],
        NOW
      ),
    ],
    ['c', summarizeEvent([{ status: 'active' }], NOW)],
    ['d', summarizeEvent([{ status: 'closed' }], NOW)],
  ]);
  const ids = (sort: Parameters<typeof sortEvents>[2]) =>
    sortEvents(groups, summaries, sort).map((g) => g.id);

  it('always puts events without open processes last', () => {
    for (const sort of [
      'recent',
      'oldest',
      'name',
      'expiry',
      'open_count',
    ] as const) {
      expect(ids(sort).at(-1)).toBe('d');
    }
  });

  it('sorts active events by the chosen criterion', () => {
    expect(ids('recent')).toEqual(['b', 'c', 'a', 'd']);
    expect(ids('oldest')).toEqual(['a', 'c', 'b', 'd']);
    expect(ids('name')).toEqual(['b', 'a', 'c', 'd']);
    expect(ids('expiry')).toEqual(['a', 'b', 'c', 'd']);
    expect(ids('open_count')).toEqual(['b', 'c', 'a', 'd']);
  });

  it('does not mutate the input', () => {
    const copy = [...groups];
    sortEvents(groups, summaries, 'name');
    expect(groups).toEqual(copy);
  });
});

describe('isEventSort', () => {
  it('validates stored preference values', () => {
    expect(isEventSort('expiry')).toBe(true);
    expect(isEventSort('nope')).toBe(false);
    expect(isEventSort(null)).toBe(false);
  });
});
