import {  nextui  } from "@nextui-org/react";
import type { Config } from 'tailwindcss';
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from 'tailwindcss/plugin';

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

const config: Config = {
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./containers/**/*.{js,jsx,ts,tsx}",
		"./shared/**/*.{js,jsx,ts,tsx}",
		"./public/index.html",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: ["class", "class"],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				xl: '10px',
				'2xl': '128px'
			}
		},
		fontFamily: {
			display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
			body: ["var(--font-body)", ...defaultTheme.fontFamily.sans]
		},
		darkMode: 'class',
		extend: {
			colors: {
				transparent: 'transparent',
				primaryColor: '#1b40af',
				// Semantic status tokens (a fork swaps these). Plain hex so they
				// render identically to the literals they replace.
				success: '#059669',
				danger: '#d71e1e',
				primary: {
					'50': 'customColors("--c-primary-50")',
					'100': 'customColors("--c-primary-100")',
					'200': 'customColors("--c-primary-200")',
					'300': 'customColors("--c-primary-300")',
					'400': 'customColors("--c-primary-400")',
					'500': 'customColors("--c-primary-500")',
					'700': 'customColors("--c-primary-700")',
					'800': 'customColors("--c-primary-800")',
					'900': 'customColors("--c-primary-900")',
					'6000': 'customColors("--c-primary-600")',
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					'50': 'customColors("--c-secondary-50")',
					'100': 'customColors("--c-secondary-100")',
					'200': 'customColors("--c-secondary-200")',
					'300': 'customColors("--c-secondary-300")',
					'400': 'customColors("--c-secondary-400")',
					'500': 'customColors("--c-secondary-500")',
					'700': 'customColors("--c-secondary-700")',
					'800': 'customColors("--c-secondary-800")',
					'900': 'customColors("--c-secondary-900")',
					'6000': 'customColors("--c-secondary-600")',
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				enterFromRight: {
					from: { opacity: '0', transform: 'translateX(200px)' },
					to: { opacity: '1', transform: 'translateX(0)' },
				},
				enterFromLeft: {
					from: { opacity: '0', transform: 'translateX(-200px)' },
					to: { opacity: '1', transform: 'translateX(0)' },
				},
				exitToRight: {
					from: { opacity: '1', transform: 'translateX(0)' },
					to: { opacity: '0', transform: 'translateX(200px)' },
				},
				exitToLeft: {
					from: { opacity: '1', transform: 'translateX(0)' },
					to: { opacity: '0', transform: 'translateX(-200px)' },
				},
				scaleIn: {
					from: { opacity: '0', transform: 'rotateX(-10deg) scale(0.9)' },
					to: { opacity: '1', transform: 'rotateX(0deg) scale(1)' },
				},
				scaleOut: {
					from: { opacity: '1', transform: 'rotateX(0deg) scale(1)' },
					to: { opacity: '0', transform: 'rotateX(-10deg) scale(0.95)' },
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				fadeOut: {
					from: { opacity: '1' },
					to: { opacity: '0' },
				},
			},
			animation: {
				scaleIn: 'scaleIn 200ms ease',
				scaleOut: 'scaleOut 200ms ease',
				fadeIn: 'fadeIn 200ms ease',
				fadeOut: 'fadeOut 200ms ease',
				enterFromLeft: 'enterFromLeft 250ms ease',
				enterFromRight: 'enterFromRight 250ms ease',
				exitToLeft: 'exitToLeft 250ms ease',
				exitToRight: 'exitToRight 250ms ease',
			},
		}
	},
	variants: {
		extend: {},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
		// require("@tailwindcss/line-clamp"),
		require("@tailwindcss/aspect-ratio"),
		nextui(),
		require("tailwindcss-animate"),
		plugin(({ matchUtilities }) => {
			matchUtilities({
				perspective: (value: string) => ({
					perspective: value,
				}),
			});
		}),
	],
};

export default config;
