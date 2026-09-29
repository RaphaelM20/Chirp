const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Compact timestamps for feeds: "now", "5m", "3h", "2d", "Sep 4", "Sep 4, 2025".
export function formatRelativeTime(value, now = Date.now()) {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (seconds < 45) return "now";
  if (seconds < HOUR) return `${Math.max(1, Math.floor(seconds / MINUTE))}m`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h`;
  if (seconds < 7 * DAY) return `${Math.floor(seconds / DAY)}d`;

  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// Full timestamp for detail views and tooltips: "3:45 PM · Sep 28, 2026".
export function formatFullTimestamp(value) {
  const date = new Date(value);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${time} · ${day}`;
}

export function byNewest(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt);
}

export function byOldest(a, b) {
  return new Date(a.createdAt) - new Date(b.createdAt);
}
