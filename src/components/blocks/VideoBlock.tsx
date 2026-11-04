import { useEffect, useRef } from 'react';
import type { Block } from '~/content/types';
import { Caption, GlassFrame } from '~/components/blocks/Figure';
import { useReducedMotion } from '~/lib/hooks';

type VideoBlock = Extract<Block, { type: 'video' }>;

/**
 * Plays muted while it's on screen and pauses when it leaves. With reduced
 * motion it waits for the play button.
 */
export function VideoBlockView({
  block,
  number
}: {
  block: VideoBlock;
  number: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !reducedMotion) {
          video.play().catch(() => {});
        } else if (!entry?.isIntersecting) {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const { poster } = block;
  return (
    <figure>
      <GlassFrame>
        <video
          ref={ref}
          src={block.src}
          poster={poster.src}
          width={poster.width}
          height={poster.height}
          muted
          loop
          playsInline
          controls
          preload='none'
          aria-label={block.label}
          className='h-auto w-full bg-ink'
          style={{ aspectRatio: `${poster.width} / ${poster.height}` }}
        />
      </GlassFrame>
      <Caption number={number}>{block.caption}</Caption>
    </figure>
  );
}
