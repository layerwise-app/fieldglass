import { createFileRoute } from '@tanstack/react-router';
import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode
} from 'react';
import { useBackgroundScene } from '~/components/case-study/useScrollScene';
import { Arrow } from '~/components/site/Arrow';
import { cn } from '~/lib/utils';
import { portfolio } from '~/portfolio.config';
import { sendContactMessage } from '~/server/contact';
import {
  CONTACT_LIMITS,
  type ContactErrors,
  type ContactField
} from '~/server/contact-rules';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/contact')({
  head: () =>
    seo({
      title: `Contact — ${portfolio.name}`,
      description: `Write to ${portfolio.name} about a commission, a collaboration or a workshop. ${portfolio.availability}.`,
      path: '/contact'
    }),
  component: ContactPage
});

function ContactPage() {
  useBackgroundScene('iris');

  return (
    <div className='mx-auto max-w-[1440px] px-4 pt-28 pb-24 md:px-6 md:pt-36 md:pb-36 lg:px-10'>
      <header className='grid grid-cols-12 gap-x-4 md:gap-x-6'>
        <div className='col-span-12 lg:col-span-9'>
          <p className='label text-muted'>Contact</p>
          <h1 className='display mt-5 text-[clamp(48px,8vw,124px)] text-balance'>
            Tell me what you’re making.
          </h1>
          <p className='mt-6 max-w-[46ch] text-[19px] leading-[1.55] md:text-[21px]'>
            Commissions, collaborations, teaching. A few sentences about the
            idea and the timing is plenty; I reply to every message within
            two working days.
          </p>
        </div>
      </header>

      <div className='mt-14 grid grid-cols-12 gap-x-4 gap-y-6 md:mt-20 md:gap-x-6'>
        <section
          aria-label='Send a message'
          className='glass col-span-12 rounded-[26px] p-5 md:rounded-[34px] md:p-10 lg:col-span-8'
        >
          <ContactForm />
        </section>

        <aside className='glass-quiet col-span-12 self-start rounded-[26px] px-5 md:rounded-[30px] md:px-7 lg:col-span-4'>
          <div className='py-6 md:py-7'>
            <p className='label text-muted'>Availability</p>
            <p className='mt-3 flex items-start gap-2.5 text-[17px] leading-snug'>
              <span
                aria-hidden
                className='mt-[7px] inline-block size-2 shrink-0 rounded-full bg-accent'
              />
              {portfolio.availability}
            </p>
          </div>

          <div className='border-t py-6 md:py-7'>
            <h2 className='label text-muted'>Elsewhere</h2>
            <ul className='mt-2'>
              {portfolio.social.map((link) => (
                <li key={link.label} className='border-t first:border-t-0'>
                  <a
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group flex items-center justify-between py-3 text-[17px]'
                  >
                    <span>{link.label}</span>
                    <Arrow
                      size={14}
                      className='text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink'
                    />
                    <span className='sr-only'> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
              {portfolio.ownerEmail && (
                <li className='border-t'>
                  <a
                    href={`mailto:${portfolio.ownerEmail}`}
                    className='flex items-center justify-between py-3 text-[17px]'
                  >
                    <span className='truncate'>{portfolio.ownerEmail}</span>
                    <Arrow size={14} className='text-muted' />
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className='border-t py-6 md:py-7'>
            <p className='label text-muted'>Studio</p>
            <p className='mt-3 text-[17px] leading-snug'>{portfolio.location}</p>
            <p className='label mt-1 text-muted'>{portfolio.coordinates}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

type Status =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'sent'; name: string }
  | { state: 'error'; message: string };

function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [length, setLength] = useState(0);
  const statusId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ state: 'sending' });
    setErrors({});
    try {
      const result = await sendContactMessage({ data });
      if (result.ok) {
        setStatus({ state: 'sent', name: String(data.get('name') ?? '').trim() });
        form.reset();
        setLength(0);
        return;
      }
      if (result.reason === 'invalid') {
        setErrors(result.errors);
        setStatus({ state: 'idle' });
        const first = (['name', 'email', 'message'] as const).find(
          (key) => result.errors[key]
        );
        if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        return;
      }
      setStatus({ state: 'error', message: result.message });
    } catch {
      setStatus({
        state: 'error',
        message: 'The message didn’t go through. Check your connection and try again.'
      });
    }
  }

  if (status.state === 'sent') {
    return (
      <div role='status' className='flex min-h-[420px] flex-col justify-between gap-10'>
        <div>
          <p className='label flex items-center gap-2 text-ink'>
            <span aria-hidden className='inline-block size-1.5 rounded-full bg-accent' />
            Message received
          </p>
          <p className='heading mt-5 max-w-[22ch] text-[34px] md:text-[44px]'>
            Thanks{status.name ? `, ${status.name}` : ''}. It’s in my inbox.
          </p>
          <p className='mt-5 max-w-[46ch] text-[17px] leading-relaxed text-muted'>
            I read everything myself and reply within two working days, usually
            sooner.
          </p>
        </div>
        <div>
          <button
            type='button'
            onClick={() => setStatus({ state: 'idle' })}
            className='label rounded-full border px-5 py-3 text-ink transition-colors hover:bg-white/60'
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const sending = status.state === 'sending';
  return (
    <form
      ref={formRef}
      method='post'
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={statusId}
      className='flex flex-col gap-3 md:gap-4'
    >
      <div className='grid gap-3 md:grid-cols-2 md:gap-6'>
        <Field
          name='name'
          label='Name'
          error={errors.name}
          input={{
            type: 'text',
            autoComplete: 'name',
            required: true,
            maxLength: CONTACT_LIMITS.name.max
          }}
        />
        <Field
          name='email'
          label='Email'
          error={errors.email}
          input={{
            type: 'email',
            autoComplete: 'email',
            required: true,
            maxLength: CONTACT_LIMITS.email.max,
            inputMode: 'email'
          }}
        />
      </div>
      <Field
        name='message'
        label='Message'
        error={errors.message}
        multiline
        hint={
          <span className='tabular-nums' style={{ minWidth: '11ch', textAlign: 'right' }}>
            {length.toLocaleString('en')} / {CONTACT_LIMITS.message.max.toLocaleString('en')}
          </span>
        }
        onLength={setLength}
      />

      {/* People never see this field; bots fill it in. */}
      <div aria-hidden='true' className='absolute -left-[9999px] h-px w-px overflow-hidden'>
        <label>
          Website
          <input type='text' name='website' tabIndex={-1} autoComplete='off' defaultValue='' />
        </label>
      </div>

      <div className='flex flex-col-reverse items-start gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between'>
        <p
          id={statusId}
          aria-live='polite'
          className={cn(
            'min-h-6 text-[15px] leading-snug',
            status.state === 'error' ? 'text-destructive' : 'text-muted'
          )}
        >
          {status.state === 'error'
            ? status.message
            : sending
              ? 'Sending…'
              : 'Messages go straight to me and are never shared.'}
        </p>
        <button
          type='submit'
          disabled={sending}
          className='group inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-ink px-6 text-[16px] font-medium text-paper transition-[opacity,transform] duration-300 hover:-translate-y-px disabled:cursor-wait disabled:opacity-60'
        >
          {sending ? 'Sending' : 'Send message'}
          <Arrow size={14} direction='e' className='transition-transform duration-300 group-hover:translate-x-0.5' />
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  multiline = false,
  hint,
  input,
  onLength
}: {
  name: ContactField;
  label: string;
  error?: string;
  multiline?: boolean;
  hint?: ReactNode;
  input?: InputHTMLAttributes<HTMLInputElement>;
  onLength?: (length: number) => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const control = cn(
    'w-full rounded-[14px] border bg-white/70 px-4 text-[17px] text-ink transition-[border-color,background-color] duration-200 placeholder:text-muted/70 hover:bg-white/85 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-2',
    error ? 'border-destructive' : 'border-[color-mix(in_srgb,var(--fg-ink)_16%,transparent)]'
  );
  const shared = {
    id,
    name,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined
  } as const;
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-baseline justify-between gap-4'>
        <label htmlFor={id} className='label text-ink'>
          {label}
        </label>
        {hint && <span className='label text-muted'>{hint}</span>}
      </div>
      {multiline ? (
        <textarea
          {...shared}
          required
          minLength={CONTACT_LIMITS.message.min}
          maxLength={CONTACT_LIMITS.message.max}
          rows={8}
          onChange={(event) => onLength?.(event.target.value.length)}
          className={cn(control, 'min-h-[200px] resize-y py-3.5 leading-relaxed')}
        />
      ) : (
        <input {...shared} {...input} className={cn(control, 'h-13')} />
      )}
      <p id={errorId} className='min-h-5 text-[14px] leading-5 text-destructive'>
        {error}
      </p>
    </div>
  );
}
