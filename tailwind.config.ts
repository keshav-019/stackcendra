
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// AI Platform specific colors
				'ai-primary': '#6366f1',
				'ai-secondary': '#8b5cf6',
				'ai-accent': '#06b6d4',
				'ai-success': '#10b981',
				'ai-warning': '#f59e0b',
				'ai-danger': '#ef4444',
				'git-branch': '#22c55e',
				'git-merge': '#3b82f6',
				'git-commit': '#f97316',
				'docker-blue': '#2496ed',
				'docker-container': '#0ea5e9',
				'status-online': '#22c55e',
				'status-busy': '#ef4444',
				'status-away': '#f59e0b',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-ai': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.05)'
					}
				},
				'git-flow': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'container-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 rgba(37, 150, 237, 0.7)'
					},
					'50%': {
						boxShadow: '0 0 0 10px rgba(37, 150, 237, 0)'
					}
				},
				'ai-thinking': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'data-flow': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'50%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-20px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-ai': 'pulse-ai 2s ease-in-out infinite',
				'git-flow': 'git-flow 3s ease-in-out infinite',
				'container-pulse': 'container-pulse 2s infinite',
				'ai-thinking': 'ai-thinking 1s linear infinite',
				'data-flow': 'data-flow 2s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-ai': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'gradient-git': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
				'gradient-docker': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
				'gradient-success': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
