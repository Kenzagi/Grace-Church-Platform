"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

/**
 * MemberAvatar — shows the member's uploaded photo or a fallback
 * with their initials on a neutral background.
 *
 * Sizes: sm (32px), md (40px), lg (56px), xl (96px)
 */
const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-24 h-24 text-2xl",
};

const IMG_SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
};

export function MemberAvatar({
  firstName,
  lastName,
  photoUrl,
  size = "md",
  className,
}: {
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [imgError, setImgError] = React.useState(false);
  const showImg = photoUrl && !imgError;

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center font-semibold text-primary-foreground bg-primary shrink-0",
        SIZES[size],
        className
      )}
    >
      {showImg ? (
        <img
          src={photoUrl!}
          alt={`${firstName || ""} ${lastName || ""}`.trim() || "Member"}
          width={IMG_SIZES[size]}
          height={IMG_SIZES[size]}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden>{initials(firstName, lastName)}</span>
      )}
    </div>
  );
}
