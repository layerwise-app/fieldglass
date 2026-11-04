import { createFileRoute } from '@tanstack/react-router';
import { siteUrl } from '~/lib/site';

// The API and the development-only screen renderer stay out of search.
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            'User-agent: *',
            'Disallow: /api/',
            'Disallow: /render-screen/',
            '',
            `Sitemap: ${siteUrl('/sitemap.xml')}`,
            ''
          ].join('\n'),
          { headers: { 'content-type': 'text/plain; charset=utf-8' } }
        )
    }
  }
});
