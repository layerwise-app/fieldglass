import { createFileRoute, notFound } from '@tanstack/react-router';
import { getProject } from '~/content/work';
import { seo } from '~/utils/seo';

// Stub: replaced by the case study page.
export const Route = createFileRoute('/work/$slug')({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { slug: project.slug };
  },
  head: ({ params }) => seo({ title: params.slug, path: `/work/${params.slug}` }),
  component: () => <div className='p-10'>Case study</div>
});
