import { fontFamily as _fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,ts,jsx,tsx}']
export const darkMode = 'class'
export const theme = {
  screens: {
    sm: '640px',
    // => @media (min-width: 640px) { ... }
    md: '768px',
    // => @media (min-width: 768px) { ... }
    normal: '910px',
    // => @media (min-width: 910px) { ... }
    lg: '1024px',
    // => @media (min-width: 1024px) { ... }
    xl: '1280px',
    // => @media (min-width: 1280px) { ... }
    '2xl': '1536px',
    // => @media (min-width: 1536px) { ... }
  },
  extend: {
    backgroundImage: {
      'staking-bg': 'url(/images/banners/staking-bg.png)',
      'staking-bg-mobile': 'url(/images/banners/staking-bg-mobile.png)',
      'earn-sub-desktop-banner': 'url(/images/banners/earn-sub-desktop-banner.png)',
      'earn-sub-mobile-banner': 'url(/images/banners/earn-sub-mobile-banner.png)',
      'support-creators-desktop-banner': 'url(/images/banners/support-creators-desktop-banner.png)',
      'support-creators-mobile-banner': 'url(/images/banners/support-creators-mobile-banner.png)',
    },
    fontFamily: {
      sans: ['var(--source-sans-pro)', ..._fontFamily.sans],
    },
    fontSize: {
      base: ['1rem', '1.35'],
      '4.5xl': '2.5rem',
    },
    colors: {
      background: 'rgb(var(--background) / <alpha-value>)',
      'background-light': 'rgb(var(--background-light) / <alpha-value>)',
      'background-lighter': 'rgb(var(--background-lighter) / <alpha-value>)',
      'background-lightest': 'rgb(var(--background-lightest) / <alpha-value>)',
      'background-primary': 'rgb(var(--background-primary))',
      'background-primary-light':
        'rgb(var(--background-primary-light) / <alpha-value>)',
      'background-warning': 'rgb(var(--background-warning) / <alpha-value>)',
      'background-info': 'rgb(var(--background-info) / <alpha-value>)',
      'background-accent': 'rgb(var(--background-accent) / <alpha-value>)',
      'background-red': 'rgb(var(--background-red) / <alpha-value>)',
      'background-stats-card':
        'rgb(var(--background-stats-card) / <alpha-value>)',

      text: 'rgb(var(--text) / <alpha-value>)',
      'text-muted': 'rgb(var(--text-muted))',
      'text-on-primary': 'rgb(var(--text-on-primary) / <alpha-value>)',
      'text-muted-on-primary':
        'rgb(var(--text-muted-on-primary) / <alpha-value>)',
      'text-primary': 'rgb(var(--text-primary))',
      'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
      'text-dark': 'rgb(var(--text-dark) / <alpha-value>)',
      'text-warning': 'rgb(var(--text-warning) / <alpha-value>)',
      'text-red': 'rgb(var(--text-red) / <alpha-value>)',
      'text-success': 'rgb(var(--text-success))',

      'border-gray': 'rgb(var(--border-gray) / <alpha-value>)',
      'border-gray-light': 'rgb(var(--border-gray-light) / <alpha-value>)',
    },
  },
}
