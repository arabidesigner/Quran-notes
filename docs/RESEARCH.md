# Research & Scoping — Qur'anic Study Workspace

**Phase:** Research
**Date:** 2026-07-05
**Reference product:** `app.qurannotate.com` (Qurannotate — "Reflect. Revisit. Rise.")
**Goal:** Replicate the workflow of a Qur'anic annotation workspace as our own
web-first product, optimized for iPad Pro and foldable phones, at low cost.

---

## 1. Access note (confirmed from a live screenshot)

Both `app.qurannotate.com` and the marketing site `qurannotate.com` sit behind
Cloudflare bot protection + a login wall, so they could not be crawled. However,
a **screenshot of the live app** (saved as `docs/reference/mushaf-page30.png`)
confirmed the real architecture — which differs materially from the first
reconstruction. Key confirmed facts:

- **It is a web app** running an **infinite-canvas** interface. The bottom-right
  badge reads **"MADE WITH TLDRAW"** — the annotation surface is built on the
  [tldraw](https://tldraw.dev) SDK, on its free/hobby license (the watermark is
  mandatory on that tier). This is the single most important finding: the exact
  engine behind the product is available to us.
- **Document model:** each mushaf is a document with a UUID
  (`/mushaf/4d43a1ec-820a…`), synced to a backend (a red **"Failed 1"** badge
  shows sync status).
- **Page-based mushaf**, not a scrolling verse list: navigation is by physical
  mushaf page (`< Page 30 ✎ >`, Madani 604-page layout), with a surah jump
  (`Al-Baqarah ▾`) and search.
- **Pen-first annotation:** the bottom toolbar is the tldraw toolset — select,
  hand/pan, **pen (active)**, text, eraser, highlighter, add-frame (+), an **AI
  (sparkle)** action, and overflow. You draw directly on the mushaf page.
- **Reading aids:** audio playback (speaker), a book/mushaf view toggle, bookmark
  + share on a floating selection toolbar, word-level selection (a selected word
  shows a highlight box), and a haptic/scroll rail on the right edge.

So the product is literally a **"mark up the mushaf like paper"** canvas, not the
verse-list + side-notes model first assumed. §2 is now the confirmed feature map;
§6 is updated accordingly. More screenshots (library/home, tag/organize view,
the AI action, sharing, settings) would still sharpen the edges — drop them in
`docs/reference/`.

---

## 2. Confirmed feature map (from live screenshot + category)

### Canvas & reading surface
- Infinite tldraw canvas with a **mushaf page** rendered as content
- Page-by-page navigation (Madani 604-page layout) + surah jump + search
- Word-level selection on the page
- Per-ayah recitation audio playback
- Book/mushaf view toggle; right-edge scroll/haptic rail

### Annotation (the core value) — pen-first on canvas
- Freehand **pen** (Apple Pencil pressure) drawn straight onto the page
- **Highlighter**, **text** boxes, **eraser**
- Shapes / frames (the `+` tool) for boxing passages and grouping notes
- An **AI action** (sparkle) — likely summarize/explain/generate on a selection
- Bookmark + share per selection

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

**Even easier than first thought, because the hard part is a reusable SDK.**
The annotation canvas — the genuinely tricky engineering (infinite pan/zoom,
pressure strokes, shapes, undo, multiplayer-ready sync) — is **tldraw**, which
we can adopt directly. That collapses the biggest build risk. What remains is:

1. Rendering mushaf **pages** onto the canvas (image or SVG per page).
2. A document + sync layer (create/open/save a mushaf per user).
3. Reading aids (translation, audio, search, page/surah navigation).
4. Adaptive chrome for iPad + foldables around the canvas.

None of that is novel; it's integration work on top of a proven engine.

**The two real gates are licensing** — of the *content* (§4) and now also of the
*canvas SDK* (§4a).

### IP position
We replicate *features and workflow* — not copyrightable ("draw on a mushaf
page" is an idea, not protected expression) — using our **own** code, branding,
name, and design. We do **not** copy Qurannotate's assets, code, or name. Using
tldraw is legitimate: it's a licensed SDK either party may build on.

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

### 4a. Canvas SDK licensing (new — the tldraw decision)

The reference product runs **tldraw** on its **free/hobby license**, which is
why the *"Made with tldraw"* watermark is visible. Our options:

| Path | Cost | Trade-off |
|---|---|---|
| **tldraw hobby (free)** | $0 | Fastest to the exact experience; keeps the "Made with tldraw" watermark (as Qurannotate does today). Fine for MVP + validation. |
| **tldraw commercial** | ~$6,000/yr (small-team tier) | Removes watermark, clean commercial rights. Only needed when going properly public/monetized. |
| **Open-source engine** | $0 | e.g. Excalidraw (MIT) or a lean custom pen layer (Konva/Fabric/SVG). No watermark, no fee, but more build effort and less polish than tldraw. |

**Recommendation:** build the MVP on **tldraw hobby (free, watermarked)** to
match the target experience at zero cost. Revisit the $6k commercial license or
an open-source swap only if/when the product goes public and the watermark
matters. This keeps early cost at ~$0 while proving the concept.

---

## 5. Device optimization — iPad Pro + foldables

The requirement is genuinely **adaptive** layout, not just responsive.
Architect around a **pane-based layout engine** (1 / 2 / 3 panes chosen from
available width + screen segments). Both device families reward the same
engine.

The mushaf **canvas** is the primary pane on every device; the adaptive chrome
(rail, translation/audio panels, tool docks) reflows around it.

### iPad Pro — the flagship device for this app
- **Apple Pencil:** tldraw already supports pressure/tilt strokes natively — a
  pen-first mushaf is the single strongest reason iPad is the hero device.
- **Multitasking:** Stage Manager / Split View / Slide Over → the window can be
  any width. The chrome must reflow fluidly (full toolbar → collapsed dock →
  overflow menu) while the canvas keeps the full remaining area.
- **Study-desk layout:** canvas + a dockable translation/tafsir panel.

### Foldables (Galaxy Fold, Pixel Fold, etc.)
- **Hinge is a real API:** Viewport Segments API — `env(viewport-segment-*)`
  and the `horizontal-viewport-segments` media feature. Put the mushaf canvas on
  one segment and translation/tools on the other; keep content out of the crease.
- **Continuity:** fold/unfold resizes the window live — canvas viewport and tool
  state must survive the transition mid-session.
- **Flex mode (half-open):** canvas top, tool dock / translation bottom.

### Shared architecture takeaway
Build one **segment-aware chrome layer** around the canvas; iPad multitasking
and foldable hinges both fall out of it. (The spike in `src/layout/` implements
exactly this engine.)

---

## 6. Recommended stack (optimized for cost)

**Responsive PWA-first on React**, mirroring Qurannotate's own choice (React is
also tldraw's native environment).

- One codebase → iPad Safari, foldable Chrome, desktop; installable to home
  screen. Wrap later with **Capacitor** for App Store / Play Store, no rewrite.
- **Canvas:** **tldraw** (hobby license for MVP) as the annotation surface —
  pen, highlighter, text, shapes, undo, Pencil support out of the box.
- **Mushaf rendering:** place each page onto the canvas as a custom shape. Page
  images/SVG from a public mushaf source (e.g. QUL / King Fahd Complex Madani
  604-page set); word-boundary data enables word selection + audio sync.
- **Storage:** local-first (IndexedDB) so it's fast and works offline; tldraw
  document snapshot per mushaf, synced when online.
- **Backend/sync:** a BaaS (e.g. Supabase) keeps auth + Postgres + document sync
  near zero cost at MVP; swap to custom later if needed.
- **Reading data:** Quran.com API v4 for translation/tafsir/audio/search at MVP;
  self-host a vetted corpus by v1.

### Alternative considered
- **Flutter** — true native both platforms, excellent Pencil + foldable
  support, but more upfront effort/cost. Best if App-Store-native from day one
  is a hard requirement.
- **Native per platform (SwiftUI + Compose)** — best per device, ~2× work,
  least aligned with the cost goal. Not recommended.

---

## 7. Phased roadmap (revised for the canvas architecture)

### MVP — mark up the mushaf, local-first
- tldraw canvas with a mushaf **page** rendered as content
- Page + surah navigation; pen / highlighter / text / eraser tools
- Save the tldraw document locally (IndexedDB); installable PWA
- Segment-aware chrome (the `src/layout/` spike) so it adapts iPad ↔ foldable

### v1 — make it yours across devices
- Accounts + cloud sync (document snapshot per mushaf)
- Multiple mushaf documents (a library/home screen)
- Translation/tafsir + audio panel; search; word-level selection
- Vetted self-hosted mushaf page set + translation (licensing resolved)

### v2 — the differentiators
- Spaced-repetition "Revisit" review over annotated pages/verses
- AI action (summarize/explain a selection)
- Sharing / study circles; export (PDF / image)
- Flex-mode + hinge polish; Capacitor store wrap; tldraw commercial license
  decision (drop the watermark)

---

## 8. Cost shape

- **Software:** built iteratively together — trading dollars for time.
- **Canvas SDK:** $0 on tldraw hobby (watermarked) for MVP; ~$6k/yr only if we
  later want the watermark gone / full commercial rights (§4a).
- **Infra:** hosting/DB/auth can start on free tiers; scales cheaply.
- **One-offs:** domain (~$10–15/yr); Apple Developer ($99/yr) + Google Play
  ($25 once) **only if** going to app stores.
- **Content:** free, except possible translation-licensing spend/permissions.

Bottom line: an MVP that closely matches the target experience costs
**~$0** to build with tldraw hobby + free content APIs + free infra tiers.

---

## 9. Open decisions (need input)

1. **Canvas engine** — recommend tldraw hobby (free, watermarked) for MVP; defer
   the $6k commercial vs. open-source-swap decision to v2.
2. **Build approach** — recommend React PWA-first (vs. Flutter / native).
3. **MVP scope** — recommend: canvas + mushaf page + pen/highlighter/text +
   local save, then translation panel. Spaced review deferred to v2.
4. **Translation/tafsir sources** — which editions matter to you (affects
   licensing work).
5. **More screenshots** — library/home, organize/tag view, AI action, sharing,
   settings — to finish mapping the edges.

---

## 10. Next steps

- [x] Capture a reference screenshot (`docs/reference/mushaf-page30.png`)
- [x] Spike: segment-aware layout engine (`src/layout/`)
- [x] Spike: Quran.com API client (`src/api/quran.ts`)
- [ ] Confirm canvas engine + MVP scope
- [ ] Spike: tldraw canvas with a single mushaf page rendered on it
- [ ] Decide translation/tafsir source(s)
- [ ] Draft MVP technical design doc
- [ ] Draft MVP technical design doc
