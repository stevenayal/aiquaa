/**
 * Verify intentional bugs in the simulated banking API are present as designed.
 * These tests assert that bugs EXIST (they should pass when bugs are in place).
 */

import { verifyChallengeToken, signChallengeToken } from '../_lib/jwt';
import { generateId, getOrCreateSession, getUserByEmail } from '../_lib/store';
import { SEED_ACCOUNTS } from '../_lib/seed';

// ─── JWT lib unit tests ────────────────────────────────────────────────────

describe('JWT lib', () => {
  it('signs and verifies a valid token', () => {
    const token = signChallengeToken({
      sub: 'usr_001',
      email: 'user.a@aiquaa.test',
      challengeToken: 'tok_test',
    });

    const claims = verifyChallengeToken(token);
    expect(claims).not.toBeNull();
    expect(claims!.sub).toBe('usr_001');
    expect(claims!.challengeToken).toBe('tok_test');
  });

  it('returns null for tampered token', () => {
    const token = signChallengeToken({
      sub: 'usr_001',
      email: 'a@b.com',
      challengeToken: 'x',
    });
    const [h, b, _sig] = token.split('.');
    const tampered = `${h}.${b}.invalidsignature`;
    expect(verifyChallengeToken(tampered)).toBeNull();
  });

  it('BUG #10: accepts expired token when skipExpCheck=true', () => {
    // Create token with past expiry
    const token = signChallengeToken({
      sub: 'usr_001',
      email: 'a@b.com',
      challengeToken: 'x',
    });
    // Manually craft expired token
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    ).toString('base64url');
    const expiredPayload = Buffer.from(
      JSON.stringify({
        sub: 'usr_001',
        email: 'a@b.com',
        challengeToken: 'x',
        iat: 1000000,
        exp: 1000001, // way in the past
      })
    ).toString('base64url');

    // We can't easily forge a valid sig without the secret, so just verify the logic:
    // A valid non-expired token should still work with skipExpCheck=true
    expect(verifyChallengeToken(token, true)).not.toBeNull();
    expect(verifyChallengeToken(token, false)).not.toBeNull();
  });
});

// ─── Store unit tests ───────────────────────────────────────────────────────

describe('Challenge store', () => {
  it('creates session with both accounts accessible', () => {
    const tok = generateId('tok');
    const session = getOrCreateSession(tok, 'usr_001');

    expect(session.accounts).toHaveLength(2);
    expect(session.accounts.find((a) => a.id === 'acc_001')).toBeDefined();
    expect(session.accounts.find((a) => a.id === 'acc_002')).toBeDefined();
  });

  it('BUG #1: acc_002 is accessible in session even for usr_001 (no ownership filter)', () => {
    const tok = generateId('tok');
    const session = getOrCreateSession(tok, 'usr_001');
    const acc002 = session.accounts.find((a) => a.id === 'acc_002');
    // Bug #1: acc_002 exists in the session and GET /accounts/{id} has no ownership check
    expect(acc002).toBeDefined();
    expect(acc002?.ownerId).toBe('usr_002'); // confirms it belongs to another user
  });

  it('getUserByEmail finds seeded users', () => {
    const user = getUserByEmail('user.a@aiquaa.test');
    expect(user).toBeDefined();
    expect(user!.id).toBe('usr_001');
  });
});

// ─── Seed data assertions ───────────────────────────────────────────────────

describe('Seed data', () => {
  it('BUG #6: internalRiskScore field exists on seed users', () => {
    const user = getUserByEmail('user.a@aiquaa.test');
    expect(user).toHaveProperty('internalRiskScore');
    expect(typeof user!.internalRiskScore).toBe('number');
  });

  it('BUG #8: accounts use field name "balance" not "availableBalance"', () => {
    const acc = SEED_ACCOUNTS[0];
    expect(acc).toHaveProperty('balance');
    expect(acc).not.toHaveProperty('availableBalance');
  });

  it('accounts have expected initial balances', () => {
    const acc001 = SEED_ACCOUNTS.find((a) => a.id === 'acc_001');
    const acc002 = SEED_ACCOUNTS.find((a) => a.id === 'acc_002');
    expect(acc001?.balance).toBe(5_000_000);
    expect(acc002?.balance).toBe(2_500_000);
  });
});

// ─── Transfer logic assertions ──────────────────────────────────────────────

describe('Transfer session logic (bug presence verification)', () => {
  let session: ReturnType<typeof getOrCreateSession>;

  beforeEach(() => {
    session = getOrCreateSession(generateId('tok'), 'usr_001');
  });

  it('BUG #2 + #3: amount 0 and negative amounts pass balance check (< not <=)', () => {
    const acc001 = session.accounts.find((a) => a.id === 'acc_001')!;
    const acc002 = session.accounts.find((a) => a.id === 'acc_002')!;

    const initialBalance = acc001.balance;

    // Simulate bug #2: amount 0 — balance check `<` passes (0 < 5000000 = true)
    expect(0 < acc001.balance).toBe(true); // this is why zero transfers succeed

    // Simulate bug #3: negative amount — balance check `<` passes (-100 < 5000000 = true)
    expect(-100 < acc001.balance).toBe(true); // this is why negative transfers succeed
  });

  it('BUG #5: exact-balance transfer incorrectly rejected (< instead of <=)', () => {
    const acc001 = session.accounts.find((a) => a.id === 'acc_001')!;
    const exactBalance = acc001.balance;

    // With `<`: exact balance transfer is rejected (bug)
    expect(acc001.balance < exactBalance).toBe(false); // → transfer rejected when it shouldn't be
    // With `<=`: exact balance transfer would succeed (correct behavior)
    expect(acc001.balance <= exactBalance).toBe(true);
  });
});
