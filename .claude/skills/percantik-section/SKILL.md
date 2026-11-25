---
name: percantik-section
description: Redesign or "beautify" one specific section of a web page (most often a digital wedding invitation such as Betawi Motion) into a themed, animated, mobile-first design, then verify it with screenshots and commit it. Use this whenever the user asks to "percantik", "perindah", "bikin lebih cantik/menarik/estetik", "redesign", "restyle", "poles", or "ubah tampilan" a particular part of a page — cover, hero, profil mempelai, jadwal/acara, love story, galeri, amplop digital/wedding gift, ucapan/RSVP, penutup, footer/credit — even if they only name the section ("bagian gift masih jelek", "jadwalnya bikin kayak kartu adat"). Not for whole-site palette swaps or new features with no visual brief.
---

# Percantik Section

Turn one plain section into a crafted, themed piece: a clear visual concept, ornaments taken from the page's own motif vocabulary, a choreographed scroll reveal, and nothing broken elsewhere. The user asks for this repeatedly, one section at a time, so every run should feel like part of the same family as the sections already redesigned.

## 1. Pin down scope (fast)

- Identify the **one** section the user means (its `<section id>`, the JS that fills it, and its CSS block). If the request is ambiguous between two sections, ask once; otherwise proceed.
- Note any explicit wishes ("kayak amplop", "pakai timeline", "jangan pakai foto"). They override everything below.
- Read `references/betawi-motion.md` if the project is Betawi Motion (it has `templates/betawi-motion/`). For other projects, do the discovery in step 2 yourself and follow the same principles.

## 2. Learn the house style before designing

Redesigns look stitched-on when they ignore what exists. Before writing anything, look at:

- **Design tokens** — CSS custom properties on `:root` (colors, fonts, easing, column width). Use them; add a new token only if the palette truly lacks a role, and add it next to the others.
- **Reveal system** — how scroll animations trigger (e.g. `[data-reveal]` + `.in` class from an IntersectionObserver). Hook into it rather than writing a new observer.
- **Shared pieces** from earlier redesigns — frames, rules, medallions, keyframes, button styles. Reuse them so sections rhyme with each other (`git log --stat` and recent redesign commits show what exists).
- **Content source** — where the text/data comes from (e.g. `wedding.js`). Never hard-code event content in the template; render from data, and keep optional fields optional (hide the element when the field is absent).
- **Ornament assets** already in the repo (images, SVG symbols). Prefer them over new files.

## 3. Choose one concept, then describe it in one sentence

Pick a real-world object or ritual the section can *become*, tied to the theme — not "a nicer card". Examples that worked: schedule → arch cards with a medallion crown; gift → a red envelope that opens in 3D; love story → a vertical timeline with numbered medallions; closing → a signed thank-you letter; cover → framed portrait plus a guest card.

Write the concept as one sentence before coding (it later becomes the commit body). If the user gave a concept, use theirs.

Design rules that keep quality high:
- **Hierarchy first**: kicker (small caps) → script/serif title → body. One focal element per section.
- **Ornament with restraint**: 2–3 motif elements per section (trim, medallion, rule, petals). Decoration is `aria-hidden` and `pointer-events: none`.
- **Mobile column first** (≈360–480px wide). Check that text never overflows, tap targets are ≥ 42px, and desktop still looks intentional.
- **Legibility**: text over photos/gradients needs contrast (overlay, text-shadow, or a card behind it).
- **Accessible semantics**: section gets `aria-labelledby` pointing at its heading; interactive bits are real `<button>`s with `aria-expanded`/labels; images have meaningful `alt` (decorative ones `alt=""`).

## 4. Choreograph the motion

Every redesign so far ships with a reveal sequence; it is part of the look.

- Container reveals via the existing system (`data-reveal="rise|up|zoom|blur|…"`, stagger with a `--d` delay variable).
- Children animate **after** the container gets `.in`, with staggered delays (≈ .2s → .8s): e.g. crest spins in, number pops, rule draws, text rises.
- Loops (slow spin, drift, shine) only on small ornaments, and pause them when off-screen if they are costly.
- **Always** add a `@media (prefers-reduced-motion: reduce)` rule that disables new infinite animations and shows the end state.
- Prefer `transform`/`opacity`; avoid animating layout properties.

## 5. Implement surgically

- Touch only the target section's markup, its render function, and a **new, labelled CSS block** (e.g. `/* ---------- Jadwal acara ---------- */`) appended near the other section blocks. Give classes a short section prefix (`ev-`, `tl-`, `gift-`) so nothing leaks.
- Remove CSS/markup the old version used only if nothing else references it (grep first).
- Match the file's existing code style (indentation, quote style, one-line vs multi-line rules, helper functions like `el()`/`icon()`).
- New SVG icons go into the existing sprite as `<symbol>` entries.

## 6. Verify visually — don't skip

Build the site, serve it, and screenshot the section on mobile and desktop with the bundled script:

```bash
node .claude/skills/percantik-section/scripts/shot.mjs --url http://localhost:8000/ --section "#jadwal" --out /tmp/shots/after --click "#open-invitation"
```

(Run it once **before** editing with `--out …/before` so you can compare.) The script forces all `[data-reveal]` elements to their final state, scrolls the section into view, waits for animations, and writes `mobile.png` and `desktop.png`. Open the images and check: overflow, overlap with neighbouring sections, contrast, alignment, empty optional fields, and that the concept actually reads. Fix and re-shoot until it looks right. Also check the browser console for errors.

Show the user the after screenshot(s) (or before/after) when reporting.

## 7. Commit like the earlier redesigns

- Branch per the session's rules; one commit per section.
- Subject: imperative, names the section and the concept — `Redesign the schedule as Betawi arch cards`.
- Body: one paragraph describing what the viewer sees, in order, then the motion ("Cards rise in, the crest spins in, the date pops and the rule draws."). No file lists.
- If the content model changed (new optional field such as `story[].photo`), mention it in the body and in the README's field list.

## Report back

Reply in the user's language: the concept in one line, what changed visually, the screenshot(s), anything you couldn't do or chose not to change, and what you'd suggest polishing next.
