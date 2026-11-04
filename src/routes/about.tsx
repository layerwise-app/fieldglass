import { createFileRoute } from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import { useBackgroundScene } from '~/components/case-study/useScrollScene';
import { Arrow } from '~/components/site/Arrow';
import { Portrait } from '~/components/site/Portrait';
import { personJsonLd } from '~/components/site/structured-data';
import {
  education,
  experience,
  formatNoteDate,
  otherClients,
  services,
  writing,
  type Role
} from '~/content/about';
import { projects } from '~/content/work';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/about')({
  head: () =>
    seo({
      title: `About — ${portfolio.name}`,
      description: `${portfolio.name} is a ${portfolio.role.toLowerCase()} in ${portfolio.location.split(',')[0]}. Services, experience, clients, writing and CV.`,
      path: '/about',
      jsonLd: personJsonLd()
    }),
  component: AboutPage
});

const pad = (n: number) => String(n).padStart(2, '0');

function AboutPage() {
  useBackgroundScene('iris');

  // Open a note when the page is opened at its anchor, like /about#fewer-knobs.
  useEffect(() => {
    const open = () => {
      const target = document.getElementById(location.hash.slice(1));
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);

  const clients = [
    ...new Set([
      // "Veld Kunsthal, Utrecht" → "Veld Kunsthal"
      ...projects.map((project) => project.client.split(',')[0]!.trim()),
      ...otherClients
    ])
  ];
  const [lead, ...rest] = portfolio.bio;

  return (
    <div className='mx-auto max-w-[1440px] px-4 pt-28 pb-24 md:px-6 md:pt-36 md:pb-36 lg:px-10'>
      <header className='grid grid-cols-12 items-end gap-x-4 gap-y-10 md:gap-x-6'>
        <div className='col-span-12 lg:col-span-7'>
          <p className='label text-muted'>About</p>
          <h1 className='display mt-5 text-[clamp(56px,9vw,140px)]'>
            {portfolio.name}
          </h1>
          <p className='heading mt-6 text-[22px] text-muted md:text-[30px]'>
            {portfolio.role}, {portfolio.location.split(',')[0]}
          </p>
        </div>
        <div className='col-span-12 sm:col-span-8 sm:col-start-3 md:col-span-6 md:col-start-4 lg:col-span-4 lg:col-start-9'>
          <Portrait />
        </div>
      </header>

      <section
        aria-label='Bio'
        className='glass mt-16 rounded-[26px] px-5 py-10 md:mt-24 md:rounded-[34px] md:px-12 md:py-16 lg:px-16 lg:py-20'
      >
        <Row label='Bio'>
          <p className='heading max-w-[30ch] text-[26px] leading-[1.2] md:text-[36px]'>
            {lead}
          </p>
          <div className='prose-fg mt-8 max-w-[62ch] text-[18px] leading-[1.6] md:text-[19px]'>
            {rest.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </Row>

        <Row label='Services'>
          <ol>
            {services.map((service, i) => (
              <li
                key={service.title}
                className='grid grid-cols-[2.5rem_1fr] gap-x-4 border-t py-5 first:border-t-0 first:pt-0 md:grid-cols-[3.5rem_minmax(0,22rem)_1fr] md:gap-x-6'
              >
                <span className='label pt-1.5 text-muted'>{pad(i + 1)}</span>
                <h3 className='heading text-[21px] md:text-[23px]'>
                  {service.title}
                </h3>
                <p className='col-start-2 mt-1.5 max-w-[48ch] text-[17px] leading-snug text-muted md:col-start-3 md:mt-1'>
                  {service.description}
                </p>
              </li>
            ))}
          </ol>
        </Row>

        <Row label='Experience'>
          <RoleList roles={experience} />
        </Row>

        <Row label='Education'>
          <RoleList roles={education} />
        </Row>

        <Row label='Selected clients'>
          <ul className='columns-2 gap-x-6 text-[15px] leading-[1.3] sm:text-[17px] md:columns-3'>
            {clients.map((client) => (
              <li key={client} className='break-inside-avoid py-[5px]'>
                {client}
              </li>
            ))}
          </ul>
        </Row>

        <Row label='Tools'>
          <ul className='flex max-w-[60ch] flex-wrap gap-x-2 gap-y-1 text-[17px] leading-[1.7]'>
            {portfolio.tools.map((tool, i) => (
              <li key={tool.name} className='flex gap-2'>
                {tool.name}
                {i < portfolio.tools.length - 1 && (
                  <span aria-hidden className='text-muted'>
                    /
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Row>

        <Row label='CV'>
          <a
            href={portfolio.cv.href}
            download
            className='group inline-flex items-center gap-4 rounded-full bg-ink py-3 pr-5 pl-6 text-paper transition-transform duration-300 hover:-translate-y-px'
          >
            <span className='text-[16px] font-medium'>Download CV</span>
            <span className='label text-paper/70'>{portfolio.cv.label}</span>
            <Arrow
              size={14}
              direction='s'
              className='transition-transform duration-300 group-hover:translate-y-0.5'
            />
          </a>
        </Row>
      </section>

      <section id='writing' aria-labelledby='writing-title' className='mt-24 scroll-mt-28 md:mt-36'>
        <div className='grid grid-cols-12 gap-x-4 md:gap-x-6'>
          <div className='col-span-12 lg:col-span-8'>
            <p className='label text-muted'>Writing</p>
            <h2
              id='writing-title'
              className='display mt-5 text-[clamp(40px,6vw,88px)]'
            >
              Notes and talks
            </h2>
          </div>
        </div>
        <div className='glass mt-10 rounded-[26px] px-2 md:mt-14 md:rounded-[34px] md:px-4'>
          {writing.map((note) => (
            <details
              key={note.slug}
              id={note.slug}
              className='note group scroll-mt-28 border-t first:border-t-0'
            >
              <summary className='grid cursor-pointer list-none grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 rounded-[20px] px-3 py-6 md:grid-cols-[10rem_1fr_auto] md:px-8 md:py-8 [&::-webkit-details-marker]:hidden'>
                <span className='label col-start-1 row-start-1 pt-2 text-muted'>
                  {formatNoteDate(note.date)}
                </span>
                <span className='col-span-2 md:col-span-1 md:col-start-2 md:row-start-1'>
                  <span className='heading block text-[24px] md:text-[30px]'>
                    {note.title}
                  </span>
                  <span className='mt-1.5 block text-[15px] text-muted'>
                    {note.venue}
                  </span>
                </span>
                <span
                  aria-hidden
                  className='col-start-2 row-start-1 flex size-9 items-center justify-center justify-self-end rounded-full border text-ink transition-transform duration-500 ease-(--ease-out-expo) group-open:rotate-45 md:col-start-3'
                >
                  <svg width='12' height='12' viewBox='0 0 12 12'>
                    <path d='M6 1v10M1 6h10' stroke='currentColor' strokeWidth='1.3' />
                  </svg>
                </span>
              </summary>
              <div className='prose-fg max-w-[64ch] px-3 pb-10 text-[18px] leading-[1.65] md:ml-[calc(10rem+1.5rem)] md:px-8 md:pb-12'>
                {note.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='grid grid-cols-12 gap-x-4 gap-y-5 border-t pt-10 first:border-t-0 first:pt-0 [&+&]:mt-10 md:gap-x-6 md:pt-14 md:[&+&]:mt-14'>
      <h2 className='label col-span-12 text-ink lg:col-span-3'>{label}</h2>
      <div className='col-span-12 lg:col-span-9'>{children}</div>
    </div>
  );
}

function RoleList({ roles }: { roles: Role[] }) {
  return (
    <ul>
      {roles.map((role) => (
        <li
          key={`${role.years}${role.role}`}
          className='grid grid-cols-1 gap-x-6 gap-y-1 border-t py-4 first:border-t-0 first:pt-0 md:grid-cols-[9rem_1fr_minmax(0,16rem)]'
        >
          <span className='label pt-1 text-muted'>{role.years}</span>
          <span className='text-[17px] leading-snug'>
            <span className='font-medium'>{role.role}</span>
            <span className='text-muted'> — {role.studio}</span>
          </span>
          <span className='text-[17px] leading-snug text-muted md:text-right'>
            {role.city}
          </span>
        </li>
      ))}
    </ul>
  );
}
