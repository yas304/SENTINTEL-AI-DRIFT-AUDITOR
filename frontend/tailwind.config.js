/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium black & gold luxury theme
        navy: {
          DEFAULT: '#050508',
          light: '#0A0A0F',
          lighter: '#12121A'
        },
        dark: '#0A0A0F',
        charcoal: '#12121A',
        slate: '#1A1A24',
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F4D03F',
          dark: '#B8860B'
        },
        platinum: '#E5E4E2',
        teal: {
          DEFAULT: '#00D9B5',
          dark: '#00B89A',
          light: '#00F5CC'
        },
        emerald: {
          DEFAULT: '#059669',
          light: '#10B981'
        },
        rose: '#F43F5E',
        amber: '#F59E0B',
      },
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif']
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #B8860B 100%)',
        'premium-gradient': 'linear-gradient(135deg, #050508 0%, #12121A 50%, #050508 100%)',
        'dark-radial': 'radial-gradient(ellipse at center, #12121A 0%, #050508 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-gold': 'glowGold 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        glowGold: {
          '0%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.4), inset 0 0 30px rgba(212, 175, 55, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
