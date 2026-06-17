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
    id: "shelter-a",
    name: "Shelter A",
    type: "Villa",
    bedrooms: 3,
    bathrooms: 1,
    maxGuests: 8,
    description:
      "Shelter A – Entire Rental Unit in Griesheim-près-Molsheim, France\n\nA peaceful and elegant rental unit nestled in lush surroundings, perfect for families and groups of up to 8 guests.\n\nHighlights:\n• 3 spacious bedrooms with 7 beds and comfortable furnishings.\n• Warm, inviting living spaces.\n• Fully equipped modern kitchen.\n• Free WiFi, heating, and air conditioning.\n• Beautiful natural surroundings.\n\nThe perfect retreat in the Alsace region of France.",
    isAvailable: true,
    color: "#3b82f6",
    image: "/images/Shelter A/204ef77b-b7e7-4cce-a4c7-2e735b3a30bf.avif",
    gallery: [
      "/images/Shelter A/204ef77b-b7e7-4cce-a4c7-2e735b3a30bf.avif",
      "/images/Shelter A/3991dd29-5bc4-4cbd-b5eb-68fbd0971d54.avif",
      "/images/Shelter A/46aded4b-c5cc-484f-8bd9-3fd39b9bf323.avif",
      "/images/Shelter A/513a5ca6-5b0e-4207-9404-8e59ec630a2d.avif",
      "/images/Shelter A/51c578fd-74fe-4cf5-b7d5-fc0fb03ca0b9.avif",
      "/images/Shelter A/54a9f03d-91c4-44de-9efe-54827fa4fd5e.avif",
      "/images/Shelter A/57803688-8f49-4a77-8766-4f4eff730087.avif",
      "/images/Shelter A/751e4e4e-1c75-4e84-91be-30034a5b5829.avif",
      "/images/Shelter A/83872ac0-113d-4958-bfee-4c688631559d.avif",
      "/images/Shelter A/88ea92a6-5434-4097-ad24-955e34e5f03b.avif",
      "/images/Shelter A/8939bf51-84e3-4ad9-9b7b-583893a7b056.avif",
      "/images/Shelter A/9410b608-cbd8-46ce-8b18-eeea7e1bdf6c.avif",
      "/images/Shelter A/9cf7b400-9139-451e-a142-3fe7df65b03e.avif",
      "/images/Shelter A/b4b36cf0-1b8d-4b03-97f7-082a4b2ccda0.avif",
      "/images/Shelter A/d2cb42da-197b-45a1-a90e-b23705208303.avif",
      "/images/Shelter A/d3f26120-824d-4cb9-b5b0-960f62bff434.avif",
    ],
    amenities: [
      "3 Bedrooms",
      "7 Beds",
      "1 Bathroom",
      "Heating",
      "Air Conditioning",
      "Modern Kitchen",
      "Free Wi-Fi",
      "Hot Water",
      "Fully Equipped",
    ],
    pricing: [{ baseGuests: 4, basePrice: 6000, extraPersonFee: 2000 }],
  },
  {
    id: "shelter-b",
    name: "Shelter B",
    type: "Villa",
    bedrooms: 3,
    bathrooms: 1,
    maxGuests: 7,
    description:
      "Shelter B – Entire Rental Unit in Griesheim-près-Molsheim, France\n\nA beautifully appointed rental unit offering comfort and character for families and groups of up to 7 guests.\n\nHighlights:\n• 3 bedrooms with 7 beds and comfortable furnishings.\n• Warm, inviting living spaces.\n• Fully equipped modern kitchen.\n• Free WiFi, flat-screen TV, and all linen included.\n• Beautiful surroundings and outdoor spaces in the Alsace region.",
    isAvailable: true,
    color: "#eab308",
    image: "/images/Shelter B/076d893a-eb66-4d47-a942-e771f585ad9c.avif",
    gallery: [
      "/images/Shelter B/076d893a-eb66-4d47-a942-e771f585ad9c.avif",
      "/images/Shelter B/1b4eb0a9-8512-49e6-94a2-351868347766.avif",
      "/images/Shelter B/31ead890-02a6-4b96-ad51-343d87c1df92.avif",
      "/images/Shelter B/3d1424c3-9662-4f06-a4d9-739283119142.avif",
      "/images/Shelter B/4000cb42-596e-402b-b832-771f5264bf4c.avif",
      "/images/Shelter B/4421a38c-0911-4e74-9868-1b6b3e0b3560.avif",
      "/images/Shelter B/4c9d753b-b563-44ff-b5b4-f919d1cb22b5.avif",
      "/images/Shelter B/640244fc-f2da-430f-9272-2d834a3de6f2.avif",
      "/images/Shelter B/66f85b80-e5de-4c02-9753-1ae1944cef49.avif",
      "/images/Shelter B/6882f7b8-9f64-4959-a940-e68cd56c19d8.avif",
      "/images/Shelter B/68957628-27ae-4445-b633-c26b0aebc2a8.avif",
      "/images/Shelter B/68a17503-0cca-4643-8fa2-5fdfb4b84920.avif",
      "/images/Shelter B/6a43ebcf-a2cc-4558-a020-20635c096234.avif",
      "/images/Shelter B/6bd8b157-c7c9-440d-87c6-03dd68271093.avif",
      "/images/Shelter B/6d8d0152-8f93-4699-b4f5-2f48583aa4c2.avif",
      "/images/Shelter B/6e205d72-a96e-46c8-89c3-66e80c7b34f0.avif",
      "/images/Shelter B/71367ecf-11bf-4832-96b0-bf780c926c98.jpeg",
      "/images/Shelter B/9314cf53-9d12-4054-81f6-9ff09b0118e2.avif",
      "/images/Shelter B/9ab58200-a6d3-466f-adc0-438701898486.avif",
      "/images/Shelter B/ab2b08bc-3755-490a-8758-8550ec2fbb41.jpeg",
      "/images/Shelter B/c2edb7e8-4cad-4173-851d-854faa8a13cd.avif",
      "/images/Shelter B/ccd0e770-eef4-4bba-a3e3-3bef21914192.avif",
      "/images/Shelter B/d208790f-bae0-4862-99c3-d7889ecf92c4.avif",
      "/images/Shelter B/d8513b0a-5c60-4d98-9ac8-d5dd23da358c.avif",
      "/images/Shelter B/daebc782-3055-41ed-86eb-d427ee67c95d.avif",
      "/images/Shelter B/dec32cd1-f0a0-46ad-ac96-b18e4d1f0a12.avif",
      "/images/Shelter B/df8e4ce0-f8a4-47c4-ab7c-7d709b355848.avif",
      "/images/Shelter B/e0865593-07c9-4daf-b4bd-ce880acc24a8.avif",
      "/images/Shelter B/e6ff9fcb-f59f-45f7-9440-1085e24df24c.jpeg",
      "/images/Shelter B/f93a6104-879e-4d31-ad54-23d3c3f84dbd.avif",
    ],
    amenities: [
      "3 Bedrooms",
      "7 Beds",
      "1 Bathroom",
      "Outdoor Spaces",
      "Fully Equipped Kitchen",
      "Free Wi-Fi",
      "Flat-screen TV",
      "Bed Linen & Towels",
    ],
    pricing: [{ baseGuests: 4, basePrice: 6000, extraPersonFee: 2000 }],
  },
  {
    id: "la-maison-modern",
    name: "La Maison Modern",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 2,
    maxGuests: 15,
    description:
      "La Maison Modern – Entire Home in Griesheim-près-Molsheim, France\n\nA beautifully designed contemporary property offering premium comfort and refined living spaces for up to 15 guests.\n\nHighlights:\n• 5 spacious bedrooms with 13 beds and elegant bathrooms.\n• Large open-plan living area with designer furnishings.\n• Fully equipped modern kitchen.\n• Free WiFi, flat-screen TV, and all linen provided.\n• Stunning outdoor spaces and landscaped garden.\n\nPerfect for families and groups seeking luxury and comfort in the Alsace region of France.",
    isAvailable: true,
    color: "#10b981",
    image: "/images/LA MAISON MODERN/040b83f5-da2a-4eaf-a9f3-b06ff18eb617.avif",
    gallery: [
      "/images/LA MAISON MODERN/040b83f5-da2a-4eaf-a9f3-b06ff18eb617.avif",
      "/images/LA MAISON MODERN/0adaa473-2ac7-4b09-abb8-df390cc81fb8.avif",
      "/images/LA MAISON MODERN/10e20d1f-fa99-4bd1-920e-025f056ec4e6.avif",
      "/images/LA MAISON MODERN/14cc472f-22a4-44a4-8941-7590360a1adf.avif",
      "/images/LA MAISON MODERN/17bceb61-9840-4971-9cfd-8c78a683f1f8.avif",
      "/images/LA MAISON MODERN/17f9e68c-9528-4948-9143-358e189c010e.avif",
      "/images/LA MAISON MODERN/1953dd42-294c-436e-9e77-e175e41c6e2e.avif",
      "/images/LA MAISON MODERN/1ace6552-c2ee-4a61-be59-43f322cf8339.avif",
      "/images/LA MAISON MODERN/22d9e99d-6fa0-495f-b0cd-441a9caafed7.avif",
      "/images/LA MAISON MODERN/2921c4f4-ec4b-4cd9-ad66-d9bda78de6f7.avif",
      "/images/LA MAISON MODERN/2de597fb-ea4c-44c8-8269-fdde268dd670.avif",
      "/images/LA MAISON MODERN/305cbaf4-237a-4efb-bfef-dbcab3b3af4f.avif",
      "/images/LA MAISON MODERN/36d58e14-e633-4e56-a680-85e37e969125.avif",
      "/images/LA MAISON MODERN/39bb11b5-568e-40f0-97a9-6498b5d9af1f.avif",
      "/images/LA MAISON MODERN/3a082a41-b958-45bc-b457-0f0c6b499118.avif",
      "/images/LA MAISON MODERN/4ecd6667-c48e-45a0-b1fa-bc8e37c4eca8.avif",
      "/images/LA MAISON MODERN/4f25e4cc-070c-4160-a300-170273ce08e0.avif",
      "/images/LA MAISON MODERN/50b20991-4eb2-4c55-8444-981fd3a494c9.avif",
      "/images/LA MAISON MODERN/5180124e-a20d-4a54-a972-4acf56b52fa3.avif",
      "/images/LA MAISON MODERN/5c726889-0b9f-4aad-a382-c9185984de0c.avif",
      "/images/LA MAISON MODERN/63793a37-b52c-454c-be6e-31f0b2ceaedd.avif",
      "/images/LA MAISON MODERN/646c6d22-5df4-47a9-8a0d-5487e61add9b.avif",
      "/images/LA MAISON MODERN/6c555480-95d6-4765-a4ed-0dbc01cfafaa.avif",
      "/images/LA MAISON MODERN/6c85c09f-20e5-4815-b648-2f496875f818.avif",
      "/images/LA MAISON MODERN/6e58d3d7-1f6c-4b0d-b4bd-c811f6a37161.avif",
      "/images/LA MAISON MODERN/7612fcba-0a89-4bd9-b275-de95d86cb620.avif",
      "/images/LA MAISON MODERN/78006b73-c841-48bf-baaf-7128959ca41e.avif",
      "/images/LA MAISON MODERN/7c1cf32f-0008-42d0-a4fe-75496b94a900.avif",
      "/images/LA MAISON MODERN/839f3c5a-9db2-4787-8025-76ceee9a0900.avif",
      "/images/LA MAISON MODERN/8756b5e1-3731-43c3-8ee2-e7f3b289c43e.avif",
      "/images/LA MAISON MODERN/9090add1-836c-46f2-8fc7-4ff22f582b2c.avif",
      "/images/LA MAISON MODERN/a07811c7-6ba1-4242-b4ed-66b252a4b4da.avif",
      "/images/LA MAISON MODERN/a541d5ab-ffd2-4c8b-a0ee-3b97bad686c8.avif",
      "/images/LA MAISON MODERN/a859bde8-98db-42cf-9f3d-0a7e01b31572.avif",
      "/images/LA MAISON MODERN/bbd5fccc-0537-47fd-a5c3-e2ba52327e07.avif",
      "/images/LA MAISON MODERN/d1b9d3a4-daac-410b-83ea-9f580e064c37.avif",
      "/images/LA MAISON MODERN/e75245ff-ef04-491c-9892-3cd2ec2d1b99.avif",
      "/images/LA MAISON MODERN/e9a27937-ae28-4a9e-88be-70283ade1463.avif",
      "/images/LA MAISON MODERN/f3ecd408-3d23-45e3-b82e-85663ad877b6.avif",
      "/images/LA MAISON MODERN/f89c5b3f-edf4-4111-8e4c-1d887a4fc50c.avif",
    ],
    amenities: [
      "5 Bedrooms",
      "13 Beds",
      "2 Bathrooms",
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
    id: "refuge-de-la-martre",
    name: "Refuge de la Martre",
    type: "Villa",
    bedrooms: 6,
    bathrooms: 2,
    maxGuests: 15,
    description:
      "Refuge de la Martre – Entire Home in Griesheim-près-Molsheim, France\n\nA beautifully appointed property set in a natural woodland setting, perfect for larger groups and families seeking luxury and comfort.\n\nHighlights:\n• 6 spacious bedrooms with 14 beds and elegant bathrooms.\n• Warm, inviting living spaces.\n• Fully equipped modern kitchen.\n• Free WiFi, flat-screen TV, and all linen included.\n• Beautiful natural surroundings and outdoor spaces.\n\nAn idyllic retreat for groups seeking tranquility and a connection with nature in the Alsace region of France.",
    isAvailable: true,
    color: "#f59e0b",
    image: "/images/REFUGE DE LA MARtRE/015c3131-ead9-4952-baae-c32c96465618.avif",
    gallery: [
      "/images/REFUGE DE LA MARtRE/015c3131-ead9-4952-baae-c32c96465618.avif",
      "/images/REFUGE DE LA MARtRE/04e7fb89-afd7-41bd-80bd-5ce4c79c4769.avif",
      "/images/REFUGE DE LA MARtRE/06af1c7a-dd6a-4f07-9231-c7ce235c0311.avif",
      "/images/REFUGE DE LA MARtRE/0ced509b-2c18-4664-a5cc-62617d2bff79.avif",
      "/images/REFUGE DE LA MARtRE/0ebc2fba-0d36-4b0c-ad28-0093396ad8ec.avif",
      "/images/REFUGE DE LA MARtRE/151000f2-3268-4483-bece-f284f02963a3.avif",
      "/images/REFUGE DE LA MARtRE/1e51a16e-b837-4268-940a-6a232a9221b7.avif",
      "/images/REFUGE DE LA MARtRE/233cdd0b-58ab-4be7-90ec-3ae8fa7312be.avif",
      "/images/REFUGE DE LA MARtRE/374fca0b-db80-4276-b89b-95fcaf00a4dc.avif",
      "/images/REFUGE DE LA MARtRE/3e0880e0-0305-4d26-91f6-007317715bcb.avif",
      "/images/REFUGE DE LA MARtRE/41d4132e-74fd-441c-a1be-cfe974444e3e.avif",
      "/images/REFUGE DE LA MARtRE/46893453-303b-43fa-99e4-2f2a7d989e9d.avif",
      "/images/REFUGE DE LA MARtRE/4b281acc-6906-43e5-b770-b32cd81a0bb8.avif",
      "/images/REFUGE DE LA MARtRE/4b4cc263-1321-4b0d-bea7-3f680ed2c01a.avif",
      "/images/REFUGE DE LA MARtRE/4ff00f74-2f2d-4a4c-9b9c-8e0c1f4ebf0a.avif",
      "/images/REFUGE DE LA MARtRE/5a98b69b-59bc-4286-834b-2709ea7346de.avif",
      "/images/REFUGE DE LA MARtRE/6718b2f9-260f-417a-bbde-5798e5e1d85f.avif",
      "/images/REFUGE DE LA MARtRE/70685259-d269-4c51-84e6-0ebc3a3f670e.avif",
      "/images/REFUGE DE LA MARtRE/70a4ed72-9800-4ab1-90e8-77bb0cea5296.avif",
      "/images/REFUGE DE LA MARtRE/72b01297-f27a-47b4-b8dd-0a786d11ecf6.avif",
      "/images/REFUGE DE LA MARtRE/83b065e3-b673-4ddd-a05b-8ee512274eaa.avif",
      "/images/REFUGE DE LA MARtRE/950a7460-10fa-4428-8cee-b9d35f8e0305.avif",
      "/images/REFUGE DE LA MARtRE/9a0ad13f-a7f2-41c5-b692-b4547d82c039.avif",
      "/images/REFUGE DE LA MARtRE/9bb69b5d-1f09-41a4-97e2-7261f9b32bc5.avif",
      "/images/REFUGE DE LA MARtRE/a2d5ccd2-f8d2-4aba-96fa-e5feef3c2399.avif",
      "/images/REFUGE DE LA MARtRE/a3372a8b-df12-46ee-b561-b738dc6dc393.avif",
      "/images/REFUGE DE LA MARtRE/a6a5a722-3a9a-47eb-8cb7-89bfade6c9bd.avif",
      "/images/REFUGE DE LA MARtRE/a888279d-de8a-4fce-aaab-7a033df418bf.avif",
      "/images/REFUGE DE LA MARtRE/a95dae3f-9879-4d4a-97ba-0b01cac238a2.avif",
      "/images/REFUGE DE LA MARtRE/ad7b3bee-67b9-4add-a5ff-56e481db87b6.avif",
      "/images/REFUGE DE LA MARtRE/ad7bfcbd-23ad-4a3b-832c-32ace4335fc1.avif",
      "/images/REFUGE DE LA MARtRE/b1cd3d6e-4386-40e5-a044-b263f2f57da7.avif",
      "/images/REFUGE DE LA MARtRE/bc9f2e46-3cf6-4d63-bbaf-0cd2021185d3.avif",
      "/images/REFUGE DE LA MARtRE/c3f99f4b-3a49-46e2-a414-6c816f58633a.avif",
      "/images/REFUGE DE LA MARtRE/c73b1a96-b6e7-41cf-b36e-c8259b59f715.avif",
      "/images/REFUGE DE LA MARtRE/cbee101a-bfd2-4d17-9628-88780de74d5c.avif",
      "/images/REFUGE DE LA MARtRE/cc09ca88-4b9c-4235-ae7e-87fdcf3025f0.avif",
      "/images/REFUGE DE LA MARtRE/cf0537f5-ed0e-463b-bd4e-6fa3589ea7a9.avif",
      "/images/REFUGE DE LA MARtRE/d4f7fc31-2d48-4fbc-b2dc-ffd30eea9027.avif",
      "/images/REFUGE DE LA MARtRE/db5e63a5-0437-4c1d-8927-3b3515232f03.avif",
      "/images/REFUGE DE LA MARtRE/dd052e15-3f78-4e12-9bb2-ad64a3328a0c.avif",
      "/images/REFUGE DE LA MARtRE/e0aa4b29-271a-4254-a7ab-03db4ed688c8.avif",
      "/images/REFUGE DE LA MARtRE/e3f6e4c6-d415-433d-aeb1-471f7831f957.avif",
      "/images/REFUGE DE LA MARtRE/e75688cc-91e7-4b92-a90b-b45f75ece9d3.avif",
      "/images/REFUGE DE LA MARtRE/e76c3c15-3e90-4bad-baa8-cd8a7b56596d.avif",
      "/images/REFUGE DE LA MARtRE/eb64701d-f257-433f-992a-85453f98faf0.avif",
      "/images/REFUGE DE LA MARtRE/f29f20e5-ba5d-4831-8bbf-763da0577a33.avif",
      "/images/REFUGE DE LA MARtRE/fb990f12-19f0-4bc3-9445-5da94163d263.avif",
      "/images/REFUGE DE LA MARtRE/fc4b157b-b34c-4c50-a4a2-9c3083bd0470.avif",
    ],
    amenities: [
      "6 Bedrooms",
      "14 Beds",
      "2 Bathrooms",
      "Woodland Setting",
      "Outdoor Spaces",
      "Fully Equipped Kitchen",
      "Free Wi-Fi",
      "Flat-screen TV",
      "Bed Linen & Towels",
    ],
    pricing: [{ baseGuests: 5, basePrice: 8000, extraPersonFee: 2000 }],
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
