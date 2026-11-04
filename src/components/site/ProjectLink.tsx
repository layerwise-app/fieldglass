import { Link, useRouter } from '@tanstack/react-router';
import type { MouseEvent, ReactNode } from 'react';
import type { Project } from '~/content/types';
import { field } from '~/lib/field/store';
import { useReducedMotion } from '~/lib/hooks';

let arriving = false;
let busy = false;

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
 * A link to a case study. A plain click first morphs the particle field into
 * the project's shape, then opens the page. Modified clicks (new tab), reduced
 * motion and the WebGL fallback navigate straight away.
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
    try {
      await field.morph(project.shape);
      arriving = true;
      await router.navigate({
        to: '/work/$slug',
        params: { slug: project.slug }
      });
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
