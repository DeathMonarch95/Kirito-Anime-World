// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'], // Example: Add a specific font for headings
      },
      colors: {
        // Define a more comprehensive color palette
        'primary-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Your existing primary
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        'gray-base': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280', // Your existing secondary-like color
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        'accent-yellow': {
          50: '#fffdf4',
          100: '#fff9e5',
          200: '#fff2c6',
          300: '#ffe59c',
          400: '#ffd06a',
          500: '#facc15', // Your existing accent
          600: '#eab308',
          700: '#a16207',
          800: '#854d09',
          900: '#713f12',
          950: '#422006',
        },
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        card: '0 8px 25px rgba(0, 0, 0, 0.15)', // Enhanced card shadow
      },
      borderRadius: {
        '4xl': '2rem', // Add a larger border radius option
        '5xl': '2.5rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'colors': 'background-color, border-color, color, fill, stroke',
        'opacity': 'opacity',
        'transform': 'transform',
        'all': 'all', // Ensure 'all' is explicitly defined for simpler usage
      },
      transitionTimingFunction: {
        'ease-in-out': 'ease-in-out',
        'ease-out': 'ease-out',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
    },
  },
  plugins: [],
};