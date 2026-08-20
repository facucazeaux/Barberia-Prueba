/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta Dark Mode Premium para barberías modernas
        // Fondos oscuros elegantes con acentos dorados/ámbar
        slate: {
          950: '#020617', // Fondo principal
          900: '#0f172a', // Fondo secundario
          800: '#1e293b', // Bordes y elementos
          700: '#334155', // Texto secundario
          600: '#475569', // Texto terciario
        },
        zinc: {
          950: '#09090b', // Fondo principal alternativo
          900: '#18181b', // Fondo secundario alternativo
          800: '#27272a', // Bordes sutiles
          700: '#3f3f46', // Texto secundario
        },
        amber: {
          500: '#f59e0b', // Acento principal dorado
          400: '#fbbf24', // Acento más claro
          600: '#d97706', // Acento más oscuro
        },
        white: {
          DEFAULT: '#ffffff', // Acento blanco puro
        },
        // Mantener colores originales para compatibilidad
        ink: {
          950: '#161310',
          900: '#211D19',
          800: '#2E2822',
          700: '#3D352C',
          600: '#544A3D',
        },
        paper: {
          50: '#FBF8F2',
          100: '#F6F1E8',
          200: '#EEE5D3',
        },
        brass: {
          400: '#CDA35F',
          500: '#B6884A',
          600: '#93683A',
        },
        pole: {
          red: '#7C2D2D',
          redLight: '#9A4444',
        },
        sage: {
          500: '#3F6B4A',
          600: '#345A3E',
        },
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px -2px rgba(22,19,16,0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
