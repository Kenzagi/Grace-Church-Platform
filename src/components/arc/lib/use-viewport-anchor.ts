"use client";

/**
 * Viewport-aware placement for the arc pickers' anchored popovers.
 *
 * The vendored date/time popovers are plain `position: absolute` surfaces that
 * always open below (and left-aligned to) their trigger. Near the viewport's
 * bottom edge they run off-screen (e.g. the Ends field of the Add-event
 * dialog), and near the right edge a 320px calendar can overflow sideways.
 *
 * This hook measures trigger + panel on open (and while open, on scroll and
 * resize) and returns the placement that keeps the panel inside the viewport:
 *   - side:  keep "bottom" when it fits; flip "top" when above has room;
 *            otherwise the roomier side, with the panel capped via maxHeight.
 *   - align: keep "left"; switch to "right" when the panel would cross the
 *            right edge.
 *
 * The measured height is frozen for the open session so the decision cannot
 * oscillate once a maxHeight cap changes the panel's rendered height.
 */
import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

const GUTTER = 12;

export interface AnchorPlacement {
  side: "bottom" | "top";
  align: "left" | "right";
  /** Set only when neither side fully fits — clamp the panel to this height. */
  maxHeight: number | null;
}

export function useViewportAnchor(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  gap: number,
): AnchorPlacement {
  const [placement, setPlacement] = useState<AnchorPlacement>({ side: "bottom", align: "left", maxHeight: null });
  const naturalHeight = useRef(0);

  useLayoutEffect(() => {
    if (!open) {
      naturalHeight.current = 0;
      return;
    }
    const measure = () => {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (!trigger || !popover) return;
      if (!naturalHeight.current) naturalHeight.current = popover.offsetHeight || 0;
      const height = naturalHeight.current;
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const fits = (space: number) => height + gap <= space - GUTTER;
      const side = fits(spaceBelow)
        ? "bottom"
        : fits(spaceAbove)
          ? "top"
          : spaceAbove > spaceBelow
            ? "top"
            : "bottom";
      const chosenSpace = side === "bottom" ? spaceBelow : spaceAbove;
      const width = popover.offsetWidth || 0;
      const align = width && rect.left + width > window.innerWidth - GUTTER ? "right" : "left";
      const next: AnchorPlacement = {
        side,
        align,
        maxHeight: fits(chosenSpace) ? null : Math.max(GUTTER, chosenSpace - gap - GUTTER),
      };
      setPlacement((current) =>
        current.side === next.side && current.align === next.align && current.maxHeight === next.maxHeight
          ? current
          : next,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [gap, open, popoverRef, triggerRef]);

  return placement;
}

/**
 * Inline styles that move an anchored popover to its measured placement.
 * Pass `align: false` for panels pinned to both edges of the trigger (the
 * time menu spans left:0/right:0 and must not be narrowed).
 */
export function viewportAnchorStyle(
  { side, align, maxHeight }: AnchorPlacement,
  opts: { gap: number; origin: string; flippedOrigin: string; align?: boolean },
): CSSProperties {
  const style: CSSProperties = {};
  if (side === "top") {
    style.top = "auto";
    style.bottom = `calc(100% + ${opts.gap}px)`;
    style.transformOrigin = opts.flippedOrigin;
  }
  if ((opts.align ?? true) && align === "right") {
    style.left = "auto";
    style.right = 0;
  }
  if (maxHeight) {
    style.maxHeight = maxHeight;
    style.overflowY = "auto";
  }
  return style;
}
