/* nav.js — adds the hamburger button and opens/closes the mobile menu. */
(function () {
  const bar = document.querySelector('.navbar');
  const links = bar && bar.querySelector('.nav-links');
  if (!bar || !links) return;

  links.id = links.id || 'site-menu';
  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-controls', links.id);
  btn.innerHTML = '<span></span><span></span><span></span>';
  bar.appendChild(btn);

  function set(open) {
    bar.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  set(false);

  btn.addEventListener('click', () => set(!bar.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width:901px)').addEventListener('change', e => { if (e.matches) set(false); });
})();
