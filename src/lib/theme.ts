import { portfolio, type FontFamily } from '~/portfolio.config';

function fontFaces(font: FontFamily) {
  return font.files
    .map((file) =>
      [
        '@font-face{',
        `font-family:'${font.family}';`,
        `src:url('${file.src}') format('woff2');`,
        `font-weight:${file.weight};`,
        `font-style:${file.style ?? 'normal'};`,
        file.stretch ? `font-stretch:${file.stretch};` : '',
        file.unicodeRange ? `unicode-range:${file.unicodeRange};` : '',
        'font-display:swap;}'
      ].join('')
    )
    .join('');
}

const stack = (font: FontFamily) => `'${font.family}', ${font.fallback}`;

/** @font-face rules and the --fg-* variables the stylesheet reads. */
export function themeCss() {
  const { fonts, colors } = portfolio;
  return [
    fontFaces(fonts.sans),
    fontFaces(fonts.pixel),
    fontFaces(fonts.serif),
    ':root{',
    `--fg-font-sans:${stack(fonts.sans)};`,
    `--fg-font-pixel:${stack(fonts.pixel)};`,
    `--fg-font-serif:${stack(fonts.serif)};`,
    `--fg-paper:${colors.paper};`,
    `--fg-ink:${colors.ink};`,
    `--fg-muted:${colors.muted};`,
    `--fg-graphite:${colors.graphite};`,
    `--fg-accent:${colors.accent};`,
    `--fg-on-accent:${colors.onAccent};`,
    '}'
  ].join('');
}

export function fontPreloads() {
  const { fonts } = portfolio;
  return [fonts.sans, fonts.pixel, fonts.serif].flatMap((font) =>
    font.files
      .filter((file) => 'preload' in file && file.preload)
      .map((file) => ({
        rel: 'preload',
        href: file.src,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous' as const
      }))
  );
}
