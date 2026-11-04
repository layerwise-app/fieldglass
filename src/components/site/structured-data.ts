import { site, siteUrl } from '~/lib/site';
import { portfolio } from '~/portfolio.config';

/** Profile links that point at an actual profile, not a site's home page. */
function profileLinks() {
  return portfolio.social
    .map((link) => link.href)
    .filter((href) => {
      try {
        return new URL(href).pathname.replace(/\/+$/, '').length > 0;
      } catch {
        return false;
      }
    });
}

/** schema.org Person for the owner, for Home and About. */
export function personJsonLd() {
  const [locality, country] = portfolio.location.split(',').map((s) => s.trim());
  const sameAs = profileLinks();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': siteUrl('/#person'),
    name: portfolio.name,
    jobTitle: portfolio.role,
    description: site.description,
    url: siteUrl('/'),
    image: siteUrl('/portrait.webp'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      ...(country ? { addressCountry: country } : {})
    },
    ...(portfolio.ownerEmail ? { email: `mailto:${portfolio.ownerEmail}` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: [
      'Generative identity',
      'Creative coding',
      'Data sonification',
      'Real-time graphics',
      'Interaction design',
      'Spatial interfaces'
    ]
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: siteUrl('/'),
    author: { '@id': siteUrl('/#person') }
  };
}
