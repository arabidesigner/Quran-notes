/**
 * Quran.com API v4 client — spike.
 *
 * Docs: https://api-docs.quran.com/docs/category/quran.com-api
 * Base: https://api.quran.com/api/v4
 *
 * For the MVP we lean on this public API so we don't host a corpus yet.
 * By v1 we plan to self-host a vetted text + a cleanly-licensed translation
 * set (see docs/RESEARCH.md §4).
 */

const BASE = "https://api.quran.com/api/v4";

/** A cleanly-usable default translation. 20 = Saheeh International (English). */
export const DEFAULT_TRANSLATION_ID = 20;

export interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  translated_name: { name: string };
  verses_count: number;
}

export interface Verse {
  id: number;
  verse_key: string; // e.g. "2:255"
  text_uthmani: string;
  translation: string; // flattened from the first requested translation
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Quran.com API ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

/** List all 114 surahs. */
export async function fetchChapters(): Promise<Chapter[]> {
  const data = await getJSON<{ chapters: Chapter[] }>(`/chapters?language=en`);
  return data.chapters;
}

interface RawVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations?: { text: string }[];
}

/** Fetch every verse of a surah with Uthmani Arabic + one translation. */
export async function fetchChapterVerses(
  chapterId: number,
  translationId: number = DEFAULT_TRANSLATION_ID,
): Promise<Verse[]> {
  const params = new URLSearchParams({
    language: "en",
    words: "false",
    translations: String(translationId),
    fields: "text_uthmani",
    per_page: "300", // longest surah (Al-Baqarah) is 286 ayat
  });
  const data = await getJSON<{ verses: RawVerse[] }>(
    `/verses/by_chapter/${chapterId}?${params}`,
  );
  return data.verses.map((v) => ({
    id: v.id,
    verse_key: v.verse_key,
    text_uthmani: v.text_uthmani,
    // API returns translation HTML; strip footnote <sup> markers for the spike.
    translation: stripHtml(v.translations?.[0]?.text ?? ""),
  }));
}

function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}
