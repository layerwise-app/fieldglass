import { Link, useRouter } from '@tanstack/react-router';
import type { MouseEvent, ReactNode } from 'react';
import type { Project } from '~/content/types';
import { stageGuess } from '~/components/case-study/useScrollScene';
import { field } from '~/lib/field/store';
import { useReducedMotion } from '~/lib/hooks';

let arriving = false;
let busy = false;

/** How long the old page takes to fade out (matches `.page-leave`). */
const LEAVE_MS = 160;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * True once, right after a project was opened through a morph. The case study
 * page reads it on its first render to fade its content in.
 */
export function consumeArrival(): boolean {
  const value = arriving;
  arriving = false;
  return value;
}

/**
 * A link to a case study. A plain click starts morphing the particle field
 * into the project's shape and opens the page as soon as the old one has
 * faded out; the morph finishes behind the case study's title. Modified
 * clicks (new tab), reduced motion and the WebGL fallback navigate straight
 * away.
 */
export function ProjectLink({
  project,
  children,
  className,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  'aria-label': ariaLabel
}: {
  project: Pick<Project, 'slug' | 'shape' | 'title'>;
  children: ReactNode;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  'aria-label'?: string;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      reducedMotion ||
      field.getInfo().mode !== 'live'
    ) {
      return;
    }
    event.preventDefault();
    if (busy) return;
    busy = true;
    const main = document.getElementById('main');
    main?.classList.add('page-leave');
    const target = { to: '/work/$slug', params: { slug: project.slug } } as const;
    void field.morph(project.shape);
    field.setScene(stageGuess());
    try {
      await Promise.all([
        wait(LEAVE_MS),
        router.preloadRoute(target).catch(() => undefined)
      ]);
      arriving = true;
      await router.navigate(target);
    } finally {
      main?.classList.remove('page-leave');
      busy = false;
    }
  }

  return (
    <Link
      to='/work/$slug'
      params={{ slug: project.slug }}
      preload='intent'
      className={className}
      onClick={handleClick}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
