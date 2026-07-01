// Shared pricing helpers so Search Results, Shelter Details, and the
// Reservation page all compute the same total the same way: each night
// priced at its own weekday/weekend rate (not just the first night's rate
// multiplied by the stay length), plus extra-guest, cleaning and monetary
// fees, plus tax.

export const SHELTER_TO_PROPERTY_ID: Record<string, number> = {
  "shelter-a": 1,
  "shelter-b": 2,
  "la-maison-modern": 3,
  "refuge-de-la-martre": 4,
};

export interface PropertyPricing {
  weekday_price: number | null;
  weekend_price: number | null;
  extra_person_fee: number;
  cleaning_fee: number;
  linen_fee: number;
}

export interface PriceBreakdown {
  roomCharges: number;
  guestCharges: number;
  cleaningFee: number;
  linenFee: number;
  taxAmount: number;
  taxPercentage: number;
  totalPrice: number;
}

const TAX_PERCENTAGE = 5.5;
const DEFAULT_BASE_GUESTS = 6;

export function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  return Math.max(
    0,
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000),
  );
}

export function isWeekend(dateString: string): boolean {
  const day = new Date(dateString + "T00:00:00").getDay();
  return day === 5 || day === 6; // Friday=5, Saturday=6
}

/**
 * Formats a Date as "YYYY-MM-DD" using its *local* calendar fields.
 * `date.toISOString()` converts to UTC first, which silently shifts the
 * calendar date back a day in any timezone ahead of UTC (e.g. France,
 * UTC+1/+2) — exactly the kind of bug that made some nights get priced
 * at the wrong day's weekday/weekend rate.
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Prices every night of the stay individually (weekday vs weekend rate),
 * then adds extra-guest, cleaning, and monetary fees, then tax.
 */
export function calculateDetailedPrice(
  pricing: PropertyPricing | null,
  checkin: string,
  checkout: string,
  guests: number,
  baseGuests: number = DEFAULT_BASE_GUESTS,
  includeLinen: boolean = true,
): PriceBreakdown | null {
  if (!pricing || !pricing.weekday_price || !pricing.weekend_price) return null;
  if (!checkin || !checkout) return null;

  let roomCharges = 0;
  const currentDate = new Date(checkin + "T00:00:00");
  const endDate = new Date(checkout + "T00:00:00");

  while (currentDate < endDate) {
    const dateStr = formatLocalDate(currentDate);
    roomCharges += isWeekend(dateStr) ? pricing.weekend_price : pricing.weekday_price;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const nights = nightsBetween(checkin, checkout);
  if (nights <= 0) return null;

  const guestCharges =
    guests > baseGuests ? (guests - baseGuests) * pricing.extra_person_fee * nights : 0;

  const cleaningFee = pricing.cleaning_fee;
  const linenFee = includeLinen ? pricing.linen_fee * guests : 0;

  // Tourist tax (taxe de séjour) applies only to room/night charges, not fees.
  const taxAmount = Math.round(roomCharges * (TAX_PERCENTAGE / 100) * 100) / 100;
  const totalPrice = Math.round((roomCharges + guestCharges + cleaningFee + linenFee + taxAmount) * 100) / 100;

  return {
    roomCharges,
    guestCharges,
    cleaningFee,
    linenFee,
    taxAmount,
    taxPercentage: TAX_PERCENTAGE,
    totalPrice,
  };
}

/** Fetches live pricing for one property; resolves to null on any failure. */
export async function fetchPropertyPricing(
  propertyId: number,
): Promise<PropertyPricing | null> {
  try {
    const res = await fetch(`/api/pricing/property?property_id=${propertyId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      weekday_price: data.data.weekday_price,
      weekend_price: data.data.weekend_price,
      extra_person_fee: data.data.extra_person_fee,
      cleaning_fee: data.data.cleaning_fee || 40,
      linen_fee: data.data.linen_fee ?? 12,
    };
  } catch {
    return null;
  }
}
