/**
 * Design tokens exposed to JS (charts, inline SVG). Mirrors tailwind.config
 * and index.css so Recharts and hand-drawn SVG use the exact same values.
 *
 * Palette: "Patina" — a light, instrument-like system. Verdigris accent,
 * deep ink with a teal undertone, muted semantic colours (no alarm red /
 * neon green), and a sparing treasury gold.
 */
export const colors = {
  base: '#F4F5F2',
  surface: '#FBFBF9',
  elevated: '#FFFFFF',
  raised: '#ECEEE8',
  line: '#E1E4DD',
  lineStrong: '#CDD2C8',
  ink: '#1C2B2A',
  inkSecondary: '#566360',
  inkMuted: '#6E7A76',
  accent: '#2F6F63',
  accentHover: '#3C877A',
  pos: '#2F6F63',
  neg: '#A84C33',
  warn: '#8F6B1C',
  gold: '#B08D3C',
};

/**
 * Categorical series colours (Patina family). Validated against the dataviz
 * skill's six checks on the light chart surface (#FFFFFF): every slot clears
 * the lightness band, chroma floor, and 3:1 contrast; worst adjacent CVD ΔE is
 * 10.2 and worst adjacent normal-vision ΔE is 15.2 (both above their floors).
 * Assign in fixed order, never cycled; fold a 7th slot into "Other".
 */
export const seriesColors = [
  '#0A8266', // verdigris
  '#C08A1E', // treasury gold
  '#2F6FB5', // slate blue
  '#C0553A', // clay
  '#7C4F9B', // aubergine
  '#C65E88', // rose
];
