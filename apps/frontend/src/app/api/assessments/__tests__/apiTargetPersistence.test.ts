import { describe, expect, it } from 'vitest';
import {
  insertAttemptWithApiTargetFallback,
  isMissingApiTargetColumnError,
  selectAttemptForSubmitWithApiTargetFallback,
} from '../_lib/apiTargetPersistence';

const missingApiTargetError = {
  code: 'PGRST204',
  message:
    "Could not find the 'api_target' column of 'qac_attempts' in the schema cache",
};

describe('apiTargetPersistence', () => {
  it('detects missing api_target column errors from Supabase', () => {
    expect(isMissingApiTargetColumnError(missingApiTargetError)).toBe(true);
    expect(
      isMissingApiTargetColumnError({
        code: '42703',
        message: 'column qac_attempts.api_target does not exist',
      })
    ).toBe(true);
    expect(
      isMissingApiTargetColumnError({
        code: 'PGRST204',
        message: "Could not find the 'other_column' column",
      })
    ).toBe(false);
  });

  it('retries attempt creation without api_target when the deployed schema is stale', async () => {
    const insertedPayloads: Record<string, unknown>[] = [];
    const responses = [
      { data: null, error: missingApiTargetError },
      { data: { id: 123 }, error: null },
    ];
    const supabase = {
      from: () => ({
        insert: (payload: Record<string, unknown>) => {
          insertedPayloads.push(payload);
          return {
            select: () => ({
              single: async () => responses.shift(),
            }),
          };
        },
      }),
    } as any;

    const result = await insertAttemptWithApiTargetFallback(supabase, {
      catalog_id: 1,
      candidate_name: 'Ada QA',
      api_target: 'nasa',
      status: 'in_progress',
    });

    expect(result.data).toEqual({ id: 123 });
    expect(insertedPayloads).toHaveLength(2);
    expect(insertedPayloads[0].api_target).toBe('nasa');
    expect(insertedPayloads[1]).not.toHaveProperty('api_target');
  });

  it('does not retry attempt creation for unrelated insert errors', async () => {
    const insertedPayloads: Record<string, unknown>[] = [];
    const supabase = {
      from: () => ({
        insert: (payload: Record<string, unknown>) => {
          insertedPayloads.push(payload);
          return {
            select: () => ({
              single: async () => ({
                data: null,
                error: { code: '23503', message: 'foreign key violation' },
              }),
            }),
          };
        },
      }),
    } as any;

    const result = await insertAttemptWithApiTargetFallback(supabase, {
      catalog_id: 999,
      candidate_name: 'Ada QA',
      api_target: 'rick-and-morty',
    });

    expect(result.error?.code).toBe('23503');
    expect(insertedPayloads).toHaveLength(1);
  });

  it('retries submit attempt lookup without api_target for legacy schemas', async () => {
    const selectedColumns: string[] = [];
    const responses = [
      { data: null, error: missingApiTargetError },
      {
        data: {
          id: 123,
          status: 'in_progress',
          process_code: null,
        },
        error: null,
      },
    ];
    const supabase = {
      from: () => ({
        select: (columns: string) => {
          selectedColumns.push(columns);
          return {
            eq: () => ({
              single: async () => responses.shift(),
            }),
          };
        },
      }),
    } as any;

    const result = await selectAttemptForSubmitWithApiTargetFallback(
      supabase,
      123
    );

    expect(result.data?.id).toBe(123);
    expect(selectedColumns).toHaveLength(2);
    expect(selectedColumns[0]).toContain('api_target');
    expect(selectedColumns[1]).not.toContain('api_target');
  });
});
