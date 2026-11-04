import type { ShapeName } from '~/content/types';

/**
 * A tiny line drawing of each particle-field shape, used next to project
 * titles. 20×20 viewBox, drawn with currentColor.
 */
export function ShapeGlyph({
  shape,
  size = 18,
  className
}: {
  shape: ShapeName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 20 20'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      className={className}
    >
      {glyphs[shape]}
    </svg>
  );
}

const rays = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const r1 = 3.2;
  const r2 = i % 2 === 0 ? 9 : 6.6;
  return (
    <line
      key={i}
      x1={10 + Math.cos(a) * r1}
      y1={10 + Math.sin(a) * r1}
      x2={10 + Math.cos(a) * r2}
      y2={10 + Math.sin(a) * r2}
    />
  );
});

const glyphs: Record<ShapeName, React.ReactNode> = {
  iris: <g>{rays}</g>,
  contour: (
    <g>
      <path d='M3.2 11.5c0-4.4 3.3-8 7.4-8 3.6 0 6.2 2.6 6.2 6.3 0 4.2-3.3 6.9-7.1 6.9-3.6 0-6.5-1.9-6.5-5.2Z' />
      <path d='M6.2 11c0-2.5 2-4.6 4.4-4.6 2.1 0 3.5 1.5 3.5 3.6 0 2.4-1.9 3.9-4 3.9-2.1 0-3.9-1.1-3.9-2.9Z' />
      <circle cx='10.2' cy='10.4' r='1' />
    </g>
  ),
  waveform: (
    <path d='M1.5 10h1.6l1.2-3.2 1.6 7 1.7-10 1.8 12 1.8-9.5 1.6 7 1.5-4.5 1.3 2.4 1 -1.2h2.9' />
  ),
  lattice: (
    <g>
      <path d='M2.5 6.5c2.5-1.6 5-1.6 7.5 0s5 1.6 7.5 0' />
      <path d='M2.5 10c2.5 1.6 5 1.6 7.5 0s5-1.6 7.5 0' />
      <path d='M2.5 13.5c2.5-1.6 5-1.6 7.5 0s5 1.6 7.5 0' />
      <path d='M6 3.5c-1.2 2.2-1.2 4.4 0 6.5s1.2 4.4 0 6.5' />
      <path d='M14 3.5c1.2 2.2 1.2 4.4 0 6.5s-1.2 4.4 0 6.5' />
    </g>
  ),
  orbit: (
    <g>
      <ellipse cx='10' cy='10' rx='8.3' ry='3.4' transform='rotate(-24 10 10)' />
      <ellipse cx='10' cy='10' rx='5.4' ry='2.2' transform='rotate(18 10 10)' />
      <circle cx='10' cy='10' r='1.4' fill='currentColor' stroke='none' />
    </g>
  ),
  ribbon: (
    <g>
      <path d='M2 6.5c4.5-3 7.5 6.5 16 3.2' />
      <path d='M2 11c4.5-3 7.5 6.5 16 3.2' />
      <path d='M4.6 6.2l.2 4.4M8.5 7.6l.2 4.5M12.4 9.6l.1 4.4M16.2 9.9v4.3' />
    </g>
  ),
  volume: (
    <g>
      <path d='M10 2.8 16.6 6.4v7.2L10 17.2 3.4 13.6V6.4L10 2.8Z' />
      <path d='M3.4 6.4 10 10l6.6-3.6M10 10v7.2' />
    </g>
  )
};
