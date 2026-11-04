import type { CSSProperties } from 'react';
import type { ImageAsset } from '~/content/types';
import { cn } from '~/lib/utils';

/**
 * An image from `scripts/add-images`: sized before it loads (no layout shift),
 * with its blurred placeholder underneath until the file arrives.
 */
export function ResponsiveImage({
  image,
  alt,
  sizes = '100vw',
  priority = false,
  className,
  style
}: {
  image: ImageAsset;
  alt: string;
  /** The `sizes` attribute, like `(min-width: 1024px) 50vw, 100vw`. */
  sizes?: string;
  /** Above the fold: load eagerly with high priority. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet || undefined}
      sizes={image.srcSet ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'auto' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      className={cn('h-auto w-full', className)}
      style={{
        aspectRatio: `${image.width} / ${image.height}`,
        backgroundImage: `url("${image.placeholder}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style
      }}
    />
  );
}
