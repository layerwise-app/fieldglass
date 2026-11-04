import {
  Component,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode
} from 'react';
import type { Block } from '~/content/types';
import { Caption, GlassFrame } from '~/components/blocks/Figure';

type DemoBlock = Extract<Block, { type: 'demo' }>;

/**
 * A live piece of the project. The still holds the exact box until the
 * component has loaded nearby, then the component takes its place.
 */
export function DemoBlockView({
  block,
  number
}: {
  block: DemoBlock;
  number: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [Demo, setDemo] = useState<ComponentType | null>(null);
  const [shown, setShown] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        block
          .load()
          .then((module) => {
            if (!cancelled) setDemo(() => module.default);
          })
          .catch(() => {
            if (!cancelled) setFailed(true);
          });
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(box);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [block]);

  // Let the demo paint its first frame before the still underneath fades.
  useEffect(() => {
    if (!Demo) return;
    const id = window.setTimeout(() => setShown(true), 350);
    return () => window.clearTimeout(id);
  }, [Demo]);

  const { image, alt } = block.still;
  const style = {
    '--demo-desktop': `${image.width} / ${image.height}`,
    '--demo-mobile': String(block.mobileAspect ?? 4 / 5)
  } as CSSProperties;

  return (
    <figure>
      <div className='mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3'>
        <div>
          <p className='label flex items-center gap-2 text-ink'>
            <span
              aria-hidden
              className='inline-block size-1.5 rounded-full bg-accent'
            />
            Live demo
          </p>
          <h3 className='heading mt-2 text-[26px] md:text-[32px]'>
            {block.title}
          </h3>
        </div>
        <p className='label text-muted'>
          {failed ? 'Showing a still' : 'Try it'}
        </p>
      </div>
      <GlassFrame>
        <div
          ref={boxRef}
          style={style}
          className='relative isolate w-full aspect-(--demo-mobile) md:aspect-(--demo-desktop)'
        >
          <img
            src={image.src}
            srcSet={image.srcSet || undefined}
            sizes='(min-width: 1440px) 1360px, 100vw'
            width={image.width}
            height={image.height}
            alt={Demo && !failed ? '' : alt}
            aria-hidden={Demo && !failed ? true : undefined}
            loading='lazy'
            decoding='async'
            className='absolute inset-0 size-full object-cover transition-opacity duration-500'
            style={{
              backgroundImage: `url("${image.placeholder}")`,
              backgroundSize: 'cover',
              opacity: shown && !failed ? 0 : 1
            }}
          />
          {Demo && !failed && (
            <div className='absolute inset-0'>
              <DemoBoundary onError={() => setFailed(true)}>
                <Demo />
              </DemoBoundary>
            </div>
          )}
        </div>
      </GlassFrame>
      <Caption number={number}>{block.caption}</Caption>
    </figure>
  );
}

class DemoBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
