// Long Take's own colours and type. The magazine is printed on a warm uncoated
// stock, so the screen palette starts from that paper.
export const lt = {
  paper: '#EFE8DA',
  paperDeep: '#E5DCC9',
  paperShade: '#D9CFBA',
  ink: '#1A1714',
  inkSoft: '#3B342D',
  grey: '#7D7466',
  rule: '#CBBFA9',
  oxblood: '#7A1F1F',
  oxbloodDeep: '#561615',
  screen: '#121010'
} as const;

export const font = {
  sans: 'var(--fg-font-sans)',
  serif: 'var(--fg-font-serif)',
  pixel: 'var(--fg-font-pixel)'
} as const;

/** Condensed grotesque for credits, set like an end crawl. */
export const credits = {
  fontFamily: font.sans,
  fontStretch: '75%',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
} as const;

export const masthead = {
  fontFamily: font.sans,
  fontStretch: '75%',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
  lineHeight: 0.82
} as const;
