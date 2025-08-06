import type { Config } from 'tailwindcss'

const config = {
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
    extend: {
      colors: {
        // Keep existing shadcn/ui colors for compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Add custom brand colors
        brand: {
          primary: '#6366F1',
          accent: '#8B5CF6',
        },
        income: {
          primary: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
          glow: 'rgba(16, 185, 129, 0.1)',
        },
        expense: {
          primary: '#F59E0B',
          light: '#FEF3C7',
          dark: '#92400E',
          glow: 'rgba(245, 158, 11, 0.1)',
        },
        surface: {
          base: '#FAFAFA',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        // Custom typography scale
        display: [
          '2.5rem',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        heading: [
          '1.875rem',
          { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        subheading: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        currency: [
          '1.375rem',
          { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '600' },
        ],
        'currency-lg': [
          '1.875rem',
          { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '700' },
        ],
      },
      boxShadow: {
        resting: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        hover: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06)',
        active:
          '0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.08)',
        modal:
          '0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'inner-subtle': 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-income':
          'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)',
        'gradient-expense':
          'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)',
        'gradient-brand':
          'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
        shimmer:
          'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.3s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      spacing: {
        section: '3rem',
        card: '1.5rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')],
}

export default config
