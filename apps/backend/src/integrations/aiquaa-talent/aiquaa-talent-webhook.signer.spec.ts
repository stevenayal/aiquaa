import {
  signWebhookPayload,
  verifyWebhookSignature,
} from './aiquaa-talent-webhook.signer';

describe('AiquaaTalentWebhookSigner', () => {
  const SECRET = 'test-secret-32-chars-xxxxxxxxxxx';
  const TIMESTAMP = 1700000000000;
  const BODY = '{"eventId":"abc"}';

  it('produces sha256= prefixed signature', () => {
    const sig = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    expect(sig).toMatch(/^sha256=[a-f0-9]{64}$/);
  });

  it('signature is deterministic for same inputs', () => {
    const sig1 = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    const sig2 = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    expect(sig1).toBe(sig2);
  });

  it('different timestamp = different signature', () => {
    const sig1 = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    const sig2 = signWebhookPayload(SECRET, TIMESTAMP + 1, BODY);
    expect(sig1).not.toBe(sig2);
  });

  it('different body = different signature', () => {
    const sig1 = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    const sig2 = signWebhookPayload(SECRET, TIMESTAMP, '{"eventId":"xyz"}');
    expect(sig1).not.toBe(sig2);
  });

  it('different secret = different signature', () => {
    const sig1 = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    const sig2 = signWebhookPayload('other-secret', TIMESTAMP, BODY);
    expect(sig1).not.toBe(sig2);
  });

  it('verifyWebhookSignature returns true for valid signature', () => {
    const sig = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    expect(verifyWebhookSignature(SECRET, TIMESTAMP, BODY, sig)).toBe(true);
  });

  it('verifyWebhookSignature returns false for tampered body', () => {
    const sig = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    expect(
      verifyWebhookSignature(SECRET, TIMESTAMP, '{"tampered":true}', sig)
    ).toBe(false);
  });

  it('does not embed secret in output', () => {
    const sig = signWebhookPayload(SECRET, TIMESTAMP, BODY);
    expect(sig).not.toContain(SECRET);
  });
});
