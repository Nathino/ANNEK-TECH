import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BlogPost {
  id: string;
  title: string;
  lastModified: string;
  slug?: string;
  content?: {
    featuredImage?: string;
    excerpt?: string;
  };
}

const Sitemap: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const q = query(
          collection(db, 'content'),
          where('type', '==', 'blog'),
          where('status', '==', 'published'),
          orderBy('lastModified', 'desc')
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];
        
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const generateSitemap = () => {
    const baseUrl = 'https://annektech.web.app';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly', lastmod: currentDate },
      { url: '/portfolio', priority: '0.9', changefreq: 'monthly', lastmod: currentDate },
      { url: '/blog', priority: '0.9', changefreq: 'weekly', lastmod: currentDate },
      { url: '/contact', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
      { url: '/sitemap', priority: '0.3', changefreq: 'monthly', lastmod: currentDate }
    ];

    const blogPages = blogPosts.map(post => ({
      url: `/blog/${post.id}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: new Date(post.lastModified).toISOString().split('T')[0]
    }));

    const allPages = [...staticPages, ...blogPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => {
  let urlEntry = `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;
  
  // Add image sitemap for blog posts
  if (page.url.startsWith('/blog/')) {
    const post = blogPosts.find(p => `/blog/${p.id}` === page.url);
    if (post?.content?.featuredImage) {
      urlEntry += `
    <image:image>
      <image:loc>${post.content.featuredImage}</image:loc>
      <image:title>${post.title}</image:title>
      <image:caption>${post.content.excerpt || post.title}</image:caption>
    </image:image>`;
    }
  }
  
  urlEntry += `
  </url>`;
  return urlEntry;
}).join('\n')}
</urlset>`;

    return sitemap;
  };

  const downloadSitemap = () => {
    const sitemap = generateSitemap();
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Sitemap Generator
          </h1>
          
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Generate an XML sitemap for your website including all published blog posts.
            </p>
            
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Sitemap Contents:</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>• Static pages (Home, Portfolio, Blog, Contact)</li>
                <li>• {blogPosts.length} published blog posts</li>
                <li>• SEO-optimized URLs and priorities</li>
                <li>• Last modified dates for blog posts</li>
              </ul>
            </div>

            <button
              onClick={downloadSitemap}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Download Sitemap.xml
            </button>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Preview Sitemap
            </h3>
            <pre className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 overflow-x-auto text-sm text-slate-600 dark:text-slate-300">
              {generateSitemap()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
