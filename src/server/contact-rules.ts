// Contact-form rules with no server imports, so they can be unit tested and
// reused by the form for its HTML constraints.

export const CONTACT_LIMITS = {
  name: { min: 1, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 4000 },
  /** Messages allowed from one sender inside the window. */
  rateLimit: { max: 3, windowMs: 10 * 60 * 1000 }
} as const;

export type ContactField = 'name' | 'email' | 'message';

export type ContactInput = {
  name: string;
  email: string;
  message: string;
  /** The honeypot. People never see it, so it should arrive empty. */
  website: string;
};

export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: 'invalid'; errors: ContactErrors }
  | { ok: false; reason: 'rate_limited'; message: string }
  | { ok: false; reason: 'server'; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const asString = (value: unknown) =>
  typeof value === 'string' ? value : '';

/** Accepts anything (a FormData object, JSON) and returns trimmed strings. */
export function readContactInput(raw: unknown): ContactInput {
  const get = (key: string): unknown => {
    if (raw instanceof FormData) return raw.get(key);
    if (raw && typeof raw === 'object') {
      return (raw as Record<string, unknown>)[key];
    }
    return undefined;
  };
  return {
    name: asString(get('name')).trim(),
    email: asString(get('email')).trim(),
    message: asString(get('message')).trim(),
    website: asString(get('website')).trim()
  };
}

export function validateContact(input: ContactInput): ContactErrors {
  const { name, email, message } = CONTACT_LIMITS;
  const errors: ContactErrors = {};

  if (input.name.length < name.min) {
    errors.name = 'Tell me your name.';
  } else if (input.name.length > name.max) {
    errors.name = `Keep your name under ${name.max} characters.`;
  }

  if (!input.email) {
    errors.email = 'Add an email address so I can reply.';
  } else if (input.email.length > email.max || !EMAIL.test(input.email)) {
    errors.email = 'That email address doesn’t look right.';
  }

  if (input.message.length < message.min) {
    errors.message = `Write at least ${message.min} characters.`;
  } else if (input.message.length > message.max) {
    errors.message = `Keep it under ${message.max.toLocaleString('en')} characters.`;
  }

  return errors;
}

/** A filled-in honeypot means a bot filled in every field it found. */
export function isSpam(input: ContactInput): boolean {
  return input.website.length > 0;
}

/** True when the sender has already used up the window's messages. */
export function isRateLimited(recentCount: number): boolean {
  return recentCount >= CONTACT_LIMITS.rateLimit.max;
}

/** The client key that the rate limit counts against, before hashing. */
export function clientKey(headers: {
  get(name: string): string | null | undefined;
}): string {
  const ip =
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local';
  return `${ip}|${headers.get('user-agent') ?? ''}`;
}

export async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
