/* ══════════════════════════════════════════════════════════════════
     SINGLE-FILE VIEW ROUTER

     index.html holds what used to be four separate pages as four .view
     blocks. This swaps between them on hash change, so the Meet Us
     dropdown and the Sponsors link change the view with no page load,
     while the URL still says #team / #bot / #sponsors - back, forward,
     reload, and shared links all keep working.

     Section anchors (#about, #achievements, #season) live inside the
     home view, so following one has to switch view first and scroll
     second. #contact is shared: it sits outside the views and is
     visible under whichever one is active, so it never switches.

     WHY CAPTURE PHASE: script.js already binds a smooth-scroll handler
     to every a[href^="#"] on the page. It runs in the bubble phase, so
     a capture-phase listener here gets the click first and can stop it
     from reaching that handler - which would otherwise try to
     scrollIntoView on an element inside a display:none view.
     ══════════════════════════════════════════════════════════════════ */
(function () {
  const views = document.querySelectorAll('.view');
  if (!views.length) return;              // the four separate pages: no-op

  const DEFAULT_VIEW = 'home';

  /* Anchors that live inside a view rather than being a view themselves.
     Following one means "switch to that view, then scroll to the id". */
  const SECTION_VIEW = {
    about:        'home',
    achievements: 'home',
    season:       'home'
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  /* 'instant', not 'auto': 'auto' defers to CSS, and styles.css sets
     `html { scroll-behavior: smooth }` - so 'auto' would animate anyway and
     the reduced-motion preference would be silently ignored. */
  const behavior = () => (prefersReducedMotion.matches ? 'instant' : 'smooth');

  function viewExists(name) {
    return !!document.getElementById('view-' + name);
  }

  /* Nav state. The sponsors link uses aria-current rather than .active
     because script.js's scrollspy owns the .active class on .nav-links
     anchors and would clear it on the next scroll. */
  function markNav(view) {
    document.querySelectorAll('.nav-links a[href^="#"], .nav-panel a[href^="#"]')
      .forEach(a => a.removeAttribute('aria-current'));

    const onMeetUs = view === 'team' || view === 'bot';
    const toggle = document.querySelector('.nav-drop-toggle');
    if (toggle) toggle.classList.toggle('active', onMeetUs);

    document.querySelectorAll('.nav-drop-item').forEach(item => {
      const isCurrent = item.getAttribute('href') === '#' + view;
      item.classList.toggle('active', isCurrent);
      if (isCurrent) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });

    if (!onMeetUs && view !== DEFAULT_VIEW) {
      /* `view` is already constrained - resolve() only returns it after
         confirming an element with that id exists - so it cannot currently
         carry anything strange. Escaping it anyway means this stays true if
         resolve() is ever loosened: without it, a hash containing a quote or
         a bracket would build a malformed selector and throw a SyntaxError,
         taking the whole router down with it. */
      const safe = window.CSS && CSS.escape ? CSS.escape(view) : view;
      document.querySelectorAll('a[href="#' + safe + '"]')
        .forEach(a => a.setAttribute('aria-current', 'page'));
    }
  }

  function showView(view) {
    views.forEach(v => v.classList.toggle('is-active', v.id === 'view-' + view));
    document.documentElement.setAttribute('data-view', view);
    markNav(view);

    /* The view we just revealed was display:none, so its children still have
       no layout box. Reading offsetHeight forces the reflow now - without it,
       a scrollIntoView on the next line measures a zero-sized element and
       silently does nothing. */
    void document.body.offsetHeight;
  }

  /* Resolve a raw hash to { view, scrollTo }. scrollTo is an element id
     to scroll to once the view is up, or null to land at the top. */
  function resolve(hash) {
    const id = (hash || '').replace(/^#/, '');
    if (!id || id === DEFAULT_VIEW)  return { view: DEFAULT_VIEW, scrollTo: null };
    if (viewExists(id))              return { view: id, scrollTo: null };
    if (SECTION_VIEW[id])            return { view: SECTION_VIEW[id], scrollTo: id };
    if (document.getElementById(id)) return { view: null, scrollTo: id };  // e.g. #contact
    return null;                                                           // unknown: leave alone
  }

  /* Moves the page to wherever `target` points, once the view is up. A jump
     inside the view you are already on is animated; anything that follows a
     view change is not, because that scroll happens while the page is faded
     out and animating something nobody can see just delays the fade back in.

     'instant' rather than 'auto' is deliberate: 'auto' defers to CSS, and
     styles.css sets `html { scroll-behavior: smooth }`, which would animate
     it after all. */
  function settle(target, how) {
    if (target.scrollTo) {
      const el = document.getElementById(target.scrollTo);
      if (el) el.scrollIntoView({ behavior: how });
    } else {
      window.scrollTo({ top: 0, behavior: how });
    }
  }

  /* Scrolling to a section immediately after revealing a view lands slightly
     off: the view is still carrying viewIn's opening transform, and on a cold
     load fonts and images may not have finished settling the layout. Both
     resolve within a few frames, so the position is simply re-asserted once
     they have. Only needed when aiming at a section - the top of the page
     cannot drift. */
  let resettleTimer = null;

  function settleTwice(target) {
    clearTimeout(resettleTimer);
    settle(target, 'instant');
    if (!target.scrollTo) return;
    /* Tracked so a newer navigation cancels it. Left untracked, a correction
       queued for one target can fire after you have already moved to another
       and drag the page back to the old position. */
    resettleTimer = setTimeout(() => settle(target, 'instant'), 80);
  }

  /* ── View transition ──────────────────────────────────────────────
     Switching view used to swap instantly. Now the outgoing view fades
     down, the page jumps to the top while it is invisible, and the
     incoming view fades up - so the scroll reset, which is the jarring
     part, happens inside the transition where it cannot be seen.

     Timings live in theme.css as --view-out / --view-in so the CSS and
     JS cannot drift apart. */
  const rootStyles = getComputedStyle(document.documentElement);
  const msVar = (name, fallback) => {
    const v = parseFloat(rootStyles.getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  };
  const OUT_MS = msVar('--view-out', 190);

  let transitionTimer = null;

  function go(hash, { allowSmooth = true } = {}) {
    const target = resolve(hash);
    if (!target) return false;

    clearTimeout(resettleTimer);   // a pending correction is now out of date

    const changedView =
      target.view && document.documentElement.getAttribute('data-view') !== target.view;

    /* Same view, or first paint, or reduced motion: no cross-fade to run. */
    if (!changedView || !allowSmooth || prefersReducedMotion.matches) {
      if (target.view) showView(target.view);
      settle(target, (allowSmooth && !changedView) ? behavior() : 'instant');
      return true;
    }

    const outgoing = document.querySelector('.view.is-active');
    if (!outgoing) {
      showView(target.view);
      settleTwice(target);
      return true;
    }

    /* A second click mid-transition must not leave the old view stranded
       half-faded, so any pending swap is cancelled and cleaned up first. */
    clearTimeout(transitionTimer);
    document.querySelectorAll('.view.is-leaving')
      .forEach(v => v.classList.remove('is-leaving'));

    outgoing.classList.add('is-leaving');

    transitionTimer = setTimeout(() => {
      outgoing.classList.remove('is-leaving');
      showView(target.view);
      settleTwice(target);                // invisible: happens behind the fade
    }, OUT_MS);

    return true;
  }

  document.addEventListener('click', e => {
    const link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (hash === '#') return;

    if (!resolve(hash)) return;          // not ours - let script.js have it

    e.preventDefault();
    e.stopPropagation();                 // keep script.js's smooth-scroll off it

    if (location.hash !== hash) history.pushState(null, '', hash);
    go(hash);
  }, true);                              // capture: runs before script.js

  window.addEventListener('popstate', () => go(location.hash));
  window.addEventListener('hashchange', () => go(location.hash));

  /* Initial paint. Jump rather than animate: the browser has already tried to
     position the page for this hash (and got it wrong, because the target was
     inside a hidden view), so an animated correction just reads as a lurch. */
  go(location.hash, { allowSmooth: false });
})();
