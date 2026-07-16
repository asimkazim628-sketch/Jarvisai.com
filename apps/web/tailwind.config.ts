import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { jarvis: { cyan: '#22d3ee', blue: '#2563eb', navy: '#06111f' } },
      boxShadow: { neon: '0 0 35px rgba(34,211,238,.35)' },
      backgroundImage: { grid: 'linear-gradient(rgba(34,211,238,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.09) 1px, transparent 1px)' }
    }
  },
  plugins: []
};
export default config;
