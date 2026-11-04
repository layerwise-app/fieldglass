import { cn } from '~/lib/utils';
import { portfolio } from '~/portfolio.config';

/**
 * Noor's portrait: a stipple drawing in 24,134 dots, drawn on canvas from
 * hand-made silhouette paths and saved as `public/portrait.webp`
 * (960×1200). To use a photo instead, replace that file with a 4:5 image of
 * the same name, or point `src` below at your own.
 */
const src = '/portrait.webp';
const width = 960;
const height = 1200;

export function Portrait({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        'relative overflow-hidden rounded-[22px] bg-[#EEEDE8] shadow-[inset_0_0_0_1px_rgba(255,255,255,.75)]',
        className
      )}
    >
      <img
        src={src}
        width={width}
        height={height}
        alt={portfolio.portrait.alt}
        loading='lazy'
        decoding='async'
        className='size-full object-cover object-[50%_35%]'
        style={{ aspectRatio: `${width} / ${height}` }}
      />
      {/* Each label sits on a chip of paper so the dots never run under it. */}
      <figcaption className='label absolute inset-x-0 top-0 flex justify-between gap-3 p-2.5 text-muted'>
        <span className='rounded-md bg-[#EEEDE8] px-1.5 py-0.5'>
          {portfolio.name.split(' ')[0]}, 2026
        </span>
        <span className='rounded-md bg-[#EEEDE8] px-1.5 py-0.5'>24,134 dots</span>
      </figcaption>
    </figure>
  );
}
