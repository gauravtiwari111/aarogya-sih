import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f6c7a',
          dark: '#0a4f5a',
          light: '#e6f4f6',
        },
        navy: '#12263a',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config
