# RankForImpact

Marketing site for RankForImpact — premium editorial SEO and AEO for B2B companies.
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
  js/cal-embed.js   Cal.com booking modal, opened by every "Book 15-min call"
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

### Booking

Every "Book 15-min call" button on the site opens the Cal.com booker in a modal,
rather than one page carrying an inline calendar. A button becomes a trigger by
carrying three attributes, which `btn(..., cal=True)` in the generator stamps on:

```html
data-cal-link="rankforimpact/15min"
data-cal-namespace="15min"
data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"light"}'
```

Each trigger is a real `<button type="button">` carrying **no `href`**, and that
is deliberate: with an href present the navigation beat Cal's click handler and
the modal never opened. `btn()` raises if a caller passes an href alongside
`cal=True`, so the fix cannot be undone by accident.

`<button>` rather than an `<a>` with the href stripped out — an anchor without an
href stops being focusable and loses its semantics, while a button stays
keyboard-operable (Enter and Space) and announces itself correctly.

The trade-off is that a trigger now does nothing at all if the embed script is
blocked or fails, where before it fell back to the booking page. The contact
page's booking panel carries the email address beside the button for that case,
and it is the reason to keep an eye on the script loading.

`assets/js/cal-embed.js` carries Cal's loader and is the site's **only
third-party request**. It loads on *every* page, because the header CTA is on
every page. The event and namespace sit in the `CAL_LINK` / `CAL_NS` constants at
the top of that file, and must match `CAL_LINK` / `CAL_NS` in the generator.

The modal is themed through Cal's own design tokens (`cssVarsPerTheme`) rather
than by overriding its CSS, so the whole widget follows the palette: cream
surfaces, deep green on the primary action and the selected day, gold on the
emphasis and border states. `theme` is pinned to `light` rather than `auto` —
only the light set is defined, and the site itself pins `color-scheme: light`, so
following the visitor's OS would leave a dark modal wearing cream tokens. Green
carries the primary action rather than gold because white on `#c19a63` measures
about 2.6:1, too weak for a button label; gold does the decorative work.

The contact page's own booking panel is a cream CTA block (`.booker`) holding one
line of copy, that trigger button, and the email address as an alternative.

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
with a gold border. Section `21b` of the stylesheet carries it to the components
that only appear away from the homepage (feature rows, article cards, the
about-page splits).

Card lifts use the `translate` property rather than a `transform`, and this is
load-bearing: the scroll reveal owns `transform` on the same elements, and its
settled rule outranks any component's `:hover`, so a `transform: translateY(-3px)`
lift silently stopped working the moment the card was revealed — i.e. for every
visitor with JavaScript. `translate` composes with `transform` instead of
replacing it. The reveal's `transition` shorthand lists `translate` explicitly so
the lift keeps its own short duration, and the stagger delay is attached per
property so a card near the end of a group does not wait out its reveal offset
before responding to the pointer. Adding a new hover lift means using `translate`
and cancelling it under `prefers-reduced-motion`, where `transform: none` no
longer reaches it.

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
- ~~**Booking link**~~ — set to
  [cal.com/rankforimpact/15min](https://cal.com/rankforimpact/15min), and the
  modal is confirmed opening. Changing the event means updating `CAL_LINK` in
  `assets/js/cal-embed.js` **and** in the generator, which stamps it onto every
  trigger. The modal's cream palette has not been eyeballed here — this
  environment blocks `app.cal.com`, so it could only be verified as far as the
  tokens being handed to Cal.
- **Insights articles** — the six cards are placeholder copy.
