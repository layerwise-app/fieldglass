import { createFileRoute } from '@tanstack/react-router';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/')({
  head: () => seo({ title: 'Noor Haddad', path: '/' }),
  component: () => <main className='p-10'>Fieldglass</main>
});
