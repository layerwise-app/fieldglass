import { useId, useState } from 'react';
import type { Block } from '~/content/types';
import { Caption, GlassFrame } from '~/components/blocks/Figure';
import { ResponsiveImage } from '~/components/site/ResponsiveImage';

type CompareBlock = Extract<Block, { type: 'compare' }>;

/**
 * Before and after, one over the other. A native range input moves the
 * divide, so it works with arrow keys and screen readers.
 */
export function CompareBlockView({
  block,
  number
}: {
  block: CompareBlock;
  number: number;
}) {
  const [position, setPosition] = useState(50);
  const id = useId();
  const [beforeLabel, afterLabel] = block.labels ?? ['Before', 'After'];

  return (
    <figure>
      <GlassFrame>
        <div className='relative select-none'>
          <ResponsiveImage
            image={block.after.image}
            alt={`${afterLabel}: ${block.after.alt}`}
            sizes='(min-width: 1440px) 1360px, 100vw'
          />
          <div
            className='absolute inset-0'
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <ResponsiveImage
              image={block.before.image}
              alt={`${beforeLabel}: ${block.before.alt}`}
              sizes='(min-width: 1440px) 1360px, 100vw'
              className='h-full object-cover'
            />
          </div>

          <span className='label glass-quiet pointer-events-none absolute top-3 left-3 rounded-full px-3 py-1.5 text-ink md:top-5 md:left-5'>
            {beforeLabel}
          </span>
          <span className='label glass-quiet pointer-events-none absolute top-3 right-3 rounded-full px-3 py-1.5 text-ink md:top-5 md:right-5'>
            {afterLabel}
          </span>

          {/* The divide and its handle, drawn under the invisible range input. */}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_0_1px_rgba(19,20,24,.12)]'
            style={{ left: `${position}%` }}
          >
            <div className='compare-handle absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_6px_20px_-6px_rgba(19,20,24,.45)]'>
              <svg width='18' height='18' viewBox='0 0 18 18' fill='none'>
                <path
                  d='M6.5 4.5 2 9l4.5 4.5M11.5 4.5 16 9l-4.5 4.5'
                  stroke='currentColor'
                  strokeWidth='1.4'
                />
              </svg>
            </div>
          </div>

          <label htmlFor={id} className='sr-only'>
            Slide to compare {beforeLabel.toLowerCase()} and{' '}
            {afterLabel.toLowerCase()}
          </label>
          <input
            id={id}
            type='range'
            min={0}
            max={100}
            step={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            aria-valuetext={`${position}% ${beforeLabel.toLowerCase()}`}
            className='compare-range absolute inset-0 size-full cursor-ew-resize opacity-0'
          />
        </div>
      </GlassFrame>
      <Caption number={number}>{block.caption}</Caption>
    </figure>
  );
}
