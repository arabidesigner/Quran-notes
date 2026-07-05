import { useEffect, useState } from "react";

/**
 * Adaptive layout engine — spike.
 *
 * One hook drives layout across every form factor we care about:
 *   - phones / narrow multitasking windows  -> 1 pane
 *   - tablets / medium windows              -> 2 panes (mushaf | notes)
 *   - iPad Pro landscape / desktop          -> 3 panes (rail | mushaf | notes)
 *   - foldables opened flat                 -> 2 panes SPLIT AT THE HINGE
 *
 * The foldable hinge is a real browser feature, not just "a wide screen":
 * the Viewport Segments API exposes it via the `horizontal-viewport-segments`
 * media feature (JS side) and `env(viewport-segment-*)` (CSS side). We detect
 * it here and let CSS pin panes to physical segments in PaneLayout.css.
 *
 * See docs/RESEARCH.md §5.
 */

export type LayoutMode = "single" | "dual" | "triple";

export interface AdaptiveLayout {
  width: number;
  mode: LayoutMode;
  paneCount: 1 | 2 | 3;
  /** True when the window spans two horizontal viewport segments (a fold). */
  foldedAcross: boolean;
}

// Breakpoints (px). Kept deliberately few — the point is fluid reflow, not a
// pile of magic numbers.
const DUAL_MIN = 700;
const TRIPLE_MIN = 1100;

function readFoldAcross(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  // 2 (or more) horizontal segments means the window straddles the hinge.
  return window.matchMedia("(horizontal-viewport-segments: 2)").matches;
}

function computeMode(width: number, foldedAcross: boolean): LayoutMode {
  // A flat-open foldable is the canonical two-pane device: split at the crease.
  if (foldedAcross) return "dual";
  if (width >= TRIPLE_MIN) return "triple";
  if (width >= DUAL_MIN) return "dual";
  return "single";
}

const paneCountFor: Record<LayoutMode, 1 | 2 | 3> = {
  single: 1,
  dual: 2,
  triple: 3,
};

function snapshot(): AdaptiveLayout {
  const width = typeof window === "undefined" ? 1024 : window.innerWidth;
  const foldedAcross = readFoldAcross();
  const mode = computeMode(width, foldedAcross);
  return { width, mode, paneCount: paneCountFor[mode], foldedAcross };
}

export function useAdaptiveLayout(): AdaptiveLayout {
  const [layout, setLayout] = useState<AdaptiveLayout>(snapshot);

  useEffect(() => {
    // resize covers iPad Stage Manager / Split View drags AND a foldable
    // continuity fold/unfold (the window resizes live in both cases).
    const update = () => setLayout(snapshot());
    window.addEventListener("resize", update);

    // Also react to the segment media query flipping without a size change.
    const mq = window.matchMedia("(horizontal-viewport-segments: 2)");
    mq.addEventListener?.("change", update);

    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener?.("change", update);
    };
  }, []);

  return layout;
}
