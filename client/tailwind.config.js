/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Official brand tokens from CSS variables
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
          surface: 'var(--color-surface)',
          background: 'var(--color-background)',
          muted: 'var(--color-muted)',
          body: 'var(--color-body)',
          highlight: 'var(--color-highlight)',

          // Preserved legacy tokens
          'oneshot-text': '#0C1C2D',
          'oneshot-label': '#1C78F2',
        },
        fontFamily: {
          display: ['var(--font-display)', 'sans-serif'],
          body: ['var(--font-body)', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };
  