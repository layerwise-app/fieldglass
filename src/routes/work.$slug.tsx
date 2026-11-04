import { createFileRoute, notFound } from '@tanstack/react-router';
import { CaseStudy } from '~/components/case-study/CaseStudy';
import { getProject } from '~/content/work';
import { siteUrl } from '~/lib/site';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/work/$slug')({
  // Only plain data crosses from server to browser; the page reads the full
  // project (with its demo loaders) from the content registry.
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return {
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      discipline: project.discipline,
      client: project.client,
      year: project.year,
      image: project.cover.image.og ?? project.cover.image.src,
      imageAlt: project.cover.alt
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return seo({ title: portfolio.name, noindex: true });
    const path = `/work/${params.slug}`;
    return seo({
      title: `${loaderData.title} — ${portfolio.name}`,
      description: loaderData.summary,
      path,
      image: loaderData.image,
      imageAlt: loaderData.imageAlt,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: loaderData.title,
        description: loaderData.summary,
        url: siteUrl(path),
        image: siteUrl(loaderData.image),
        genre: loaderData.discipline,
        dateCreated: String(loaderData.year),
        creator: {
          '@type': 'Person',
          name: portfolio.name,
          jobTitle: portfolio.role,
          url: siteUrl('/about')
        },
        funder: { '@type': 'Organization', name: loaderData.client }
      }
    });
  },
  component: CaseStudyPage
});

function CaseStudyPage() {
  const { slug } = Route.useLoaderData();
  const project = getProject(slug);
  if (!project) return null;
  // Keyed so moving to the next project starts the page fresh.
  return <CaseStudy key={project.slug} project={project} />;
}
