import { cn } from '~/lib/utils';

/** The north-east arrow used on tiles and links. */
export function Arrow({
  className,
  size = 16,
  direction = 'ne'
}: {
  className?: string;
  size?: number;
  direction?: 'ne' | 'e' | 'n' | 's';
}) {
  const rotate = { ne: 0, e: 45, n: -45, s: 135 }[direction];
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 16 16'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.3}
      strokeLinecap='square'
      aria-hidden
      className={cn('shrink-0', className)}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path d='M4 12 12 4M5.5 4H12v6.5' />
    </svg>
  );
}
