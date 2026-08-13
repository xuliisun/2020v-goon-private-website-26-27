# Security notes - 2020V website

## First, an honest picture of the risk

This is a **static site**: HTML, CSS, and JavaScript files that a web server
hands to visitors unchanged. There is no server-side code, no database, no
login, no shopping cart, and no visitor data stored anywhere. The contact
forms never send anything - they open the visitor's own mail app with a
message pre-filled, and the visitor presses Send themselves.

That matters, because most of what people mean by "getting hacked" simply
does not apply here. There is no database to dump, no login to brute-force,
no server-side code to exploit, and no stored personal data to leak.

The realistic ways this site could actually be damaged, roughly in order of
how likely they are:

| # | Risk | Where it's addressed |
|---|------|----------------------|
| 1 | Someone gets into the **GitHub or hosting account** and edits the site | Only you can fix - see "What you need to do" |
| 2 | Files are **deleted or broken** with no way back | Git history - see "Backups" |
| 3 | A **third-party resource** (Google Fonts) is compromised and serves something malicious | CSP restricts what it may do |
| 4 | Someone **frames the site** to trick visitors into clicking things (clickjacking) | `_headers` |
| 5 | Markup is **injected** into the page and runs as script | CSP - no inline script allowed |

Number 1 is by far the most likely, and no amount of code in this repo can
prevent it. Please read that section.

---

## What has been done in the code

### 1. Content Security Policy (the main protection)

`index.html` carries a strict CSP that starts from `default-src 'none'` -
deny everything - and then names each capability the page actually needs.
Anything not listed is refused by the browser.

The important part is that **`script-src` does not allow `'unsafe-inline'`**.
That means if markup ever did get injected into the page, an injected
`<script>` or `onclick=` would not execute. It is inert text.

To make that possible, the nine inline event handlers the page used to have
(`onerror=`, `onclick=`, `onsubmit=`) were removed and rewired with
`addEventListener` in **`bindings.js`**. Behaviour is identical.

I verified the policy is actually enforcing rather than silently malformed,
by trying three attacks against the live page:

- injecting an inline `<script>` → **did not run**
- injecting an `onclick` attribute → **did not run**
- loading a script from a non-allowlisted origin → **refused**

### 2. HTTP security headers

`_headers` (repo root) sets the protections a `<meta>` tag cannot:

- `frame-ancestors 'none'` + `X-Frame-Options: DENY` - anti-clickjacking
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy` - don't leak URLs to sites visitors click through to
- `Permissions-Policy` - deny camera, mic, location, payment
- `Strict-Transport-Security` - force HTTPS

**Netlify and Cloudflare Pages read this file automatically.** GitHub Pages
does **not** support custom headers - if you host there, the meta CSP still
works but you lose clickjacking protection and HSTS. Cloudflare Pages is free
and does support them.

### 3. Smaller hardening

- Every `target="_blank"` link already had `rel="noopener noreferrer"`, so a
  linked site cannot reach back into this tab. Confirmed across all links.
- The router escapes the URL hash before building a CSS selector from it, so
  a malformed hash cannot throw and take the navigation down.
- `form-action 'none'` guarantees the forms cannot post data anywhere, even
  if the markup were tampered with.

---

## What you need to do (this is the important part)

Code cannot protect an account. These are the ones that actually matter:

1. **Turn on two-factor authentication** on your GitHub account and on
   whatever hosts the site. This is the single highest-value thing on this
   page. An attacker with your password can replace the entire site, and no
   CSP stops that - they would just publish a new one.
2. **Use HTTPS.** Netlify, Cloudflare Pages, and GitHub Pages all provide a
   free certificate. Turn on "force HTTPS" if offered.
3. **Never commit passwords, API keys, or tokens** to the repo. This site
   needs none, so there is nothing to leak today - keep it that way.
4. **Be careful who has push access** to the repository. Everyone with it can
   change the live site.
5. Before enabling `Strict-Transport-Security`, make sure HTTPS definitely
   works on your real domain. Browsers remember that header for two years and
   it is deliberately hard to undo.

## Backups

Git *is* the backup, but only for what has been committed. Right now the
site is untracked - if the files were deleted, they would be gone. Commit
them, and push to GitHub so a copy exists off your laptop.

## Maintenance note

The CSP allows exactly one inline script - the `classList.add('js')` line in
`index.html` - by its SHA-256 hash. **If you edit that line, even by one
character, regenerate the hash** or the script will be blocked and the page
will render with every section already visible:

```sh
printf "%s" "document.documentElement.classList.add('js');" \
  | openssl dgst -sha256 -binary | openssl base64
```

Paste the result into the `script-src 'sha256-...'` value. The command is
also in a comment right above the script tag.

## What this does not protect against

Being straight about the limits:

- **Someone with your account credentials.** They can change anything.
- **Denial of service.** If someone floods your host with traffic, the site
  goes down. Cloudflare's free tier helps; nothing in this repo can.
- **Your email address being scraped.** `2020vrobotics@gmail.com` appears in
  the page text, so it will attract spam. That is the trade-off for being
  easy to contact - use Gmail's spam filtering.
- **Anything a visitor does on their own machine.** Anyone can view the page
  source, copy the design, or edit the page in their own browser. That is how
  the web works; it does not affect what anyone else sees.
