import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

/** Images sit on a thin pane of glass, so the field glints around them. */
export function GlassFrame({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'glass overflow-hidden rounded-[22px] p-1.5 md:rounded-[30px] md:p-2',
        className
      )}
    >
      <div className='relative overflow-hidden rounded-[17px] md:rounded-[23px]'>
        {children}
      </div>
    </div>
  );
}

/** "Fig. 03 — caption", in pixel type and body type. */
export function Caption({
  number,
  children,
  className
}: {
  number?: number;
  children?: ReactNode;
  className?: string;
}) {
  if (!children && number === undefined) return null;
  return (
    <figcaption
      className={cn(
        'mt-4 flex max-w-[72ch] items-baseline gap-4 text-[15px] leading-snug text-muted',
        className
      )}
    >
      {number !== undefined && (
        <span className='label shrink-0 text-ink'>
          Fig. {String(number).padStart(2, '0')}
        </span>
      )}
      {children && <span>{children}</span>}
    </figcaption>
  );
}
