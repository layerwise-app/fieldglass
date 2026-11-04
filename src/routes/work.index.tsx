import { createFileRoute } from '@tanstack/react-router';
import { seo } from '~/utils/seo';

// Stub: replaced by the Work page.
export const Route = createFileRoute('/work/')({
  validateSearch: (search: Record<string, unknown>): { view?: 'grid' | 'index' } =>
    search.view === 'index' ? { view: 'index' } : {},
  head: () => seo({ title: 'Work — Noor Haddad', path: '/work' }),
  component: () => <div className='p-10'>Work</div>
});
