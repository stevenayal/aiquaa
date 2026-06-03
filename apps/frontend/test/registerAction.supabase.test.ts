import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

function makeSupabaseMock(signUpResult: object) {
  const signUp = vi.fn().mockResolvedValue(signUpResult);
  // createClient es async en la versión actual del proyecto
  vi.mocked(createClient).mockResolvedValue({ auth: { signUp } } as never);
  return { signUp };
}

async function importAction() {
  const mod = await import('@/actions/auth');
  return mod.registerAction;
}

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const BASE_CANDIDATO = {
  email: 'juan@test.com',
  password: 'Pass1234',
  name: 'Juan',
  audience: 'candidato',
  role: 'qa_junior',
};

const BASE_EMPRESA = {
  email: 'hr@acme.com',
  password: 'Pass1234',
  name: 'María',
  audience: 'empresa',
  companyName: 'Acme SA',
  ruc: '80000001-1',
};

describe('registerAction — integración Supabase', () => {
  let registerAction: (fd: FormData) => Promise<{ success?: boolean; message?: string; error?: string } | undefined>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    registerAction = await importAction();
  });

  // ── Candidato ──────────────────────────────────────────────────────────────

  describe('candidato', () => {
    it('llama signUp con audience candidato sin company_name ni ruc', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData(BASE_CANDIDATO));

      expect(signUp).toHaveBeenCalledOnce();
      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.audience).toBe('candidato');
      expect(options.data.company_name).toBeUndefined();
      expect(options.data.ruc).toBeUndefined();
    });

    it('incluye role "comunidad" en metadata', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData({ ...BASE_CANDIDATO, role: 'comunidad' }));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.role).toBe('comunidad');
    });

    it('incluye role "admin" en metadata', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData({ ...BASE_CANDIDATO, role: 'admin' }));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.role).toBe('admin');
    });

    it('NO incluye role para qa_junior (no especial)', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData(BASE_CANDIDATO));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.role).toBeUndefined();
    });

    it('NO incluye role para qa_senior (no especial)', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData({ ...BASE_CANDIDATO, role: 'qa_senior' }));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.role).toBeUndefined();
    });
  });

  // ── Empresa ────────────────────────────────────────────────────────────────

  describe('empresa', () => {
    it('llama signUp con audience empresa, company_name y ruc', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData(BASE_EMPRESA));

      expect(signUp).toHaveBeenCalledOnce();
      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.audience).toBe('empresa');
      expect(options.data.company_name).toBe('Acme SA');
      expect(options.data.ruc).toBe('80000001-1');
    });

    it('NO incluye company_name cuando está vacío', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData({ ...BASE_EMPRESA, companyName: '' }));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.company_name).toBeUndefined();
    });

    it('NO incluye ruc cuando está vacío', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData({ ...BASE_EMPRESA, ruc: '' }));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.ruc).toBeUndefined();
    });

    it('trimea el RUC antes de guardarlo', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData({ ...BASE_EMPRESA, ruc: '  80000001-1  ' }));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.ruc).toBe('80000001-1');
    });

    it('NO incluye role en metadata aunque venga en el form', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData({ ...BASE_EMPRESA, role: 'comunidad' }));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.role).toBeUndefined();
    });
  });

  // ── Defaults ───────────────────────────────────────────────────────────────

  describe('defaults', () => {
    it('usa audience "candidato" cuando no viene en el FormData', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData({ email: 'x@test.com', password: 'Pass1234', name: 'X' }));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.data.audience).toBe('candidato');
    });
  });

  // ── Resultados ─────────────────────────────────────────────────────────────

  describe('resultados', () => {
    it('retorna { success: true, message } cuando no hay error', async () => {
      makeSupabaseMock({ error: null });
      const result = await registerAction(makeFormData(BASE_CANDIDATO));

      expect(result?.success).toBe(true);
      expect(result?.message).toBeTruthy();
    });

    it('el mensaje de éxito menciona el email', async () => {
      makeSupabaseMock({ error: null });
      const result = await registerAction(makeFormData(BASE_CANDIDATO));

      expect(result?.message?.toLowerCase()).toContain('email');
    });

    it('retorna { error } con el mensaje de Supabase cuando falla', async () => {
      makeSupabaseMock({ error: { message: 'User already registered' } });
      const result = await registerAction(makeFormData({ ...BASE_CANDIDATO, email: 'dup@test.com' }));

      expect(result?.error).toBe('User already registered');
    });

    it('traduce "Database error saving new user" a español', async () => {
      makeSupabaseMock({ error: { message: 'Database error saving new user' } });
      const result = await registerAction(makeFormData(BASE_CANDIDATO));

      expect(result?.error).toContain('regla interna de la base de datos');
    });

    it('traduce el error también en minúsculas', async () => {
      makeSupabaseMock({ error: { message: 'database error saving new user' } });
      const result = await registerAction(makeFormData(BASE_CANDIDATO));

      expect(result?.error).toContain('regla interna de la base de datos');
    });
  });

  // ── emailRedirectTo ────────────────────────────────────────────────────────

  describe('emailRedirectTo', () => {
    it('apunta a /auth/confirm', async () => {
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData(BASE_CANDIDATO));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.emailRedirectTo).toContain('/auth/confirm');
    });

    it('usa NEXT_PUBLIC_SITE_URL cuando está definido', async () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://mi-sitio.com';
      const { signUp } = makeSupabaseMock({ error: null });
      await registerAction(makeFormData(BASE_CANDIDATO));

      const [{ options }] = signUp.mock.calls[0];
      expect(options.emailRedirectTo).toContain('https://mi-sitio.com');
      delete process.env.NEXT_PUBLIC_SITE_URL;
    });
  });
});
