import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-6"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Our Blog
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Insights, tutorials, and updates from the ANNEK TECH team
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {categoryInfo[category as keyof typeof categoryInfo]?.name || category}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('folders')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'folders'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📁 Folders
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📋 List
              </button>
            </div>
          </div>
        </motion.div>

        {/* Blog Posts */}
        {viewMode === 'folders' ? (
          /* Folder View */
          <div className="space-y-4">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Category Header */}
                  <div className={`${categoryData?.color || 'bg-slate-500'} p-4 sm:p-6 text-white relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-xl sm:text-3xl">{categoryData?.icon || '📁'}</span>
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-3xl font-bold mb-1">{categoryData?.name || category}</h2>
                            <p className="text-white/90 text-sm sm:text-lg font-medium">{filteredCategoryPosts.length} post{filteredCategoryPosts.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCategory(category)}
                          className="px-3 py-2 sm:px-6 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl"
                        >
                          View All
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Posts Grid */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCategoryPosts.slice(0, 6).map((post, index) => (
                        <motion.article
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 hover:shadow-md transition-all duration-300 group"
                        >
                          <Link to={`/blog/${post.id}`} className="block">
                            <div className="relative h-32 overflow-hidden rounded-lg mb-2">
                              <img
                                src={post.content.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
                                alt={post.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                              {post.content.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>{formatDate(post.lastModified)}</span>
                              <span>{post.content.readTime} min read</span>
                            </div>
                          </Link>
                        </motion.article>
                      ))}
                    </div>
                    {filteredCategoryPosts.length > 6 && (
                      <div className="text-center mt-4">
                        <button
                          onClick={() => setSelectedCategory(category)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          View {filteredCategoryPosts.length - 6} more posts →
                        </button>
                      </div>
                    )}
                  </div>
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
              className="text-center py-12"
            >
              <div className="text-slate-400 text-lg">
                {searchTerm || selectedTag !== 'all' || selectedCategory !== 'all'
                  ? 'No blog posts found matching your criteria.' 
                  : 'No blog posts available yet. Check back soon!'
                }
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Featured Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.content.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category and Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${categoryInfo[post.content.category as keyof typeof categoryInfo]?.color || 'bg-slate-500'}`}>
                      {categoryInfo[post.content.category as keyof typeof categoryInfo]?.icon || '📁'} {categoryInfo[post.content.category as keyof typeof categoryInfo]?.name || post.content.category}
                    </span>
                    {(post.content.tags || []).slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-slate-600 dark:text-slate-300 mb-3 line-clamp-3">
                    {post.content.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-3">
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
                      <span>{post.content.readTime} min read</span>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group-hover:gap-3"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
          )
        )}
      </div>
    </div>
  );
};

export default Blog;
