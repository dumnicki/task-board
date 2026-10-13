/** Deadlines due today through this many days ahead count as coming up. */
export const COMING_WINDOW_DAYS = 2;

export type DeadlineTone = "none" | "later" | "soon" | "overdue";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Parse a `YYYY-MM-DD` value as a local calendar day.
 * `new Date("YYYY-MM-DD")` is UTC midnight, which lands on the previous
 * evening in timezones behind UTC and marks "due today" as overdue.
 */
export function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function calendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole local calendar days from today until the deadline. Negative means past. */
export function daysUntil(deadline: string, now = new Date()): number | null {
  const due = parseCalendarDate(deadline);
  if (!due) return null;
  return Math.round((due.getTime() - calendarDay(now).getTime()) / DAY_MS);
}

export function deadlineTone(
  deadline: string | null,
  now = new Date(),
): DeadlineTone {
  if (!deadline) return "none";
  const days = daysUntil(deadline, now);
  if (days === null) return "none";
  if (days < 0) return "overdue";
  if (days <= COMING_WINDOW_DAYS) return "soon";
  return "later";
}

export function deadlineSummary(
  deadline: string,
  now = new Date(),
): string | null {
  const days = daysUntil(deadline, now);
  if (days === null) return null;
  if (days < 0) {
    const ago = Math.abs(days);
    return ago === 1
      ? "Past deadline · 1 day ago"
      : `Past deadline · ${ago} days ago`;
  }
  if (days === 0) return "Coming up · due today";
  if (days === 1) return "Coming up · due tomorrow";
  if (days <= COMING_WINDOW_DAYS) return `Coming up · due in ${days} days`;
  return `Due in ${days} days`;
}

export function formatDeadline(deadline: string): string | null {
  const date = parseCalendarDate(deadline);
  if (!date) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
