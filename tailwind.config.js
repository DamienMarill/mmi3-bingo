/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['dracula', 'nord'],
    // themeRoot: false,
    darkTheme: true,
  },
  plugins: [
    require('daisyui'),
  ],
}

