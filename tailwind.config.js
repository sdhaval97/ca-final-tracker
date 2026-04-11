/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#f0f4f8',
        bg2: '#ffffff',
        bg3: '#f1f5f9',
        bgH: '#e8eef6',
        tx: '#0f172a',
        tx2: '#475569',
        txM: '#94a3b8',
        b9: '#1e3a5f',
        b8: '#1e40af',
        b7: '#1d4ed8',
        b6: '#2563eb',
        b5: '#3b82f6',
        b4: '#60a5fa',
        b3: '#93c5fd',
        b2: '#bfdbfe',
        b1: '#dbeafe',
        b0: '#eff6ff',
        ind: '#6366f1',
        indBg: '#eef2ff',
        sky: '#0ea5e9',
        skyBg: '#f0f9ff',
        cyn: '#06b6d4',
        cynBg: '#ecfeff',
        vio: '#8b5cf6',
        vioBg: '#f5f3ff',
        teal: '#14b8a6',
        tealBg: '#f0fdfa',
        em: '#10b981',
        emBg: '#ecfdf5',
        amb: '#f59e0b',
        ambBg: '#fffbeb',
        rose: '#f43f5e',
        roseBg: '#fff1f2',
        brd: '#e2e8f0',
      },
      boxShadow: {
        s1: '0 1px 3px rgba(15,23,42,.06)',
        s2: '0 4px 16px rgba(15,23,42,.08)',
        s3: '0 10px 40px rgba(15,23,42,.12)',
        sB: '0 4px 16px rgba(37,99,235,.2)',
      },
      keyframes: {
        pulseShadow: {
          '0%, 100%': { boxShadow: '0 6px 24px rgba(37,99,235,.4)' },
          '50%': { boxShadow: '0 6px 32px rgba(37,99,235,.6)' }
        },
        fu: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        mp: {
          from: { opacity: 0, transform: 'scale(0.93) translateY(8px)' },
          to: { opacity: 1, transform: 'scale(1) translateY(0)' }
        }
      },
      animation: {
        'ft-pulse': 'pulseShadow 2s infinite',
        'fade-up': 'fu 0.3s ease-out forwards',
        'modal-pop': 'mp 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
