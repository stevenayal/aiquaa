import { createHmac } from 'crypto';

/**
 * Signs a webhook payload with HMAC-SHA256.
 * Signature covers: `${timestampMs}.${rawBody}`
 * Header: `X-Aiquaa-Signature: sha256=<hex>`
 */
export function signWebhookPayload(
  secret: string,
  timestampMs: number,
  rawBody: string
): string {
  const message = `${timestampMs}.${rawBody}`;
  const hmac = createHmac('sha256', secret);
  hmac.update(message);
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Verifies a webhook signature (useful for tests / receiver side).
 */
export function verifyWebhookSignature(
  secret: string,
  timestampMs: number,
  rawBody: string,
  signature: string
): boolean {
  const expected = signWebhookPayload(secret, timestampMs, rawBody);
  return expected === signature;
}
