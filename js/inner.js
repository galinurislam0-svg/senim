// Ішкі беттер: мобиль мәзір. (Анимация жоқ: бет жеңіл, мазмұн бірден көрінеді.)
(function () {
  'use strict';
  document.documentElement.classList.replace('no-js', 'js');
  const btn = document.getElementById('menu-btn'), links = document.getElementById('nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Жабу' : 'Мәзір';
  });
})();
