import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken } from './crypto';

describe('Calendar Crypto', () => {
  it('encrypts and decrypts correctly', () => {
    process.env.CALENDAR_ENCRYPTION_KEY = '12345678901234567890123456789012';
    
    const token = 'my-secret-token-123';
    const encrypted = encryptToken(token);
    
    expect(encrypted).not.toBe(token);
    expect(encrypted).toContain(':');
    
    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(token);
  });
});
