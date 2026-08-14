/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        // Extra stop for ultrawide monitors so grids can gain columns rather
        // than just stretching. (Adds to the default sm/md/lg/xl/2xl.)
        '3xl': '1920px',
      },
      colors: {
        // --- Patina: light, instrument-like, archival ---
        // Surfaces layer from the paper plane up toward pure white.
        base: '#F4F5F2', // page plane — cool paper, never warm cream
        surface: '#FBFBF9', // primary card
        elevated: '#FFFFFF', // raised card / chart surface
        raised: '#ECEEE8', // hover / nested fill / skeleton base
        // Hairlines
        line: {
          DEFAULT: '#E1E4DD',
          strong: '#CDD2C8',
        },
        // Ink — deep, with a teal undertone (aged bronze, not pure black)
        ink: {
          DEFAULT: '#1C2B2A',
          secondary: '#566360',
          muted: '#6E7A76',
        },
        // Brand accent — verdigris (patinated bronze); doubles as "positive/up"
        accent: {
          DEFAULT: '#2F6F63',
          hover: '#3C877A',
          soft: '#E4EDE9', // faint fill tint for light surfaces
        },
        pos: '#2F6F63', // up — calm verdigris, not neon green
        neg: '#A84C33', // down — muted clay-rust, not alarm red
        warn: '#8F6B1C', // caution / snapshot — treasury amber
        gold: '#B08D3C', // decorative treasury detail (rules, marks) — sparing
        // Chart categorical (Patina) — validated on the light surface via the
        // dataviz skill: passes lightness/chroma/contrast; worst adjacent CVD ΔE 10.2.
        series: {
          1: '#0A8266', // verdigris
          2: '#C08A1E', // treasury gold
          3: '#2F6FB5', // slate blue
          4: '#C0553A', // clay
          5: '#7C4F9B', // aubergine
          6: '#C65E88', // rose
        },
      },
      fontFamily: {
        // Display carries the literate, human voice; sans is the calm instrument;
        // mono is reserved for every figure that must align.
        display: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.375rem',
      },
      boxShadow: {
        // Soft, ink-tinted elevation — paper under glass, never a hard drop shadow.
        card: '0 1px 2px 0 rgba(28,43,42,0.04), 0 12px 32px -20px rgba(28,43,42,0.20)',
        pop: '0 24px 60px -24px rgba(28,43,42,0.28)',
        glow: '0 0 0 1px rgba(47,111,99,0.30), 0 10px 30px -12px rgba(47,111,99,0.22)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(47,111,99,0.05), transparent 42%)',
        'accent-radial':
          'radial-gradient(60% 60% at 50% 0%, rgba(47,111,99,0.10), transparent 70%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        rise: 'rise 0.5s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
