/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14171F',
        paper: '#F6F5F2',
        slate: '#5B6474',
        line: '#DDD9D0',
        approved: '#1F7A5C',
        denied: '#A83232',
        escalated: '#B4791F',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
