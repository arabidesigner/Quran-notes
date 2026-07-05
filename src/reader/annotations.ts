/**
 * Local-first annotation store — spike stub.
 *
 * MVP stores everything in the browser (here: localStorage; IndexedDB by the
 * time notes get large). v1 adds accounts + cloud sync on top of the same
 * shape. Keyed by verse_key ("2:255") so annotations are portable across
 * translations and sessions.
 */

export type HighlightColor = "amber" | "green" | "blue" | "rose" | null;

export interface Annotation {
  color: HighlightColor;
  note: string;
}

const KEY = "quran-notes:annotations:v1";

type Store = Record<string, Annotation>;

export function loadAnnotations(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

export function saveAnnotations(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}
