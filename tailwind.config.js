/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                zinc: {
                    50: 'var(--c-zinc-50, #fafafa)',
                    100: 'var(--c-zinc-100, #f4f4f5)',
                    200: 'var(--c-zinc-200, #e4e4e7)',
                    300: 'var(--c-zinc-300, #d4d4d8)',
                    400: 'var(--c-zinc-400, #a1a1aa)',
                    500: 'var(--c-zinc-500, #71717a)',
                    600: 'var(--c-zinc-600, #52525b)',
                    700: 'var(--c-zinc-700, #3f3f46)',
                    800: 'var(--c-zinc-800, #27272a)',
                    900: 'var(--c-zinc-900, #18181b)',
                    950: 'var(--c-zinc-950, #09090b)',
                },
                indigo: {
                    50: 'var(--c-indigo-50, #eef2ff)',
                    100: 'var(--c-indigo-100, #e0e7ff)',
                    200: 'var(--c-indigo-200, #c7d2fe)',
                    300: 'var(--c-indigo-300, #a5b4fc)',
                    400: 'var(--c-indigo-400, #818cf8)',
                    500: 'var(--c-indigo-500, #6366f1)',
                    600: 'var(--c-indigo-600, #4f46e5)',
                    700: 'var(--c-indigo-700, #4338ca)',
                    800: 'var(--c-indigo-800, #3730a3)',
                    900: 'var(--c-indigo-900, #312e81)',
                    950: 'var(--c-indigo-950, #1e1b4b)',
                },
            },
        },
    },
    plugins: [],
}
