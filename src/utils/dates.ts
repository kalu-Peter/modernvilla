// Shared check-in/check-out date helpers, so every page that needs a
// default date range (home hero, shelter details, reservation) uses the
// exact same rule: check-in = today, check-out = 3 nights later.

// Formats using *local* calendar fields. `d.toISOString()` converts to UTC
// first, which silently shifts the date back a day for several hours after
// local midnight in any timezone ahead of UTC (e.g. France, UTC+1/+2) —
// so "today" could resolve to yesterday depending on what time it is.
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultDateRange(nights: number = 3): {
  checkin: string;
  checkout: string;
} {
  const today = new Date();
  const checkout = new Date(today);
  checkout.setDate(today.getDate() + nights);
  return { checkin: formatDate(today), checkout: formatDate(checkout) };
}
