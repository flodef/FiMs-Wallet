import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import headlessui from '@headlessui/tailwindcss';
import forms from '@tailwindcss/forms';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    transparent: 'transparent',
    current: 'currentColor',
    screens: {
      '2xs': '320px',
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      transitionDuration: {
        DEFAULT: '500ms', // Set your default duration here
      },
      animation: {
        blink: 'blink 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        display: 'display .5s cubic-bezier(0.4, 0, 0.6, 1) forwards',
        hide: 'display .5s cubic-bezier(0.4, 0, 0.6, 1) reverse forwards',
        strokeCircle: 'stroke .6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
        strokeCircleSlow: 'stroke 3s cubic-bezier(0.65, 0, 0.45, 1) forwards',
        strokeCheck: 'stroke .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards',
        fillGreen: 'fillGreen .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both',
        fillRed: 'fillRed .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both',
        swing: 'swing 1.3s ease-in-out infinite alternate',
        swinghair: 'swinghair 1.3s ease-in-out infinite alternate',
        flip: 'flip 1000ms 1.6s ease-in-out forwards',
        cross1a: 'cross1 300ms 1s ease-in-out forwards',
        cross2a: 'cross2 400ms 1.2s ease-in-out forwards',
        cross1b: 'cross1 400ms 1.1s ease-in-out forwards',
        cross2b: 'cross2 500ms 1.3s ease-in-out forwards',
        flipReverse: 'flipReverse 300ms',
        cross1Reverse: 'cross1Reverse 300ms',
        cross2Reverse: 'cross2Reverse 300ms',
        spin: 'spin 2s linear infinite',
        move: 'move 500ms linear 0ms infinite',
        grow: 'grow 500ms linear 0ms infinite',
        growReverse: 'grow 500ms linear 0ms infinite reverse',
        worm1: 'worm1 2s linear infinite',
        worm2: 'worm2 2s linear infinite',
        blur: 'blurText 1s ease-in-out forwards',
        unblur: 'blurText 1s ease-in-out forwards reverse',
        loading0: 'blurText 1.5s 0s infinite linear alternate',
        loading1: 'blurText 1.5s 0.2s infinite linear alternate',
        loading2: 'blurText 1.5s 0.4s infinite linear alternate',
        loading3: 'blurText 1.5s 0.6s infinite linear alternate',
        loading4: 'blurText 1.5s 0.8s infinite linear alternate',
        loading5: 'blurText 1.5s 1s infinite linear alternate',
        loading6: 'blurText 1.5s 1.2s infinite linear alternate',
        loading7: 'blurText 1.5s 1.4s infinite linear alternate',
        loading8: 'blurText 1.5s 1.6s infinite linear alternate',
        loading9: 'blurText 1.5s 1.8s infinite linear alternate',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        display: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        stroke: {
          '100%': { strokeDashoffset: '0' },
        },
        scale: {
          '0%, 100%': { transform: 'none' },
          '50%': { transform: 'scale3d(1.1, 1.1, 1)' },
        },
        fillGreen: {
          '100%': { boxShadow: 'inset 0px 0px 0px 180px #84cc16' },
        },
        fillRed: {
          '100%': { boxShadow: 'inset 0px 0px 0px 180px #ef4444' },
        },
        swing: {
          '0%': { transform: 'rotate(10deg)' },
          '100%': { transform: 'rotate(-10deg)' },
        },
        swinghair: {
          '0%': { transform: 'rotate(6deg)' },
          '100%': { transform: 'rotate(-6deg)' },
        },
        cross1: {
          '0%': {
            transform: 'rotate(45deg) scaleX(0) scaleY(0.7)',
            boxShadow: '0 1vmin 5vmin rgba(0, 0, 0, 0)',
          },
          '100%': {
            transform: 'rotate(45deg) scaleX(1) scaleY(1)',
            boxShadow: '0 1vmin 5vmin rgba(0, 0, 0, 0.5)',
          },
        },
        cross2: {
          '0%': {
            transform: 'rotate(-45deg) scaleX(0) scaleY(0.7)',
            boxShadow: '0 1vmin 5vmin rgba(0, 0, 0, 0)',
          },
          '100%': {
            transform: 'rotate(-45deg) scaleX(1) scaleY(1)',
            boxShadow: '0 1vmin 5vmin rgba(0, 0, 0, 0.5)',
          },
        },
        cross1Reverse: {
          '100%': {
            transform: 'rotate(45deg) scaleX(0) scaleY(0.7)',
            boxShadow: '0 1vmin 5vmin rgba(0, 0, 0, 0)',
            opacity: '0',
          },
          '0%': {
            transform: 'rotate(45deg) scaleX(1) scaleY(1)',
            boxShadow: '0 1vmin 5vmin rgba(0, 0, 0, 0.5)',
            opacity: '1',
          },
        },
        cross2Reverse: {
          '100%': {
            transform: 'rotate(-45deg) scaleX(0) scaleY(0.7)',
            boxShadow: '0 1vmin 5vmin rgba(0, 0, 0, 0)',
            opacity: '0',
          },
          '0%': {
            transform: 'rotate(-45deg) scaleX(1) scaleY(1)',
            boxShadow: '0 1vmin 5vmin rgba(0, 0, 0, 0.5)',
            opacity: '1',
          },
        },
        flip: {
          '0%': {
            transform: 'rotate(-90deg) rotateY(0deg) translateX(0)',
          },
          '60%': {
            transform: 'rotate(-90deg) rotateY(200deg) translateX(3vmin)',
          },
          '80%': {
            transform: 'rotate(-90deg) rotateY(170deg) translateX(3vmin)',
          },
          '100%': {
            transform: 'rotate(-90deg) rotateY(180deg) translateX(3vmin)',
          },
        },
        flipReverse: {
          '100%': {
            transform: 'rotate(-90deg) rotateY(0deg) translateX(0)',
          },
          '40%': {
            transform: 'rotate(-90deg) rotateY(200deg) translateX(3vmin)',
          },
          '20%': {
            transform: 'rotate(-90deg) rotateY(170deg) translateX(3vmin)',
          },
          '0%': {
            transform: 'rotate(-90deg) rotateY(180deg) translateX(3vmin)',
          },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        blurText: {
          '0%': { filter: 'blur(0px)' },
          '100%': { filter: 'blur(4px)' },
        },
        move: {
          '0%': { transform: 'translateX(0px)' },
          '100%': { transform: 'translateX(45px)' },
        },
        grow: {
          '0%': { transform: 'scale(0, 0)', opacity: '0' },
          '100%': { transform: 'scale(1, 1)', opacity: '1' },
        },
        worm1: {
          '0%': { strokeDashoffset: '0' },
          '50%': { strokeDashoffset: '-358' },
          '50.01%': { strokeDashoffset: '358' },
          '100%': { strokeDashoffset: '0' },
        },
        worm2: {
          '0%': { strokeDashoffset: '358' },
          '50%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-358' },
        },
      },
      colors: {
        ok: colors.green['500'], // green-500
        error: colors.red['500'], // red-500

        // light mode
        theme: {
          brand: {
            faint: colors.blue[50],
            muted: colors.blue[200],
            subtle: colors.blue[400],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[700],
            inverted: colors.white,
          },
          background: {
            muted: colors.gray[50],
            subtle: colors.gray[100],
            DEFAULT: colors.white,
            emphasis: colors.gray[700],
          },
          border: {
            DEFAULT: colors.gray[200],
          },
          ring: {
            DEFAULT: colors.gray[200],
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        // dark mode
        'dark-theme': {
          brand: {
            faint: '#0B1229',
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          background: {
            muted: '#131A2B',
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[800],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[400],
            strong: colors.gray[100],
            inverted: colors.gray[950],
          },
        },
        //TODO : to be removed
        // light mode
        tremor: {
          brand: {
            faint: colors.blue[50],
            muted: colors.blue[200],
            subtle: colors.blue[400],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[700],
            inverted: colors.white,
          },
          background: {
            muted: colors.gray[50],
            subtle: colors.gray[100],
            DEFAULT: colors.white,
            emphasis: colors.gray[700],
          },
          border: {
            DEFAULT: colors.gray[200],
          },
          ring: {
            DEFAULT: colors.gray[200],
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        // dark mode
        'dark-tremor': {
          brand: {
            faint: '#0B1229',
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          background: {
            muted: '#131A2B',
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[800],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
        },
      },
      boxShadow: {
        // light
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        // dark
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',
      },
      fontSize: {
        'tremor-label': '0.75rem',
        'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
        'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
        'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [headlessui, forms],
} satisfies Config;
