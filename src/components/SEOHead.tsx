import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: object;
  noIndex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'ANNEK TECH - Digital Solutions',
  description = 'Transforming ideas into digital reality with cutting-edge software solutions',
  keywords = 'ANNEK TECH, software development, web development, digital solutions, technology, Ghana',
  canonicalUrl,
  ogImage = '/annek_tech.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta description
    updateMetaTag('name', 'description', description);
    
    // Update or create meta keywords
    const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    updateMetaTag('name', 'keywords', keywordsString);
    
    // Update or create canonical URL
    updateCanonicalUrl(canonicalUrl);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', canonicalUrl || window.location.href);
    updateMetaTag('property', 'og:site_name', 'ANNEK TECH');
    
    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', twitterCard);
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);
    
    // Add canonical URL
    if (canonicalUrl) {
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.setAttribute('href', canonicalUrl);
      } else {
        const canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        canonicalLink.href = canonicalUrl;
        document.head.appendChild(canonicalLink);
      }
    }

    // Add robots meta tag
    if (noIndex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      updateMetaTag('name', 'robots', 'index, follow');
    }
    
    // Add structured data
    if (structuredData) {
      addStructuredData(structuredData);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, twitterCard, structuredData, noIndex]);

  return null;
};

const updateMetaTag = (attribute: string, value: string, content: string) => {
  if (!content) return;
  
  let element = document.querySelector(`meta[${attribute}="${value}"]`);
  
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

const updateCanonicalUrl = (url?: string) => {
  if (!url) return;
  
  let element = document.querySelector('link[rel="canonical"]');
  
  if (element) {
    element.setAttribute('href', url);
  } else {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    element.setAttribute('href', url);
    document.head.appendChild(element);
  }
};

const addStructuredData = (data: object) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export default SEOHead;
