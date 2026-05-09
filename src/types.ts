// Villa Types and Constants
export interface PricingTier {
  baseGuests: number;     // guests included in the base price
  basePrice: number;      // flat nightly rate for up to baseGuests
  extraPersonFee: number; // added per person beyond baseGuests (0 = no extras)
}

export interface Villa {
  id: string;
  name: string;
  type: 'Villa' | 'Lodge' | 'Apartment' | 'Bungalow';
  maxGuests: number;
  description: string;
  isAvailable: boolean;
  pricing: PricingTier[];
  color: string;
  image: string;
  gallery?: string[];
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  contactOnly?: boolean; // if true, show WhatsApp contact instead of online reservation
  openingSoon?: boolean; // if true, show "Opening Soon" instead of Reserved/unavailable
}

export interface Reservation {
  id: string;
  villaId: string;
  villaName: string;
  guestCount: number;
  checkInDate: string;
  checkOutDate: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export interface PaymentInfo {
  phoneNumber: string;
  amount: number;
  reservationId: string;
  status: "pending" | "completed" | "failed";
}

// Villa Pricing Configuration
export const VILLAS: Villa[] = [
  {
    id: "blue-villa",
    name: "Blue Villa",
    type: "Villa",
    bedrooms: 3,
    maxGuests: 8,
    description:
      "3-Bedroom Villa with Pool and Tropical Garden – Crocodile Lodge, Diani Beach\n\nDiscover our elegant 3-bedroom villa in the heart of Crocodile Lodge, a peaceful green haven just a 7–10 minute walk from the white sandy beaches of Diani (Galu).\n\nThis spacious and bright villa can accommodate up to 8 people in a modern and artistic setting, perfect for a family vacation or a getaway with friends.\n\nVilla highlights:\n• 3 comfortable bedrooms, each with its own private bathroom (modern showers and well-designed spaces).\n• A large, bright open-plan living area, stylishly decorated with colorful artwork, opening directly onto a terrace and a lush tropical garden.\n• Fully equipped kitchen (refrigerator, microwave, dishes, etc.) with a dining area.\n• Air conditioning, free WiFi, flat-screen TV, and bed linen/towels provided.\n• Access to a large freeform turquoise shared swimming pool, surrounded by sun loungers, thatched umbrellas, and a natural stone deck.\n\nA paradise setting:\nThe property is nestled in a mature tropical garden with palm trees, banana trees, vibrant flowers, succulents, and a magnificent large tree. Enjoy orange sunsets on the horizon, peaceful moments by the pool, or drinks on the terrace while listening to birdsong.\n\nKaribu sana! Welcome to Crocodile Lodge – where modern comfort meets tropical magic.",
    isAvailable: true,
    color: "#3b82f6",
    image: "/images/crocodile/blue/IMG_20260202_180003.jpg",
    gallery: [
      "/images/crocodile/blue/IMG_20260202_180003.jpg",
      "/images/crocodile/blue/IMG_20260202_180026.jpg",
      "/images/crocodile/blue/IMG_20260202_180038.jpg",
      "/images/crocodile/blue/IMG_20260202_180550.jpg",
      "/images/crocodile/blue/IMG_20260202_180753.jpg",
      "/images/crocodile/blue/IMG_20260327_140328.jpg",
      "/images/crocodile/blue/WhatsApp Image 2026-04-01 at 22.32.45.jpeg",
      "/images/crocodile/blue/Maisons Diani-photos-Pierre_Rich-45.jpg",
      "/images/crocodile/blue/Maisons Diani-photos-Pierre_Rich-37.jpg",
      "/images/crocodile/blue/IMG-20250728-WA0040.jpg",
      "/images/crocodile/blue/IMG-20250728-WA0036.jpg",
      "/images/crocodile/blue/IMG-20250728-WA0033.jpg",
      "/images/crocodile/blue/IMG-20250728-WA0031.jpg",
      "/images/crocodile/blue/IMG-20250728-WA0015.jpg",
      "/images/crocodile/blue/20241121_140024.jpg",
      "/images/crocodile/blue/20241121_135924.jpg",
      "/images/crocodile/blue/20241121_135917.jpg",
      "/images/crocodile/blue/20241121_135844.jpg",
    ],
    pricing: [{ baseGuests: 4, basePrice: 6000, extraPersonFee: 2000 }],
  },
  {
    id: "green-villa",
    name: "Green Villa",
    type: "Villa",
    bedrooms: 3,
    maxGuests: 8,
    description:
      "3-Bedroom Villa with Pool and Tropical Garden – Crocodile Lodge, Diani Beach\n\nDiscover our elegant 3-bedroom villa in the heart of Crocodile Lodge, a peaceful green haven just a 7–10 minute walk from the white sandy beaches of Diani (Galu).\n\nThis spacious and bright villa can accommodate up to 8 people in a modern and artistic setting, perfect for a family vacation or a getaway with friends.\n\nVilla highlights:\n• 3 comfortable bedrooms, each with its own private bathroom (modern showers and well-designed spaces).\n• A large, bright open-plan living area, stylishly decorated with colorful artwork, opening directly onto a terrace and a lush tropical garden.\n• Fully equipped kitchen (refrigerator, microwave, dishes, etc.) with a dining area.\n• Air conditioning, free WiFi, flat-screen TV, and bed linen/towels provided.\n• Access to a large freeform turquoise shared swimming pool, surrounded by sun loungers, thatched umbrellas, and a natural stone deck.\n\nA paradise setting:\nThe property is nestled in a mature tropical garden with palm trees, banana trees, vibrant flowers, succulents, and a magnificent large tree. Enjoy orange sunsets on the horizon, peaceful moments by the pool, or drinks on the terrace while listening to birdsong.\n\nKaribu sana! Welcome to Crocodile Lodge – where modern comfort meets tropical magic.",
    isAvailable: true,
    color: "#10b981",
    image: "/images/crocodile/green/Maisons Diani-photos-Pierre_Rich-38.jpg",
    gallery: [
      "/images/crocodile/green/Maisons Diani-photos-Pierre_Rich-38.jpg",
      "/images/crocodile/green/WhatsApp Image 2026-04-01 at 22.32.05.jpeg",
      "/images/crocodile/green/WhatsApp Image 2026-04-01 at 22.32.44.jpeg",
      "/images/crocodile/green/Maisons Diani-photos-Pierre_Rich-42.jpg",
      "/images/crocodile/green/IMG-20250728-WA0038.jpg",
      "/images/crocodile/green/IMG-20250728-WA0037.jpg",
      "/images/crocodile/green/IMG-20250728-WA0033.jpg",
      "/images/crocodile/green/IMG-20250728-WA0032.jpg",
      "/images/crocodile/green/IMG-20250728-WA0024.jpg",
    ],
    pricing: [{ baseGuests: 4, basePrice: 6000, extraPersonFee: 2000 }],
  },
  {
    id: "gold-lodge",
    name: "Gold Lodge",
    type: "Lodge",
    maxGuests: 21,
    description:
      "Large Group Lodge with Pool and Tropical Garden: Crocodile Lodge, Diani Beach\n\nWelcome to the Gold Lodge, our flagship property at Crocodile Lodge, a spacious retreat designed for large groups, family reunions, and corporate getaways, just a 7–10 minute walk from the stunning white sands of Diani (Galu) Beach.\n\nSleeping up to 21 guests, the Gold Lodge combines generous communal spaces with comfortable private rooms, all set within a lush tropical garden.\n\nLodge highlights:\n• Sleeps up to 21 guests across multiple rooms — 18 single beds, 1 double bed, and 2 sofa beds.\n• Spacious open-plan living and dining area, perfect for group meals, gatherings, and celebrations.\n• Fully equipped communal kitchen (refrigerator, microwave, dishes, etc.).\n• Air conditioning, free WiFi, flat-screen TV, and bed linen/towels provided.\n• Access to a large freeform turquoise shared swimming pool, surrounded by sun loungers, thatched umbrellas, and a natural stone deck.\n\nA paradise setting:\nNestled in a mature tropical garden with palm trees, banana trees, vibrant flowers, and a magnificent shading tree, the Gold Lodge offers a private and serene atmosphere. Enjoy golden sunsets, evenings by the pool, and the sounds of nature all around you.\n\nConveniently located close to Diani's best beach restaurants, supermarkets, and activities — while remaining a peaceful sanctuary away from the crowds.\n\nKaribu sana! Welcome to Crocodile Lodge – where modern comfort meets tropical magic.",
    isAvailable: true,
    color: "#eab308",
    image: "/images/crocodile/gold/IMG_20240814_135009.jpg",
    gallery: [
      "/images/crocodile/gold/IMG_20240814_135009.jpg",
      "/images/crocodile/gold/Maisons Diani-photos-Pierre_Rich-11.jpg",
      "/images/crocodile/gold/WhatsApp Image 2026-03-09 at 13.25.46.jpeg",
      "/images/crocodile/gold/20250803_162410.jpg",
      "/images/crocodile/gold/20250803_162250.jpg",
      "/images/crocodile/gold/20250803_162139.jpg",
      "/images/crocodile/gold/20250803_162136.jpg",
      "/images/crocodile/gold/20250307_142357.jpg",
      "/images/crocodile/gold/20250307_142209.jpg",
      "/images/crocodile/gold/20250307_142205.jpg",
      "/images/crocodile/gold/20250307_142151.jpg",
      "/images/crocodile/gold/IMG-20250307-WA0019.jpg",
      "/images/crocodile/gold/IMG-20250307-WA0012.jpg",
      "/images/crocodile/gold/IMG_20250226_192834.jpg",
      "/images/crocodile/gold/IMG_20250226_134129.jpg",
      "/images/crocodile/gold/IMG_20250226_134110.jpg",
      "/images/crocodile/gold/IMG_20250226_132636.jpg",
    ],
    pricing: [{ baseGuests: 12, basePrice: 6000, extraPersonFee: 2000 }],
  },
  {
    id: "apartment-1",
    name: "Blue Baobab Apartment",
    type: "Apartment",
    maxGuests: 2,
    description:
      "A modern self-contained apartment nestled under the iconic baobab. Ideal for a couple's getaway with all the amenities you need.",
    isAvailable: true,
    color: "#f97316",
    image: "/images/crocodile/baobab/Maisons Diani-photos-Pierre_Rich-25.jpg",
    gallery: [
      "/images/crocodile/baobab/Maisons Diani-photos-Pierre_Rich-25.jpg",
      "/images/crocodile/baobab/Maisons Diani-photos-Pierre_Rich-28.jpg",
      "/images/crocodile/baobab/Maisons Diani-photos-Pierre_Rich-29.jpg",
      "/images/crocodile/baobab/Maisons Diani-photos-Pierre_Rich-31.jpg",
      "/images/crocodile/baobab/FB_IMG_1721233401385.jpg",
      "/images/crocodile/baobab/20250711_141209.jpg",
      "/images/crocodile/baobab/20250711_141216.jpg",
      "/images/crocodile/baobab/20250711_141241.jpg",
    ],
    pricing: [{ baseGuests: 2, basePrice: 6000, extraPersonFee: 0 }],
  },
  {
    id: "mango-park-bungalow",
    name: "Mango Villa",
    type: "Bungalow",
    contactOnly: true,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    description:
      "A charming 2-bedroom bungalow nestled in the lush Mango Park grounds. Features two comfortable double bedrooms, a spacious living area, and a private garden — perfect for couples or small families seeking a serene bush retreat.",
    isAvailable: true,
    color: "#c2410c",
    image: "/images/mango park/20250731_100752.jpg",
    gallery: [
      "/images/mango park/20250731_100752.jpg",
      "/images/mango park/20250731_100808.jpg",
      "/images/mango park/20250731_100905.jpg",
      "/images/mango park/20250731_101142.jpg",
      "/images/mango park/Maisons Diani-photos-Pierre_Rich-52.jpg",
      "/images/mango park/Maisons Diani-photos-Pierre_Rich-55.jpg",
      "/images/mango park/Maisons Diani-photos-Pierre_Rich-57.jpg",
      "/images/mango park/Maisons Diani-photos-Pierre_Rich-58.jpg",
      "/images/mango park/Maisons Diani-photos-Pierre_Rich-61_BD.jpg",
    ],
    amenities: [
      "2 Double Bedrooms",
      "2 Bathrooms",
      "Private Garden",
      "Fully Equipped Kitchen",
      "Living & Dining Area",
      "Air Conditioning",
      "Free Wi-Fi",
      "Daily Housekeeping",
    ],
    pricing: [{ baseGuests: 4, basePrice: 6000, extraPersonFee: 0 }],
  },
  {
    id: "mango-park-1st-floor",
    name: "Mango Villa 1st Floor",
    type: "Bungalow",
    contactOnly: true,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    description:
      "An elegant first-floor suite in Mango Park with sweeping garden and pool views. Offers two bright bedrooms, a breezy balcony, and refined interiors — ideal for guests who appreciate elevated comfort and panoramic surroundings.",
    isAvailable: true,
    color: "#15803d",
    image: "/images/mango 1st floor/1st floor 1.jpg",
    gallery: [
      "/images/mango 1st floor/1st floor 1.jpg",
      "/images/mango 1st floor/1st floor 2.jpg",
      "/images/mango 1st floor/1st floor 3.jpg",
      "/images/mango 1st floor/1st floor 4.jpg",
      "/images/mango 1st floor/1st floor 5.jpg",
      "/images/mango 1st floor/1st floor 6.jpg",
      "/images/mango 1st floor/1st floor 7.jpg",
      "/images/mango 1st floor/1st floor 8.jpg",
      "/images/mango 1st floor/1st floor 9.jpg",
      "/images/mango 1st floor/1st floor 10.jpg",
    ],
    amenities: [
      "2 Double Bedrooms",
      "2 Bathrooms",
      "Private Balcony",
      "Garden & Pool Views",
      "Fully Equipped Kitchen",
      "Air Conditioning",
      "Free Wi-Fi",
      "Daily Housekeeping",
    ],
    pricing: [{ baseGuests: 4, basePrice: 6000, extraPersonFee: 0 }],
  },
  {
    id: "paradise-villa",
    name: "Paradise Villa",
    type: "Villa",
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    openingSoon: true,
    description:
      "A stunning villa nestled in a private tropical setting. Two spacious bedrooms, lush garden surroundings, and premium finishes make Paradise Villa the ultimate retreat for couples or small families seeking an unforgettable Diani experience.",
    isAvailable: false,
    color: "#7c3aed",
    image: "/images/paradise/IMG_20260223_151803.jpg",
    gallery: [
      "/images/paradise/IMG_20260223_151803.jpg",
      "/images/paradise/IMG_20260223_151823.jpg",
      "/images/paradise/IMG_20260223_151836.jpg",
      "/images/paradise/IMG_20260223_151847.jpg",
      "/images/paradise/IMG_20260223_151927.jpg",
      "/images/paradise/IMG_20260223_151930.jpg",
      "/images/paradise/IMG_20260223_151951.jpg",
      "/images/paradise/IMG_20260223_151959.jpg",
      "/images/paradise/IMG_20260223_152031.jpg",
      "/images/paradise/IMG_20260223_154754.jpg",
      "/images/paradise/IMG_20260223_154913.jpg",
    ],
    amenities: [
      "2 Bedrooms",
      "2 Bathrooms",
      "Private Garden",
      "Swimming Pool",
      "Fully Equipped Kitchen",
      "Air Conditioning",
      "Free Wi-Fi",
      "Daily Housekeeping",
    ],
    pricing: [{ baseGuests: 4, basePrice: 15000, extraPersonFee: 2000 }],
  },
];

// Helper function to get per-night price for a villa and guest count
export const getVillaPrice = (villaId: string, guestCount: number): number | null => {
  const villa = VILLAS.find((v) => v.id === villaId);
  if (!villa) return null;
  if (guestCount < 1 || guestCount > villa.maxGuests) return null;

  const tier = villa.pricing[0];
  if (!tier) return null;

  if (guestCount <= tier.baseGuests) return tier.basePrice;
  return tier.basePrice + (guestCount - tier.baseGuests) * tier.extraPersonFee;
};

// ─── Admin Types ───────────────────────────────────────────────────────────────

export interface AdminReservation {
  id: string;
  property_name: string;
  guests: number;
  checkin: string;
  checkout: string;
  name: string;
  phone: string;
  email: string;
  total_price: number;
  amount_paid: number | null;
  payment_transaction_id: string | null;
  payment_status: string;
  confirmed: boolean;
  cancelled: boolean;
  created_at: string;
}

export interface BlockedDate {
  id: number;
  property_name: string;
  blocked_date: string;
  reason: string;
  created_at: string;
}

export interface PricingRow {
  id: number;
  property_name: string;
  min_guests: number;
  max_guests: number;
  price: number;
}

export interface SeasonalPricingRule {
  id: number;
  villa_id: string;
  label: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  created_at: string;
}
