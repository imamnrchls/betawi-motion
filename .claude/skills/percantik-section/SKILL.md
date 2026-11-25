---
name: percantik-section
description: Redesign or "beautify" one specific section of a web page (landing page, digital invitation, portfolio, event site) into a themed, animated, mobile-first design, then verify it with screenshots and commit it. Use this whenever the user asks to "percantik", "perindah", "bikin lebih cantik/menarik/estetik/elegan", "redesign", "restyle", "poles", or "ubah tampilan" a particular part of a page — hero/cover, profil, jadwal/acara, timeline/cerita, galeri, pricing, testimoni, hadiah/amplop digital, form/RSVP, penutup, footer — even if they only name the section ("bagian gift masih jelek", "jadwalnya bikin kayak kartu"). Not for whole-site palette swaps or new features with no visual brief.
---

# Percantik Section

Turn one plain section into a crafted, themed piece: a clear visual concept, ornaments drawn from the page's own visual vocabulary, a choreographed scroll reveal, and nothing broken elsewhere. Users tend to ask for this repeatedly, one section at a time, so every run should feel like part of the same family as the sections already redesigned.

## 1. Pin down scope (fast)

- Identify the **one** section the user means: its markup (e.g. `<section id>`), any JS that renders or drives it, and its CSS. If the request is ambiguous between two sections, ask once; otherwise proceed.
- Note explicit wishes ("kayak amplop", "pakai timeline", "jangan pakai foto", "lebih minimalis"). They override everything below.

## 2. Learn the house style before designing

Redesigns look stitched-on when they ignore what exists. Spend a few minutes on discovery before writing anything:

| Look for | Why |
| --- | --- |
| **Design tokens** — CSS custom properties on `:root`, Tailwind config, theme files (colors, fonts, spacing, easing, max column width) | Use them so the section matches. Add a new token only if the palette lacks a role, and put it beside the others. Choose tokens by role, not by name — names can be historical. |
| **Animation system** — an IntersectionObserver that adds a class (`.in`, `.visible`, `.aos-animate`), a library (AOS, GSAP, Framer Motion), existing `@keyframes` | Hook into it instead of writing a second observer; reuse keyframes before inventing new ones. |
| **Shared pieces** from sections already polished — frames, dividers, badges, medallions, button styles, icon sprite | Reuse them so sections rhyme. `git log --oneline` and recent redesign commits show what exists and how earlier ones were described. |
| **Content source** — a data/config file, CMS, props | Never hard-code content into a template that renders from data. Keep optional fields optional: hide the element when the field is absent. |
| **Assets & visual motif** — illustrations, ornaments, textures, fonts already in the repo; the cultural or brand theme they express | Prefer existing assets over new files, and take the concept's vocabulary from this theme. |
| **Code conventions** — indentation, quote style, CSS organisation (one block per section? utility classes?), DOM helper functions | Match them exactly. |
| **Build & serve** — README, `package.json` scripts, build script output folder | Needed for visual verification in step 6. |

If the project has its own notes file for this skill (e.g. a `percantik-notes.md` or a section in `CLAUDE.md`), read it first. After a successful run, offer to save what you learned (tokens, reveal system, ids, motifs) there so the next run starts faster.

## 3. Choose one concept, then describe it in one sentence

Pick a real-world object, ritual, or metaphor that the section can *become*, tied to the page's theme — not "a nicer card". Patterns that work well:

- schedule/event list → arched or ticket-style cards with a medallion or stamp at the top, joined by a dashed line
- gift/donation → an envelope or box that opens on tap to reveal the details
- story/history → a vertical timeline with numbered nodes and speech-bubble cards
- closing/thanks → a signed letter or card with the names as a signature
- cover/hero → a framed portrait with a personalised greeting card and a clear call to action
- profiles/team → centred portraits in a consistent frame with a decorative halo
- gallery → a window, film strip, or polaroid scatter with a lightbox
- guestbook/testimonials → bubbles or notes pinned to a board

Write the concept as one sentence before coding (it becomes the commit body). If the user gave a concept, use theirs.

Design rules that keep quality high:
- **Hierarchy first**: small kicker label → display title → body. One focal element per section.
- **Ornament with restraint**: 2–3 decorative elements per section (trim, divider, medallion, petals). Decoration is `aria-hidden` and `pointer-events: none`.
- **Mobile first** (≈360–480px wide). Text never overflows, tap targets are ≥ 42px, and desktop still looks intentional rather than stretched.
- **Legibility**: text over photos or gradients needs contrast (overlay, text-shadow, or a card behind it).
- **Accessible semantics**: the section has `aria-labelledby` pointing at its heading; interactive bits are real `<button>`s with `aria-expanded`/labels; meaningful images have `alt`, decorative ones `alt=""`; user data is inserted as text, never as raw HTML.

## 4. Choreograph the motion

A reveal sequence is part of the look.

- The container reveals via the existing system (rise, fade-up, zoom, blur…), staggered with a delay variable when there are several items.
- Children animate **after** the container is revealed, with staggered delays (≈ .2s → .8s): e.g. badge spins in, number pops, divider draws, text rises.
- Loops (slow spin, drift, shine) only on small ornaments; pause costly ones when off-screen.
- **Always** add a `@media (prefers-reduced-motion: reduce)` rule that disables new infinite animations and shows the end state.
- Animate `transform` and `opacity`, not layout properties.

## 5. Implement surgically

- Touch only the target section's markup, its render/behaviour code, and a **new, labelled CSS block** (e.g. `/* ---------- Schedule ---------- */`) placed with the other section styles. Give classes a short section prefix (`ev-`, `tl-`, `gift-`) so nothing leaks into other sections.
- Remove old CSS/markup only if nothing else references it (grep first).
- New icons go into the existing icon sprite or icon set.
- If the content model changes (a new optional field), update the sample data and any docs that list the fields.

## 6. Verify visually — don't skip

Build and serve the site, then screenshot the section on mobile and desktop with the bundled script (needs Node and Playwright):

```bash
node <skill-dir>/scripts/shot.mjs --url http://localhost:8000/ --section "#schedule" --out /tmp/shots/after
```

Options: `--click "<selector>"` taps something first (e.g. a cover's open button or a cookie banner), `--wait <ms>` waits longer for animations, `--full` captures the whole page instead of just the section.

Run it once **before** editing (`--out /tmp/shots/before`) so you can compare. The script reveals the section, forces any `[data-reveal]` elements to their `.in` state (adapt the selector in the script if the project uses another convention), waits, and writes `mobile.png` and `desktop.png`, reporting console errors and horizontal overflow. Look at the images and check overflow, overlap with neighbouring sections, contrast, alignment, empty optional fields, and whether the concept actually reads. Fix and re-shoot until it looks right.

If Playwright isn't available, say so and describe what you checked instead — don't claim a visual check you didn't do.

## 7. Commit

- Follow the repository's branch rules; one commit per section.
- Subject: imperative, names the section and the concept — e.g. `Redesign the schedule as arch cards`.
- Body: one paragraph describing what a visitor sees, in order, then the motion ("Cards rise in, the badge spins in, the date pops and the divider draws."). No file lists.

## Report back

Reply in the user's language: the concept in one line, what changed visually, the after (or before/after) screenshots, anything you couldn't do or chose not to change, and a suggestion for which section to polish next.
