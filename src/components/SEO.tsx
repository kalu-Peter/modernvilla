import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const BASE_URL = "https://alsacehideaways.fr";
const DEFAULT_IMAGE = `${BASE_URL}/images/hero.jpg`;

export default function SEO({
  title,
  description,
  image,
  url,
  type = "website",
}: SEOProps) {
  const { t, i18n } = useTranslation();
  const fullTitle = title
    ? `${title} ${t("seo.titleSuffix")}`
    : t("seo.defaultTitle");
  const metaDesc = description ?? t("seo.defaultDescription");
  const metaImage = image
    ? image.startsWith("http")
      ? image
      : `${BASE_URL}${image}`
    : DEFAULT_IMAGE;
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet htmlAttributes={{ lang: i18n.language }}>
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
