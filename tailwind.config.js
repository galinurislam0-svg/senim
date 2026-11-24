/** SENIM — Tailwind конфигі. CSS-ті қайта жинау: npm run build:css */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        'matte-orange': '#E66E38',
        'matte-dark': '#121214',
        'matte-bg': '#0B0B0C'
      }
    }
  }
};
