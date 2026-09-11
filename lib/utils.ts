import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

// <input type="datetime-local"> has no timezone. The lab runs on IST, so the
// admin types IST and these convert at the boundary.
export function toIstInput(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).replace(" ", "T").slice(0, 16);
}

export function istInputToIso(value: string | null) {
  return value ? new Date(`${value}:00+05:30`).toISOString() : null;
}

// Only same-site paths, so a crafted ?next= cannot bounce a user off-site
// after signing in.
export function safeNext(value: unknown, fallback = "/") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : fallback;
}
