import { Link } from '@tanstack/react-router';
import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { BlockView, figureCount } from '~/components/blocks';
import { GlassFrame } from '~/components/blocks/Figure';
import { useScrollScene } from '~/components/case-study/useScrollScene';
import { Arrow } from '~/components/site/Arrow';
import { consumeArrival, ProjectLink } from '~/components/site/ProjectLink';
import { ResponsiveImage } from '~/components/site/ResponsiveImage';
import { ShapeGlyph } from '~/components/site/ShapeGlyph';
import type { Project } from '~/content/types';
import { getNextProject, projects } from '~/content/work';

const pad = (n: number) => String(n).padStart(2, '0');

export function CaseStudy({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useScrollScene(project.shape, stage);

  // After a morph the page fades in over the formed shape. The flag is set
  // by ProjectLink, which also dims <main> until navigation finishes.
  useLayoutEffect(() => {
    const morphing =
      document.getElementById('main')?.classList.contains('page-leave') ??
      false;
    if (consumeArrival() || morphing) ref.current?.classList.add('arrive');
  }, []);

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = getNextProject(project.slug);

  let figure = 1;
  const blocks = project.blocks.map((block, i) => {
    const number = figure;
    figure += figureCount(block);
    return (
      <div key={i}>
        <BlockView block={block} number={number} />
      </div>
    );
  });

  return (
    <article ref={ref} className='relative'>
      <Hero
        project={project}
        index={index}
        total={projects.length}
        stage={stage}
      />

      <div className='mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10'>
        <figure>
          <GlassFrame>
            <ResponsiveImage
              image={project.cover.image}
              alt={project.cover.alt}
              sizes='(min-width: 1440px) 1360px, 100vw'
              priority
            />
          </GlassFrame>
        </figure>

        <Overview project={project} />

        <div className='mt-24 space-y-24 md:mt-36 md:space-y-36'>{blocks}</div>

        {next.slug !== project.slug && <NextProject project={next} />}
      </div>
    </article>
  );
}

function Hero({
  project,
  index,
  total,
  stage
}: {
  project: Project;
  index: number;
  total: number;
  stage: RefObject<HTMLDivElement | null>;
}) {
  return (
    <header className='mx-auto flex max-w-[1440px] flex-col px-4 pt-24 pb-8 md:px-6 md:pt-28 lg:min-h-[88svh] lg:px-10 lg:pb-12'>
      <div className='flex items-center justify-between gap-4'>
        <Link
          to='/work'
          className='label -my-[13px] -ml-2 inline-flex h-11 items-center gap-2 rounded-md px-2 text-muted transition-colors hover:text-ink'
        >
          <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden>
            <path d='M11 6H1.5M5.5 2 1.5 6l4 4' stroke='currentColor' strokeWidth='1.2' />
          </svg>
          <span>Work</span>
        </Link>
        {index >= 0 && (
          <p className='label text-muted'>
            Case study {pad(index + 1)} / {pad(total)}
          </p>
        )}
      </div>

      <div className='grid flex-1 grid-cols-12 gap-x-4 md:gap-x-6'>
        {/* The project's shape forms inside this empty box: the field is
            fitted to it, so the form stays clear of the text beside it. */}
        <div className='col-span-12 flex flex-col pt-4 lg:order-2 lg:col-span-5 lg:pt-8'>
          <div
            ref={stage}
            aria-hidden
            className='h-[clamp(240px,40svh,440px)] lg:h-auto lg:min-h-[340px] lg:flex-1'
          />
          <p className='label mt-3 flex items-center justify-end gap-2 text-muted lg:mt-4'>
            <ShapeGlyph shape={project.shape} size={16} className='text-ink' />
            <span>
              Field: <span className='text-ink'>{project.shape}</span>
            </span>
          </p>
        </div>

        <div className='col-span-12 flex flex-col justify-end pt-8 lg:order-1 lg:col-span-7 lg:pt-16'>
          <p className='label flex items-center gap-2 text-ink'>
            <span aria-hidden className='inline-block size-1.5 rounded-full bg-accent' />
            {project.discipline}
          </p>
          <h1 className='display mt-5 text-[clamp(52px,9vw,140px)] text-balance lg:text-[clamp(64px,8.2vw,124px)]'>
            {project.title}
          </h1>
          <p className='heading mt-6 max-w-[28ch] text-[22px] text-muted md:text-[28px] lg:text-[32px]'>
            {project.tagline}
          </p>

          <dl className='glass-quiet mt-12 grid grid-cols-2 gap-x-6 gap-y-6 rounded-[22px] p-5 md:mt-16 md:grid-cols-[1.2fr_0.5fr_1.2fr_1.6fr] md:p-6'>
            <Meta term='Client'>{project.client}</Meta>
            <Meta term='Year'>{project.year}</Meta>
            <Meta term='Role' wide>
              {project.role}
            </Meta>
            <Meta term='Team' wide>
              <ul>
                {project.team.map((member) => (
                  <li key={member}>{member}</li>
                ))}
              </ul>
            </Meta>
          </dl>
        </div>
      </div>
    </header>
  );
}

function Meta({
  term,
  wide = false,
  children
}: {
  term: string;
  /** Spans both columns on phones. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? 'col-span-2 min-w-0 md:col-span-1' : 'min-w-0'}>
      <dt className='label text-muted'>{term}</dt>
      <dd className='mt-2 text-[15px] leading-snug'>{children}</dd>
    </div>
  );
}

function Overview({ project }: { project: Project }) {
  return (
    <section
      aria-label='Overview'
      className='glass mt-24 rounded-[26px] px-5 py-10 md:mt-36 md:rounded-[34px] md:px-12 md:py-16 lg:px-16 lg:py-20'
    >
      <OverviewRow label='The brief'>
        <div className='prose-fg max-w-[60ch] text-[19px] leading-[1.5] md:text-[23px]'>
          {project.problem.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </OverviewRow>

      <OverviewRow label='Decisions'>
        <ol>
          {project.decisions.map((decision, i) => (
            <li
              key={decision.title}
              className='border-t py-7 first:border-t-0 first:pt-0 last:pb-0 md:grid md:grid-cols-[3.5rem_1fr] md:gap-x-4'
            >
              <span className='label mb-2 block text-muted md:mb-0 md:pt-1.5'>
                {pad(i + 1)}
              </span>
              <div>
                <h3 className='heading text-[22px] md:text-[26px]'>
                  {decision.title}
                </h3>
                <p className='mt-3 max-w-[62ch] text-[17px] leading-[1.6]'>
                  {decision.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </OverviewRow>

      <OverviewRow label='Outcome'>
        <div className='prose-fg max-w-[62ch] text-[18px] leading-[1.6] md:text-[19px]'>
          {project.outcome.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </OverviewRow>
    </section>
  );
}

function OverviewRow({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className='grid grid-cols-12 gap-x-4 gap-y-5 border-t pt-10 first:border-t-0 first:pt-0 [&+&]:mt-10 md:gap-x-6 md:[&+&]:mt-14 md:pt-14'>
      <h2 className='label col-span-12 text-ink lg:col-span-3'>{label}</h2>
      <div className='col-span-12 lg:col-span-9'>{children}</div>
    </div>
  );
}

function NextProject({ project }: { project: Project }) {
  return (
    <nav aria-label='Next project' className='mt-28 mb-10 md:mt-40'>
      <ProjectLink
        project={project}
        className='group glass block rounded-[26px] p-5 md:rounded-[34px] md:p-10 lg:p-12'
      >
        <div className='flex items-start justify-between gap-6'>
          <p className='label text-muted'>Next project</p>
          <Arrow
            size={28}
            className='transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1'
          />
        </div>
        <p className='display mt-16 text-[clamp(44px,8vw,120px)] md:mt-24'>
          {project.title}
        </p>
        <div className='mt-6 flex flex-wrap items-center gap-x-6 gap-y-2'>
          <span className='heading text-[20px] text-muted md:text-[24px]'>
            {project.tagline}
          </span>
        </div>
        <p className='label mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted'>
          <span>{project.discipline}</span>
          <span>{project.year}</span>
          <span className='flex items-center gap-2'>
            <ShapeGlyph shape={project.shape} size={14} className='text-ink' />
            {project.shape}
          </span>
        </p>
      </ProjectLink>
    </nav>
  );
}
