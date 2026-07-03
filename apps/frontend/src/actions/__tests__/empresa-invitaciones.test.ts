import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInvitacionToCandidateAction } from '../empresa-invitaciones';

const getUser = vi.fn();
const singleResponses: unknown[] = [];
const maybeSingleResponses: unknown[] = [];
const inserts: unknown[] = [];

vi.mock('@/lib/resend', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser,
    },
    from: (table: string) => {
      const builder = {
        table,
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        in: vi.fn(() => builder),
        order: vi.fn(() => builder),
        insert: vi.fn((payload: unknown) => {
          inserts.push(payload);
          return builder;
        }),
        update: vi.fn(() => builder),
        delete: vi.fn(() => builder),
        single: vi.fn(() => singleResponses.shift()),
        maybeSingle: vi.fn(() => maybeSingleResponses.shift()),
      };
      return builder;
    },
  }),
}));

function ok<T>(data: T) {
  return { data, error: null };
}

function authUser() {
  getUser.mockResolvedValue({
    data: { user: { id: 'empresa-user' } },
    error: null,
  });
}

describe('createInvitacionToCandidateAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleResponses.length = 0;
    maybeSingleResponses.length = 0;
    inserts.length = 0;
    authUser();
  });

  it('creates an invitation by visible candidate id without exposing email to the caller', async () => {
    singleResponses.push(
      ok({ empresa_id: 'empresa-1', role: 'admin' }),
      ok({ empresa_id: 'empresa-1', role: 'admin' }),
      ok({
        id: 'invite-1',
        empresa_id: 'empresa-1',
        process_id: null,
        invited_by: 'empresa-user',
        candidate_id: 'candidate-1',
        candidate_email: 'ana@example.com',
        candidate_name: 'Ana QA',
        message: null,
        status: 'pendiente',
        token: 'token-1',
        sent_at: '2026-07-02T00:00:00Z',
        viewed_at: null,
        completed_at: null,
        email_sent: false,
        email_error: null,
        created_at: '2026-07-02T00:00:00Z',
      })
    );
    maybeSingleResponses.push(
      ok({
        id: 'candidate-1',
        email: 'ana@example.com',
        display_name: 'Ana QA',
        full_name: null,
      }),
      ok(null)
    );

    const result = await createInvitacionToCandidateAction({
      candidate_id: 'candidate-1',
    });

    expect(result.error).toBeNull();
    expect(result.data?.candidate_id).toBe('candidate-1');
    expect(inserts[0]).toMatchObject({
      candidate_id: 'candidate-1',
      candidate_email: 'ana@example.com',
    });
  });

  it('rejects users without active company membership', async () => {
    singleResponses.push(ok(null));

    const result = await createInvitacionToCandidateAction({
      candidate_id: 'candidate-1',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Sin membresia activa');
    expect(inserts).toHaveLength(0);
  });

  it('rejects candidates that are not visible to companies', async () => {
    singleResponses.push(ok({ empresa_id: 'empresa-1', role: 'admin' }));
    maybeSingleResponses.push(ok(null));

    const result = await createInvitacionToCandidateAction({
      candidate_id: 'candidate-1',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Candidato no disponible para invitacion');
    expect(inserts).toHaveLength(0);
  });

  it('rejects duplicate active invitations', async () => {
    singleResponses.push(
      ok({ empresa_id: 'empresa-1', role: 'admin' }),
      ok({ empresa_id: 'empresa-1', role: 'admin' })
    );
    maybeSingleResponses.push(
      ok({
        id: 'candidate-1',
        email: 'ana@example.com',
        display_name: 'Ana QA',
        full_name: null,
      }),
      ok({ id: 'invite-1', status: 'pendiente' })
    );

    const result = await createInvitacionToCandidateAction({
      candidate_id: 'candidate-1',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe(
      'Ya existe una invitacion activa para ese candidato'
    );
    expect(inserts).toHaveLength(0);
  });
});
