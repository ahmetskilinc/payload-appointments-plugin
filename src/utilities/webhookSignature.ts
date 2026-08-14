import crypto from 'crypto';

export const WEBHOOK_SIGNATURE_HEADER = 'x-appointments-signature';

/**
 * Computes the HMAC-SHA256 signature for a webhook payload.
 * Payment providers (or the glue code calling the webhook) must send this
 * value in the `x-appointments-signature` header, hex encoded.
 */
export const signWebhookPayload = (rawBody: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
};

/**
 * Constant-time comparison of the received signature against the expected one.
 * Returns false for missing/malformed signatures instead of throwing.
 */
export const verifyWebhookSignature = (
  rawBody: string,
  signature: string | null | undefined,
  secret: string,
): boolean => {
  if (!signature) {
    return false;
  }

  const expected = signWebhookPayload(rawBody, secret);
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};
