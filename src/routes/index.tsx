import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, type Ref } from 'react';
import { Arrow } from '~/components/site/Arrow';
import { navItems } from '~/components/site/Header';
import {
  LocalTime,
  ParticleCount,
  isMorphing,
  useFieldInfo
} from '~/components/site/live';
import { Portrait } from '~/components/site/Portrait';
import { ProjectLink } from '~/components/site/ProjectLink';
import { ShapeGlyph } from '~/components/site/ShapeGlyph';
import {
  personJsonLd,
  websiteJsonLd
} from '~/components/site/structured-data';
import { ToolRow } from '~/components/site/ToolRow';
import { archive } from '~/content/archive';
import { formatNoteDate, writing } from '~/content/about';
import type { Project } from '~/content/types';
import { projects } from '~/content/work';
import { field } from '~/lib/field/store';
import { useFinePointer } from '~/lib/hooks';
import { site } from '~/lib/site';
import { cn } from '~/lib/utils';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: site.name,
      description: site.description,
      path: '/',
      jsonLd: [websiteJsonLd(), personJsonLd()]
    }),
  component: Home
});

/** How much of the dashboard's top edge shows under the hero, in px. */
const PEEK = 92;

function Home() {
  const heroRef = useRef<HTMLElement>(null);

  // The dashboard rising over the hero pulls the field back and blurs it.
  useEffect(() => {
    field.setScene({ shape: 'iris', x: 0, y: 0 });
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = heroRef.current?.offsetHeight ?? window.innerHeight;
      const progress = Math.min(1, Math.max(0, window.scrollY / height));
      field.setScene({ depth: progress });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <Hero ref={heroRef} />
      <Dashboard />
    </>
  );
}

function Hero({ ref }: { ref: Ref<HTMLElement> }) {
  const finePointer = useFinePointer();
  const { mode } = useFieldInfo();
  const windy = finePointer && mode === 'live';
  return (
    <section
      ref={ref}
      aria-label='Introduction'
      className='relative min-h-[520px]'
      style={{ height: `calc(100svh - ${PEEK}px)` }}
    >
      <div className='absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-4 pt-4 sm:gap-6 sm:px-6 sm:pt-5'>
        <h1 className='label min-w-0 leading-[18px]'>
          <span className='block'>{portfolio.name}</span>
          <span className='block text-muted min-[380px]:whitespace-nowrap'>
            {portfolio.role}
          </span>
        </h1>
        <nav aria-label='Main'>
          <ul className='-mr-1.5 flex sm:-mr-2'>
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className='label block rounded-md px-1.5 py-1 leading-[18px] hover:text-muted sm:px-2'
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className='absolute inset-x-0 bottom-0 grid grid-cols-2 items-end gap-6 px-4 pb-5 sm:grid-cols-3 sm:px-6 sm:pb-6'>
        <p className='label leading-[18px]'>
          <span className='block'>{portfolio.location}</span>
          <span className='block text-muted'>{portfolio.coordinates}</span>
        </p>
        <p className='label hidden justify-self-center leading-[18px] text-muted sm:flex sm:items-center sm:gap-2'>
          Scroll
          <Arrow size={11} direction='s' />
        </p>
        <p className='label justify-self-end text-right leading-[18px]'>
          <ParticleCount className='block text-right' />
          <span className='block text-muted'>
            {windy ? 'Move the pointer through it' : 'Scroll for work'}
          </span>
        </p>
      </div>
    </section>
  );
}

const tile =
  'rounded-[22px] bg-white/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,.75)] transition-[background-color,box-shadow,translate] duration-300 ease-[var(--ease-out-expo)]';
const linkTile = `${tile} group hover:bg-white/75 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,.95),0_18px_40px_-28px_rgba(19,20,24,.35)]`;

function Dashboard() {
  return (
    <section
      aria-labelledby='dashboard-intro'
      className='relative px-2 sm:px-3 lg:px-4'
    >
      <div className='glass mx-auto max-w-[1520px] rounded-[30px] p-2 sm:rounded-[34px] sm:p-2.5 lg:p-3'>
        <TopBar />

        <div className='grid gap-2 sm:gap-2.5 md:grid-cols-6 lg:grid-cols-12 lg:gap-3'>
          <div className='flex flex-col px-3 pt-10 pb-6 sm:px-5 md:col-span-4 lg:col-span-8 lg:px-7 lg:pt-16 lg:pb-10'>
            <p className='label text-muted'>Intro</p>
            <h2
              id='dashboard-intro'
              className='display mt-5 max-w-[17ch] text-[clamp(38px,5.4vw,84px)] text-balance'
            >
              {portfolio.intro}
            </h2>
            <dl className='mt-auto grid grid-cols-2 gap-x-6 gap-y-4 pt-10 sm:flex sm:flex-wrap sm:gap-x-12'>
              <Meta term='Based in' value={portfolio.location} />
              <div>
                <dt className='label text-muted'>Local time</dt>
                <dd className='mt-1.5 text-[15px] leading-6'>
                  <LocalTime className='tabular-nums' />
                </dd>
              </div>
              <Meta
                term='Now'
                value={portfolio.availability}
                dot
                className='col-span-2 lg:hidden'
              />
            </dl>
          </div>
          <div className='md:col-span-2 lg:col-span-4'>
            <Portrait className='h-full' />
          </div>

          <SelectedWork />
          <AboutTile />
          <IndexTile />
          <WritingTile />
        </div>
      </div>
    </section>
  );
}

function Meta({
  term,
  value,
  dot,
  className
}: {
  term: string;
  value: string;
  dot?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className='label text-muted'>{term}</dt>
      <dd className='mt-1.5 flex items-center gap-2 text-[15px] leading-6'>
        {dot ? (
          <span aria-hidden className='size-1.5 shrink-0 rounded-full bg-accent' />
        ) : null}
        {value}
      </dd>
    </div>
  );
}

function TopBar() {
  return (
    <div className='flex flex-wrap items-center gap-x-6 gap-y-4 px-3 pt-3 pb-4 sm:px-4 lg:h-[72px] lg:flex-nowrap lg:py-0'>
      <div className='flex min-w-0 items-center gap-3'>
        <span
          aria-hidden
          className='grid size-9 place-items-center rounded-full bg-ink text-paper'
        >
          <span className='label leading-none tracking-[0.04em]'>
            {portfolio.initials}
          </span>
        </span>
        <p className='leading-tight'>
          <span className='block text-[15px] font-medium tracking-[-0.01em]'>
            {portfolio.name}
          </span>
          <span className='label block text-muted'>{portfolio.role}</span>
        </p>
      </div>
      <ToolRow className='order-3 w-full justify-between sm:w-auto sm:justify-start lg:order-none lg:mx-auto' />
      <p className='label ml-auto hidden items-center gap-2 text-muted lg:flex'>
        <span aria-hidden className='size-1.5 rounded-full bg-accent' />
        {portfolio.availability}
      </p>
    </div>
  );
}

/** Ambient preview: the blurred field becomes the project's shape. */
function usePreview() {
  const finePointer = useFinePointer();
  return (project: Project) => ({
    onMouseEnter: finePointer
      ? () => field.setScene({ shape: project.shape })
      : undefined,
    onMouseLeave: finePointer
      ? () => {
          if (!isMorphing()) field.setScene({ shape: 'iris' });
        }
      : undefined,
    onFocus: () => field.setScene({ shape: project.shape }),
    onBlur: () => {
      if (!isMorphing()) field.setScene({ shape: 'iris' });
    }
  });
}

function SelectedWork() {
  const preview = usePreview();
  return (
    <section
      aria-labelledby='selected-work'
      className={cn(
        tile,
        'flex flex-col p-4 sm:p-6 md:col-span-6 lg:col-span-8 lg:row-span-3'
      )}
    >
      <div className='flex items-center justify-between gap-4'>
        <p className='label text-muted'>
          {String(projects.length).padStart(2, '0')} case studies
        </p>
        <Link
          to='/work'
          className='label -mr-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:text-muted'
        >
          All work
          <Arrow size={13} />
        </Link>
      </div>

      {projects.length ? (
        <ol className='mt-5 flex flex-1 flex-col sm:mt-7'>
          {projects.map((project, index) => (
            <li
              key={project.slug}
              className='flex flex-1 flex-col border-t border-line first:border-t-0 sm:first:border-t'
            >
              <ProjectLink
                project={project}
                {...preview(project)}
                className='group -mx-2 grid flex-1 grid-cols-[22px_1fr_auto] items-center gap-x-3 rounded-[14px] px-2 py-3.5 transition-colors duration-300 hover:bg-white/70 focus-visible:bg-white/70 sm:grid-cols-[32px_minmax(0,1.3fr)_minmax(0,1fr)_56px_18px] sm:gap-x-4 sm:py-4'
              >
                <span className='label text-muted'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className='flex min-w-0 items-center gap-3'>
                  <ShapeGlyph
                    shape={project.shape}
                    className='shrink-0 text-muted transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent'
                  />
                  <span className='min-w-0'>
                    <span className='block truncate text-[19px] leading-tight font-medium tracking-[-0.02em] sm:text-[21px]'>
                      {project.title}
                    </span>
                    <span className='mt-0.5 block truncate text-[14px] text-muted sm:hidden'>
                      {project.discipline}
                    </span>
                  </span>
                </span>
                <span className='hidden truncate text-[15px] text-muted sm:block'>
                  {project.discipline}
                </span>
                <span className='label text-muted'>{project.year}</span>
                <Arrow
                  size={14}
                  className='hidden opacity-30 transition-[opacity,translate] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 sm:block'
                />
              </ProjectLink>
            </li>
          ))}
        </ol>
      ) : (
        <p className='mt-6 text-[15px] text-muted'>
          Case studies appear here when they’re added to src/content/work.
        </p>
      )}

      <h2
        id='selected-work'
        className='mt-auto pt-8 text-[26px] leading-none font-medium tracking-[-0.025em] sm:pt-12'
      >
        Selected work
      </h2>
    </section>
  );
}

function TileHead({ index }: { index: string }) {
  return (
    <div className='flex items-start justify-between'>
      <span className='label text-muted'>{index}</span>
      <Arrow className='transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
    </div>
  );
}

function TileTitle({ children }: { children: string }) {
  return (
    <span className='mt-auto block pt-6 text-[26px] leading-none font-medium tracking-[-0.025em]'>
      {children}
    </span>
  );
}

function AboutTile() {
  return (
    <Link
      to='/about'
      className={cn(
        linkTile,
        'flex min-h-[190px] flex-col p-4 sm:p-6 md:col-span-2 lg:col-span-4'
      )}
    >
      <TileHead index='Profile' />
      <span className='mt-4 block max-w-[34ch] text-[15px] leading-[1.45] text-muted'>
        Beirut, Eindhoven, Amsterdam. Services, experience, clients and a
        CV to download.
      </span>
      <TileTitle>About</TileTitle>
    </Link>
  );
}

function IndexTile() {
  const rows = [
    ...projects.map((p) => ({ year: p.year, title: p.title })),
    ...archive.map((a) => ({ year: a.year, title: a.title }))
  ].sort((a, b) => b.year - a.year);
  const years = rows.map((r) => r.year);
  const span = rows.length
    ? `${Math.min(...years)}–${Math.max(...years)}`
    : '';
  return (
    <Link
      to='/work'
      search={{ view: 'index' }}
      className={cn(
        linkTile,
        'flex min-h-[190px] flex-col p-4 sm:p-6 md:col-span-2 lg:col-span-4'
      )}
    >
      <TileHead index={`${rows.length} entries, ${span}`} />
      <span aria-hidden className='mt-4 block space-y-1'>
        {rows.slice(0, 4).map((row, i) => (
          <span
            key={`${row.title}-${i}`}
            className='label flex gap-3 text-muted'
          >
            <span>{row.year}</span>
            <span className='truncate text-ink'>{row.title}</span>
          </span>
        ))}
      </span>
      <TileTitle>Index</TileTitle>
    </Link>
  );
}

function WritingTile() {
  const latest = writing[0];
  return (
    <Link
      to='/about'
      hash='writing'
      className={cn(
        linkTile,
        'flex min-h-[190px] flex-col p-4 sm:p-6 md:col-span-2 lg:col-span-4'
      )}
    >
      <TileHead index={`${writing.length} notes`} />
      {latest ? (
        <span className='mt-4 block'>
          <span className='block text-[17px] leading-snug font-medium tracking-[-0.015em]'>
            {latest.title}
          </span>
          <span className='mt-1 line-clamp-2 text-[15px] leading-[1.45] text-muted'>
            {latest.body[0]}
          </span>
          <span className='label mt-2 block text-muted'>
            {formatNoteDate(latest.date)}
          </span>
        </span>
      ) : null}
      <TileTitle>Writing</TileTitle>
    </Link>
  );
}
