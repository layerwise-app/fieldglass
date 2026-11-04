import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { and, count, eq, gte } from 'drizzle-orm';
import { db } from '~/db';
import { contactMessages } from '~/db/schema';
import {
  CONTACT_LIMITS,
  clientKey,
  escapeHtml,
  isRateLimited,
  isSpam,
  readContactInput,
  sha256,
  validateContact,
  type ContactInput,
  type ContactResult
} from '~/server/contact-rules';
import { portfolio } from '~/portfolio.config';

/**
 * Saves a contact-form message, then emails it to `portfolio.ownerEmail`
 * when one is set. Validation and the rate limit run here, on the server.
 */
export const sendContactMessage = createServerFn({ method: 'POST' })
  .validator((data: FormData): ContactInput => readContactInput(data))
  .handler(async ({ data }): Promise<ContactResult> => {
    // Bots fill every field. Answer as if it worked and keep nothing.
    if (isSpam(data)) return { ok: true };

    const errors = validateContact(data);
    if (Object.keys(errors).length > 0) {
      return { ok: false, reason: 'invalid', errors };
    }

    const headers = getRequestHeaders();
    const ipHash = await sha256(clientKey(headers));
    const since = new Date(Date.now() - CONTACT_LIMITS.rateLimit.windowMs);

    try {
      const [recent] = await db
        .select({ total: count() })
        .from(contactMessages)
        .where(
          and(
            eq(contactMessages.ipHash, ipHash),
            gte(contactMessages.createdAt, since)
          )
        );
      if (isRateLimited(recent?.total ?? 0)) {
        return {
          ok: false,
          reason: 'rate_limited',
          message:
            'You’ve sent a few messages in a short time. Give it ten minutes and try again.'
        };
      }

      const [saved] = await db
        .insert(contactMessages)
        .values({
          name: data.name,
          email: data.email,
          message: data.message,
          ipHash,
          userAgent: headers.get('user-agent')?.slice(0, 300) ?? null
        })
        .returning({ id: contactMessages.id });

      if (portfolio.ownerEmail && saved) {
        const { error } = await env.EMAIL.send({
          to: portfolio.ownerEmail,
          replyTo: data.email,
          subject: `New message from ${data.name.replace(/[\r\n]+/g, ' ')}`,
          text: `${data.name} <${data.email}> wrote:\n\n${data.message}\n`,
          html: `<p><strong>${escapeHtml(data.name)}</strong> &lt;${escapeHtml(data.email)}&gt; wrote:</p><p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`
        });
        if (error) {
          console.warn(`[contact] email for ${saved.id}: ${error.code}`);
        } else {
          await db
            .update(contactMessages)
            .set({ emailed: true })
            .where(eq(contactMessages.id, saved.id));
        }
      }

      return { ok: true };
    } catch (error) {
      console.error('[contact] could not save message', error);
      return {
        ok: false,
        reason: 'server',
        message: 'Something went wrong on my side. Please try again in a moment.'
      };
    }
  });
