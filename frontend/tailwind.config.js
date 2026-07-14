/** @type {import('tailwindcss').Config} */
export default {
<<<<<<< HEAD
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        civic: {
          50:  '#eef5ff', 100: '#d9e8ff', 200: '#bcd5ff', 300: '#8eb9ff',
          400: '#5990ff', 500: '#3366ff', 600: '#1a44f5', 700: '#1332e0',
          800: '#1629b5', 900: '#18278f', 950: '#121a57',
        },
        surface: {
          DEFAULT: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          800: '#1e2433', 850: '#161c2d', 900: '#0f1420', 950: '#090d17',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        glow:    { from: { boxShadow: '0 0 10px #3366ff40' }, to: { boxShadow: '0 0 25px #3366ff80' } },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
        'card-lg': '0 4px 6px rgba(0,0,0,.05), 0 10px 40px rgba(0,0,0,.08)',
        'glow': '0 0 0 3px rgba(51,102,255,.25)',
      },
    },
  },
  plugins: [],
}

=======
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  
  theme: {
    extend: {},
  },
  plugins: [],
};
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
