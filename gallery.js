/* gallery.js — shared behaviour for every gallery page:
   arrows, slide counter, gentle auto-advance, and a keyboard-friendly lightbox. */
(function () {
  const slider = document.querySelector('.g-slider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.g-slide')];
  const imgs = slides.map(s => s.querySelector('img'));
  const countEl = document.querySelector('.g-count');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- arrows ----- */
  const step = () => (slides[0].offsetWidth + 20);
  const move = dir => {
    const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 8;
    const atStart = slider.scrollLeft <= 8;
    if (dir > 0 && atEnd) slider.scrollTo({ left: 0 });
    else if (dir < 0 && atStart) slider.scrollTo({ left: slider.scrollWidth });
    else slider.scrollBy({ left: step() * dir });
  };
  document.querySelector('.g-prev')?.addEventListener('click', () => move(-1));
  document.querySelector('.g-next')?.addEventListener('click', () => move(1));

  /* ----- counter (which slide is nearest the middle) ----- */
  function updateCount() {
    if (!countEl) return;
    const mid = slider.scrollLeft + slider.clientWidth / 2;
    let best = 0, bestD = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
      if (d < bestD) { bestD = d; best = i; }
    });
    countEl.textContent = (best + 1) + ' / ' + slides.length;
  }
  slider.addEventListener('scroll', () => requestAnimationFrame(updateCount), { passive: true });
  updateCount();

  /* ----- auto-advance (pauses while you interact; off for reduced motion) ----- */
  let paused = reduce;
  ['mouseenter', 'touchstart', 'focusin'].forEach(e => slider.addEventListener(e, () => (paused = true), { passive: true }));
  if (!reduce) setInterval(() => { if (!paused && !lb.classList.contains('open')) move(1); }, 5000);

  /* ----- lightbox ----- */
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous photo">&#10094;</button>' +
    '<img alt="">' +
    '<button class="lb-next" aria-label="Next photo">&#10095;</button>' +
    '<div class="lb-count"></div>';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector('img'), lbCount = lb.querySelector('.lb-count');
  let cur = 0;

  function show(i) {
    cur = (i + imgs.length) % imgs.length;
    lbImg.src = imgs[cur].src;
    lbImg.alt = imgs[cur].alt;
    lbCount.textContent = (cur + 1) + ' / ' + imgs.length;
  }
  const open = i => { show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };

  slides.forEach((s, i) => {
    s.tabIndex = 0;
    s.setAttribute('role', 'button');
    s.setAttribute('aria-label', 'Open photo ' + (i + 1));
    s.addEventListener('click', () => open(i));
    s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
  lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
})();
