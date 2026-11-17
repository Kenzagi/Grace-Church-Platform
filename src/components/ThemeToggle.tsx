"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/Icon";
import { Moon, Sun } from "@/components/icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 inline-flex items-center justify-center">
        <div className="w-4 h-4" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 inline-flex items-center justify-center rounded-sm hover:bg-surface-alt text-muted-foreground hover:text-primary transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon as={isDark ? Sun : Moon} boundingBox={false} />
    </button>
  );
}
