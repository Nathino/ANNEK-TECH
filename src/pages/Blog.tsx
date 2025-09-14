import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  content: {
    excerpt: string;
    content: string;
    featuredImage: string;
    tags: string[];
    author: string;
    readTime: number;
    category: string;
  };
  status: 'published' | 'draft';
  lastModified: string;
  createdAt: string;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'folders'>('folders');

  useEffect(() => {
    // Set SEO meta tags
    document.title = 'Blog - ANNEK TECH | Technology Insights & Updates';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read the latest technology insights, tutorials, and updates from the ANNEK TECH team. Expert advice on web development, software solutions, and digital transformation.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Read the latest technology insights, tutorials, and updates from the ANNEK TECH team. Expert advice on web development, software solutions, and digital transformation.';
      document.head.appendChild(meta);
    }

    // Add Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Blog - ANNEK TECH | Technology Insights & Updates');
    } else {
      const ogTitleMeta = document.createElement('meta');
      ogTitleMeta.setAttribute('property', 'og:title');
      ogTitleMeta.content = 'Blog - ANNEK TECH | Technology Insights & Updates';
      document.head.appendChild(ogTitleMeta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Read the latest technology insights, tutorials, and updates from the ANNEK TECH team.');
    } else {
      const ogDescMeta = document.createElement('meta');
      ogDescMeta.setAttribute('property', 'og:description');
      ogDescMeta.content = 'Read the latest technology insights, tutorials, and updates from the ANNEK TECH team.';
      document.head.appendChild(ogDescMeta);
    }

    const q = query(
      collection(db, 'content'),
      where('type', '==', 'blog'),
      where('status', '==', 'published'),
      orderBy('lastModified', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const blogPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];
        setPosts(blogPosts);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching blog posts:', error);
        toast.error('Failed to load blog posts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const allTags = Array.from(new Set(posts.flatMap(post => post.content.tags || [])));
  const allCategories = Array.from(new Set(posts.map(post => post.content.category || 'general')));

  // Category display names and icons
  const categoryInfo = {
    'general': { name: 'General', icon: '📁', color: 'bg-gradient-to-r from-slate-500 to-slate-600' },
    'technology': { name: 'Technology', icon: '💻', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    'web-development': { name: 'Web Development', icon: '🌐', color: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
    'tutorials': { name: 'Tutorials', icon: '📚', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    'news': { name: 'News', icon: '📰', color: 'bg-gradient-to-r from-red-500 to-red-600' },
    'case-studies': { name: 'Case Studies', icon: '📊', color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    'tips': { name: 'Tips & Tricks', icon: '💡', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.content.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === 'all' || (post.content.tags || []).includes(selectedTag);
    const matchesCategory = selectedCategory === 'all' || (post.content.category || 'general') === selectedCategory;
    
    return matchesSearch && matchesTag && matchesCategory;
  });

  // Group posts by category for folder view
  const postsByCategory = posts.reduce((acc, post) => {
    const category = post.content.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(post);
    return acc;
  }, {} as Record<string, BlogPost[]>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SEOHead
        title="ANNEK TECH Blog | Technology Insights & Articles"
        description="Discover the latest technology trends, web development insights, and software engineering best practices on the ANNEK TECH blog. Expert articles on programming"
        keywords={[
          'ANNEK TECH blog',
          'technology articles',
          'web development insights',
          'programming tutorials',
          'software engineering',
          'tech trends Ghana',
          'digital transformation',
          'coding best practices',
          'technology news',
          'development guides'
        ]}
        canonicalUrl="https://annektech.web.app/blog"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "ANNEK TECH Blog",
          "description": "Technology insights and web development articles by ANNEK TECH",
          "url": "https://annektech.web.app/blog",
          "publisher": {
            "@type": "Organization",
            "name": "ANNEK TECH",
            "url": "https://annektech.web.app"
          }
        }}
      />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative text-center max-w-5xl mx-auto mb-12"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Latest Updates
            </div>
            <h1 className="text-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              Our Blog
            </h1>
            <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover insights, tutorials, and cutting-edge updates from the ANNEK TECH team
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                {posts.length} Articles
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                {allCategories.length} Categories
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                Updated Weekly
              </span>
            </div>
          </div>
        </motion.div>

        {/* Advanced Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none w-full lg:w-48 px-4 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(category => (
                    <option key={category} value={category}>
                      {categoryInfo[category as keyof typeof categoryInfo]?.name || category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Tag Filter */}
              <div className="relative">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="appearance-none w-full lg:w-48 px-4 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base cursor-pointer"
                >
                  <option value="all">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center">
              <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1.5">
                <button
                  onClick={() => setViewMode('folders')}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'folders'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span className="mr-2">📁</span>
                  Category View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span className="mr-2">📋</span>
                  List View
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blog Posts */}
        {viewMode === 'folders' ? (
          /* Category View */
          <div className="space-y-8">
            {Object.entries(postsByCategory).map(([category, categoryPosts]) => {
              const categoryData = categoryInfo[category as keyof typeof categoryInfo];
              const filteredCategoryPosts = categoryPosts.filter(post => {
                const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     post.content.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     (post.content.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesTag = selectedTag === 'all' || (post.content.tags || []).includes(selectedTag);
                return matchesSearch && matchesTag;
              });

              if (filteredCategoryPosts.length === 0) return null;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="group"
                >
                  {/* Category Header */}
                  <div className={`${categoryData?.color || 'bg-slate-500'} rounded-2xl shadow-2xl overflow-hidden relative mb-8`}>
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>
                    
                    <div className="relative z-10 p-8 lg:p-12">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                            <span className="text-3xl lg:text-4xl">{categoryData?.icon || '📁'}</span>
                          </div>
                          <div>
                            <h2 className="text-2xl lg:text-4xl font-bold mb-2 text-white">{categoryData?.name || category}</h2>
                            <p className="text-white/90 text-lg lg:text-xl font-medium">
                              {filteredCategoryPosts.length} {filteredCategoryPosts.length === 1 ? 'Article' : 'Articles'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCategory(category)}
                          className="px-6 py-3 lg:px-8 lg:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 font-semibold text-white shadow-xl hover:shadow-2xl"
                        >
                          Explore All →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCategoryPosts.slice(0, 8).map((post, index) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600"
                      >
                        <Link to={`/blog/${post.id}`} className="block">
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={post.content.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
                              alt={post.title}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute top-4 right-4">
                              <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${categoryData?.color || 'bg-slate-500'}`}>
                                {categoryData?.icon || '📁'}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-lg">
                              {post.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 text-sm">
                              {post.content.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>{formatDate(post.lastModified)}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.content.readTime} min
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                  
                  {filteredCategoryPosts.length > 8 && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        View {filteredCategoryPosts.length - 8} More Articles
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Search className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchTerm || selectedTag !== 'all' || selectedCategory !== 'all'
                    ? 'No articles found' 
                    : 'No articles yet'
                  }
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm || selectedTag !== 'all' || selectedCategory !== 'all'
                    ? 'Try adjusting your search criteria or filters.' 
                    : 'Check back soon for new content!'
                  }
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  All Articles ({filteredPosts.length})
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Sorted by latest
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600"
                  >
                    {/* Featured Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={post.content.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${categoryInfo[post.content.category as keyof typeof categoryInfo]?.color || 'bg-slate-500'}`}>
                          {categoryInfo[post.content.category as keyof typeof categoryInfo]?.icon || '📁'} {categoryInfo[post.content.category as keyof typeof categoryInfo]?.name || post.content.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(post.content.tags || []).slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 text-sm">
                        {post.content.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.content.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.lastModified)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.content.readTime} min</span>
                        </div>
                      </div>

                      {/* Read More Button */}
                      <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group-hover:gap-3 font-medium"
                      >
                        Read Article
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Blog;
