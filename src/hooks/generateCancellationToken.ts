import type { FieldHook } from 'payload';

import crypto from 'crypto';

export const generateCancellationToken: FieldHook = ({ operation, value }) => {
  if (operation === 'create' && !value) {
    return crypto.randomBytes(32).toString('hex');
  }
  return value;
};
