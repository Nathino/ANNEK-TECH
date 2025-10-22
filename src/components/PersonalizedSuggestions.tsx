import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, Star, TrendingUp, Eye } from 'lucide-react';
import BlogSuggestionEngine, { BlogPost, SuggestionScore } from '../utils/blogSuggestions';
import { optimizeImageUrl, FALLBACK_IMAGE } from '../utils/imageUtils';

interface PersonalizedSuggestionsProps {
  title?: string;
  maxPosts?: number;
  showReasons?: boolean;
}

const PersonalizedSuggestions: React.FC<PersonalizedSuggestionsProps> = ({ 
  title = "Recommended for You",
  maxPosts = 6,
  showReasons = true
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionScore[]>([]);
  const [loading, setLoading] = useState(true);

  const getEngagementIcon = (score: number) => {
    if (score >= 8) return <Star className="h-4 w-4 text-yellow-500" />;
    if (score >= 5) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    return <Eye className="h-4 w-4 text-blue-500" />;
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const suggestionEngine = new BlogSuggestionEngine();
        const personalized = await suggestionEngine.generateSuggestions(undefined, maxPosts);
        setSuggestions(personalized);
      } catch (error) {
        console.error('Error fetching personalized suggestions:', error);
        // Set empty suggestions on error to prevent infinite loading
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent blocking the main thread
    const timeoutId = setTimeout(fetchSuggestions, 100);
    return () => clearTimeout(timeoutId);
  }, [maxPosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Type guard to ensure we're working with BlogPost
  const isValidBlogPost = (post: any): post is BlogPost => {
    return post && post.id && post.title && post.content;
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
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-2 md:p-4 border border-emerald-200 dark:border-emerald-700/50">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-emerald-500" />
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-32 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-2 md:p-4 border border-emerald-200 dark:border-emerald-700/50"
    >
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-emerald-500" />
          {title}
        </h3>
        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          Based on your interests
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {suggestions.filter(item => isValidBlogPost(item.post)).map((item, index) => (
          <motion.div
            key={item.post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/blog/${item.post.id}`} className="block">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-2 md:p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-700 group-hover:border-emerald-300 dark:group-hover:border-emerald-600">
                <div className="relative overflow-hidden rounded-lg mb-2">
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
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 text-white text-xs bg-black/50 rounded-full px-2 py-1">
                      {getEngagementIcon(item.score)}
                      <span>{Math.round(item.score)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
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
                      <span>{item.post.content.readTime} min</span>
                    </div>
                  </div>
                  
                  {/* Suggestion reasons */}
                  {showReasons && item.reasons.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Why recommended:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.reasons.slice(0, 2).map((reason, reasonIndex) => (
                          <span
                            key={reasonIndex}
                            className="inline-flex items-center px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-2 md:mt-4 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
        >
          Discover More Articles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default PersonalizedSuggestions;
