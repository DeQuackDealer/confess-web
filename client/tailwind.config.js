/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          purple: '#9b6bff',
          blue: '#5b7cff',
        },
        surface: {
          DEFAULT: '#0b0c14',
          raised: '#12131f',
          light: '#f7f7fb',
          lightRaised: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        aurora:
          'radial-gradient(60% 50% at 20% 10%, rgba(155,107,255,0.25), transparent 60%), radial-gradient(50% 40% at 85% 20%, rgba(91,124,255,0.22), transparent 60%), radial-gradient(60% 50% at 50% 100%, rgba(155,107,255,0.15), transparent 60%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35)',
        'glow-purple': '0 0 40px rgba(155,107,255,0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};
