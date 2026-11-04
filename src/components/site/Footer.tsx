import { Link } from '@tanstack/react-router';
import { DissolvingWord } from '~/components/field/DissolvingWord';
import { portfolio } from '~/portfolio.config';
import { Arrow } from './Arrow';
import { LocalTime } from './live';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className='relative z-[1] mt-24 overflow-hidden sm:mt-32'>
      <div className='mx-auto max-w-[1520px] px-4 sm:px-6'>
        <div className='grid gap-x-6 gap-y-8 border-t border-line pt-8 pb-10 sm:grid-cols-12 sm:pt-10'>
          <div className='sm:col-span-6 lg:col-span-5'>
            <p className='label text-muted'>
              <span
                aria-hidden
                className='mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-accent align-middle'
              />
              {portfolio.availability}
            </p>
            <Link
              to='/contact'
              className='group mt-4 inline-flex items-center gap-3 rounded-md text-[clamp(28px,3.4vw,44px)] leading-none font-medium tracking-[-0.035em]'
            >
              <span className='link-line pb-1'>Start a project</span>
              <Arrow
                size={28}
                className='transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:-translate-y-1'
              />
            </Link>
          </div>

          <dl className='grid grid-cols-2 gap-x-6 gap-y-6 sm:col-span-6 sm:grid-cols-3 lg:col-span-7'>
            <div>
              <dt className='label text-muted'>Studio</dt>
              <dd className='mt-2 text-[15px] leading-6'>
                {portfolio.location}
                <br />
                <LocalTime className='font-pixel text-[13px] tabular-nums' />
              </dd>
            </div>
            <div>
              <dt className='label text-muted'>Elsewhere</dt>
              <dd className='mt-2'>
                <ul className='text-[15px] leading-6'>
                  {portfolio.social.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='rounded-sm hover:text-muted'
                      >
                        {link.label}
                        <span className='sr-only'> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                  {portfolio.ownerEmail ? (
                    <li>
                      <a
                        href={`mailto:${portfolio.ownerEmail}`}
                        className='rounded-sm hover:text-muted'
                      >
                        {portfolio.ownerEmail}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </dd>
            </div>
            <div className='col-span-2 sm:col-span-1'>
              <dt className='label text-muted'>Colophon</dt>
              <dd className='mt-2 text-[15px] leading-6 text-ink'>
                Set in Instrument Sans and Departure Mono. The field is drawn
                live in WebGL.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className='relative mx-auto max-w-[1520px] px-3 sm:px-5'>
        <p className='sr-only'>{portfolio.name.split(' ')[0]}</p>
        <DissolvingWord word={portfolio.footerWord} className='w-full' />
      </div>

      <div className='mx-auto flex max-w-[1520px] items-center justify-between gap-4 px-4 pt-5 pb-6 sm:px-6'>
        <p className='label text-muted'>
          © {year} {portfolio.name}
        </p>
        <a href='#top' className='label flex items-center gap-1.5 rounded-sm text-muted hover:text-ink'>
          Back to top
          <Arrow size={12} direction='n' />
        </a>
      </div>
    </footer>
  );
}
