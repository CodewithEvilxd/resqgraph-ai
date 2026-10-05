/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },
        ops: {
          bg: '#f8fafc',
          panel: '#ffffff',
          border: '#e2e8f0',
          accent: '#0f172a',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Urbanist', 'system-ui', '-apple-system', 'sans-serif'],
        syne: ['var(--font-syne)', 'Syne', 'sans-serif'],
        display: ['var(--font-syne)', 'Syne', 'sans-serif'],
        heading: ['var(--font-syne)', 'Syne', 'Urbanist', 'sans-serif'],
        tactical: ['var(--font-tactical)', 'Rajdhani', 'sans-serif'],
        tech: ['var(--font-tech)', 'Chakra Petch', 'monospace'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
