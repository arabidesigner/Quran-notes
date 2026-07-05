import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Tldraw, type TLComponents } from "tldraw";
import "tldraw/tldraw.css";
import { pageImageUrl } from "./pages";
import "./MushafCanvas.css";

/**
 * The annotation surface — a tldraw canvas with a mushaf page rendered behind
 * the drawing layer. This mirrors the confirmed architecture of the reference
 * app (RESEARCH §1): pen / highlighter / text / shapes on top of a mushaf page.
 *
 * - Pen + pressure (Apple Pencil), undo, pan/zoom: all from tldraw, free tier.
 * - `persistenceKey` gives us local-first storage (IndexedDB) out of the box —
 *   this is our MVP storage story; cloud sync layers on top at v1.
 * - The page lives in `OnTheCanvas` (canvas coordinate space) so it pans and
 *   zooms with your annotations, exactly like marking up paper.
 */

// Standard mushaf page proportions (portrait). Canvas units.
const PAGE_W = 820;
const PAGE_H = 1180;

const PageContext = createContext<number>(1);

function MushafPageLayer() {
  const page = useContext(PageContext);
  const src = pageImageUrl(page);
  const [failed, setFailed] = useState(false);

  // Reset the error state whenever the page (and thus the image URL) changes.
  useEffect(() => setFailed(false), [src]);

  const showImage = src && !failed;
  return (
    <div
      className="mushaf-page"
      style={{ width: PAGE_W, height: PAGE_H, transform: "translate(0px, 0px)" }}
    >
      {showImage ? (
        <img
          className="mushaf-page__img"
          src={src}
          alt={`Mushaf page ${page}`}
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="mushaf-page__placeholder">
          <span className="mushaf-page__num">Page {page}</span>
          <p className="mushaf-page__hint">
            {failed
              ? "Mushaf page image couldn’t load (offline or source blocked)."
              : "Mushaf page image loads here."}
          </p>
          <span className="mushaf-page__draw">Draw anywhere with the pen ✎</span>
        </div>
      )}
    </div>
  );
}

// Stable component slots — defining these once avoids remounting the editor.
const components: TLComponents = {
  OnTheCanvas: MushafPageLayer,
};

export function MushafCanvas({
  page,
  docId,
}: {
  page: number;
  docId: string;
}) {
  // Re-key persistence per mushaf document (one tldraw store per mushaf).
  const persistenceKey = useMemo(() => `mushaf:${docId}`, [docId]);
  return (
    <PageContext.Provider value={page}>
      <div className="mushaf-canvas">
        <Tldraw persistenceKey={persistenceKey} components={components} />
      </div>
    </PageContext.Provider>
  );
}
