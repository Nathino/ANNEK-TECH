// Google Analytics 4 setup and utilities

// Replace with your actual Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Initialize Google Analytics
export const initializeGA = () => {
  if (typeof window === 'undefined') return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters);
  }
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

// Track SEO events
export const trackSEOEvent = (eventName: string, seoData: Record<string, any>) => {
  trackEvent(eventName, {
    event_category: 'SEO',
    ...seoData
  });
};

// Track performance events
export const trackPerformanceEvent = (metricName: string, value: number, pageType: string) => {
  trackEvent('web_vitals', {
    name: metricName,
    value: Math.round(value),
    event_category: 'Web Vitals',
    event_label: pageType
  });
};
