/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kamfood Inasal Brand Colors
        inasal: {
          green: '#23470B',        // Primary brand green
          'green-light': '#2D5A0F', // Lighter green for hover states
          'green-dark': '#1A3508',  // Darker green
          red: '#B81D24',          // Inasal red accent
          orange: '#FF8C42',       // Orange accent from logo
          yellow: '#FDB32A',       // Yellow accent
          cream: '#FFF9F0',        // Off-white/cream background
          'cream-dark': '#F5EFE6', // Darker cream for cards
          brown: '#6B4423',        // Brown for skewer/grilled theme
        },
        // Legacy colors for admin compatibility
        cream: {
          50: '#FFF9F0',
          100: '#F5EFE6',
          200: '#EBE0D7',
          500: '#D1C7B7',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'noto': ['Noto Sans', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      boxShadow: {
        'inasal': '0 4px 6px -1px rgba(35, 71, 11, 0.1), 0 2px 4px -1px rgba(35, 71, 11, 0.06)',
        'inasal-lg': '0 10px 15px -3px rgba(35, 71, 11, 0.1), 0 4px 6px -2px rgba(35, 71, 11, 0.05)',
      }
    },
  },
  plugins: [],
};