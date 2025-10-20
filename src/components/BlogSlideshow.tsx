import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  content: {
    excerpt: string;
    featuredImage: string;
    tags: string[];
    author: string;
    readTime: number;
    category: string;
  };
  lastModified: string;
  createdAt: string;
}

const BlogSlideshow: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'content'),
      where('type', '==', 'blog'),
      where('status', '==', 'published'),
      orderBy('lastModified', 'desc'),
      limit(6) // Limit to 6 most recent posts for slideshow
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

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || posts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= posts.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, posts.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Navigation functions
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= posts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? posts.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Category display names and colors
  const categoryInfo = {
    'general': { name: 'General', color: 'bg-slate-500', icon: '📁' },
    'technology': { name: 'Technology', color: 'bg-blue-500', icon: '💻' },
    'web-development': { name: 'Web Development', color: 'bg-emerald-500', icon: '🌐' },
    'tutorials': { name: 'Tutorials', color: 'bg-purple-500', icon: '📚' },
    'news': { name: 'News', color: 'bg-red-500', icon: '📰' },
    'case-studies': { name: 'Case Studies', color: 'bg-orange-500', icon: '📊' },
    'tips': { name: 'Tips & Tricks', color: 'bg-yellow-500', icon: '💡' }
  };

  if (loading) {
    return (
      <section className="py-4 sm:py-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null; // Don't show the section if there are no blog posts
  }

  return (
    <section className="py-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Latest from Our Blog
          </h2>
          <motion.div 
            className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-4"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.5 }}
          ></motion.div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Stay updated with our latest insights, tutorials, and technology trends
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Carousel Wrapper */}
          <div 
            className="relative overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Navigation Buttons */}
            {posts.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110"
                  aria-label="Previous posts"
                >
                  <ChevronLeft className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110"
                  aria-label="Next posts"
                >
                  <ChevronRight className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </button>
              </>
            )}

            {/* Carousel Track */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="flex gap-6"
                  animate={{
                    x: `-${currentIndex * (100 / (isMobile ? 1 : Math.min(posts.length, 3)))}%`
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    duration: 1.2
                  }}
                  style={{
                    width: `${(posts.length / (isMobile ? 1 : Math.min(posts.length, 3))) * 100}%`
                  }}
                >
                  {posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 h-fit flex-shrink-0"
                    style={{ width: `${100 / (isMobile ? 1 : Math.min(posts.length, 3))}%` }}
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Link to={`/blog/${post.id}`} className="block h-full flex flex-col">
                      {/* Featured Image - Fixed Height */}
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          src={post.content.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Category Badge */}
                        <motion.div 
                          className="absolute top-3 left-3"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full ${
                            categoryInfo[post.content.category as keyof typeof categoryInfo]?.color || 'bg-slate-500'
                          }`}>
                            <span className="text-sm">
                              {categoryInfo[post.content.category as keyof typeof categoryInfo]?.icon || '📁'}
                            </span>
                            {categoryInfo[post.content.category as keyof typeof categoryInfo]?.name || 'General'}
                          </span>
                        </motion.div>

                        {/* Read Time */}
                        <motion.div 
                          className="absolute top-3 right-3"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <span className="px-2 py-1 text-xs bg-black/50 backdrop-blur-sm text-white rounded-full">
                            {post.content.readTime} min read
                          </span>
                        </motion.div>
                      </div>

                      {/* Content - Fixed Layout */}
                      <div className="p-4 flex flex-col flex-grow">
                        <motion.h3 
                          className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-base"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          {post.title}
                        </motion.h3>
                        <motion.p 
                          className="text-slate-600 dark:text-slate-300 line-clamp-3 mb-3 text-sm flex-grow"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          {post.content.excerpt}
                        </motion.p>

                        {/* Meta Information */}
                        <motion.div 
                          className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{post.content.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.lastModified)}</span>
                          </div>
                        </motion.div>

                        {/* Read More Button */}
                        <motion.div 
                          className="mt-auto"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-medium text-sm group-hover:gap-2">
                            Read Article
                            <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                          </span>
                        </motion.div>
                      </div>
                    </Link>
                  </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Indicator */}
            {posts.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: posts.length }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentIndex === index
                        ? 'bg-emerald-500 w-8'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              View All Articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSlideshow;
