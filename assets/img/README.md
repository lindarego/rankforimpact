# Photography

Every image on the site sits inside a `.frame` element. While a file is missing,
the frame renders a tonal placeholder carrying the monogram and a note describing
the shot. **Drop a correctly-named file into this folder and it takes over
automatically** — no markup change needed.

Art direction throughout: warm neutrals (cream, oatmeal, walnut), deep green and
brass accents, soft raking daylight, generous negative space, nothing glossy or
stock-looking.

## Brand assets

All present. Each lockup still falls back to a typographic `R.` in the brand
serif if its file ever goes missing, so a broken-image icon never appears.

`favicon.png`, `apple-touch-icon.png` and `og-default.jpg` were derived from the
supplied artwork by resampling and compositing — no new artwork was drawn.
Replace them freely if you would rather art-direct the social card.

| File | Used for | Notes |
| --- | --- | --- |
| `logo-mark.png` | Header lockup | The square monogram — dark green `R` with the gold arrow and dot, transparent background. 512×512; rendered 52 px tall, shrinking to 42 px once the header sticks. |
| `logo-full.png` | Footer lockup | The full lockup: monogram over `RANKFORIMPACT` and the "Authority creates opportunity." line. 1200×685. Because it is dark-ink artwork it sits on a cream plate in the footer, which keeps it legible on the dark green. |
| `logo-full-480.png` | Footer lockup, 1× | 480 px wide version of the same artwork, served via `srcset`. |
| `favicon.png` | Browser tab | 512×512, transparent background — the monogram alone |
| `apple-touch-icon.png` | iOS home screen | 180×180, opaque cream background — iOS does not honour transparency |
| `og-default.jpg` | Social sharing card | 1200×630 |

Using `.svg` instead is fine — update the `src`/`srcset` attributes in each
page's `.brand` block to match. The header and footer upgrade independently, so
adding one without the other works.

## Home — `index.html`

| File | Ratio | Shot |
| --- | --- | --- |
| `hero-forest-poster.jpg` | 16:9 | **Supplied.** First frame of the hero loop (`assets/video/hero-forest.mp4`), shown while the video buffers and whenever it cannot play. 1280×720, 38 KB. Re-cut it from the video if the footage is ever replaced. |
| `hero-workspace.jpg` | 16:9 | **Unused** since the hero became video, kept for reuse. Bright desk by a window: laptop showing “Would an AI recommend you?” in gold italic on a forest green screen, monogrammed mug, notebook and pen. 2400×1340, 215 KB. `hero-workspace-1400.jpg` is the 1400px companion. |
| `mission-focus.jpg` | 1:1 | Woman at a laptop in a bright open-plan office, candid, natural light. |
| `mission-collaboration.jpg` | 1:1 | Two colleagues mid-conversation across a table, warm and unposed. |
| `mission-landscape.jpg` | 1:1 | Green valley and river from above, golden hour, misty ridgelines. |
| `mission-portrait.jpg` | 1:1 | Portrait of a smiling woman in a library, headwrap, soft window light. |
| `cta-foliage.jpg` | wide | Soft-focus olive foliage against a pale plaster wall, very low contrast. |

## Services — `services.html`

The hero is centred type with no photograph, and the page closes on the shared
`cta-foliage.jpg` band, so the five service rows are the only images it needs.
`services-hero.jpg` and `cta-mug-books.jpg` were dropped along with those two
slots.

All five **supplied**. Each was resized to 1600px wide and re-encoded at quality
80, progressive, EXIF stripped — 4.75 MB of originals down to 0.66 MB, with no
visible loss at the size these frames render. Replacements are best given the
same treatment; a 2 MB photograph in a 420px-tall frame costs load time and buys
nothing.

The rows band is full-bleed, so a media column can reach roughly half the
viewport. 1600px covers a 1600-wide column, or an 800px one on a 2× screen.

| File | Size | Shot |
| --- | --- | --- |
| `service-technical.jpg` | 1600×900, 170 KB | Writing in a spiral notebook at a dark desk, green cup and pencils, laptop at the edge. |
| `service-intelligence.jpg` | 1500×750, 46 KB | Pale 3D render: magnifying glass beside blocks printed with search and analytics icons. |
| `service-content.jpg` | 1600×893, 115 KB | Laptop showing “Would an AI recommend you?” beside a monogrammed mug and open notebook. |
| `service-outreach.jpg` | 1600×1069, 201 KB | Two colleagues mid-conversation over a laptop in a warm wood-panelled office. |
| `service-reporting.jpg` | 1600×1067, 145 KB | Close-up of a laptop screen showing a dark analytics dashboard, plant behind. |

## Our Approach — `approach.html`

| File | Ratio | Shot |
| --- | --- | --- |
| `approach-hero.jpg` | 4:3+ | Still life: black vase with foliage, monogrammed mug, books and pen, raking light. |
| `approach-discover.jpg` | 4:3 | Laptop and open notebook on a dark desk, black mug, morning light. |
| `approach-relationships.jpg` | 4:3 | Magazine and print collateral laid out on a pale surface, editorial flat-lay. |
| `approach-authority.jpg` | 4:3 | Open magazine spread with a monogrammed mug, pen and stone vase, soft shadow. |
| `approach-measure.jpg` | 4:3 | Laptop displaying muted analytics charts beside a plant on a wooden desk. |
| `approach-cta-foliage.jpg` | wide | Dark green leaves in low light, deep shadow — sits behind a green overlay. |

## About — `about.html`

| File | Ratio | Shot |
| --- | --- | --- |
| `about-hero.jpg` | 4:3+ | Minimal interior: potted olive tree, oak desk, laptop, large window onto trees. |
| `about-mission.jpg` | 4:3 | Mountain range at sunset, winding valley below, warm haze and long light. |
| `about-approach.jpg` | 4:3 | Stacked hardback books, black vase with foliage, monogrammed mug, pen on plaster. |
| `about-cta.jpg` | wide | Winding mountain road through golden hills at dusk, wide and cinematic. |

## Insights — `insights.html`

`insight-1.jpg` … `insight-6.jpg`, 3:2 — editorial still life or abstract texture
in brand tones. Replace alongside the placeholder article copy.

## Cropping a wide photograph

The desktop hero column is nearly portrait, so a 16:9 photograph loses roughly
half its width to `object-fit: cover` — at 1100px only the middle 40% survives.
When the subject does not sit at the centre of what is kept, add
`frame--focus-right` or `frame--focus-left` to the frame; they shift the
`--focus` custom property rather than needing new markup.

The home hero stays at the default centre because its laptop screen carries the
message and spans 35.0%–63.5% of the frame. Only a focal point between **43%
and 55%** keeps that screen whole at every breakpoint — anything further right
clips the first word. If you replace this photograph, measure where the screen
sits before changing the focal point.

## Export guidance

- Save JPEG at quality 78–82; target under 300 KB for inline images and under
  600 KB for full-bleed hero and band images.
- Export hero and band images at 2400 px on the long edge, cards at 1200 px.
- Strip EXIF on export.
- Anything with an identifiable person needs a model release on file.
