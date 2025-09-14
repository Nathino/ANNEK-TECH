import { useEffect } from 'react';

// Declare gtag function for Google Analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    analytics: any;
  }
  const gtag: (...args: any[]) => void;
}

interface SEOMonitorProps {
  pageType: 'home' | 'blog' | 'portfolio' | 'contact' | 'admin';
  pageData?: {
    title?: string;
    description?: string;
    keywords?: string[];
    url?: string;
  };
}

const SEOMonitor: React.FC<SEOMonitorProps> = ({ pageType, pageData }) => {
  useEffect(() => {
    // Only run SEO monitoring in production
    if (process.env.NODE_ENV !== 'production') return;

    // Track page views for SEO analytics
    const trackPageView = () => {
      // Google Analytics 4 tracking
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
      }

      // Custom analytics tracking
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('Page Viewed', {
          page_type: pageType,
          page_title: document.title,
          page_url: window.location.href,
          timestamp: new Date().toISOString(),
          ...pageData
        });
      }
    };

    // Monitor Core Web Vitals
    const monitorWebVitals = () => {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lcp),
            event_category: 'Web Vitals',
            event_label: pageType
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const fid = (entry as any).processingStart - entry.startTime;
          
          if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(fid),
              event_category: 'Web Vitals',
              event_label: pageType
            });
          }
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Web Vitals',
            event_label: pageType
          });
        }
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Monitor SEO metrics
    const monitorSEOMetrics = () => {
      // Check if page has proper meta tags
      const hasTitle = document.title && document.title.length > 0;
      const hasDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
      const hasCanonical = document.querySelector('link[rel="canonical"]');
      const hasStructuredData = document.querySelector('script[type="application/ld+json"]');

      const seoScore = [
        hasTitle ? 25 : 0,
        hasDescription ? 25 : 0,
        hasCanonical ? 25 : 0,
        hasStructuredData ? 25 : 0
      ].reduce((a, b) => a + b, 0);

      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'seo_metrics', {
          event_category: 'SEO',
          event_label: pageType,
          value: seoScore,
          custom_parameters: {
            has_title: hasTitle,
            has_description: !!hasDescription,
            has_canonical: !!hasCanonical,
            has_structured_data: !!hasStructuredData
          }
        });
      }
    };

    // Monitor page load performance
    const monitorPerformance = () => {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics = {
            dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            load_complete: navigation.loadEventEnd - navigation.loadEventStart,
            first_byte: navigation.responseStart - navigation.requestStart,
            dom_interactive: navigation.domInteractive - (navigation as any).navigationStart
          };

          if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', 'page_performance', {
              event_category: 'Performance',
              event_label: pageType,
              custom_parameters: metrics
            });
          }
        }
      });
    };

    // Run monitoring functions
    trackPageView();
    monitorWebVitals();
    monitorSEOMetrics();
    monitorPerformance();

    // Monitor for SEO issues
    const checkSEOIssues = () => {
      const issues: string[] = [];

      // Check for missing alt attributes on images
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images missing alt attributes`);
      }

      // Check for missing heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let hasH1 = false;
      let headingOrder = true;
      let lastLevel = 0;

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (heading.tagName === 'H1') hasH1 = true;
        if (level > lastLevel + 1) headingOrder = false;
        lastLevel = level;
      });

      if (!hasH1) {
        issues.push('Page missing H1 heading');
      }

      if (!headingOrder) {
        issues.push('Heading hierarchy is not properly ordered');
      }

      // Check for internal links without proper attributes
      const internalLinks = document.querySelectorAll('a[href^="/"]:not([rel])');
      if (internalLinks.length > 0) {
        issues.push(`${internalLinks.length} internal links missing rel attributes`);
      }

      // Report issues
      if (issues.length > 0 && typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'seo_issues', {
          event_category: 'SEO',
          event_label: pageType,
          custom_parameters: {
            issues: issues.join('; '),
            issue_count: issues.length
          }
        });
      }
    };

    // Run SEO checks after a short delay to ensure DOM is fully loaded
    setTimeout(checkSEOIssues, 1000);

  }, [pageType, pageData]);

  return null;
};

export default SEOMonitor;
