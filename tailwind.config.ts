import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      animation: {
        'fade-out': 'fade-out 5s ease both'
      },
      keyframes: {
        'fade-out': {
          from: {
            opacity: '1'
          },
          to: {
            opacity: '0'
          }
        }
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    darkTheme: false,
    logs: true
  }
}
export default config
