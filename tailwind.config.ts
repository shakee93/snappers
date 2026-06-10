import {  nextui  } from "@nextui-org/react";
import type { Config } from 'tailwindcss';
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from 'tailwindcss/plugin';
import { siteConfig } from "./site.config";

// Brand color tokens resolve to CSS variables from site.config.ts (injected via
// SiteThemeStyles). Space-separated RGB channels; `<alpha-value>` enables opacity.
const tokenColor = (cssVar: string) => `rgb(var(${cssVar}) / <alpha-value>)`;

const config: Config = {
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
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
			body: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
			albra: ["var(--font-albra)", ...defaultTheme.fontFamily.sans],
		},
		darkMode: 'class',
		extend: {
			colors: {
				transparent: 'transparent',
				// Legacy alias — same brand blue as primary-500 (#1b40af).
				primaryColor: tokenColor("--c-primary-500"),
				// Semantic status tokens (a fork swaps these). Plain hex so they
				// render identically to the literals they replace.
				success: siteConfig.theme.semantic.success,
				danger: siteConfig.theme.semantic.danger,
				primary: {
					'50': tokenColor("--c-primary-50"),
					'100': tokenColor("--c-primary-100"),
					'200': tokenColor("--c-primary-200"),
					'300': tokenColor("--c-primary-300"),
					'400': tokenColor("--c-primary-400"),
					'500': tokenColor("--c-primary-500"),
					'600': tokenColor("--c-primary-600"),
					'700': tokenColor("--c-primary-700"),
					'800': tokenColor("--c-primary-800"),
					'900': tokenColor("--c-primary-900"),
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				// Header bars (cream top bar + dark-green utility bar) from site.config.
				header: {
					cream: tokenColor("--c-header-cream"),
					green: tokenColor("--c-header-green"),
					peach: tokenColor("--c-header-peach"),
					accent: tokenColor("--c-header-accent"),
				},
				secondary: {
					'50': tokenColor("--c-secondary-50"),
					'100': tokenColor("--c-secondary-100"),
					'200': tokenColor("--c-secondary-200"),
					'300': tokenColor("--c-secondary-300"),
					'400': tokenColor("--c-secondary-400"),
					'500': tokenColor("--c-secondary-500"),
					'600': tokenColor("--c-secondary-600"),
					'700': tokenColor("--c-secondary-700"),
					'800': tokenColor("--c-secondary-800"),
					'900': tokenColor("--c-secondary-900"),
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
				marquee: {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-50%)' },
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
				'marquee-left': 'marquee 60s linear infinite',
				'marquee-right': 'marquee 60s linear infinite reverse',
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
