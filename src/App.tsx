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
import { MushafCanvas } from "./mushaf/MushafCanvas";
import { TOTAL_PAGES, pageForSurah } from "./mushaf/pages";
import "./App.css";

// One tldraw document for this spike; v1 gives each mushaf its own id.
const DOC_ID = "default";

export default function App() {
  const layout = useAdaptiveLayout();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [surahId, setSurahId] = useState(1);
  const [page, setPage] = useState(1);

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChapters().then(setChapters).catch((e) => setError(String(e)));
  }, []);

  // Translation reference panel follows the selected surah.
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    fetchChapterVerses(surahId, DEFAULT_TRANSLATION_ID)
      .then((v) => live && setVerses(v))
      .catch((e) => live && setError(String(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [surahId]);

  function jumpToSurah(id: number) {
    setSurahId(id);
    setPage(pageForSurah(id));
  }

  const current = chapters.find((c) => c.id === surahId);

  const rail = (
    <nav className="rail" aria-label="Surahs">
      <h2 className="rail__title">Surahs</h2>
      <ul>
        {chapters.map((c) => (
          <li key={c.id}>
            <button
              className={c.id === surahId ? "rail__item is-active" : "rail__item"}
              onClick={() => jumpToSurah(c.id)}
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

  const main = <MushafCanvas page={page} docId={DOC_ID} />;

  const aside = (
    <aside className="refpanel" aria-label="Translation">
      <header className="refpanel__head">
        <span className="refpanel__surah">
          {current ? `${current.name_simple} · ${current.name_arabic}` : "…"}
        </span>
        <span className="refpanel__src">Saheeh International</span>
      </header>
      {loading && <p className="hint">Loading translation…</p>}
      {error && (
        <p className="hint hint--err">
          Couldn’t load translation (offline / API blocked). Drawing still works.
        </p>
      )}
      <ol className="reflist">
        {verses.map((v) => (
          <li key={v.verse_key} className="refitem">
            <span className="refitem__key">{v.verse_key}</span>
            <p className="refitem__ar" dir="rtl" lang="ar">
              {v.text_uthmani}
            </p>
            <p className="refitem__tr">{v.translation}</p>
          </li>
        ))}
      </ol>
    </aside>
  );

  return (
    <div className="app">
      <TopBar
        layout={layout}
        surah={current}
        chapters={chapters}
        page={page}
        onSurah={jumpToSurah}
        onPage={(p) => setPage(Math.min(TOTAL_PAGES, Math.max(1, p)))}
      />
      <PaneLayout layout={layout} rail={rail} main={main} aside={aside} />
    </div>
  );
}

function TopBar({
  layout,
  surah,
  chapters,
  page,
  onSurah,
  onPage,
}: {
  layout: ReturnType<typeof useAdaptiveLayout>;
  surah?: Chapter;
  chapters: Chapter[];
  page: number;
  onSurah: (id: number) => void;
  onPage: (p: number) => void;
}) {
  // Live readout so the adaptive engine is visible while testing on an iPad
  // (drag Split View) or a foldable (fold/unfold).
  const badge = useMemo(() => {
    const bits = [`${layout.paneCount}-pane`, `${layout.width}px`];
    if (layout.foldedAcross) bits.push("hinge");
    return bits.join(" · ");
  }, [layout]);

  return (
    <header className="topbar">
      <strong className="topbar__brand">Quran Notes</strong>
      <select
        className="topbar__picker"
        value={surah?.id ?? 1}
        onChange={(e) => onSurah(Number(e.target.value))}
      >
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.id}. {c.name_simple}
          </option>
        ))}
      </select>

      <div className="pager">
        <button className="pager__btn" onClick={() => onPage(page - 1)} aria-label="Previous page">
          ‹
        </button>
        <span className="pager__label">Page {page}</span>
        <button className="pager__btn" onClick={() => onPage(page + 1)} aria-label="Next page">
          ›
        </button>
      </div>

      <span className="topbar__badge" title="Adaptive layout state">
        {badge}
      </span>
    </header>
  );
}
