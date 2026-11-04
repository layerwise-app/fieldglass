import { plan } from './system';

/** A small drawing of a floor plan's walls. */
export function PlanIcon({
  planId,
  size = 40,
  color = 'currentColor',
  weight = 2
}: {
  planId: string;
  size?: number;
  color?: string;
  weight?: number;
}) {
  const walls = plan(planId).walls;
  return (
    <svg
      width={size}
      height={size * 0.96}
      viewBox='0 0 100 96'
      aria-hidden
      style={{ display: 'block' }}
    >
      {walls.map(([[x0, y0], [x1, y1]], i) => (
        <line
          key={i}
          x1={x0 * 100}
          y1={y0 * 96}
          x2={x1 * 100}
          y2={y1 * 96}
          stroke={color}
          strokeWidth={(weight * 100) / size}
          strokeLinecap='square'
        />
      ))}
    </svg>
  );
}
