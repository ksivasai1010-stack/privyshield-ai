/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080D1B',
        sidebar: '#0D1426',
        surface: '#121A30',
        surfaceHover: '#182342',
        borderLight: '#1F2C4C',
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8'
        },
        secondary: {
          DEFAULT: '#06B6D4',
          hover: '#0891B2',
          light: '#22D3EE'
        },
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: '#34D399'
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FBBF24'
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          light: '#F87171'
        },
        cyber: {
          dark: '#080D1B',
          darker: '#04070F',
          card: 'rgba(18, 26, 48, 0.75)',
          glow: 'rgba(99, 102, 241, 0.15)',
          cyanGlow: 'rgba(6, 182, 212, 0.15)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
