/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.{js,ts,jsx,tsx}',
    './index.{js,ts,jsx,tsx}',
    './{api,components,context,data,database,hooks,services,src,store,styles,tests,types,utils}/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent-h) var(--accent-s) var(--accent-l))',
          muted: 'hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.5)',
        },
        zinc: {
          50: 'hsl(var(--c-zinc-50))',
          100: 'hsl(var(--c-zinc-100))',
          200: 'hsl(var(--c-zinc-200))',
          300: 'hsl(var(--c-zinc-300))',
          400: 'hsl(var(--c-zinc-400))',
          500: 'hsl(var(--c-zinc-500))',
          600: 'hsl(var(--c-zinc-600))',
          700: 'hsl(var(--c-zinc-700))',
          800: 'hsl(var(--c-zinc-800))',
          900: 'hsl(var(--c-zinc-900))',
          950: 'hsl(var(--c-zinc-950))',
        },
        indigo: {
          50: 'hsl(var(--c-indigo-50))',
          100: 'hsl(var(--c-indigo-100))',
          200: 'hsl(var(--c-indigo-200))',
          300: 'hsl(var(--c-indigo-300))',
          400: 'hsl(var(--c-indigo-400))',
          500: 'hsl(var(--c-indigo-500))',
          600: 'hsl(var(--c-indigo-600))',
          700: 'hsl(var(--c-indigo-700))',
          800: 'hsl(var(--c-indigo-800))',
          900: 'hsl(var(--c-indigo-900))',
          950: 'hsl(var(--c-indigo-950))',
        },
      },
    },
  },
  plugins: [],
};
