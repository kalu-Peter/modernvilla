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
    id: "the-aloe-refuge",
    name: "The Aloe Refuge",
    type: "Villa",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 7,
    description:
      "The Aloe Refuge – A Serene Nature Retreat\n\nNestled in lush surroundings, The Aloe Refuge offers a peaceful and elegant escape for families and groups of up to 7 guests.\n\nBedrooms:\n• Bedroom 1 — 3 single beds\n• Bedroom 2 — 3 single beds\n• Bedroom 3 — sofa bed\n\nLiving Space:\n• Sofa bed · Heating · Air conditioning\n• Books and reading material · Hot water · Hair dryer\n\nKitchen:\n• Hot water kettle · Coffee maker · Freezer · Oven\n• Microwave · Toaster · Dishwasher · Baking sheet\n• Refrigerator · Barbecue utensils · Dishes and silverware\n• Wine glasses · Cooking basics",
    isAvailable: true,
    color: "#3b82f6",
    image: "/images/The Aloe Refuge/IMG_20201002_161720.jpg",
    gallery: [
      "/images/The Aloe Refuge/IMG_20201002_161720.jpg",
      "/images/The Aloe Refuge/IMG_20201002_161747.jpg",
      "/images/The Aloe Refuge/IMG_20201002_161757.jpg",
      "/images/The Aloe Refuge/IMG_20201002_161900.jpg",
      "/images/The Aloe Refuge/IMG_20201002_163012.jpg",
      "/images/The Aloe Refuge/IMG_20201002_163024.jpg",
      "/images/The Aloe Refuge/IMG_20201002_163508.jpg",
      "/images/The Aloe Refuge/IMG_20201002_163539.jpg",
      "/images/The Aloe Refuge/IMG_20201002_163623.jpg",
      "/images/The Aloe Refuge/IMG_20201002_163644.jpg",
      "/images/The Aloe Refuge/IMG_20201002_163722.jpg",
      "/images/The Aloe Refuge/IMG_20201002_165212.jpg",
      "/images/The Aloe Refuge/IMG_20201002_165253.jpg",
      "/images/The Aloe Refuge/IMG_20201002_165335.jpg",
      "/images/The Aloe Refuge/IMG_20201002_165339.jpg",
      "/images/The Aloe Refuge/IMG_20201002_165353.jpg",
      "/images/The Aloe Refuge/IMG_20201002_165514.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0003.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0004.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0005.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0006.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0008.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0009.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0010.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0011.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0012.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0013.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0014.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0015.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0016.jpg",
      "/images/The Aloe Refuge/IMG-20241104-WA0017.jpg",
      "/images/The Aloe Refuge/IMG-20241105-WA0045.jpg",
      "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (135).jpg",
      "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (136).jpg",
      "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (137).jpg",
      "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (138).jpg",
      "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (139).jpg",
      "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (140).jpg",
      "/images/The Aloe Refuge/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (141).jpg",
    ],
    amenities: [
      "Sofa Bed",
      "Heating",
      "Air Conditioning",
      "Books & Reading Material",
      "Hot Water",
      "Hair Dryer",
      "Hot Water Kettle",
      "Coffee Maker",
      "Freezer & Oven",
      "Microwave & Toaster",
      "Dishwasher",
      "Refrigerator",
      "Barbecue Utensils",
      "Wine Glasses",
      "Cooking Basics",
    ],
    pricing: [{ baseGuests: 4, basePrice: 6000, extraPersonFee: 2000 }],
  },
  {
    id: "the-modern-house",
    name: "The Modern House",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 10,
    description:
      "The Modern House – Contemporary Luxury\n\nA beautifully designed contemporary property offering premium comfort and refined living spaces for up to 10 guests.\n\nHighlights:\n• 4 spacious bedrooms with elegant bathrooms.\n• Large open-plan living area with designer furnishings.\n• Fully equipped modern kitchen.\n• Free WiFi, flat-screen TV, and all linen provided.\n• Stunning outdoor spaces and landscaped garden.\n\nProfessionally photographed — every room reflects a commitment to quality and style.",
    isAvailable: true,
    color: "#10b981",
    image: "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (7).jpg",
    gallery: [
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (7).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (50).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (51).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (52).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (53).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (54).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (55).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (56).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (57).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (58).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (59).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (60).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (61).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (62).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (63).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (64).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (65).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (67).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (70).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (71).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (73).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (74).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (75).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (76).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (77).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (78).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (79).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (80).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (81).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (82).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (83).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (84).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (85).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (86).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (87).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (88).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (89).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (90).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (91).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (92).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (93).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (94).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (95).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (96).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (97).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (99).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (101).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (103).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (105).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (107).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (109).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (110).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (112).jpg",
      "/images/The modern house/© Alex Flores. PhotographeTel 0645412446 www.alex-flores (114).jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-47.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-50.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-52.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-54.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-56.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-58.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-61.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-63.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-65.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-67.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-69.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-70.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-74.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-76.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-78.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-81.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-83.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-85.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-87.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-89.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-90.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-92.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-94.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-96.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-98.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-101.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-103.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-105.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-107.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-109.jpg",
      "/images/The modern house/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-110.jpg",
    ],
    amenities: [
      "4 Bedrooms",
      "3 Bathrooms",
      "Designer Interiors",
      "Landscaped Garden",
      "Modern Kitchen",
      "Free Wi-Fi",
      "Flat-screen TV",
      "Bed Linen & Towels",
    ],
    pricing: [{ baseGuests: 5, basePrice: 8000, extraPersonFee: 2000 }],
  },
  {
    id: "the-pine-marten-refuge",
    name: "The Pine Marten Refuge",
    type: "Villa",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 8,
    description:
      "The Pine Marten Refuge – A Woodland Sanctuary\n\nA charming and characterful property set in a natural woodland setting, perfect for couples, families, and nature lovers.\n\nHighlights:\n• 3 cosy bedrooms with quality furnishings.\n• Warm, inviting living spaces.\n• Fully equipped kitchen.\n• Free WiFi, flat-screen TV, and all linen included.\n• Beautiful natural surroundings and outdoor spaces.\n\nAn idyllic retreat for those seeking tranquility and a connection with nature.",
    isAvailable: true,
    color: "#eab308",
    image: "/images/The Pine Marten Refuge/IMG_20210618_102853.jpg",
    gallery: [
      "/images/The Pine Marten Refuge/IMG_20210618_102853.jpg",
      "/images/The Pine Marten Refuge/IMG_20211113_091044.jpg",
      "/images/The Pine Marten Refuge/IMG_20211114_163234.jpg",
      "/images/The Pine Marten Refuge/IMG_20211114_163258.jpg",
      "/images/The Pine Marten Refuge/IMG-20191224-WA0002.jpg",
      "/images/The Pine Marten Refuge/PANO_20210618_102952.jpg",
      "/images/The Pine Marten Refuge/PANO_20210618_103026.jpg",
      "/images/The Pine Marten Refuge/PANO_20210618_225432.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0005.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0007.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0014.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0019.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0054.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0080.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-0083.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-9979.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  bd-9990.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-21.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-24.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-25.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-26.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-27.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-28.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-29.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-30.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-31.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-32.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-33.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-34.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-35.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-37.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-38.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-39.jpg",
      "/images/The Pine Marten Refuge/© Alex Flores. Photographe strasbourg Tel 0645412446 www.alex-flores.com  internet-40.jpg",
    ],
    amenities: [
      "3 Bedrooms",
      "2 Bathrooms",
      "Woodland Setting",
      "Outdoor Spaces",
      "Fully Equipped Kitchen",
      "Free Wi-Fi",
      "Flat-screen TV",
      "Bed Linen & Towels",
    ],
    pricing: [{ baseGuests: 4, basePrice: 6000, extraPersonFee: 2000 }],
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
