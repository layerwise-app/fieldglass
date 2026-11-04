import {
  Link,
  rootRouteId,
  useMatch,
  useRouter
} from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  });

  console.error(error);

  return (
    <div className='mx-auto grid min-h-[70svh] max-w-[1520px] place-items-center px-4 py-16 sm:px-6'>
      <div className='glass w-full max-w-[640px] rounded-[30px] p-7 sm:p-10'>
        <p className='label text-muted'>Something went wrong</p>
        <h1 className='display mt-5 text-[clamp(36px,5vw,56px)]'>
          This page didn’t load.
        </h1>
        <p className='mt-5 max-w-[44ch] text-[17px] leading-[1.55] text-muted'>
          Try again in a moment. If it keeps happening, the rest of the site
          should still work.
        </p>
        {import.meta.env.DEV && error instanceof Error ? (
          <pre className='label mt-6 overflow-x-auto rounded-xl bg-white/60 p-4 whitespace-pre-wrap normal-case'>
            {error.message}
          </pre>
        ) : null}
        <div className='mt-8 flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => router.invalidate()}
            className='flex h-11 items-center rounded-[14px] bg-ink px-5 text-[15px] text-paper hover:bg-ink/85'
          >
            Try again
          </button>
          {isRoot ? (
            <Link
              to='/'
              className='flex h-11 items-center rounded-[14px] bg-white/60 px-5 text-[15px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)] hover:bg-white/90'
            >
              Home
            </Link>
          ) : (
            <Link
              to='/'
              className='flex h-11 items-center rounded-[14px] bg-white/60 px-5 text-[15px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)] hover:bg-white/90'
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
            >
              Go back
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
