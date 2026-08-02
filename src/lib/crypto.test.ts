import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from './crypto';

beforeAll(() => {
  process.env.INTEGRATION_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
});

describe('encrypt/decrypt', () => {
  it('round-trips a plaintext string', () => {
    const ciphertext = encrypt('gho_super_secret_token');
    expect(decrypt(ciphertext)).toBe('gho_super_secret_token');
  });

  it('never stores the plaintext token verbatim in the ciphertext', () => {
    const ciphertext = encrypt('gho_super_secret_token');
    expect(ciphertext).not.toContain('gho_super_secret_token');
  });

  it('produces a different ciphertext each time (random IV)', () => {
    const a = encrypt('same input');
    const b = encrypt('same input');
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe('same input');
    expect(decrypt(b)).toBe('same input');
  });

  it('throws instead of silently returning garbage if the ciphertext is tampered with', () => {
    const ciphertext = encrypt('gho_super_secret_token');
    const [iv, authTag, body] = ciphertext.split(':');
    const tampered = [iv, authTag, Buffer.from('tampered').toString('base64') + body.slice(8)].join(':');
    expect(() => decrypt(tampered)).toThrow();
  });

  it('throws a clear error when the encryption key is missing', () => {
    const original = process.env.INTEGRATION_ENCRYPTION_KEY;
    delete process.env.INTEGRATION_ENCRYPTION_KEY;
    expect(() => encrypt('x')).toThrow(/INTEGRATION_ENCRYPTION_KEY/);
    process.env.INTEGRATION_ENCRYPTION_KEY = original;
  });
});
