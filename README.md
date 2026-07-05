# Quran Notes

A Qur'anic study workspace — read the mushaf, annotate verses, organize
reflections, and revisit them over time. Built as a responsive, installable
web app (PWA) optimized for iPad Pro and foldable phones.

> Status: **Research phase.** No product code yet. See
> [`docs/RESEARCH.md`](docs/RESEARCH.md) for the feature study, feasibility
> analysis, content/licensing notes, device-optimization plan, and the
> phased build roadmap.

## The idea in one line
Notion/Obsidian for the Qur'an: the mushaf is the canvas, and the core loop is
**read → highlight/annotate → organize → revisit**.

## Why a web-first PWA
The reference product (`app.qurannotate.com`) is itself a web app. One
responsive codebase reaches iPad Safari, foldable Chrome, and desktop; it
installs to the home screen; and it can later be wrapped (Capacitor) for the
App Store / Play Store without a rewrite. This is the cheapest path to a
polished cross-device product.

## Roadmap at a glance
- **MVP** — Read + translation/tafsir, verse highlighting, rich-text notes, local-first storage
- **v1** — Accounts, cloud sync, tags/collections, global search
- **v2** — Spaced "Revisit" review, Apple Pencil ink, sharing/study circles, export, foldable-segment polish

See [`docs/RESEARCH.md`](docs/RESEARCH.md) for detail.
