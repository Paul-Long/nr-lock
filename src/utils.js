import crypto from 'crypto';

export function random() {
  return crypto.randomBytes(16).toString('hex');
}
