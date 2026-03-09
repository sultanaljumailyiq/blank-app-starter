/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				sans: ['Cairo', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#FFFFFF',
				foreground: '#0F172A',
				primary: {
					DEFAULT: '#3B82F6',
					light: '#93C5FD',
					dark: '#1E40AF',
					foreground: '#FFFFFF',
				},
				secondary: {
					DEFAULT: '#EFF6FF',
					foreground: '#1E293B',
				},
				accent: {
					DEFAULT: '#F97316',
					orange: '#F97316',
					green: '#10B981',
					red: '#EF4444',
					foreground: '#FFFFFF',
				},
				destructive: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#F1F5F9',
					foreground: '#64748B',
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#0F172A',
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#0F172A',
				},
			},
			borderRadius: {
				lg: '1rem',
				md: '0.75rem',
				sm: '0.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)', opacity: 0 },
					'100%': { transform: 'translateX(0)', opacity: 1 },
				},
				'fade-in': {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
