/* ══════════════════════════════════════════════════════════════════
     EMAIL DELIVERY  —  visitor sends it themselves

     Nothing is sent in the background and there is no third-party
     service. Submitting a form opens the visitor's own email app with
     the message fully composed — To, Subject and Body all filled in —
     and THEY press Send. The mail then arrives from their real address.

     Because some visitors have no mail app configured (common on
     desktop when using webmail), the page also shows two backups right
     under the form: an "Open in Gmail" link that composes the same
     message in Gmail's web client, and a "Copy message" button.

     TO CHANGE THE DESTINATION: edit TEAM_EMAIL below. The mailto links
     elsewhere in the page markup are separate and need updating too.
     ══════════════════════════════════════════════════════════════════ */
  const TEAM_EMAIL = '2020vrobotics@gmail.com';

  function mailtoHref(subject, body) {
    return 'mailto:' + TEAM_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body='    + encodeURIComponent(body);
  }

  // Gmail's web compose window, for visitors with no desktop mail app.
  function gmailHref(subject, body) {
    return 'https://mail.google.com/mail/?view=cm&fs=1' +
      '&to='   + encodeURIComponent(TEAM_EMAIL) +
      '&su='   + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  /* Opens the visitor's mail app with the message ready, then explains
     that they still need to press Send, and offers the two backups.
     Built with DOM APIs rather than innerHTML so the user's own text can
     never be interpreted as markup. */
  function handOffToEmail(statusEl, subject, body) {
    statusEl.className = 'form-status visible pending';
    statusEl.textContent = '';

    const line = document.createElement('div');
    line.textContent = 'Your email app should now be open with the message ready. ' +
      'Press Send there and it will reach us at ' + TEAM_EMAIL + '.';
    statusEl.appendChild(line);

    const row = document.createElement('div');
    row.className = 'handoff-row';

    const hint = document.createElement('span');
    hint.className = 'handoff-hint';
    hint.textContent = 'Nothing opened?';
    row.appendChild(hint);

    const gmail = document.createElement('a');
    gmail.className = 'handoff-btn';
    gmail.href = gmailHref(subject, body);      // property assignment, not HTML
    gmail.target = '_blank';
    gmail.rel = 'noopener noreferrer';
    gmail.textContent = 'Open in Gmail';
    row.appendChild(gmail);

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'handoff-btn';
    copy.textContent = 'Copy message';
    copy.addEventListener('click', () => {
      const full = 'To: ' + TEAM_EMAIL + '\nSubject: ' + subject + '\n\n' + body;
      navigator.clipboard.writeText(full)
        .then(() => { copy.textContent = 'Copied ✓'; })
        .catch(() => { copy.textContent = 'Press Ctrl/Cmd+C'; });
    });
    row.appendChild(copy);

    statusEl.appendChild(row);

    // Trigger the mail app last, so the guidance is already on screen
    // when the visitor comes back to the page.
    window.location.href = mailtoHref(subject, body);
  }

  function switchFormTab(tab, btn) {
    document.getElementById('tab-general').style.display = tab === 'general' ? 'block' : 'none';
    document.getElementById('tab-sponsor').style.display  = tab === 'sponsor'  ? 'block' : 'none';
    document.querySelectorAll('.form-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function sendSponsorEmail(e) {
    e.preventDefault();
    const contact = document.getElementById('s-contact').value.trim();
    const company = document.getElementById('s-company').value.trim();
    const email   = document.getElementById('s-email').value.trim();
    const tier    = document.getElementById('s-tier').value;
    const message = document.getElementById('s-message').value.trim();

    const subject = 'Sponsorship Inquiry from ' + company + ' - ' + tier + ' Tier';
    const body =
      'Hello Team 2020V,\n\n' +
      'I\'d like to talk about sponsoring the team.\n\n' +
      'Contact name: ' + contact + '\n' +
      'Company: '      + company + '\n' +
      'Email: '        + email   + '\n' +
      'Interested tier: ' + tier + '\n\n' +
      (message ? 'Message:\n' + message + '\n\n' : '') +
      'Thanks,\n' + contact;

    handOffToEmail(document.getElementById('sponsor-status'), subject, body);
  }

  function sendContactEmail(e) {
    e.preventDefault();
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const subject = 'Message from ' + name + ' via 2020V Website';
    const body =
      'Hello Team 2020V,\n\n' +
      message + '\n\n' +
      '—\n' +
      'Name: '  + name + '\n' +
      'Email: ' + email;

    handOffToEmail(document.getElementById('contact-status'), subject, body);
  }

  // ── MOBILE NAV ──
  const navToggle = document.getElementById('nav-toggle');
  const navPanel  = document.getElementById('nav-panel');

  function setNav(open) {
    navPanel.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }

  navToggle.addEventListener('click', () => {
    setNav(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  navPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setNav(false);
      navToggle.focus();
    }
  });

  document.addEventListener('click', e => {
    if (navToggle.getAttribute('aria-expanded') !== 'true') return;
    if (!navPanel.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
  });

  // ── SMOOTH SCROLL (honours reduced-motion) ──
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;             // placeholder social/notebook links
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });
  });

  // ── SCROLL REVEAL ──
  // The hidden state lives in CSS behind html.js, so this only adds .in-view.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .member-card, .achievement-row, .stat-cell, .tier-card, .sponsor-why-cell')
    .forEach(el => el.classList.add('reveal'));

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── SCROLLSPY ──
  // IntersectionObserver instead of reading offsetTop on every scroll event,
  // which forced a synchronous layout each frame.
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .nav-panel a[href^="#"]');
  const spySections = ['about', 'robot', 'team', 'achievements', 'season', 'sponsors', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const visible = new Set();

  const spyObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) visible.add(e.target.id);
      else visible.delete(e.target.id);
    });

    // Highlight the topmost section currently on screen.
    const currentId = spySections.map(s => s.id).find(id => visible.has(id)) || '';
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }, { rootMargin: '-120px 0px -60% 0px', threshold: 0 });

  spySections.forEach(s => spyObserver.observe(s));

  // Footer copyright year
  document.getElementById('year').textContent = new Date().getFullYear();

  const ruleObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        ruleObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.8 });
  document.querySelectorAll('.section-rule').forEach(el => ruleObserver.observe(el));
