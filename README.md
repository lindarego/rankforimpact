# RankForImpact

Marketing site for RankForImpact — premium editorial SEO and AEO for B2B SaaS.
Plain static HTML, CSS and a little vanilla JavaScript, built to be served
directly by GitHub Pages. No build step, no dependencies, no package manager.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `services.html` | Services |
| `approach.html` | Our Approach |
| `about.html` | About — Authority today. Opportunity tomorrow. |
| `insights.html` | Insights (placeholder articles) |
| `contact.html` | Contact |
| `404.html` | Not found |

## Local preview

Any static file server will do — the pages use relative paths:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

A workflow at `.github/workflows/pages.yml` publishes the repository root to
GitHub Pages on every push to `main`. Enable it once, in the repository
settings: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

`.nojekyll` is present so Pages serves the files verbatim rather than running
them through Jekyll.

### Custom domain

Add a `CNAME` file at the root containing the bare domain (e.g.
`rankforimpact.com`), point DNS at GitHub Pages, then update the absolute URLs in
`sitemap.xml`, `robots.txt` and the `<link rel="canonical">` / `og:url` tags in
each page's `<head>`.

## Structure

```
assets/
  css/site.css      all styling, organised in numbered sections
  js/site.js        sticky header, mobile nav, image fallbacks, scroll reveal
  fonts/            self-hosted variable font subsets (no third-party requests)
  icons/            source SVGs; inlined into each page as a <symbol> sprite
  img/              photography — see assets/img/README.md
  video/            the homepage hero loop
```

### Editing content

Each page is self-contained: header, content, footer and the icon sprite all
live in the file. Editing copy means editing the HTML directly. The trade-off is
deliberate — no toolchain to install, but the header and footer are duplicated
across pages, so nav or footer changes need applying to each file.

### Styling

`assets/css/site.css` opens with a token block under `:root` — brand colours,
type families and rhythm. Adjust tokens there rather than individual rules.

| Token | Value | Role |
| --- | --- | --- |
| `--green` | `#123328` | Dark sections, buttons, footer |
| `--green-deep` | `#0d2620` | Button hover wipe, the mission promise block |
| `--gold` | `#c19a63` | Accent fills, gold buttons, eyebrow text |
| `--gold-soft` | `#c9a877` | Gold on dark green |
| `--cream-hi` | `#faf8f3` | Page ground |
| `--cream` | `#f4f0e8` | Warmer accent band — header, hero, CTA |
| `--ink` | `#1c1c1a` | Headings |
| `--muted` | `#5b5b55` | Secondary copy |

### Images

Images degrade gracefully: while a file is missing, its frame shows a tonal
placeholder describing the intended shot. Add the file to `assets/img/` under the
documented name and it appears. Full list and art direction in
[`assets/img/README.md`](assets/img/README.md).

### Icons

Line icons come from [Lucide](https://lucide.dev) (ISC licence); the X mark comes
from [Simple Icons](https://simpleicons.org) (CC0). Sources are kept in
`assets/icons/` and inlined into each page as an SVG sprite at the end of
`<body>`, referenced with `<use href="#i-name">`.

### Fonts

Cormorant Garamond (display) and Jost (body), self-hosted as variable WOFF2
latin subsets in `assets/fonts/` — ~104 KB total, no calls to Google Fonts.

### Motion

`site.js` adds a `js` class to `<html>`, and every motion rule is gated behind
it, so with JavaScript unavailable the page renders fully visible instead of
stranding content at `opacity: 0`. Reveals are driven by `IntersectionObserver`
with per-group stagger; headings ride up from behind a clipping mask
(`.mask-line`). `prefers-reduced-motion` short-circuits all of it, and also
freezes the homepage hero video on its poster frame.

The homepage hero is a muted, looping video (`assets/video/hero-forest.mp4`,
1280×720, 2.9 MB) under a gradient scrim, with the headline centred on top. The
scrim is tuned against the brightest frame of the loop so every line clears its
contrast target there — lighten it and the gold accent stops holding. The
eyebrow runs white rather than gold for the same reason. Swapping the footage
means re-checking both, and re-cutting `assets/img/hero-forest-poster.jpg` from
the new first frame.

Headings are masked from one selector list (`MASK_TARGETS` in `site.js`) rather
than tagged per heading, so a new page picks the effect up for free. A heading
whose line breaks are deliberate — the homepage hero — is split by hand in the
markup and skipped automatically.

The hover vocabulary is shared across every page: photography scales to 1.04,
circled icons fill gold, a gold rule draws in under the title, and cards lift
with a gold border. Section `22b` of the stylesheet carries it to the components
that only appear away from the homepage (feature rows, article cards, the
about-page splits).

Note that a page rendered without the `js` class shows its final settled state —
useful when snapshotting or embedding the pages elsewhere.

## Known gaps

- **Photography** — no image files yet; every frame is showing its placeholder.
- ~~**Logo artwork**~~ — done. `logo-mark.png` (header), `logo-full.png` and
  `logo-full-480.png` (footer), plus `favicon.png`, `apple-touch-icon.png` and
  `og-default.jpg` derived from them. Each lockup still degrades to a
  typographic `R.` if its file is ever missing.
- **Favicon** — present, resampled from the supplied monogram. The
  apple-touch-icon is flattened onto cream because iOS ignores alpha.
- **Contact form** — GitHub Pages cannot process form posts. Point the form's
  `action` at Formspree, Basin, Netlify Forms or similar, then delete the notice
  under the submit button. The direct `mailto:` link works today.
- **Insights articles** — the six cards are placeholder copy.
