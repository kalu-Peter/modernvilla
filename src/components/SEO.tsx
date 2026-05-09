import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const BASE_URL = "https://crocodilelodge.co.ke";
const DEFAULT_IMAGE = `${BASE_URL}/images/crocodile/blue/IMG_20260202_180003.jpg`;

export default function SEO({ title, description, image, url, type = "website" }: SEOProps) {
  const fullTitle = title
    ? `${title} — Crocodile Lodge, Diani Beach`
    : "Crocodile Lodge — Luxury Villas & Lodge, Diani Beach Kenya";
  const metaDesc =
    description ??
    "Luxury 3-bedroom villas and a large group lodge steps from Diani Beach, Kenya. Private pool, tropical garden, and the Indian Ocean at your doorstep.";
  const metaImage = image ? (image.startsWith("http") ? image : `${BASE_URL}${image}`) : DEFAULT_IMAGE;
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}
