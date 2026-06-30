import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encryptToken(token: string): string {
  const secret = process.env.CALENDAR_ENCRYPTION_KEY;
  if (!secret || secret.length !== 32) {
    throw new Error('Invalid CALENDAR_ENCRYPTION_KEY');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secret), iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(encrypted: string): string {
  const secret = process.env.CALENDAR_ENCRYPTION_KEY;
  if (!secret || secret.length !== 32) {
    throw new Error('Invalid CALENDAR_ENCRYPTION_KEY');
  }

  const parts = encrypted.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const text = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(secret), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
