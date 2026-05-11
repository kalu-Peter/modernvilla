import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const BASE_URL = "https://themodernrefuge.co.ke";
const DEFAULT_IMAGE = `${BASE_URL}/images/The Aloe Refuge/IMG_20201002_165212.jpg`;

export default function SEO({ title, description, image, url, type = "website" }: SEOProps) {
  const fullTitle = title
    ? `${title} — The Modern Refuge, Strasbourg, France`
    : "The Modern Refuge — Luxury Holiday Rentals in Strasbourg, France";
  const metaDesc =
    description ??
    "Discover exceptional holiday properties across Strasbourg, France. The Modern Refuge offers handpicked retreats — from serene countryside villas to elegant woodland escapes.";
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
