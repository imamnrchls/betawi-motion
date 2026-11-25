# Betawi Motion conventions

Facts about this repo that a redesign must respect. Verify against the code if something looks stale — the files are the source of truth.

## Files

| What | Where |
| --- | --- |
| Markup, SVG icon sprite (`<symbol id="i-…">`) | `templates/betawi-motion/index.html` |
| Rendering from data, reveals, interactions | `templates/betawi-motion/invitation.js` |
| All styles (base block, then "Betawi Motion theme" block, then per-section blocks) | `templates/betawi-motion/style.css` |
| Template ornaments (`kembang.webp`, `kembang-kelapa.webp`, `gigi-balang.svg`, `flowers.webp`, `bouquet.webp`, `pavilion.webp`, `ondel-*.webp`, `hanging.webp`, `frame.webp`, `sky.webp`, …) | `templates/betawi-motion/assets/` |
| Event content (names, events, story, photos, gift accounts…) | `events/<slug>/wedding.js` + `events/<slug>/assets/` |
| Build | `node build.mjs [event-slug]` → `dist/` ; serve with `python3 -m http.server 8000 --directory dist` |

Sample event: `ayu-raka` (fictional). Test with `?to=Ibu%20Dewi` for the guest name on the cover.

## Section ids

`pembuka` (hero), `pembuka-ayat` (with-love/quote), `mempelai` (couple), `jadwal` (events), `cerita` (story, hidden if no data), `galeri` (gallery, hidden if no photos), `hadiah` (gift + wishes/RSVP `#reply`), `penutup` (closing), then `.credit` footer. The cover is a fixed overlay opened by `#open-invitation`.

## Tokens (theme block overrides the base `:root`)

Palette is soft sage & coral: `--paper`, `--cream`, `--navy` (deep green text), `--blue`, `--blue-deep`, `--gold` (actually a deep red-brown accent used for titles), `--gold-soft` (beige line), `--brass`, `--ink`, `--muted`, `--line`, `--sage`, `--sage-light`, `--sage-cream`, `--coral`, `--peach`.
Filters: `--illustration-tone`, `--ornament-tone` (apply to ornament images so they match the pastel palette).
Fonts: `--script` (Great Vibes), `--serif` (Cormorant Garamond), `--body` (Crimson Pro), `--sans` (Montserrat).
Layout/motion: `--col` (= min(100vw, 480px), the phone column; desktop shows a split layout from 900px), `--ease`.
Opening timeline: `--t-*` variables — don't touch unless the request is about the opening scene.

Note: token names are historical (`--gold` is not gold, `--navy` is not navy). Pick by role, not by name.

## Reusable type & pieces

- `.kicker` (small caps label), `.script` (big script title), `.caps-title`, `.serif-names`, `.pill` / `.pill.small` buttons, `.ico` icons.
- From earlier redesigns: `.pf-rule` (diamond rule), `.pf-halo` (spinning kembang kelapa halo), arched double-frame portrait (profile/cover/closing), `.gigi.edge` (gigi balang trim at a band's top edge, `data-reveal="gigi"`), `.ev-btn.solid/.line` buttons, `.blue-band` / `.cards-band` backgrounds.
- Keyframes to reuse before inventing new ones: `pf-bloom` (pop), `pf-line` (rule draw), `pf-rise`, `pf-halo`, `letter-in` (text rise), `spin`, `spin-in`, `kembang-pop`, `float`, `petal-fall`, `drop-in`, `swing`.

## Reveal system

- Put `data-reveal="<kind>"` on an element; `watchReveals()` in `invitation.js` adds `.in` once it is 18% visible. Kinds: `up`, `rise`, `left`, `right`, `zoom`, `zoom-out`, `blur`, plus section-specific ones (`pf`, `tl`, `drop`, `gigi`). Define a new kind as `[data-reveal="x"] { transform: … }` — the `.in` rule resets it.
- Stagger with inline `style="--d:.2s"`.
- Animate children with `.thing.in .child { animation: name dur delay curve both; }`.
- Elements created in JS must exist before `watchReveals()` runs (render first) — follow how existing render functions do it.
- Global reduced-motion rule already neutralises durations; still add `animation: none` for new infinite loops.

## JS helpers

- `$(id)` → `getElementById`.
- `el(tag, { class, text, 'data-…', 'aria-…', style, …props }, ...children)` builds DOM; falsy children are skipped (good for optional fields).
- `icon(id, cls)` → `<svg><use href="#i-id">`.
- `asset(file)` (event asset), `own(file)` (template asset).
- Use `textContent` (`text:`) for user data — never `innerHTML` with event content.

## Motif vocabulary (Betawi)

Gigi balang (triangular trim), kembang kelapa (spinning flower crown), ondel-ondel figures, rumah kebaya pavilion, banana and blossom trees, kingfishers, clouds, amplop (envelope) and red/green Betawi colours softened to coral/sage. Copy text is Indonesian (e.g. "Waktu & Tempat", "Buka Amplop", "Kami yang berbahagia").

## Past redesign commits (read for patterns)

`git log --oneline | grep -i redesign` — e.g. schedule (arch cards), gift (envelope), story (timeline), closing (thank-you), cover (framed portrait + guest card), couple profiles (centred portraits), gallery (window slideshow), wishes (guestbook).
