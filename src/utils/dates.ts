// Shared check-in/check-out date helpers, so every page that needs a
// default date range (home hero, shelter details, reservation) uses the
// exact same rule: check-in = today, check-out = 3 nights later.

export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
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
