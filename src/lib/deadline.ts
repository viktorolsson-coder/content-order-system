import type { ContentType } from "./types";

export function deadlineForType(type: ContentType, now: Date = new Date()): Date {
  const days = type === "staticAds" ? 3 : 5;
  const deadline = new Date(now);
  deadline.setHours(23, 59, 0, 0);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}

export function formatMonth(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function monthLabelFromDate(date: Date): string {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function currentMonthKey(): string {
  return formatMonth(new Date());
}
