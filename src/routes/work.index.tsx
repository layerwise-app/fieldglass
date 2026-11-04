import { createFileRoute, Link } from '@tanstack/react-router';
import { Arrow } from '~/components/site/Arrow';
import { isMorphing, useFieldScene } from '~/components/site/live';
import { ProjectLink } from '~/components/site/ProjectLink';
import { ResponsiveImage } from '~/components/site/ResponsiveImage';
import { ShapeGlyph } from '~/components/site/ShapeGlyph';
import { archive } from '~/content/archive';
import type { Project } from '~/content/types';
import { projects } from '~/content/work';
import { field } from '~/lib/field/store';
import { useFinePointer } from '~/lib/hooks';
import { cn } from '~/lib/utils';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

type View = 'grid' | 'index';

export const Route = createFileRoute('/work/')({
  validateSearch: (search: Record<string, unknown>): { view?: 'grid' | 'index' } =>
    search.view === 'index' ? { view: 'index' } : {},
  head: () =>
    seo({
      title: `Work — ${portfolio.name}`,
      description: `Case studies by ${portfolio.name}: generative identity, data sonification, a shader playground, a music visualizer, a film magazine and a spatial prototype.`,
      path: '/work'
    }),
  component: WorkPage
});

function WorkPage() {
  const { view = 'grid' } = Route.useSearch();
  useFieldScene({ shape: 'iris', depth: 1, x: 0, y: 0 });
  const total = projects.length + archive.length;

  return (
    <div className='mx-auto max-w-[1520px] px-4 sm:px-6'>
      <header className='grid gap-x-6 gap-y-8 pt-14 pb-10 sm:pt-24 sm:pb-14 lg:grid-cols-12'>
        <div className='lg:col-span-7'>
          <p className='label text-muted'>
            Work, {Math.min(...years())}–{Math.max(...years())}
          </p>
          <h1 className='display mt-4 text-[clamp(64px,11vw,168px)]'>
            Work
            <span className='label ml-3 align-top text-muted tracking-normal sm:ml-4'>
              ({String(view === 'index' ? total : projects.length).padStart(2, '0')})
            </span>
          </h1>
        </div>
        <div className='flex flex-col justify-end gap-7 lg:col-span-5 lg:pb-3'>
          <p className='max-w-[44ch] text-[19px] leading-[1.45] text-muted'>
            {projects.length} case studies in depth, and an index of everything
            else since {Math.min(...years())}: workshops, talks, experiments
            and small commissions.
          </p>
          <ViewToggle view={view} />
        </div>
      </header>

      {view === 'index' ? <IndexTable /> : <Grid />}
    </div>
  );
}

function years() {
  const all = [...projects.map((p) => p.year), ...archive.map((a) => a.year)];
  return all.length ? all : [new Date().getFullYear()];
}

function ViewToggle({ view }: { view: View }) {
  const item =
    'flex h-10 items-center gap-2 rounded-[12px] px-4 text-[15px] tracking-[-0.01em] transition-colors';
  return (
    <nav aria-label='View' className='glass-quiet flex w-fit gap-1 rounded-[16px] p-1'>
      <Link
        to='/work'
        search={{}}
        aria-current={view === 'grid' ? 'page' : undefined}
        className={cn(
          item,
          view === 'grid' ? 'bg-ink text-paper' : 'text-muted hover:bg-white/70 hover:text-ink'
        )}
      >
        Grid
      </Link>
      <Link
        to='/work'
        search={{ view: 'index' }}
        aria-current={view === 'index' ? 'page' : undefined}
        className={cn(
          item,
          view === 'index' ? 'bg-ink text-paper' : 'text-muted hover:bg-white/70 hover:text-ink'
        )}
      >
        Index
      </Link>
    </nav>
  );
}

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

// Alternating wide and narrow columns: 7/5, then 5/7.
const spans = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7'];

function Grid() {
  const preview = usePreview();
  if (projects.length === 0) {
    return (
      <p className='glass rounded-[28px] p-8 text-[17px] text-muted'>
        No case studies yet. Add one in src/content/work.
      </p>
    );
  }
  return (
    <ol className='grid gap-x-6 gap-y-10 sm:gap-y-14 md:grid-cols-2 lg:grid-cols-12'>
      {projects.map((project, index) => (
        <li
          key={project.slug}
          className={spans[index % spans.length]}
        >
          <ProjectLink
            project={project}
            {...preview(project)}
            className='group block rounded-[28px]'
          >
            <div className='glass overflow-hidden rounded-[28px] p-2 transition-[background-color] duration-500 group-hover:bg-white/70'>
              <div className='overflow-hidden rounded-[21px]'>
                <ResponsiveImage
                  image={project.cover.image}
                  alt={project.cover.alt}
                  priority={index < 2}
                  sizes='(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw'
                  className='transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.018]'
                />
              </div>
              <div className='grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-3 px-3 pt-4 pb-3 sm:px-4 sm:pt-5 sm:pb-4'>
                <h2 className='text-[clamp(24px,2.2vw,30px)] leading-[1.05] font-medium tracking-[-0.03em]'>
                  {project.title}
                </h2>
                <span className='label pt-1.5 text-muted'>{project.year}</span>
                <p className='col-span-2 max-w-[52ch] text-[15px] leading-[1.5] text-muted'>
                  {project.tagline}
                </p>
                <p className='label col-span-2 flex flex-wrap items-center gap-x-5 gap-y-1 pt-1 text-muted'>
                  <span className='text-ink'>{project.discipline}</span>
                  <span>{project.client}</span>
                  <span className='ml-auto flex items-center gap-2'>
                    <ShapeGlyph
                      shape={project.shape}
                      size={16}
                      className='transition-colors duration-300 group-hover:text-accent'
                    />
                    Field: {project.shape}
                  </span>
                </p>
              </div>
            </div>
          </ProjectLink>
        </li>
      ))}
    </ol>
  );
}

type Row = {
  year: number;
  title: string;
  type: string;
  client: string;
  project?: Project;
};

function IndexTable() {
  const preview = usePreview();
  const rows: Row[] = [
    ...projects.map((project) => ({
      year: project.year,
      title: project.title,
      type: project.discipline,
      client: project.client,
      project
    })),
    ...archive.map((item): Row => ({ ...item }))
  ].sort((a, b) => b.year - a.year || Number(Boolean(b.project)) - Number(Boolean(a.project)));

  return (
    <div className='glass overflow-hidden rounded-[28px] px-2 py-2 sm:px-3'>
      <table className='w-full border-collapse text-left'>
        <caption className='sr-only'>
          Every project, newest first. Case studies are links.
        </caption>
        <thead>
          <tr className='label text-muted'>
            <th scope='col' className='hidden w-[72px] px-3 py-4 font-normal sm:table-cell'>
              No.
            </th>
            <th scope='col' className='w-[64px] px-3 py-4 font-normal sm:w-[88px]'>
              Year
            </th>
            <th scope='col' className='px-3 py-4 font-normal'>
              Project
            </th>
            <th scope='col' className='hidden px-3 py-4 font-normal md:table-cell'>
              Type
            </th>
            <th scope='col' className='hidden px-3 py-4 font-normal lg:table-cell'>
              Client or venue
            </th>
            <th scope='col' className='w-[40px] px-3 py-4 font-normal'>
              <span className='sr-only'>Case study</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const number = String(rows.length - index).padStart(2, '0');
            return (
              <tr
                key={`${row.title}-${row.year}`}
                className={cn(
                  'group border-t border-line align-top',
                  row.project && 'transition-colors hover:bg-white/60'
                )}
              >
                <td className='label hidden px-3 py-4 text-muted sm:table-cell'>{number}</td>
                <td className='label px-3 py-4 text-muted'>{row.year}</td>
                <td className='px-3 py-3'>
                  {row.project ? (
                    <ProjectLink
                      project={row.project}
                      {...preview(row.project)}
                      className='flex items-center gap-2.5 rounded-md text-[17px] leading-6 font-medium tracking-[-0.015em] sm:text-[19px]'
                    >
                      <ShapeGlyph
                        shape={row.project.shape}
                        size={16}
                        className='shrink-0 text-muted transition-colors group-hover:text-accent'
                      />
                      {row.title}
                    </ProjectLink>
                  ) : (
                    <span className='block text-[17px] leading-6 tracking-[-0.015em] sm:text-[19px]'>
                      {row.title}
                    </span>
                  )}
                  <span className='mt-1 block text-[14px] leading-5 text-muted md:hidden'>
                    {row.type}, {row.client}
                  </span>
                </td>
                <td className='hidden px-3 py-4 text-[15px] leading-5 text-muted md:table-cell'>
                  {row.type}
                </td>
                <td className='hidden px-3 py-4 text-[15px] leading-5 text-muted lg:table-cell'>
                  {row.client}
                </td>
                <td className='px-3 py-4 text-right'>
                  {row.project ? (
                    <Arrow
                      size={14}
                      className='ml-auto opacity-40 transition-opacity group-hover:opacity-100'
                    />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
