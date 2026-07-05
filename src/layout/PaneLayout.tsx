import type { ReactNode } from "react";
import type { AdaptiveLayout } from "./useAdaptiveLayout";
import "./PaneLayout.css";

/**
 * Renders 1–3 panes according to the adaptive layout. On a foldable opened
 * flat, the CSS (PaneLayout.css) pins the two panes either side of the hinge
 * using `env(viewport-segment-*)`; otherwise panes share the width fluidly.
 */
export function PaneLayout({
  layout,
  rail,
  main,
  aside,
}: {
  layout: AdaptiveLayout;
  rail: ReactNode;
  main: ReactNode;
  aside: ReactNode;
}) {
  const { mode, foldedAcross } = layout;

  return (
    <div
      className="panes"
      data-mode={mode}
      data-fold={foldedAcross ? "across" : "none"}
    >
      {mode === "triple" && <div className="pane pane--rail">{rail}</div>}
      <div className="pane pane--main">{main}</div>
      {mode !== "single" && <div className="pane pane--aside">{aside}</div>}
    </div>
  );
}
