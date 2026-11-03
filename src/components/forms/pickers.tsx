"use client";

/**
 * App-side adapters for the vendored pickers (uiarc "arc" components).
 *
 * Forms keep dates as plain strings — the exact wire formats the APIs have
 * always received — so no backend semantics change:
 *   DateField     "YYYY-MM-DD"        (member DOB, media date, portal date)
 *   DateTimeField "YYYY-MM-DDTHH:mm"  (event starts/ends)
 * This module is the ONLY place that converts those strings to the pickers'
 * local Date objects and back.
 */

import * as React from "react";
import { DatePicker } from "@/components/arc/date-picker/date-picker";
import { TimePicker } from "@/components/arc/time-picker/time-picker";

/** Local-time "YYYY-MM-DD" for a Date (the pickers work in local dates). */
function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Parse "YYYY-MM-DD" as a local Date; undefined when empty or malformed. */
function parseDateKey(value: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Today in the viewer's timezone as "YYYY-MM-DD" (ISO-slice defaults are UTC-based and land a day off outside Greenwich). */
export function todayKey(): string {
  return dateKey(new Date());
}

/** A Date as "YYYY-MM-DDTHH:mm" in the viewer's timezone (event default values). */
export function localDateTimeKey(date: Date): string {
  return `${dateKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export interface DateFieldProps {
  label: string;
  /** "YYYY-MM-DD" or "" for none. */
  value: string;
  /** Receives "YYYY-MM-DD", or "" when the field is cleared. */
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  /** Earliest selectable day as "YYYY-MM-DD". */
  minDate?: string;
  /** Latest selectable day as "YYYY-MM-DD". */
  maxDate?: string;
  id?: string;
  className?: string;
}

export function DateField({
  label,
  value,
  onChange,
  description,
  placeholder,
  minDate,
  maxDate,
  id,
  className,
}: DateFieldProps) {
  return (
    <DatePicker
      label={label}
      value={parseDateKey(value)}
      onChange={(date) => onChange(date ? dateKey(date) : "")}
      description={description}
      placeholder={placeholder}
      minDate={minDate ? parseDateKey(minDate) : undefined}
      maxDate={maxDate ? parseDateKey(maxDate) : undefined}
      showToday
      locale="en-GB"
      id={id}
      className={className}
    />
  );
}

export interface DateTimeFieldProps {
  /** Visible label for the date half. */
  dateLabel: string;
  /** Visible label for the time half. */
  timeLabel: string;
  /** "YYYY-MM-DDTHH:mm" or "" for none. */
  value: string;
  /**
   * Receives a complete "YYYY-MM-DDTHH:mm" once both halves are chosen, ""
   * when the date half is cleared, or nothing while only one half is set.
   */
  onChange: (value: string) => void;
  className?: string;
}

const FULL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function DateTimeField({ dateLabel, timeLabel, value, onChange, className }: DateTimeFieldProps) {
  const [datePart, setDatePart] = React.useState(FULL_DATETIME.test(value) ? value.slice(0, 10) : "");
  const [timePart, setTimePart] = React.useState(FULL_DATETIME.test(value) ? value.slice(11, 16) : "");

  // Re-derive both halves when the parent replaces the value wholesale
  // (dialog re-open / form reset while the field stays mounted).
  React.useEffect(() => {
    if (FULL_DATETIME.test(value)) {
      setDatePart(value.slice(0, 10));
      setTimePart(value.slice(11, 16));
    } else if (value === "") {
      setDatePart("");
      setTimePart("");
    }
  }, [value]);

  // Only a complete timestamp (or an explicit clear) reaches the form state.
  const emit = (nextDate: string, nextTime: string) => {
    if (nextDate && nextTime) onChange(`${nextDate}T${nextTime}`);
    else if (!nextDate) onChange("");
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        <DatePicker
          label={dateLabel}
          value={parseDateKey(datePart)}
          onChange={(date) => {
            const next = date ? dateKey(date) : "";
            setDatePart(next);
            emit(next, timePart);
          }}
          showToday
          locale="en-GB"
        />
        <TimePicker
          label={timeLabel}
          value={timePart}
          onChange={(next) => {
            setTimePart(next);
            emit(datePart, next);
          }}
          minuteStep={5}
          format="24h"
        />
      </div>
    </div>
  );
}
