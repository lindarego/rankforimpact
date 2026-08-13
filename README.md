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
| `--green` | `#16302a` | Dark sections, buttons, footer |
| `--gold` | `#c4a265` | Accent fills, gold buttons |
| `--gold-ink` | `#96742f` | Accent text on light backgrounds (contrast-safe) |
| `--cream` | `#f7f5f0` | Page background |
| `--ink` | `#22241f` | Headings |

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

Cormorant Garamond (display) and Inter (body), self-hosted as variable WOFF2
latin subsets in `assets/fonts/` — 125 KB total, no calls to Google Fonts.

## Known gaps

- **Photography** — no image files yet; every frame is showing its placeholder.
- **Logo artwork** — the header renders a typographic `R.` lockup. Add
  `assets/img/logo.svg` and swap the `.brand__mark` span for an `<img>` (there is
  a comment marking the spot in each page).
- **Favicon** — `assets/img/favicon.png` and `apple-touch-icon.png` are
  referenced but not present.
- **Contact form** — GitHub Pages cannot process form posts. Point the form's
  `action` at Formspree, Basin, Netlify Forms or similar, then delete the notice
  under the submit button. The direct `mailto:` link works today.
- **Insights articles** — the six cards are placeholder copy.
