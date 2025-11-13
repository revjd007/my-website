/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1b1e',
          secondary: '#2b2d31',
          tertiary: '#383a40',
          hover: '#3f4147',
        },
        purple: {
          primary: '#5865f2',
          hover: '#4752c4',
          light: '#7289da',
        },
        blue: {
          primary: '#00d4ff',
          hover: '#00b8e6',
        }
      },
    },
  },
  plugins: [],
}

