# Research & Scoping — Qur'anic Study Workspace

**Phase:** Research
**Date:** 2026-07-05
**Reference product:** `app.qurannotate.com` (Qurannotate — "Reflect. Revisit. Rise.")
**Goal:** Replicate the workflow of a Qur'anic annotation workspace as our own
web-first product, optimized for iPad Pro and foldable phones, at low cost.

---

## 1. Access note (what's confirmed vs. reconstructed)

Both `app.qurannotate.com` and the marketing site `qurannotate.com` sit behind
Cloudflare bot protection + a login wall, so the live UI/code could not be
crawled. **Confirmed** from public sources: positioning as *"the world's 1st
Qur'anic Workspace,"* tagline *"Reflect. Revisit. Rise,"* and active marketing
on Instagram (@qurannotate), TikTok, YouTube, and LinkedIn. The most important
confirmed fact: **it is a web application** (`app.` subdomain), not a native
app — which validates a web-first replication strategy.

The feature map in §2 is **reconstructed** from the product category and
positioning. **To make it exact:** capture 5–10 screenshots of the live app
(reading view, note editor, tags/collections, review/revisit screen, sharing)
and drop them in `docs/reference/`. This is the single highest-value input for
scoping.

---

## 2. Reconstructed feature map

### Reading surface
- Full mushaf, Arabic script (Uthmani + IndoPak options)
- Selectable translations and tafsir — side-by-side or toggled
- Verse-level and word-level selection
- Per-word morphology/root lookup (common in this category)
- Per-ayah recitation audio

### Annotation (the core value)
- Highlight verses in multiple colors; underline
- Rich-text notes attached to a specific ayah (headings, lists, links)
- Word-level notes
- Cross-references: link ayah → ayah to build thematic threads
- Freehand ink/drawing (Apple Pencil) — natural premium feature on iPad

### Organization & retrieval
- Tags, collections / "spaces," folders
- Global search across notes + verse text
- Filter by tag ("show every ayah tagged *patience*")

### Review & retention
- "Revisit" = spaced-repetition / flashcard review over annotated verses
  (implied directly by "Reflect. **Revisit.** Rise")

### Account layer
- Auth, cloud sync across devices
- Export (PDF / Markdown)
- Likely sharing / study-circle feature

---

## 3. Feasibility verdict

**The software is the easy ~70%.** This is a CRUD app with a rich
text/annotation layer and strong responsive design. Nothing is novel
engineering; every feature above is very buildable.

**The hard ~30% is content + licensing, not code** (see §4).

### IP position
We replicate *features and workflow* — which are not copyrightable ("let users
highlight verses" is an idea, not protected expression) — using our **own**
code, branding, name, and design. We do **not** copy Qurannotate's assets,
code, or name.

---

## 4. Content & licensing (the real gate)

| Content | Availability | Notes |
|---|---|---|
| Quran Arabic text | Free / clean | Tanzil.net, King Fahd Complex, Quranic Universal Library (QUL) exports |
| Translations | **Mixed** | Some freely licensed (e.g. Sahih International widely usable); many copyrighted — choose sources deliberately |
| Tafsir | **Mixed** | Same caution as translations |
| Recitation audio | Free | EveryAyah, QUL verse-by-verse mp3 |
| Word morphology | Free | Quranic Arabic Corpus derived data |

### API options for MVP (avoid hosting our own corpus early)
- **Quran.com API v4** — text, translations, tafsir, audio, word-by-word
- **AlQuran.cloud API** — text + translations + audio

**Action item:** pick a translation set with clean licensing before v1 (when we
ship accounts and go semi-public). MVP can rely on an API.

---

## 5. Device optimization — iPad Pro + foldables

The requirement is genuinely **adaptive** layout, not just responsive.
Architect around a **pane-based layout engine** (1 / 2 / 3 panes chosen from
available width + screen segments). Both device families reward the same
engine.

### iPad Pro
- **Apple Pencil:** pressure + tilt via Pointer Events; ink on a canvas/SVG
  overlay above the mushaf. Signature feature.
- **Multitasking:** Stage Manager / Split View / Slide Over → window can be any
  width. Layout must reflow fluidly (single column → mushaf|notes → three-pane),
  not snap at a couple of fixed breakpoints.
- **Study-desk layout:** verse pane + docked note editor.

### Foldables (Galaxy Fold, Pixel Fold, etc.)
- **Hinge is a real API:** Viewport Segments API — `env(viewport-segment-*)`
  and the `horizontal-viewport-segments` media feature. Pin mushaf to the left
  segment, notes to the right; keep content out of the crease.
- **Continuity:** fold/unfold resizes the window live — state must survive the
  transition and panes recompose mid-session.
- **Flex mode (half-open):** reading pane top, controls/keyboard bottom.

### Shared architecture takeaway
Build the pane/segment layout engine **once**; iPad multitasking and foldable
hinges both fall out of it. This is the piece worth investing in early because
it shapes the whole component tree.

---

## 6. Recommended stack (optimized for cost)

**Responsive PWA-first**, mirroring Qurannotate's own choice.

- One codebase → iPad Safari, foldable Chrome, desktop; installable to home
  screen. Wrap later with **Capacitor** for App Store / Play Store, no rewrite.
- **Front end:** React/Next-style SPA/PWA; rich-text editor (e.g. TipTap/ProseMirror-class).
- **Storage:** local-first (IndexedDB) so it's fast and works offline; sync when online.
- **Backend/sync:** a BaaS (e.g. Supabase) keeps auth + Postgres + sync near
  zero cost at MVP; swap to custom later if needed.
- **Content:** Quran.com API v4 for MVP; self-host a vetted corpus by v1.

### Alternative considered
- **Flutter** — true native both platforms, excellent Pencil + foldable
  support, but more upfront effort/cost. Best if App-Store-native from day one
  is a hard requirement.
- **Native per platform (SwiftUI + Compose)** — best per device, ~2× work,
  least aligned with the cost goal. Not recommended.

---

## 7. Phased roadmap

### MVP — the core loop, local-first
- Mushaf reader (Arabic) + toggleable translation via API
- Verse selection, multi-color highlight
- Rich-text note attached to an ayah
- Local persistence; installable PWA
- Baseline pane layout engine (1 vs 2 panes)

### v1 — make it yours across devices
- Accounts + cloud sync
- Tags / collections + global search
- Full adaptive layout (iPad multitasking + foldable segments)
- Vetted self-hosted content set (licensing resolved)

### v2 — the differentiators
- Spaced-repetition "Revisit" review
- Apple Pencil ink annotation
- Sharing / study circles
- Export (PDF / Markdown)
- Flex-mode + hinge polish, Capacitor store wrap

---

## 8. Cost shape

- **Software:** built iteratively together — trading dollars for time.
- **Infra:** hosting/DB/auth can start on free tiers; scales cheaply.
- **One-offs:** domain (~$10–15/yr); Apple Developer ($99/yr) + Google Play
  ($25 once) **only if** going to app stores.
- **Content:** free, except possible translation-licensing spend/permissions.

---

## 9. Open decisions (need input)

1. **Build approach** — recommend PWA-first (vs. Flutter / native).
2. **MVP scope order** — recommend Read+translate → Highlight+notes →
   Tags/collections; spaced review deferred to v2.
3. **Translation/tafsir sources** — which editions matter to you (affects
   licensing work).
4. **Reference screenshots** — please supply from the live app to make §2 exact.

---

## 10. Next steps

- [ ] Collect reference screenshots into `docs/reference/`
- [ ] Confirm build approach + MVP scope
- [ ] Decide translation/tafsir source(s)
- [ ] Spike: pane/segment layout engine (proves iPad + foldable strategy)
- [ ] Spike: Quran.com API integration (fetch surah + translation)
- [ ] Draft MVP technical design doc
