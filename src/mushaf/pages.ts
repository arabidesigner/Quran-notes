/**
 * Madani 604-page mushaf — the starting page of each of the 114 surahs.
 * Public factual reference data (page indices, not scripture text). Used to
 * jump the canvas to a surah's first page. Index 0 = surah 1 (Al-Fatiha).
 */
export const SURAH_START_PAGE: number[] = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282,
  293, 305, 312, 322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415,
  418, 428, 434, 440, 446, 453, 458, 467, 477, 483, 489, 496, 499, 502, 507,
  511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549, 551, 553,
  554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580,
  582, 583, 585, 586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 595,
  596, 596, 597, 597, 598, 598, 599, 600, 601, 601, 602, 602, 602, 603, 603,
  603, 604, 604, 604, 604, 604, 604, 604, 604,
];

export const TOTAL_PAGES = 604;

/** Page a surah opens on (1-based surah id). */
export function pageForSurah(surahId: number): number {
  return SURAH_START_PAGE[surahId - 1] ?? 1;
}

/**
 * Build a mushaf page-image URL. Kept configurable via env so the app works
 * with any page-image source; by v1 we self-host a vetted set (see RESEARCH §6).
 * Set VITE_MUSHAF_PAGE_URL to a template containing "{page}" (zero-padded to 3).
 * When unset, the canvas shows a placeholder frame (so it runs offline).
 */
export function pageImageUrl(page: number): string | null {
  const tmpl = import.meta.env.VITE_MUSHAF_PAGE_URL as string | undefined;
  if (!tmpl) return null;
  const padded = String(page).padStart(3, "0");
  return tmpl.replace("{page}", padded);
}
