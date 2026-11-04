import type { Project } from '~/content/types';

// Every `src/content/work/<slug>.ts` file is a case study. Adding a file adds
// the project to Home, Work, the index and the sitemap.
const modules = import.meta.glob<{ default: Project }>(
  ['./*.ts', '!./index.ts'],
  { eager: true }
);

export const projects: Project[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.order - b.order || b.year - a.year);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string): Project {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length]!;
}
