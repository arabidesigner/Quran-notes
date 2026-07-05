# Quran Notes

A Qur'anic study workspace — read the mushaf, annotate verses, organize
reflections, and revisit them over time. Built as a responsive, installable
web app (PWA) optimized for iPad Pro and foldable phones.

> Status: **Research phase.** No product code yet. See
> [`docs/RESEARCH.md`](docs/RESEARCH.md) for the feature study, feasibility
> analysis, content/licensing notes, device-optimization plan, and the
> phased build roadmap.

## The idea in one line
Mark up the mushaf like paper: an infinite canvas where you draw, highlight, and
annotate Qur'an pages with a pen — then organize and revisit your reflections.

## Architecture (confirmed from the live app)
The reference product (`app.qurannotate.com`) is a **web app** whose annotation
surface is built on **[tldraw](https://tldraw.dev)** (its "Made with tldraw"
watermark is visible — i.e. the free hobby tier). We can adopt the same engine.
One responsive React/PWA codebase reaches iPad Safari, foldable Chrome, and
desktop; installs to the home screen; and wraps (Capacitor) for the App Store /
Play Store later without a rewrite. See [`docs/RESEARCH.md`](docs/RESEARCH.md).

## Run it locally
```bash
npm install
npm run dev        # http://localhost:5173
```
Real mushaf pages, the surah list, and translations load from public sources at
runtime, so a local dev browser shows the full experience (a build sandbox with
restricted egress will show placeholders — that's expected).

### Configuration
- `VITE_MUSHAF_PAGE_URL` — page-image source template containing `{page}`
  (3-digit). Defaults to the open-source Madani page images. Set to `off` to
  force the offline placeholder frame.

## Deploy (GitHub Pages)
A workflow at `.github/workflows/deploy.yml` builds and publishes on every push.
One-time setup: **repo Settings → Pages → Source: "GitHub Actions."** After that
the app is live at `https://<owner>.github.io/<repo>/`.

## Roadmap at a glance
- **MVP** — tldraw canvas + a mushaf page, pen/highlighter/text tools, local-first save, adaptive chrome
- **v1** — Accounts, cloud sync, mushaf library, translation/audio panel, search
- **v2** — Spaced "Revisit" review, AI action, sharing/study circles, export, hinge polish, watermark decision

See [`docs/RESEARCH.md`](docs/RESEARCH.md) for detail.
