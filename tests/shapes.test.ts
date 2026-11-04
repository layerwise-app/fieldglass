import { describe, expect, it } from 'vitest';
import { shapeNames } from '~/content/types';
import { generateShape } from '~/lib/field/shapes';

describe('particle shapes', () => {
  const count = 4096;
  it.each(shapeNames.map((name) => [name]))('%s fills every particle', (name) => {
    const glyphs = name === 'iris' ? new Float32Array([0, 0, 0.1, 0.1, -0.1, 0.05]) : undefined;
    const data = generateShape(name, count, glyphs);
    expect(data.length).toBe(count * 4);
    let maxRadius = 0;
    for (let i = 0; i < count; i++) {
      const x = data[i * 4]!;
      const y = data[i * 4 + 1]!;
      const z = data[i * 4 + 2]!;
      expect(Number.isFinite(x + y + z + data[i * 4 + 3]!)).toBe(true);
      maxRadius = Math.max(maxRadius, Math.hypot(x, y, z));
    }
    expect(maxRadius).toBeGreaterThan(0.3);
    expect(maxRadius).toBeLessThan(2);
  });

  it('is deterministic', () => {
    expect(generateShape('orbit', 512)).toEqual(generateShape('orbit', 512));
  });
});
