import type { Tool } from '~/portfolio.config';

/**
 * Original line glyphs for the tool row. 24×24 viewBox, currentColor.
 * Add a new key here and to `Tool['icon']` in the config to draw another.
 */
export function ToolIcon({
  icon,
  size = 18
}: {
  icon: Tool['icon'];
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.4}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      {icons[icon]}
    </svg>
  );
}

const icons: Record<Tool['icon'], React.ReactNode> = {
  // A bezier curve with its anchor and both handles. The curve and handles
  // stop at the anchor's edges so nothing shows through it.
  pen: (
    <g>
      <path d='M3.5 20C4.4 12.6 6.9 8 10.2 8M13.8 8C17.1 8 19.6 12.6 20.5 20' />
      <path d='M5.4 8h4.8M13.8 8h4.8' />
      <circle cx='3.8' cy='8' r='1.6' />
      <circle cx='20.2' cy='8' r='1.6' />
      <rect x='10.2' y='6.2' width='3.6' height='3.6' rx='0.4' />
    </g>
  ),
  // Three operators wired together.
  nodes: (
    <g>
      <rect x='3' y='4' width='6' height='5' rx='1.4' />
      <rect x='3' y='15' width='6' height='5' rx='1.4' />
      <rect x='15' y='9.5' width='6' height='5' rx='1.4' />
      <path d='M9 6.5c3.2 0 2.8 5.5 6 5.5M9 17.5c3.2 0 2.8-5.5 6-5.5' />
    </g>
  ),
  // A lit sphere drawn with hatching.
  shader: (
    <g>
      <circle cx='12' cy='12' r='8' />
      <path d='M13.6 4.6c2.6 1.6 4.2 4.2 4.2 7.4s-1.6 5.8-4.2 7.4' />
      <path d='M15.6 5.8c.9 1.8 1.3 3.9 1.3 6.2s-.4 4.4-1.3 6.2M17.8 8.4c.3 1.1.4 2.3.4 3.6s-.1 2.5-.4 3.6' />
      <circle cx='9' cy='9' r='1.3' fill='currentColor' stroke='none' />
    </g>
  ),
  // An isometric cube with its hidden edges.
  cube: (
    <g>
      <path d='M12 3.2 19.6 7.6v8.8L12 20.8l-7.6-4.4V7.6L12 3.2Z' />
      <path d='M4.4 7.6 12 12l7.6-4.4M12 12v8.8' />
      <path d='M12 3.2V12' strokeDasharray='1.4 1.8' opacity={0.55} />
    </g>
  ),
  // Audio bars.
  wave: (
    <g>
      <path d='M3.5 10.5v3M7 7v10M10.5 4.5v15M14 8.5v7M17.5 6v12M21 10.5v3' />
    </g>
  ),
  // A glyph on its metrics: baseline, x-height and an outline "a".
  type: (
    <g>
      <path d='M3 19.5h18M3 9h18' opacity={0.5} />
      <path d='M15.6 19.5V12.6c0-2.3-1.6-3.6-3.8-3.6-1.7 0-3 .8-3.6 2.1' />
      <path d='M15.6 14.4c-1 .1-2.9.2-4.2.6-1.8.5-2.8 1.3-2.8 2.5 0 1.3 1.1 2.2 2.8 2.2 2.4 0 4.2-1.6 4.2-3.8' />
    </g>
  ),
  // A sketch grid: a field of points, one larger.
  grid: (
    <g fill='currentColor' stroke='none'>
      {[5, 9.67, 14.33, 19].flatMap((y) =>
        [5, 9.67, 14.33, 19].map((x) =>
          x === 14.33 && y === 9.67 ? (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={2.1} />
          ) : (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={0.95} />
          )
        )
      )}
    </g>
  ),
  // A prompt and a cursor.
  terminal: (
    <g>
      <rect x='2.8' y='4.2' width='18.4' height='15.6' rx='2.6' />
      <path d='m7 10 2.6 2.4L7 14.8M12 15h4.6' />
    </g>
  )
};
