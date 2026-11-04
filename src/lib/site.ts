import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestUrl } from '@tanstack/react-start/server';

type Site = {
  name: string;
  description: string;
  /**
   * The address search engines should index, like `https://bloombakery.com`.
   * Empty uses the address each visitor opened. Set it when a custom domain is
   * connected, so the layerwise.site address isn't indexed as a copy.
   */
  url: string;
  /**
   * Share image for link previews on Instagram, iMessage, WhatsApp, and
   * search: a 1200×630 PNG or JPG in `public/`, like `/og-image.jpg`. Pages
   * can set their own. Empty shows previews without an image.
   */
  image: string;
  imageAlt: string;
  /** The `content` of Google Search Console's HTML tag, if it's used. */
  googleSiteVerification: string;
};

/** What search engines and link previews read about this site. */
export const site: Site = {
  name: 'Noor Haddad — Designer & creative coder',
  description:
    'Noor Haddad is an independent designer and creative coder in Amsterdam, making generative identities, data sonification tools and real-time interfaces.',
  url: '',
  image: '/og-image.png',
  imageAlt:
    'A burst of graphite particles gathered into a radial form around the orange initials NH',
  googleSiteVerification: ''
};

/**
 * Public pages in `/sitemap.xml`. Every case study in `src/content/work/` is
 * added automatically by the sitemap route.
 */
export const sitemapPaths: string[] = ['/', '/work', '/about', '/contact'];

const requestOrigin = createIsomorphicFn()
  .server(() => getRequestUrl().origin)
  .client(() => window.location.origin);

/** Absolute URL for a path or a `public/` file on this site. */
export function siteUrl(path = '/'): string {
  return new URL(path, site.url || requestOrigin()).toString();
}
