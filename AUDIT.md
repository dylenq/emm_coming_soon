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

---

## STILL OPEN — your decisions

### 1. The 10 illustration JPEGs are byte-identical
All `* illustration.jpeg` files share the same MD5 hash. Pick one path:
- **Option A**: supply 10 actually-distinct illustrations (one per service) and drop them in as replacements with the same filenames — no code changes needed.
- **Option B**: consolidate to one shared file (e.g. `service-illustration.jpeg`) and update the 10 service pages to reference it. Saves ~900 KB total download for any visitor who browses multiple service pages.

Either way, also exporting to **WebP** would shave another 30–50 % off the file size with no visible quality loss.

### 2. Nine stub "Content Coming Soon" pages
`privacy`, `terms`, `cookies`, `faq`, `gallery`, `products`, `careers`, `assessments`, and `contact` all show a `content-placeholder` block. Pick a path:
- **Option A**: write real content for each (privacy policy, terms, FAQ, careers, etc.). I can draft starter content on request, but legal pages (privacy/terms/cookies) really should be reviewed by counsel.
- **Option B**: temporarily hide them from the nav/footer until ready. I can do this in one pass by editing `_partials/nav.html` and `_partials/footer.html`, then re-running `python3 _partials/sync.py`.

### 3. P2 / nice-to-have items left for later
- "Skip to main content" link for keyboard users.
- `<meta name="theme-color">` for mobile browser chrome.
- Open Graph and Twitter Card meta tags for shareable link previews.
- `sitemap.xml` and `robots.txt`.
- Team photo re-export at lower file size or WebP.
- Prune unused pink/rose palette variables from `styles.css`.

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
