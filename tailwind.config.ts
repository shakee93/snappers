import { nextui } from "@nextui-org/react";
const defaultTheme = require("tailwindcss/defaultTheme");

interface CustomColorsParams {
  opacityVariable?: string;
  opacityValue?: number;
}

function customColors(cssVar: string) {
  return ({ opacityVariable, opacityValue }: CustomColorsParams) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${cssVar}), ${opacityValue})`;
    }
    if (opacityVariable !== undefined) {
      return `rgba(var(${cssVar}), var(${opacityVariable}, 1))`;
    }
    return `rgb(var(${cssVar}))`;
  };
}

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./public/index.html", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class',
  theme: {
    container: {
      center: true,
      padding: {
        "sm": '0.5rem',
        "md": '1rem',  
        DEFAULT: "2rem",
        // DEFAULT: "50px",
        xl: "48px",
        "2xl": "128px",
      },
      // "max-width": {
      //   lg: '1220px',
      //   xl: '1280px',
      //   '2xl': '1536px',
      // },
      screens: {
        sm: '100%',
        md: '100%',
        lg: '100%',
        xl: '1536px',
        '2xl': '1800px',
      },
    },
    fontFamily: {
      display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
      body: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
    },
    darkMode: "class",
    extend: {
      colors: {
        transparent: 'transparent',
        primaryColor: '#1b40af',

        primary: {

          50: customColors("--c-primary-50"),
          100: customColors("--c-primary-100"),
          200: customColors("--c-primary-200"),
          300: customColors("--c-primary-300"),
          400: customColors("--c-primary-400"),
          500: customColors("--c-primary-500"),
          6000: customColors("--c-primary-600"),
          700: customColors("--c-primary-700"),
          800: customColors("--c-primary-800"),
          900: customColors("--c-primary-900"),
        },
        secondary: {
          50: customColors("--c-secondary-50"),
          100: customColors("--c-secondary-100"),
          200: customColors("--c-secondary-200"),
          300: customColors("--c-secondary-300"),
          400: customColors("--c-secondary-400"),
          500: customColors("--c-secondary-500"),
          6000: customColors("--c-secondary-600"),
          700: customColors("--c-secondary-700"),
          800: customColors("--c-secondary-800"),
          900: customColors("--c-secondary-900"),
        },
        neutral: {
          50: customColors("--c-neutral-50"),
          100: customColors("--c-neutral-100"),
          200: customColors("--c-neutral-200"),
          300: customColors("--c-neutral-300"),
          400: customColors("--c-neutral-400"),
          500: customColors("--c-neutral-500"),
          6000: customColors("--c-neutral-600"),
          700: customColors("--c-neutral-700"),
          800: customColors("--c-neutral-800"),
          900: customColors("--c-neutral-900"),
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    // require("@tailwindcss/line-clamp"),
    require("@tailwindcss/aspect-ratio"),
    nextui()
  ],
};
