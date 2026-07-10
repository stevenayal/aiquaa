import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notifyEmpresaExamCompleted } from '../empresa-result-notifications';

const mocks = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const inFilter = vi.fn();
  const select = vi.fn();
  const from = vi.fn();
  const sendEmail = vi.fn();
  const ilike = vi.fn(() => ({
    maybeSingle,
  }));

  return {
    maybeSingle,
    inFilter,
    select,
    from,
    sendEmail,
    ilike,
  };
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mocks.from,
  }),
}));

vi.mock('@/lib/resend', () => ({
  sendEmail: mocks.sendEmail,
}));

function resetMembersQuery(data: unknown[]) {
  mocks.inFilter.mockReturnValue(Promise.resolve({ data, error: null }));
}

describe('notifyEmpresaExamCompleted', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.select.mockImplementation((columns: string) => {
      if (columns.includes('position_name')) {
        return { ilike: mocks.ilike };
      }

      return {
        eq: () => ({
          eq: () => ({
            in: mocks.inFilter,
          }),
        }),
      };
    });

    mocks.from.mockImplementation(() => ({
      select: mocks.select,
    }));
  });

  it('does nothing without a process code', async () => {
    await notifyEmpresaExamCompleted({
      examType: 'istqb',
      percentage: 90,
      passed: true,
    });

    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('emails unique owner/admin recipients for the matching process', async () => {
    mocks.maybeSingle.mockResolvedValueOnce({
      data: {
        id: 'process-1',
        empresa_id: 'empresa-1',
        position_name: 'QA Senior',
        code: 'QA-123',
        empresas: {
          razon_social: 'AIQUAA SA',
          nombre_comercial: 'AIQUAA',
        },
      },
      error: null,
    });

    resetMembersQuery([
      { profiles: { email: 'owner@aiquaa.com' } },
      { profiles: { email: 'owner@aiquaa.com' } },
      { profiles: { email: 'admin@aiquaa.com' } },
      { profiles: { email: null } },
    ]);

    await notifyEmpresaExamCompleted({
      processCode: 'qa-123',
      candidateName: 'Ana QA',
      candidateEmail: 'ana@example.com',
      examType: 'api-banking',
      percentage: 82,
      passed: true,
    });

    expect(mocks.from).toHaveBeenCalledWith('hiring_processes');
    expect(mocks.from).toHaveBeenCalledWith('empresa_miembros');
    expect(mocks.sendEmail).toHaveBeenCalledTimes(2);
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      'owner@aiquaa.com',
      expect.stringContaining('Ana QA'),
      expect.stringContaining('QA Senior')
    );
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      'admin@aiquaa.com',
      expect.stringContaining('Ana QA'),
      expect.stringContaining('QA Senior')
    );
  });
});
