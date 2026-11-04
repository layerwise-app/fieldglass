import type { Block } from '~/content/types';
import { CompareBlockView } from '~/components/blocks/CompareBlock';
import { DemoBlockView } from '~/components/blocks/DemoBlock';
import { Caption, GlassFrame } from '~/components/blocks/Figure';
import { VideoBlockView } from '~/components/blocks/VideoBlock';
import { ResponsiveImage } from '~/components/site/ResponsiveImage';

const FULL = '(min-width: 1440px) 1360px, 100vw';
const HALF = '(min-width: 1440px) 668px, (min-width: 768px) 50vw, 100vw';

/** How many figure numbers a block uses, so captions count up the page. */
export function figureCount(block: Block): number {
  switch (block.type) {
    case 'pair':
      return 2;
    case 'image':
    case 'video':
    case 'compare':
    case 'demo':
      return 1;
    default:
      return 0;
  }
}

/** Renders one case-study block. `number` is its first figure number. */
export function BlockView({ block, number }: { block: Block; number: number }) {
  switch (block.type) {
    case 'demo':
      return <DemoBlockView block={block} number={number} />;
    case 'image':
      return (
        <figure>
          <GlassFrame>
            <ResponsiveImage
              image={block.figure.image}
              alt={block.figure.alt}
              sizes={FULL}
            />
          </GlassFrame>
          <Caption number={number}>{block.caption}</Caption>
        </figure>
      );
    case 'pair':
      return (
        <figure>
          <div className='grid gap-4 md:grid-cols-2 md:gap-6'>
            {block.figures.map((figure, index) => (
              <GlassFrame key={index}>
                <ResponsiveImage
                  image={figure.image}
                  alt={figure.alt}
                  sizes={HALF}
                />
              </GlassFrame>
            ))}
          </div>
          <Caption number={number}>
            {block.caption}
            <span className='sr-only'>
              {' '}
              (figures {number} and {number + 1})
            </span>
          </Caption>
        </figure>
      );
    case 'video':
      return <VideoBlockView block={block} number={number} />;
    case 'compare':
      return <CompareBlockView block={block} number={number} />;
    case 'text':
      return <TextBlockView heading={block.heading} body={block.body} />;
    case 'quote':
      return (
        <figure className='grid grid-cols-12 gap-x-4 md:gap-x-6'>
          <div className='col-span-12 md:col-span-10 md:col-start-2 lg:col-span-9 lg:col-start-3'>
            <span
              aria-hidden
              className='mb-6 block size-2 rounded-full bg-accent md:mb-8'
            />
            <blockquote className='heading text-[28px] leading-[1.15] md:text-[44px] lg:text-[52px]'>
              <p>“{block.quote}”</p>
            </blockquote>
            <figcaption className='mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1'>
              <span className='text-[17px] font-medium'>{block.name}</span>
              <span className='label text-muted'>{block.role}</span>
            </figcaption>
          </div>
        </figure>
      );
    case 'metrics':
      return (
        <section aria-label='Results' className='glass rounded-[24px] md:rounded-[32px]'>
          <dl
            className={[
              'grid grid-cols-2',
              block.items.length >= 4
                ? 'lg:grid-cols-4'
                : block.items.length === 3
                  ? 'lg:grid-cols-3'
                  : 'lg:grid-cols-2'
            ].join(' ')}
          >
            {block.items.map((item, index) => (
              <div
                key={item.label}
                className={[
                  'flex flex-col justify-between gap-6 p-5 md:p-8 lg:min-h-[220px]',
                  index % 2 === 1 ? 'border-l' : '',
                  index >= 2 ? 'border-t lg:border-t-0' : '',
                  index >= 1 ? 'lg:border-l' : ''
                ].join(' ')}
              >
                <dt className='order-2 max-w-[26ch] text-[15px] leading-snug text-muted'>
                  {item.label}
                </dt>
                <dd className='display order-1 text-[44px] md:text-[64px] lg:text-[72px]'>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      );
  }
}

export function TextBlockView({
  heading,
  body
}: {
  heading?: string;
  body: string[];
}) {
  return (
    <section className='grid grid-cols-12 gap-x-4 gap-y-5 md:gap-x-6'>
      {heading && (
        <h3 className='heading col-span-12 text-[28px] md:text-[34px] lg:col-span-4 lg:col-start-2'>
          {heading}
        </h3>
      )}
      <div
        className={[
          'prose-fg col-span-12 max-w-[64ch] text-[18px] leading-[1.6] md:text-[19px] lg:col-span-6',
          heading ? 'lg:col-start-6' : 'lg:col-start-4'
        ].join(' ')}
      >
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
