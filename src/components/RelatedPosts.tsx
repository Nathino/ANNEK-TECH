import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, TrendingUp, Tag } from 'lucide-react';
import BlogSuggestionEngine, { BlogPost, SuggestionScore } from '../utils/blogSuggestions';
import { optimizeImageUrl, FALLBACK_IMAGE } from '../utils/imageUtils';

interface RelatedPostsProps {
  currentPost: BlogPost;
  title?: string;
  maxPosts?: number;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ 
  currentPost, 
  title = "Related Articles",
  maxPosts = 4 
}) => {
  const [relatedPosts, setRelatedPosts] = useState<SuggestionScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        const suggestionEngine = new BlogSuggestionEngine();
        const related = await suggestionEngine.getRelatedPosts(currentPost, maxPosts);
        setRelatedPosts(related);
      } catch (error) {
        console.error('Error fetching related posts:', error);
        // Set empty related posts on error to prevent infinite loading
        setRelatedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent blocking the main thread
    const timeoutId = setTimeout(fetchRelatedPosts, 100);
    return () => clearTimeout(timeoutId);
  }, [currentPost, maxPosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'general': 'bg-slate-500',
      'technology': 'bg-blue-500',
      'web-development': 'bg-emerald-500',
      'tutorials': 'bg-purple-500',
      'news': 'bg-red-500',
      'case-studies': 'bg-orange-500',
      'tips': 'bg-yellow-500'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-500';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-32 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
    >
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        {title}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedPosts.map((item, index) => (
          <motion.div
            key={item.post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/blog/${item.post.id}`} className="block">
              <div className="relative overflow-hidden rounded-lg mb-3">
                <img
                  src={optimizeImageUrl(item.post.content.featuredImage || FALLBACK_IMAGE, 300, 200)}
                  alt={item.post.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-white rounded-full ${getCategoryColor(item.post.content.category || 'general')}`}>
                    {item.post.content.category || 'General'}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <div className="flex items-center gap-1 text-white text-xs">
                    <TrendingUp className="h-3 w-3" />
                    <span>Related</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {item.post.title}
                </h4>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                  {item.post.content.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{item.post.content.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.post.lastModified)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.post.content.readTime} min read</span>
                  </div>
                </div>
                
                {/* Suggestion reasons */}
                {item.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.reasons.slice(0, 2).map((reason, reasonIndex) => (
                      <span
                        key={reasonIndex}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full"
                      >
                        <Tag className="h-2 w-2" />
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
        >
          View All Articles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default RelatedPosts;
