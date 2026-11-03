"use client";

/**
 * <Icon /> — Design-system icon wrapper (PRD §4.1)
 *
 * Establishes a single source of truth for lucide-react iconography:
 *   - Default size: 18px
 *   - Default stroke width: 1.5px
 *   - Bounding box: 24px (maintains alignment in rows/grids)
 *
 * Call sites do not need to repeat size/stroke props. Override only when
 * a genuinely different scale is required (and document why).
 */
import * as React from "react";
import {
  AppIconProps,
  AppIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

export interface IconProps extends Omit<AppIconProps, "ref"> {
  as: AppIcon;
  /** Container reserves 24px so icons align in rows regardless of glyph size. */
  boundingBox?: boolean;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ as: LucideComponent, boundingBox = true, className, size = 18, strokeWidth = 1.5, ...rest }, ref) => {
    const svg = (
      <LucideComponent
        ref={ref}
        size={size}
        strokeWidth={strokeWidth}
        className={cn(boundingBox ? "" : className)}
        aria-hidden={rest["aria-label"] ? undefined : true}
        {...rest}
      />
    );
    if (!boundingBox) return svg;
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center shrink-0",
          "w-6 h-6",
          className
        )}
      >
        {svg}
      </span>
    );
  }
);
Icon.displayName = "Icon";
