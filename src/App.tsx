import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TRANSLATION_ID,
  fetchChapterVerses,
  fetchChapters,
  type Chapter,
  type Verse,
} from "./api/quran";
import { useAdaptiveLayout } from "./layout/useAdaptiveLayout";
import { PaneLayout } from "./layout/PaneLayout";
import {
  loadAnnotations,
  saveAnnotations,
  type Annotation,
  type HighlightColor,
} from "./reader/annotations";
import "./App.css";

const COLORS: Exclude<HighlightColor, null>[] = ["amber", "green", "blue", "rose"];

export default function App() {
  const layout = useAdaptiveLayout();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterId, setChapterId] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState(loadAnnotations);

  // Load surah list once.
  useEffect(() => {
    fetchChapters().then(setChapters).catch((e) => setError(String(e)));
  }, []);

  // Load verses whenever the surah changes.
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    fetchChapterVerses(chapterId, DEFAULT_TRANSLATION_ID)
      .then((v) => {
        if (!live) return;
        setVerses(v);
        setSelected(null);
      })
      .catch((e) => live && setError(String(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [chapterId]);

  useEffect(() => saveAnnotations(annotations), [annotations]);

  const current = chapters.find((c) => c.id === chapterId);

  function updateAnnotation(key: string, patch: Partial<Annotation>) {
    setAnnotations((prev) => {
      const existing = prev[key] ?? { color: null, note: "" };
      return { ...prev, [key]: { ...existing, ...patch } };
    });
  }

  const rail = (
    <nav className="rail" aria-label="Surahs">
      <h2 className="rail__title">Surahs</h2>
      <ul>
        {chapters.map((c) => (
          <li key={c.id}>
            <button
              className={c.id === chapterId ? "rail__item is-active" : "rail__item"}
              onClick={() => setChapterId(c.id)}
            >
              <span className="rail__num">{c.id}</span>
              <span className="rail__name">{c.name_simple}</span>
              <span className="rail__ar">{c.name_arabic}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  const main = (
    <section className="mushaf" aria-label="Reading">
      <header className="mushaf__head">
        {layout.mode !== "triple" && (
          <select
            className="mushaf__picker"
            value={chapterId}
            onChange={(e) => setChapterId(Number(e.target.value))}
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}. {c.name_simple}
              </option>
            ))}
          </select>
        )}
        {current && (
          <div className="mushaf__titles">
            <span className="mushaf__ar">{current.name_arabic}</span>
            <span className="mushaf__en">
              {current.name_simple} · {current.translated_name.name}
            </span>
          </div>
        )}
      </header>

      {loading && <p className="hint">Loading surah…</p>}
      {error && <p className="hint hint--err">{error}</p>}

      <ol className="verses">
        {verses.map((v) => {
          const ann = annotations[v.verse_key];
          const cls = [
            "verse",
            selected === v.verse_key ? "is-selected" : "",
            ann?.color ? `hl-${ann.color}` : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <li
              key={v.verse_key}
              className={cls}
              onClick={() => setSelected(v.verse_key)}
            >
              <span className="verse__key">{v.verse_key}</span>
              <p className="verse__ar" dir="rtl" lang="ar">
                {v.text_uthmani}
              </p>
              <p className="verse__tr">{v.translation}</p>
              {ann?.note && <p className="verse__notemark">✎ {ann.note}</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );

  const aside = (
    <aside className="notes" aria-label="Notes">
      {selected ? (
        <NotePanel
          key={selected}
          verseKey={selected}
          annotation={annotations[selected] ?? { color: null, note: "" }}
          onColor={(color) => updateAnnotation(selected, { color })}
          onNote={(note) => updateAnnotation(selected, { note })}
        />
      ) : (
        <div className="notes__empty">
          <p>Select a verse to highlight it and attach a note.</p>
        </div>
      )}
    </aside>
  );

  return (
    <div className="app">
      <TopBar layout={layout} surah={current?.name_simple} />
      <PaneLayout layout={layout} rail={rail} main={main} aside={aside} />
    </div>
  );
}

function NotePanel({
  verseKey,
  annotation,
  onColor,
  onNote,
}: {
  verseKey: string;
  annotation: Annotation;
  onColor: (c: HighlightColor) => void;
  onNote: (n: string) => void;
}) {
  return (
    <div className="notepanel">
      <h2 className="notepanel__key">{verseKey}</h2>
      <div className="swatches" role="group" aria-label="Highlight color">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`swatch swatch--${c} ${annotation.color === c ? "is-on" : ""}`}
            aria-label={c}
            onClick={() => onColor(annotation.color === c ? null : c)}
          />
        ))}
      </div>
      <textarea
        className="notepanel__text"
        placeholder="Your reflection on this ayah…"
        value={annotation.note}
        onChange={(e) => onNote(e.target.value)}
      />
    </div>
  );
}

function TopBar({
  layout,
  surah,
}: {
  layout: ReturnType<typeof useAdaptiveLayout>;
  surah?: string;
}) {
  // A small live readout so the adaptive engine is visible while testing on
  // an iPad (drag Split View) or a foldable (fold/unfold).
  const badge = useMemo(() => {
    const bits = [`${layout.paneCount}-pane`, `${layout.width}px`];
    if (layout.foldedAcross) bits.push("hinge");
    return bits.join(" · ");
  }, [layout]);

  return (
    <header className="topbar">
      <strong className="topbar__brand">Quran Notes</strong>
      {surah && <span className="topbar__ctx">{surah}</span>}
      <span className="topbar__badge" title="Adaptive layout state">
        {badge}
      </span>
    </header>
  );
}
