/** @type {import('tailwindcss').Config} */
const fcPalette = {
  25: '#fff9fc',
  50: '#fff3f9',
  100: '#f8e5f0',
  200: '#ebc5db',
  300: '#d79abc',
  400: '#c274a3',
  500: '#ab5989',
  600: '#8c376c',
  700: '#580f41',
  800: '#460c34',
  900: '#2d1325',
}

const fcBrandPalette = {
  DEFAULT: fcPalette[700],
  25: fcPalette[25],
  50: fcPalette[50],
  100: fcPalette[100],
  200: fcPalette[200],
  300: fcPalette[300],
  400: fcPalette[400],
  500: fcPalette[600],
  600: fcPalette[700],
  700: fcPalette[800],
  800: fcPalette[900],
  900: fcPalette[900],
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fc: {
          ...fcPalette,
          accent: '#b47a0b',
          accentLight: '#f7edd6',
        },
        blue: fcBrandPalette,
        indigo: fcBrandPalette,
      },
    },
  },
  plugins: [],
}
