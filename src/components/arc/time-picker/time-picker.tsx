"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { ChevronDown, Clock3 } from "@/components/icons";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motionTokens } from "../lib/motion-tokens";
import { useViewportAnchor, viewportAnchorStyle } from "../lib/use-viewport-anchor";
import styles from "./time-picker.module.css";

export interface TimePickerProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  description?: string;
  placeholder?: string;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  format?: "12h" | "24h";
  disabled?: boolean;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
const toMinutes = (value: string) => { const [h = NaN, m = NaN] = value.split(":").map(Number); return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : 0; };
const enter = motionTokens.ease.enter;
const standard = motionTokens.ease.standard;
/** The shown time rolls like a clock face: a later time rises from below, an earlier one drops from above. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.35}em`, filter: `blur(${motionTokens.blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: enter } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.3}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }),
};
/** Reduced motion keeps a short crossfade; the resting state matches valueRoll so server and client markup agree. */
const valueFade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, exit: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };

/** Two short scrolling panes (hours | minutes [, AM/PM]) replace one long list. */
type Pane = "hour" | "minute" | "period";

export function TimePicker({ label, value, defaultValue = "09:00", onChange, description, placeholder = "Select a time", minuteStep = 15, format = "12h", disabled = false, className }: TimePickerProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<Record<Pane, HTMLDivElement | null>>({ hour: null, minute: null, period: null });
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<{ pane: Pane; value: string }>({ pane: "hour", value: "" });
  const selected = value ?? internal;
  const reduce = useReducedMotion();
  const [previous, setPrevious] = useState(selected);
  const [direction, setDirection] = useState(1);
  if (previous !== selected) { setPrevious(selected); setDirection(toMinutes(selected) >= toMinutes(previous) ? 1 : -1); }

  const [hourRaw, minuteRaw] = selected ? selected.split(":") : ["", ""];
  const hour24 = Number(hourRaw);
  const minute = minuteRaw || "";
  const period = hour24 >= 12 ? "PM" : "AM";
  const hourValues = format === "24h" ? Array.from({ length: 24 }, (_, h) => pad(h)) : Array.from({ length: 12 }, (_, h) => String(h + 1));
  const minuteValues = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => pad(i * minuteStep));
  const periodValues = ["AM", "PM"] as const;
  const shownHour = format === "24h" ? (Number.isFinite(hour24) ? pad(hour24) : "") : Number.isFinite(hour24) ? String(hour24 % 12 || 12) : "";

  const display = (raw: string) => {
    const minutes = toMinutes(raw);
    const hour = Math.floor(minutes / 60);
    const minutePart = minutes % 60;
    return format === "24h" ? `${pad(hour)}:${pad(minutePart)}` : `${hour % 12 || 12}:${pad(minutePart)} ${hour < 12 ? "AM" : "PM"}`;
  };

  /** Commit an hour/minute/period change; the pane stays open for fine-tuning, a complete time closes it. */
  const apply = (part: Pane, partValue: string) => {
    let h = hour24;
    let m = minute === "" ? null : Number(minute);
    let p = period;
    if (part === "hour") { h = format === "24h" ? Number(partValue) : (partValue === "12" ? 0 : Number(partValue)) + (period === "PM" ? 12 : 0); }
    if (part === "minute") m = Number(partValue);
    if (part === "period") { p = partValue as "AM" | "PM"; if (format !== "24h") h = (hour24 % 12) + (p === "PM" ? 12 : 0); }
    if (!Number.isFinite(h) || h < 0) h = 9;
    const next = `${pad(h)}:${pad(m ?? 0)}`;
    if (value === undefined) setInternal(next);
    onChange?.(next);
    return m !== null;
  };

  const choose = (part: Pane, partValue: string) => {
    const complete = apply(part, partValue);
    if (complete) setOpen(false);
    else if (part === "hour") setActive({ pane: "minute", value: minuteValues[0] ?? "" });
  };

  useEffect(() => { const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, []);

  // Runs before paint so each pane's first frame is already centered on its selected value.
  useLayoutEffect(() => {
    if (!open) return;
    for (const pane of ["hour", "minute", "period"] as Pane[]) {
      const selectedValue = pane === "hour" ? shownHour : pane === "minute" ? minute : period;
      const option = optionRefs.current[`${pane}:${selectedValue}`];
      const menu = paneRefs.current[pane];
      if (!option || !menu) continue;
      const top = option.offsetTop;
      menu.scrollTop = top - (menu.clientHeight - option.offsetHeight) / 2;
    }
  }, [open, shownHour, minute, period]);

  const placement = useViewportAnchor(open, triggerRef, popoverRef, 6);

  const openMenu = () => {
    setActive({ pane: "hour", value: shownHour || (hourValues[0] ?? "") });
    setOpen(true);
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && active.value) choose(active.pane, active.value);
      else openMenu();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || (open && (event.key === "ArrowLeft" || event.key === "ArrowRight"))) {
      event.preventDefault();
      if (!open) { openMenu(); return; }
      const panes: Pane[] = format === "24h" ? ["hour", "minute"] : ["hour", "minute", "period"];
      const values = active.pane === "hour" ? hourValues : active.pane === "minute" ? minuteValues : [...periodValues];
      const index = values.indexOf(active.value);
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const nextPane = panes[(panes.indexOf(active.pane) + (event.key === "ArrowRight" ? 1 : panes.length - 1)) % panes.length];
        const nextValues = nextPane === "hour" ? hourValues : nextPane === "minute" ? minuteValues : [...periodValues];
        const current = active.pane === "hour" ? shownHour : active.pane === "minute" ? minute : period;
        setActive({ pane: nextPane, value: nextValues.includes(active.value) ? active.value : (current && nextValues.includes(current) ? current : nextValues[0] ?? "") });
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = values[(index + step + values.length) % values.length] ?? "";
      setActive({ pane: active.pane, value: next });
    }
  };
  // Arrow-key highlight is a preview; pressing Enter commits it.
  useLayoutEffect(() => {
    if (!open || !active.value) return;
    const option = optionRefs.current[`${active.pane}:${active.value}`];
    const menu = paneRefs.current[active.pane];
    if (!option || !menu) return;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < menu.scrollTop) menu.scrollTop = top;
    else if (bottom > menu.scrollTop + menu.clientHeight) menu.scrollTop = bottom - menu.clientHeight;
  }, [active, open]);

  const pane = (key: Pane, ariaLabel: string, values: readonly string[], formatLabel: (v: string) => string, selectedValue: string) => (
    <div ref={(node) => { paneRefs.current[key] = node; }} className={styles.pane} role="listbox" aria-label={`${label} ${ariaLabel}`} aria-activedescendant={active.pane === key && active.value ? `${id}-${key}-${active.value}` : undefined}>
      {values.map((v) => {
        const isSelected = v === selectedValue;
        const isActive = active.pane === key && active.value === v;
        return (
          <button
            ref={(node) => { optionRefs.current[`${key}:${v}`] = node; }}
            key={v}
            id={`${id}-${key}-${v}`}
            type="button"
            role="option"
            aria-selected={isSelected}
            data-active={isActive || undefined}
            className={styles.option}
            onPointerMove={() => { if (!isActive) setActive({ pane: key, value: v }); }}
            onClick={() => choose(key, v)}
          >
            {formatLabel(v)}
            {isSelected && <span className={styles.dot} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );

  return <div ref={rootRef} className={[styles.field, className].filter(Boolean).join(" ")}>
    <span id={labelId} className={styles.label}>{label}</span>
    <div className={styles.anchor}>
      <button ref={triggerRef} type="button" className={styles.trigger} disabled={disabled} aria-labelledby={`${labelId} ${valueId}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-listbox`} onClick={() => open ? setOpen(false) : openMenu()} onKeyDown={onKeyDown}>
        <Clock3 size={16} aria-hidden="true" />
        <span id={valueId} className={styles.srOnly}>{selected ? display(selected) : placeholder}</span>
        <span className={styles.valueText} aria-hidden="true"><AnimatePresence initial={false} custom={direction}><motion.span key={selected || "placeholder"} className={selected ? styles.value : styles.placeholder} custom={direction} variants={reduce ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">{selected ? display(selected) : placeholder}</motion.span></AnimatePresence></span>
        <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>{open && <motion.div ref={popoverRef} id={`${id}-listbox`} className={styles.menu} role="group" aria-label={`${label} options`}
        style={viewportAnchorStyle(placement, { gap: 6, origin: "top center", flippedOrigin: "bottom center", align: false })}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter } } }}
        exit={{ opacity: 0, ...(reduce ? {} : { y: -4, scale: .98 }), transition: { duration: motionTokens.duration.instant, ease: standard } }}>
        <div className={styles.panes}>
          {pane("hour", "hours", hourValues, (v) => (format === "24h" ? v : v), shownHour)}
          {pane("minute", "minutes", minuteValues, (v) => v, minute)}
          {format === "12h" && pane("period", "period", periodValues, (v) => v, period)}
        </div>
      </motion.div>}</AnimatePresence>
    </div>
    {description && <span className={styles.description}>{description}</span>}
  </div>;
}
