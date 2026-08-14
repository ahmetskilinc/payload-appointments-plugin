import { describe, expect, it } from 'vitest';

import { signWebhookPayload, verifyWebhookSignature } from './webhookSignature';

const SECRET = 'test-secret';
const BODY = JSON.stringify({ appointmentId: '1', paymentId: 'pay_1', status: 'success' });

describe('webhook signature', () => {
  it('accepts a correctly signed payload', () => {
    const signature = signWebhookPayload(BODY, SECRET);
    expect(verifyWebhookSignature(BODY, signature, SECRET)).toBe(true);
  });

  it('rejects a payload signed with the wrong secret', () => {
    const signature = signWebhookPayload(BODY, 'other-secret');
    expect(verifyWebhookSignature(BODY, signature, SECRET)).toBe(false);
  });

  it('rejects a tampered body', () => {
    const signature = signWebhookPayload(BODY, SECRET);
    expect(verifyWebhookSignature(BODY + 'x', signature, SECRET)).toBe(false);
  });

  it('rejects missing or malformed signatures', () => {
    expect(verifyWebhookSignature(BODY, null, SECRET)).toBe(false);
    expect(verifyWebhookSignature(BODY, undefined, SECRET)).toBe(false);
    expect(verifyWebhookSignature(BODY, '', SECRET)).toBe(false);
    expect(verifyWebhookSignature(BODY, 'not-a-signature', SECRET)).toBe(false);
  });
});
