import { describe, expect, it } from 'vitest';
import {
  CONTACT_LIMITS,
  clientKey,
  escapeHtml,
  isRateLimited,
  isSpam,
  readContactInput,
  sha256,
  validateContact
} from '~/server/contact-rules';

const valid = {
  name: 'Ada Visser',
  email: 'ada@example.com',
  message: 'We are planning an identity for a new music venue.',
  website: ''
};

describe('contact form rules', () => {
  it('reads and trims form data', () => {
    const form = new FormData();
    form.set('name', '  Ada  ');
    form.set('email', ' ada@example.com ');
    form.set('message', ' Hello there, a project. ');
    expect(readContactInput(form)).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello there, a project.',
      website: ''
    });
    expect(readContactInput(null).name).toBe('');
  });

  it('accepts a valid message', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('rejects missing or malformed fields', () => {
    const errors = validateContact({ name: '', email: 'not-an-email', message: 'short', website: '' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name']);
    expect(validateContact({ ...valid, email: '' }).email).toBeTruthy();
    expect(
      validateContact({ ...valid, message: 'x'.repeat(CONTACT_LIMITS.message.max + 1) }).message
    ).toBeTruthy();
    expect(validateContact({ ...valid, name: 'n'.repeat(101) }).name).toBeTruthy();
  });

  it('treats a filled honeypot as spam', () => {
    expect(isSpam(valid)).toBe(false);
    expect(isSpam({ ...valid, website: 'https://spam.example' })).toBe(true);
  });

  it('limits messages per window', () => {
    const max = CONTACT_LIMITS.rateLimit.max;
    expect(isRateLimited(max - 1)).toBe(false);
    expect(isRateLimited(max)).toBe(true);
  });

  it('keys the rate limit on address and browser, then hashes it', async () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1', 'user-agent': 'Test' });
    expect(clientKey(headers)).toBe('203.0.113.7|Test');
    expect(clientKey(new Headers({ 'cf-connecting-ip': '198.51.100.2' }))).toBe('198.51.100.2|');
    expect(clientKey(new Headers())).toBe('local|');
    const hash = await sha256('203.0.113.7|Test');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await sha256('203.0.113.7|Test')).toBe(hash);
  });

  it('escapes html in emails', () => {
    expect(escapeHtml(`<b>"Tom" & 'Jo'</b>`)).not.toMatch(/[<>"']/);
  });
});
