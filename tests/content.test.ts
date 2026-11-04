import { describe, expect, it } from 'vitest';
import { shapeNames, type Block, type Figure, type Project } from '~/content/types';
import { getNextProject, getProject, projects } from '~/content/work';

function figures(project: Project): Figure[] {
  const list: Figure[] = [project.cover];
  const add = (block: Block) => {
    switch (block.type) {
      case 'image':
        list.push(block.figure);
        break;
      case 'pair':
        list.push(...block.figures);
        break;
      case 'compare':
        list.push(block.before, block.after);
        break;
      case 'demo':
        list.push(block.still);
        break;
      default:
        break;
    }
  };
  project.blocks.forEach(add);
  return list;
}

// The sample work is held to the template's bar: a live demo and at least five
// images each. Your own projects only need to be valid.
const SAMPLES = ['veld-kunsthal', 'low-orbit', 'uniforms', 'undertone', 'atlas-room', 'long-take'];
const samples = projects.filter((p) => SAMPLES.includes(p.slug));

describe('case studies', () => {
  it('has at least one project', () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it('uses unique slugs and orders', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const orders = projects.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it.each(projects.map((p) => [p.slug, p] as const))(
    '%s is complete',
    (_slug, project) => {
      expect(shapeNames).toContain(project.shape);
      expect(project.shape).not.toBe('iris');
      for (const field of ['title', 'tagline', 'client', 'role', 'discipline', 'summary'] as const) {
        expect(project[field].trim().length, field).toBeGreaterThan(0);
      }
      expect(project.team.length).toBeGreaterThan(0);
      expect(project.problem.length).toBeGreaterThan(0);
      expect(project.decisions.length).toBeGreaterThan(0);
      expect(project.outcome.length).toBeGreaterThan(0);

      for (const figure of figures(project)) {
        expect(figure.alt.trim().length, 'alt text').toBeGreaterThan(0);
        expect(figure.image.width).toBeGreaterThan(0);
        expect(figure.image.placeholder).toMatch(/^data:image\//);
      }

      for (const block of project.blocks) {
        if (block.type === 'compare') {
          expect(block.before.image.width / block.before.image.height).toBeCloseTo(
            block.after.image.width / block.after.image.height,
            3
          );
        }
        if (block.type === 'demo') expect(typeof block.load).toBe('function');
      }
    }
  );

  it.each(samples.map((p) => [p.slug, p] as const))(
    'sample %s has a demo, a share image and five or more images',
    (_slug, project) => {
      expect(project.cover.image.og, 'cover needs a link-preview JPG').toBeTruthy();
      expect(project.decisions.length).toBeGreaterThanOrEqual(3);
      expect(project.blocks.some((b) => b.type === 'demo')).toBe(true);
      const distinct = new Set(figures(project).map((f) => f.image.src));
      expect(distinct.size).toBeGreaterThanOrEqual(5);
    }
  );

  it('finds projects and wraps to the next one', () => {
    const first = projects[0]!;
    const last = projects[projects.length - 1]!;
    expect(getProject(first.slug)).toBe(first);
    expect(getProject('not-a-project')).toBeUndefined();
    expect(getNextProject(last.slug)).toBe(first);
  });

  it.skipIf(samples.length < SAMPLES.length)('covers every block type across the sample work', () => {
    const used = new Set(samples.flatMap((p) => p.blocks.map((b) => b.type)));
    for (const type of ['demo', 'image', 'pair', 'video', 'text', 'quote', 'compare', 'metrics']) {
      expect(used, type).toContain(type);
    }
  });
});
