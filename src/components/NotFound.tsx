import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Arrow } from '~/components/site/Arrow';
import { useFieldScene } from '~/components/site/live';

export function NotFound({ children }: { children?: ReactNode }) {
  useFieldScene({ shape: 'iris', depth: 1, x: 0, y: 0 });
  return (
    <div className='mx-auto grid min-h-[70svh] max-w-[1520px] place-items-center px-4 py-16 sm:px-6'>
      <div className='glass w-full max-w-[640px] rounded-[30px] p-7 sm:p-10'>
        <p className='label text-muted'>404, not found</p>
        <h1 className='display mt-5 text-[clamp(40px,6vw,64px)]'>
          This part of the field is empty.
        </h1>
        <div className='mt-5 max-w-[44ch] text-[17px] leading-[1.55] text-muted'>
          {children ?? (
            <p>
              The page you were looking for doesn’t exist, or it moved. The
              work is still where it was.
            </p>
          )}
        </div>
        <div className='mt-8 flex flex-wrap gap-2'>
          <Link
            to='/'
            className='flex h-11 items-center gap-2 rounded-[14px] bg-ink px-5 text-[15px] text-paper hover:bg-ink/85'
          >
            Home
          </Link>
          <Link
            to='/work'
            className='flex h-11 items-center gap-2 rounded-[14px] bg-white/60 px-5 text-[15px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)] hover:bg-white/90'
          >
            See the work
            <Arrow size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
