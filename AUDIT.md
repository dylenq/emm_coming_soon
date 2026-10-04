# Every Mind Matters — Optimization Audit & Change Log

Scope: code quality, performance, accessibility & mobile. Originally audited 24 HTML pages, `styles.css` (47 KB), `script.js` (27 KB), and 15 images. A full backup of all originals was made first in `_backup_pre_optimization/` (42 files) so every change is reversible.

---

## STATUS — Applied across three rounds

### Round 1 — Safe P0 fixes ✓ APPLIED
- **`services.html` created** — real Services overview page with all 10 services as cards, each with anchor IDs (`#therapy`, `#online`, `#reiki`, `#coaching`, `#mindfulness`, `#yoga`, `#fitness`, `#assessments`, `#financial`, `#social`, `#corporate`) so old `services.html#anchor` links keep working.
- **`blog.html` → `journal.html`** — 6 dead links across 4 service pages repointed.
- **`corporate.html` → `corporates.html`** — fixed dead link in `corporates.html` dropdown.
- **Broken Director image on `about.html`** — removed `<img src="/placeholder.svg?...">`; left a TODO comment with example markup.
- **Broken "Our Journey" image on `about.html`** — same treatment.
- **Malformed indentation in `service-counselling.html`** — service-image block re-indented to match the other 9 service pages.
- **Stripped `?height=400&width=1200` placeholder query params** from 9 service-page image sources.
- **Verified**: zero broken internal links across the site.

### Round 2 — Performance & accessibility ✓ APPLIED
- **`<meta name="description">`** added to all 25 pages with per-page copy (~140–155 chars each).
- **`<link rel="preconnect">`** to `fonts.googleapis.com`, `fonts.gstatic.com`, and `cdnjs.cloudflare.com` on all 25 pages.
- **Font Awesome deferred** — `media="print" onload="this.media='all'"` + `<noscript>` fallback. No longer render-blocking.
- **Favicon** — new `favicon.svg` (brand pink-rose heart) + `<link rel="icon">` on all pages.
- **Images**: `loading="lazy"` + explicit `width`/`height` on every `<img>` (17 total) → no more layout shift.
- **Hamburger menu** converted from `<div>` to a real `<button>` with `aria-label`, `aria-expanded`, `aria-controls`.
- **Services dropdown toggle** now has `aria-haspopup="menu"` and `aria-expanded="false"`.
- **Social links** in every footer now have proper `aria-label` (Instagram / Facebook / LinkedIn / YouTube).
- **5 "email professional" links** on `professionals.html` got `aria-label="Email this professional"`.
- **568 decorative Font Awesome icons** marked `aria-hidden="true"` site-wide.

### Round 3 — Structural ✓ APPLIED
- **DRY nav/footer system** — new `_partials/` folder:
  - `_partials/nav.html` — canonical nav template with `{{HOME}}`, `{{ABOUT}}`, etc. placeholders for the active class.
  - `_partials/footer.html` — canonical footer.
  - `_partials/sync.py` — run `python3 _partials/sync.py` to push the canonical nav/footer (with correct per-page `active` highlight) into every HTML file. Idempotent.
  - Verified: all 25 pages now share exactly **1 distinct nav** and **1 distinct footer** (modulo per-page active class).
- **Minification**:
  - `styles.min.css` — 35.6 KB (was 47.4 KB, **24.8 % smaller**)
  - `script.min.js` — 17.9 KB (was 27.0 KB, **33.6 % smaller**)
  - Combined: ~20 KB saved per fresh page load.
  - All 25 pages updated to reference `.min` versions. Originals retained for editing.
- **`console.log` calls** — all 6 stripped from `script.js`.

### Round 3 — INTENTIONALLY SKIPPED
- **Merge duplicate `@media (max-width: 768px)` blocks** — turned out there are **three** such blocks (not two), and one is `@media (max-width: 768px)` (applies to print too) while the others are `@media screen and (max-width: 768px)` (screen only). They are not semantically equivalent. Merging would also change CSS cascade order and could shift visual behavior. Left alone — needs a manual pass with eyes on the page.

### Round 4 — July 2026 polish pass ✓ APPLIED
- **Deleted `images/partners/partnerships.png`** — 2.3 MB, referenced by no page.
- **Deleted `images/services/Corporate Programs illustration.jpeg`** — referenced by no page.
- **Consolidated the 9 byte-identical service illustrations** into one shared `images/services/service-illustration.jpeg`; all 9 service pages updated (≈0.9 MB less to download when browsing multiple services; one cache hit instead of nine).
- **Partner logos downscaled** from ~360 px tall to 120 px (2× their 60 px display size): 1.7 MB → 440 KB.
- **Removed the Google Fonts stylesheet + its two preconnects** from all 25 pages — Inter and Playfair Display were loaded but never referenced; the CSS uses a Roboto/system stack, so this is zero visual change.
- **Fixed CSS bug**: `.professional-image { height: (280px, 35vw, 400px) }` was missing `clamp()` — the declaration was invalid and silently ignored.
- **Skip-to-main-content link** added to all 25 pages (`.skip-link` styles in styles.css; first section after nav now has `id="main-content"`).
- **`<meta name="theme-color">` (#ec4899), Open Graph (`og:type/site_name/title/description`) and `twitter:card` meta** on all 25 pages. `og:url`/`og:image` still need the production domain — see below.
- **Pruned 23 genuinely unused CSS variables** (rose palette, most of the pink palette, unused container/radius sizes). Kept `--primary-100/200` — they're referenced from script.js inline styles.
- **`robots.txt`** added (allow all, disallow `/_partials/`); **`.vercelignore`** added so `_partials/`, `AUDIT.md`, etc. aren't deployed.
- **Nav drift fixed**: "Wellness Products" had been added to 24 pages but not `_partials/nav.html`, and `contact.html` still had the old nav. Partial + sync.py updated (new `{{PRODUCTS}}` placeholder), sync re-run — all 25 navs identical again.
- **Re-minified** styles.min.css (39.0 KB) and script.min.js.
- **Verified**: 0 broken links/anchors, 1 nav variant, 1 footer variant, OG tags exactly once per page, no undefined CSS variables, all 25 pages parse.

### Round 5 — October 2026 completion pass ✓ APPLIED
- **Contact form now actually sends.** It used to fake a 2-second "submit" and drop the message. It now POSTs to the booking API's new `POST /api/contact`, which emails `CONTACT_TO` (reply-to = the visitor) using the existing SMTP config. Includes validation, length caps, a honeypot field, and a per-IP rate limit (5 per 10 minutes). The visitor sees a clear error if sending fails; the message is never silently lost. **Set `SMTP_URL`, `MAIL_FROM` and `CONTACT_TO` in `booking-api/.env` before going live.**
- **Late-payment double-booking fixed.** If a PayHere payment arrives after its 10-minute hold lapsed and someone else has since booked the slot, the booking becomes `conflict` instead of `paid`: no calendar event is created, an error is logged for a manual refund or rebook, and the status page tells the client. The claim and the check run in one transaction.
- **Invalid booking time** now returns 400 instead of a 500.
- **"Continue to payment" stays usable** after returning from PayHere with the Back button.
- **Secrets removed from `booking-api/.env.example`.** The PayHere merchant ID and secret were committed; they are now blank. Rotate the sandbox secret if it is shared anywhere.
- **API Docker image:** uses `npm ci` with the lockfile; new `booking-api/.dockerignore` keeps the host `node_modules`, `.env`, the Google key and the database out of the image.
- Optional `TRUST_PROXY` env var so rate limiting sees real client IPs behind a reverse proxy.
- Tests: 8/8 passing (`cd booking-api && npm test`). Re-minified `styles.min.css` and `script.min.js`.

---

## STILL OPEN — your decisions

### 0. Real booking data
`booking-api/catalog.json` still has placeholder prices, hours, and `REPLACE@group.calendar.google.com` calendar IDs for four of the five professionals. Booking those professionals will fail until real calendar IDs are filled in and shared with the service account.


### 1. Production domain needed for final SEO polish
`sitemap.xml`, `og:url`, `og:image`, and `<link rel="canonical">` all require the site's public URL. Once the domain is settled, these are a quick one-pass addition.

### 2. Remaining placeholder content
All former stub pages now have real content. What's left: the "More Photos Coming Soon" block on `gallery.html`, and the empty "Our Journey" image slot on `about.html` (TODO comment in place). Both need real photos.

### 3. P2 / nice-to-have items left for later
- Team photo re-export at lower file size or WebP (currently 60–96 KB each — modest win).
- WebP export of `service-illustration.jpeg` (~30–50 % smaller).
- ~~Skip link, theme-color, OG/Twitter meta, robots.txt, unused CSS variables~~ — done in Round 4.

---

## Final state of the site

| Metric | Before | After |
|---|---|---|
| HTML pages | 24 | 25 (incl. new `services.html`) |
| Distinct nav structures across pages | 3+ inconsistent | 1 canonical |
| Distinct footers across pages | 2+ inconsistent | 1 canonical |
| Broken internal links | 22+ | 0 |
| Pages with meta description | 0 / 24 | 25 / 25 |
| Pages with deferred Font Awesome | 0 / 24 | 25 / 25 |
| Pages with preconnects | 0 / 24 | 25 / 25 |
| Pages with favicon | 0 / 24 | 25 / 25 |
| Images with `loading="lazy"` + dimensions | 0 / 17 | 17 / 17 |
| Hamburger is a real `<button>` | 0 / 24 | 25 / 25 |
| FA icons with `aria-hidden` | 0 / 568 | 568 / 568 |
| CSS file shipped to users | 47.4 KB | 35.6 KB (`styles.min.css`) |
| JS file shipped to users | 27.0 KB | 17.9 KB (`script.min.js`) |
| `console.log` in production JS | 6 | 0 |

## Backup
Originals are preserved under `_backup_pre_optimization/` (42 files, 1.8 MB). To roll back any single file, copy from there. To roll back the entire site, replace everything except `_backup_pre_optimization/` itself with the contents of that folder.

## Workflow going forward
- **To change the nav or footer**: edit `_partials/nav.html` or `_partials/footer.html`, then run `python3 _partials/sync.py` from the site folder.
- **To change styles**: edit `styles.css`, then re-minify with `npx csso styles.css -o styles.min.css`.
- **To change JS**: edit `script.js`, then re-minify with `npx terser script.js -c -m -o script.min.js`.
