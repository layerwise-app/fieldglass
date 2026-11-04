import { createFileRoute } from '@tanstack/react-router';
import { seo } from '~/utils/seo';

// Stub: replaced by the About page.
export const Route = createFileRoute('/about')({
  head: () => seo({ title: 'About — Noor Haddad', path: '/about' }),
  component: () => <div className='p-10'>About</div>
});
