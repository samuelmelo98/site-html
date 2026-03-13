/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          primary: '#0A4F8A',   // azul principal
          secondary: '#0D5C9C', // azul levemente mais claro
          dark: '#083B66',      // azul escuro
          divider: '#1E6FA8',   // linhas divisórias
        }
      }
    },
  },
  plugins: [],
}
