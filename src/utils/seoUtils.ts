// SEO utility functions for better search engine optimization

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: object;
  noIndex?: boolean;
}

// Generate SEO-friendly title
export const generateSEOTitle = (title: string, siteName: string = 'ANNEK TECH', maxLength: number = 60): string => {
  const fullTitle = `${title} | ${siteName}`;
  return fullTitle.length > maxLength ? title : fullTitle;
};

// Generate SEO-friendly description
export const generateSEODescription = (content: string, maxLength: number = 160): string => {
  // Remove HTML tags and extra whitespace
  const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength - 3);
  const lastSentenceEnd = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'));
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
};

// Generate URL slug
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Generate keywords from content
export const generateKeywords = (title: string, content: string, tags: string[] = []): string[] => {
  const baseKeywords = [
    'ANNEK TECH',
    'web development',
    'software development',
    'digital solutions',
    'Ghana technology'
  ];
  
  // Extract words from title and content
  const text = `${title} ${content}`.toLowerCase();
  const words = text.match(/\b\w{4,}\b/g) || [];
  
  // Count word frequency
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    if (word.length >= 4) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Get most frequent words
  const frequentWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  // Combine all keywords and remove duplicates
  const allKeywords = [...baseKeywords, ...tags, ...frequentWords];
  return [...new Set(allKeywords)].slice(0, 15);
};

// Generate blog post structured data
export const generateBlogStructuredData = (post: {
  id: string;
  title: string;
  content: { excerpt: string; content: string; featuredImage?: string; author: string; tags: string[] };
  lastModified: string;
  createdAt: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.content.excerpt,
    "image": post.content.featuredImage || "https://annektech.web.app/annek_tech.png",
    "author": {
      "@type": "Organization",
      "name": post.content.author || "ANNEK TECH"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ANNEK TECH",
      "logo": {
        "@type": "ImageObject",
        "url": "https://annektech.web.app/annek_tech.png"
      }
    },
    "datePublished": post.createdAt,
    "dateModified": post.lastModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://annektech.web.app/blog/${post.id}`
    },
    "keywords": post.content.tags.join(', '),
    "articleSection": "Technology",
    "wordCount": post.content.content.split(' ').length,
    "inLanguage": "en-US"
  };
};

// Generate organization structured data
export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ANNEK TECH",
    "description": "Transforming ideas into digital reality with cutting-edge software solutions",
    "url": "https://annektech.web.app",
    "logo": "https://annektech.web.app/annek_tech.png",
    "sameAs": [
      "https://twitter.com/annektech",
      "https://facebook.com/annektech",
      "https://instagram.com/annektech"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+233547214248",
      "contactType": "customer service",
      "email": "annektech.gh@gmail.com",
      "areaServed": "GH",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Opposite Ghanass SHS",
      "addressLocality": "Koforidua",
      "addressRegion": "Eastern Region",
      "addressCountry": "GH"
    },
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "ANNEK TECH Team"
      }
    ]
  };
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://annektech.web.app${item.url}`
    }))
  };
};

// Validate SEO data
export const validateSEOData = (seoData: SEOData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!seoData.title || seoData.title.length === 0) {
    errors.push('Title is required');
  } else if (seoData.title.length > 60) {
    errors.push('Title should be 60 characters or less');
  }
  
  if (!seoData.description || seoData.description.length === 0) {
    errors.push('Description is required');
  } else if (seoData.description.length > 160) {
    errors.push('Description should be 160 characters or less');
  }
  
  if (!seoData.canonicalUrl || !seoData.canonicalUrl.startsWith('https://')) {
    errors.push('Valid canonical URL is required');
  }
  
  if (seoData.keywords.length === 0) {
    errors.push('At least one keyword is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate meta tags for social sharing
export const generateSocialMetaTags = (seoData: SEOData) => {
  return {
    // Open Graph
    'og:title': seoData.title,
    'og:description': seoData.description,
    'og:image': seoData.ogImage || 'https://annektech.web.app/annek_tech.png',
    'og:url': seoData.canonicalUrl,
    'og:type': seoData.ogType || 'website',
    'og:site_name': 'ANNEK TECH',
    
    // Twitter Card
    'twitter:card': seoData.twitterCard || 'summary_large_image',
    'twitter:title': seoData.title,
    'twitter:description': seoData.description,
    'twitter:image': seoData.ogImage || 'https://annektech.web.app/annek_tech.png',
    
    // Standard meta
    'description': seoData.description,
    'keywords': seoData.keywords.join(', '),
    'robots': seoData.noIndex ? 'noindex, nofollow' : 'index, follow'
  };
};
