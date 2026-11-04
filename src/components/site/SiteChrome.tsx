import { useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { FieldCanvas } from '~/components/field/FieldCanvas';
import { Footer } from './Footer';
import { Header } from './Header';

/** Everything around a page: the particle field, header, main and footer. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const isHome = useRouterState({
    select: (s) => s.location.pathname === '/'
  });
  return (
    <>
      <a
        href='#main'
        className='sr-only-focusable glass fixed top-3 left-3 z-50 rounded-xl px-4 py-3 text-[15px]'
      >
        Skip to content
      </a>
      <span id='top' aria-hidden className='absolute top-0' />
      <FieldCanvas />
      {isHome ? null : <Header />}
      <main id='main' tabIndex={-1} className='relative z-[1] outline-none'>
        {children}
      </main>
      <Footer />
    </>
  );
}
