import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
export const theme = {
  extend: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: '#14a800',
      secondary: '#13544e',
      accent: '#02fdaf',
      content: 'hsl(113, 100%, 10%)',
    },
  },
};
export const plugins = [
  require('flowbite/plugin'),
  plugin(({ matchUtilities, theme }) => {
    matchUtilities(
      {
        'animation-delay': (value) => {
          return {
            'animation-delay': `${value} !important`,
          };
        },
      },
      {
        values: theme('transitionDelay'),
      }
    );
  }),
];
