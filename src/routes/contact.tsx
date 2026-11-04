import { createFileRoute } from '@tanstack/react-router';
import { seo } from '~/utils/seo';

// Stub: replaced by the Contact page.
export const Route = createFileRoute('/contact')({
  head: () => seo({ title: 'Contact — Noor Haddad', path: '/contact' }),
  component: () => <div className='p-10'>Contact</div>
});
