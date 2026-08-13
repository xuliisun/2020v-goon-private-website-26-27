/* ══════════════════════════════════════════════════════════════════
     EVENT BINDINGS  -  replaces the former inline handlers

     index.html used to wire behaviour with inline attributes:
       onerror="this.style.display='none'; ..."   (5 image fallbacks)
       onclick="switchFormTab('general', this)"   (2 form tabs)
       onsubmit="sendContactEmail(event);"        (2 forms)

     Those are gone, and the same behaviour is attached here instead.
     The reason is the Content-Security-Policy in index.html: inline
     handlers can only run if the policy allows 'unsafe-inline' for
     scripts, and that single allowance is what defeats most of CSP's
     value - an attacker who manages to inject markup can then also
     execute it. With no inline handlers the policy can refuse inline
     script outright, so injected markup stays inert.

     The handler functions themselves (switchFormTab, sendContactEmail,
     sendSponsorEmail) still live in script.js.
     ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Photo slots ──────────────────────────────────────────────────
     Each .img-probe points at a file in images/ that may not exist
     yet, and is followed by a styled placeholder (robot icon, or the
     member's initials). Exactly one of the two should ever be visible:

       file missing  →  hide the <img>, show the placeholder
       file present  →  show the <img>, hide the placeholder

     The second case is the one that matters for adding photos. The
     placeholder is `display: flex` in styles.css and is a flex SIBLING
     of the image inside the wrapper - so if it is left visible when a
     real photo loads, the two split the frame and the photo appears
     squashed into half of it. Hiding it is what makes dropping a file
     into images/ Just Work.

     Which of the two shows is decided in CSS by a .has-photo class on
     the wrapper (see theme.css), rather than by writing inline styles from
     here. Inline styles would have to fight the stylesheet's own display
     rules and would need re-setting to exactly the right value; a class
     just flips the state and lets CSS own the presentation. */
  function showPhoto(img) {
    if (img.parentElement) img.parentElement.classList.add('has-photo');
  }

  function showPlaceholder(img) {
    if (img.parentElement) img.parentElement.classList.remove('has-photo');
  }

  /* Neither `error` nor `load` bubbles, so both are caught in the
     capture phase at the document level rather than bound per image.
     That also covers any images added to the page later. */
  document.addEventListener('error', function (e) {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.classList.contains('img-probe')) showPlaceholder(img);
  }, true);

  document.addEventListener('load', function (e) {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.classList.contains('img-probe')) showPhoto(img);
  }, true);

  /* Images that finished before this script ran will never fire either
     event, so settle them now. naturalWidth === 0 is the "finished but
     broken" state; anything else that is complete has real pixels. */
  document.querySelectorAll('img.img-probe').forEach(function (img) {
    if (!img.complete) return;
    if (img.naturalWidth === 0) showPlaceholder(img);
    else showPhoto(img);
  });

  /* ── Contact form tabs ───────────────────────────────────────────── */
  document.querySelectorAll('.form-tab[data-form-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchFormTab(btn.dataset.formTab, btn);
    });
  });

  /* ── Form submits ─────────────────────────────────────────────────
     Both handlers call preventDefault themselves, so nothing is ever
     posted anywhere - the page only ever hands a pre-composed message
     to the visitor's own mail client. */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', sendContactEmail);

  const sponsorForm = document.getElementById('sponsor-form');
  if (sponsorForm) sponsorForm.addEventListener('submit', sendSponsorEmail);
})();
