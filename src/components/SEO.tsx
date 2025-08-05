import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, getSchemaOrg } from '../config/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: any;
}

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image = '/images/aiquaa-logo.png',
  url,
  type = 'website',
  schema
}: SEOProps) => {
  const siteTitle = title || SEO_CONFIG.site.name;
  const siteDescription = description || SEO_CONFIG.site.description;
  const siteKeywords = keywords || SEO_CONFIG.site.keywords;
  const siteUrl = url || SEO_CONFIG.site.url;
  const fullImageUrl = image.startsWith('http') ? image : `${SEO_CONFIG.site.url}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content={SEO_CONFIG.site.author} />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={siteUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={SEO_CONFIG.site.name} />
      <meta property="og:locale" content={SEO_CONFIG.site.locale} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={siteDescription} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:site" content={SEO_CONFIG.social.twitter.site} />
      <meta property="twitter:creator" content={SEO_CONFIG.social.twitter.handle} />
      
      {/* Schema.org Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
      
      {/* Default Organization Schema if no custom schema provided */}
      {!schema && (
        <script type="application/ld+json">
          {JSON.stringify(getSchemaOrg())}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 