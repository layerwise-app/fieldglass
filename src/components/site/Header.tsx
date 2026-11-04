import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '~/lib/utils';
import { portfolio } from '~/portfolio.config';

export const navItems = [
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
] as const;

/** The floating glass bar on every page except Home. */
export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className='sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4'>
      <div className='glass glass-bar mx-auto flex h-14 max-w-[1520px] items-center justify-between gap-4 rounded-[20px] pr-2 pl-4 sm:pl-5'>
        <Link
          to='/'
          className='flex h-11 min-w-0 items-center rounded-md'
        >
          <span className='flex items-baseline gap-3'>
            <span className='text-[15px] font-medium tracking-[-0.01em] whitespace-nowrap'>
              {portfolio.name}
            </span>
            <span className='label hidden text-muted md:inline'>
              {portfolio.role}
            </span>
          </span>
        </Link>
        <nav aria-label='Main'>
          <ul className='flex items-center'>
            {navItems.map((item) => {
              const current =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'relative flex h-11 items-center gap-2 rounded-[12px] px-2.5 text-[15px] tracking-[-0.01em] transition-colors sm:px-3.5',
                      current
                        ? 'text-ink'
                        : 'text-muted hover:bg-white/60 hover:text-ink'
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'size-1.5 rounded-full bg-accent transition-transform duration-300',
                        current ? 'scale-100' : 'scale-0'
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
