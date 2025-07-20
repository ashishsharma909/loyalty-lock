import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({
  title = "Loyalty Lock - AI-Powered Customer Churn Prevention",
  description = "Revolutionary AI platform that predicts and prevents customer churn with hyper-realistic analytics and cinematic user experience. Transform your customer retention strategy.",
  keywords = "customer churn, AI analytics, retention platform, predictive analytics, customer loyalty, business intelligence, machine learning, customer experience",
  image = "/loyalty-lock-og.jpg",
  url = "https://loyalty-lock.netlify.app",
  type = "website",
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let element = document.querySelector(
        `meta[${attribute}="${name}"]`,
      ) as HTMLMetaElement;

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.content = content;
    };

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", "Ashish Sharma");
    updateMetaTag("robots", "index, follow");
    updateMetaTag("viewport", "width=device-width, initial-scale=1.0");

    // Open Graph tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", image, true);
    updateMetaTag("og:url", url, true);
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:site_name", "Loyalty Lock", true);

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);
    updateMetaTag("twitter:creator", "@ashishsharma");

    // Additional meta tags for PWA and mobile
    updateMetaTag("theme-color", "#0a0a0a");
    updateMetaTag("apple-mobile-web-app-capable", "yes");
    updateMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
    updateMetaTag("apple-mobile-web-app-title", "Loyalty Lock");

    // Preconnect to external domains for performance
    const addPreconnect = (href: string) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = href;
        document.head.appendChild(link);
      }
    };

    addPreconnect("https://fonts.googleapis.com");
    addPreconnect("https://fonts.gstatic.com");

    // Structured data for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Loyalty Lock",
      description: description,
      url: url,
      author: {
        "@type": "Person",
        name: "Ashish Sharma",
      },
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    };

    // Update or create structured data script
    let scriptElement = document.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    if (!scriptElement) {
      scriptElement = document.createElement("script");
      scriptElement.type = "application/ld+json";
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify(structuredData);

    // Add canonical link
    let canonicalLink = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;

    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.href = url;
  }, [title, description, keywords, image, url, type]);

  return null; // This component doesn't render anything
};

export default SEOHead;
