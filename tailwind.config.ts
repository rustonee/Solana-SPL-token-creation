import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '400px',
        md: '700px',
        '2xl': '1590px',
      },
      fontFamily: {
        CalSans: ['Cal Sans SemiBold'],
        ClashDisplay: ['ClashDisplay'],
      },
      colors: {
        text: {
          100: '#F1F1F1',
        },
        bg: {
          100: '#0C0928',
          200: '#39d0d8',
          300: '#e300ff',
          400: '#141041',
        },
      },
      boxShadow: {
        inputFocus: '0 0 6px 2px rgb(255 255 255 / 10%)',
        card: '0px 4px 4px 0px #00000040',
        bottomBar: '0 -1px 4px rgba(0,0,0,.25)',
        icon: '0 0 0 2px rgba(255 255 255 / 5%)',
        shadowBoxLeft: '0 0 140px 55px #39d0d8aa',
        shadowBoxRight: '0 0 140px 55px #e300ffaa',
      },
      backgroundImage: {
        box: 'linear-gradient(var(--gradient-rotate, 246deg), #da2eef 7.97%, #2b6aff 49.17%, #39d0d8 92.1%)',
        boxContent:
          'linear-gradient(140.14deg,rgba(0,182,191,.15),rgba(27,22,89,.1) 86.61%),linear-gradient(321.82deg,#18134d,#1b1659)',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: '0.99',
            filter:
              'drop-shadow(0 0 1px rgba(252, 211, 77)) drop-shadow(0 0 15px rgba(245, 158, 11)) drop-shadow(0 0 1px rgba(252, 211, 77))',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: '0.4',
            filter: 'none',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-700px 0',
          },
          '100%': {
            backgroundPosition: '700px 0',
          },
        },
        ripple: {
          to: { transform: 'scale(4)', opacity: '1' },
        },
        'appear-slide-left': {
          from: { transform: 'translateX(32px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'appear-slide-right': {
          from: { transform: 'translateX(-32px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        flicker: 'flicker 3s linear infinite',
        shimmer: 'shimmer 1.3s linear infinite',
        ripple: 'ripple 600ms linear',
        'appear-slide-left': 'appear-slide-left .5s cubic-bezier(.4,0,.2,1)',
        'appear-slide-right': 'appear-slide-right .5s cubic-bezier(.4,0,.2,1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwind-scrollbar')],
  variants: {
    scrollbar: ['rounded'],
  },
} satisfies Config;
