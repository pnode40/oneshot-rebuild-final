/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'oneshot-text': '#0C1C2D',
          'oneshot-label': '#1C78F2',
        },
        // Add Montserrat font family here if needed via theme.extend.fontFamily
      },
    },
    plugins: [],
  };
  