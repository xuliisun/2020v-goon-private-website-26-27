/* ══════════════════════════════════════════════════════════════════
     "MEET US" NAV DROPDOWN

     CSS already opens the menu on :hover and :focus-within, which
     covers mouse and keyboard-tab. This file adds the two cases CSS
     can't express: an explicit click/tap on the trigger (the only way
     in on touch, where :hover doesn't exist), and closing again on
     Escape or on a click elsewhere in the page.
     ══════════════════════════════════════════════════════════════════ */
(function () {
  const drop   = document.querySelector('.nav-drop');
  if (!drop) return;

  const toggle = drop.querySelector('.nav-drop-toggle');

  function setDrop(open) {
    drop.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    setDrop(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Leaving with the pointer clears the click-opened state too, otherwise
  // the menu would stay pinned open after the cursor has moved away.
  drop.addEventListener('mouseleave', () => setDrop(false));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setDrop(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', e => {
    if (!drop.contains(e.target)) setDrop(false);
  });
})();


/* ══════════════════════════════════════════════════════════════════
     NAV SCROLL STATE

     Adds .is-scrolled to the nav once the page has moved off the top,
     which tightens the bar and deepens its shadow (see theme.css).

     The listener is passive and does no work of its own beyond setting
     a flag - the class toggle happens in a rAF callback, so scrolling
     never blocks on a style write and repeated events inside one frame
     collapse into a single update.
     ══════════════════════════════════════════════════════════════════ */
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const THRESHOLD = 40;
  let ticking = false;

  function update() {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();   // a reload part-way down the page starts in the right state
})();
