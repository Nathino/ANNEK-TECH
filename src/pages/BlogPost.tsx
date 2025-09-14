import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Tag, Eye, Heart, Share2, MessageCircle } from 'lucide-react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import SEOMonitor from '../components/SEOMonitor';
import { generateBlogStructuredData, generateBreadcrumbStructuredData } from '../utils/seoUtils';

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
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
}

const BlogPost: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Array<{id: string, name: string, email: string, comment: string, createdAt: string}>>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const docRef = doc(db, 'content', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.type === 'blog' && data.status === 'published') {
            const blogPost = {
              id: docSnap.id,
              ...data,
              views: data.views || 0,
              likes: data.likes || 0,
              shares: data.shares || 0,
              comments: data.comments || 0
            } as BlogPost;
            setPost(blogPost);

            // Track view
            try {
              await updateDoc(docRef, {
                views: increment(1),
                lastViewed: new Date().toISOString()
              });
            } catch (error) {
              console.error('Error tracking view:', error);
            }

            // Set comprehensive SEO meta tags
            const seoTitle = data.seoTitle || data.title;
            const seoDescription = data.seoDescription || data.content?.excerpt || data.title;
            const featuredImage = data.content?.featuredImage;
            const tags = data.content?.tags || [];
            const author = data.content?.author || 'ANNEK TECH';
            const publishedDate = data.lastModified || data.createdAt;

            // Set page title
            document.title = `${seoTitle} - ANNEK TECH Blog`;

            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
              metaDescription.setAttribute('content', seoDescription);
            } else {
              const meta = document.createElement('meta');
              meta.name = 'description';
              meta.content = seoDescription;
              document.head.appendChild(meta);
            }

            // Add meta keywords using tags
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
              metaKeywords.setAttribute('content', tags.join(', '));
            } else {
              const keywordsMeta = document.createElement('meta');
              keywordsMeta.name = 'keywords';
              keywordsMeta.content = tags.join(', ');
              document.head.appendChild(keywordsMeta);
            }

            // Add author meta tag
            const metaAuthor = document.querySelector('meta[name="author"]');
            if (metaAuthor) {
              metaAuthor.setAttribute('content', author);
            } else {
              const authorMeta = document.createElement('meta');
              authorMeta.name = 'author';
              authorMeta.content = author;
              document.head.appendChild(authorMeta);
            }

            // Add publication date meta tag
            const metaDate = document.querySelector('meta[name="article:published_time"]');
            if (metaDate) {
              metaDate.setAttribute('content', publishedDate);
            } else {
              const dateMeta = document.createElement('meta');
              dateMeta.name = 'article:published_time';
              dateMeta.content = publishedDate;
              document.head.appendChild(dateMeta);
            }

            // Add Open Graph tags
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
              ogTitle.setAttribute('content', seoTitle);
            } else {
              const ogTitleMeta = document.createElement('meta');
              ogTitleMeta.setAttribute('property', 'og:title');
              ogTitleMeta.content = seoTitle;
              document.head.appendChild(ogTitleMeta);
            }

            const ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription) {
              ogDescription.setAttribute('content', seoDescription);
            } else {
              const ogDescMeta = document.createElement('meta');
              ogDescMeta.setAttribute('property', 'og:description');
              ogDescMeta.content = seoDescription;
              document.head.appendChild(ogDescMeta);
            }

            const ogType = document.querySelector('meta[property="og:type"]');
            if (ogType) {
              ogType.setAttribute('content', 'article');
            } else {
              const ogTypeMeta = document.createElement('meta');
              ogTypeMeta.setAttribute('property', 'og:type');
              ogTypeMeta.content = 'article';
              document.head.appendChild(ogTypeMeta);
            }

            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) {
              ogUrl.setAttribute('content', window.location.href);
            } else {
              const ogUrlMeta = document.createElement('meta');
              ogUrlMeta.setAttribute('property', 'og:url');
              ogUrlMeta.content = window.location.href;
              document.head.appendChild(ogUrlMeta);
            }

            if (featuredImage) {
              const ogImage = document.querySelector('meta[property="og:image"]');
              if (ogImage) {
                ogImage.setAttribute('content', featuredImage);
              } else {
                const ogImageMeta = document.createElement('meta');
                ogImageMeta.setAttribute('property', 'og:image');
                ogImageMeta.content = featuredImage;
                document.head.appendChild(ogImageMeta);
              }
            }

            // Add Twitter Card tags
            const twitterCard = document.querySelector('meta[name="twitter:card"]');
            if (twitterCard) {
              twitterCard.setAttribute('content', 'summary_large_image');
            } else {
              const twitterCardMeta = document.createElement('meta');
              twitterCardMeta.name = 'twitter:card';
              twitterCardMeta.content = 'summary_large_image';
              document.head.appendChild(twitterCardMeta);
            }

            const twitterTitle = document.querySelector('meta[name="twitter:title"]');
            if (twitterTitle) {
              twitterTitle.setAttribute('content', seoTitle);
            } else {
              const twitterTitleMeta = document.createElement('meta');
              twitterTitleMeta.name = 'twitter:title';
              twitterTitleMeta.content = seoTitle;
              document.head.appendChild(twitterTitleMeta);
            }

            const twitterDescription = document.querySelector('meta[name="twitter:description"]');
            if (twitterDescription) {
              twitterDescription.setAttribute('content', seoDescription);
            } else {
              const twitterDescMeta = document.createElement('meta');
              twitterDescMeta.name = 'twitter:description';
              twitterDescMeta.content = seoDescription;
              document.head.appendChild(twitterDescMeta);
            }

            if (featuredImage) {
              const twitterImage = document.querySelector('meta[name="twitter:image"]');
              if (twitterImage) {
                twitterImage.setAttribute('content', featuredImage);
              } else {
                const twitterImageMeta = document.createElement('meta');
                twitterImageMeta.name = 'twitter:image';
                twitterImageMeta.content = featuredImage;
                document.head.appendChild(twitterImageMeta);
              }
            }

            // Generate and inject structured data using utility
            const structuredData = generateBlogStructuredData(blogPost);
            const breadcrumbData = generateBreadcrumbStructuredData([
              { name: 'Home', url: '/' },
              { name: 'Blog', url: '/blog' },
              { name: seoTitle, url: window.location.pathname }
            ]);

            // Inject structured data into the page
            const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
            if (existingStructuredData) {
              existingStructuredData.remove();
            }

            // Add blog post structured data
            const blogScript = document.createElement('script');
            blogScript.type = 'application/ld+json';
            blogScript.textContent = JSON.stringify(structuredData);
            document.head.appendChild(blogScript);

            // Add breadcrumb structured data
            const breadcrumbScript = document.createElement('script');
            breadcrumbScript.type = 'application/ld+json';
            breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
            document.head.appendChild(breadcrumbScript);

          } else {
            toast.error('Blog post not found or not published');
          }
        } else {
          toast.error('Blog post not found');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    if (!post || !id) return;
    
    try {
      const docRef = doc(db, 'content', id);
      await updateDoc(docRef, {
        likes: increment(liked ? -1 : 1)
      });
      
      setPost(prev => prev ? {
        ...prev,
        likes: (prev.likes || 0) + (liked ? -1 : 1)
      } : null);
      
      setLiked(!liked);
      toast.success(liked ? 'Unliked!' : 'Liked!');
    } catch (error) {
      console.error('Error updating likes:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = async () => {
    if (!post) return;
    
    try {
      const docRef = doc(db, 'content', post.id);
      await updateDoc(docRef, {
        shares: increment(1)
      });
      
      setPost(prev => prev ? {
        ...prev,
        shares: (prev.shares || 0) + 1
      } : null);
      
      // Copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;
    
    try {
      // In a real app, you'd save to Firestore
      const comment = {
        id: Date.now().toString(),
        name: 'Anonymous User',
        email: 'user@example.com',
        comment: newComment,
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      // Update comment count
      const docRef = doc(db, 'content', post.id);
      await updateDoc(docRef, {
        comments: increment(1)
      });
      
      setPost(prev => prev ? {
        ...prev,
        comments: (prev.comments || 0) + 1
      } : null);
      
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Blog Post Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SEOMonitor 
        pageType="blog" 
        pageData={{
          title: post?.title,
          description: post?.content?.excerpt,
          keywords: post?.content?.tags,
          url: window.location.href
        }}
      />
      <div className="w-full max-w-none px-2 sm:px-4 lg:px-8 xl:px-12 py-4 md:py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 md:mb-8"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-slate-800/50 backdrop-blur-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-lg hover:shadow-xl text-sm md:text-base"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4 md:mb-8"
        >
          <div className="relative h-64 md:h-80 lg:h-[28rem] xl:h-[32rem] 2xl:h-[36rem] overflow-hidden rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl">
            <img
              src={post.content.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-3 md:bottom-6 left-3 md:left-6 right-3 md:right-6">
              <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-4">
                <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 text-xs md:text-sm bg-emerald-500/90 backdrop-blur-sm text-white font-medium rounded-full">
                  📁 {post.content.category || 'General'}
                </span>
                {(post.content.tags || []).slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 md:px-3 py-1 text-xs md:text-sm bg-white/20 backdrop-blur-sm text-white font-medium rounded-full"
                  >
                    <Tag className="h-2 w-2 md:h-3 md:w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-4 md:mb-8"
        >
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-slate-200 dark:border-slate-700 p-3 md:p-6 lg:p-8">
            {/* Title */}
            <h1 className="text-sm md:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-white mb-1 md:mb-4 leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xs md:text-base lg:text-lg text-slate-600 dark:text-slate-300 mb-2 md:mb-6 leading-relaxed">
              {post.content.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-1 md:gap-4 text-slate-500 dark:text-slate-400 mb-1 md:mb-4 text-xs md:text-sm">
              <div className="flex items-center gap-1">
                <User className="h-2 w-2 md:h-5 md:w-5" />
                <span className="font-medium text-xs">{post.content.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-2 w-2 md:h-5 md:w-5" />
                <span className="text-xs">{formatDate(post.lastModified)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-2 w-2 md:h-5 md:w-5" />
                <span className="text-xs">{post.content.readTime} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-2 w-2 md:h-5 md:w-5" />
                <span className="text-xs">{post.views || 0} views</span>
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="flex flex-wrap items-center gap-1 md:gap-3 mt-2 md:mt-0">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-1.5 md:px-4 py-0.5 md:py-2 rounded-md md:rounded-xl transition-all duration-200 font-medium text-xs md:text-sm ${
                  liked 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-lg'
                }`}
              >
                <Heart className={`h-2.5 w-2.5 md:h-5 md:w-5 ${liked ? 'fill-current' : ''}`} />
                <span>{post.likes || 0} {liked ? 'Liked' : 'Like'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-1.5 md:px-4 py-0.5 md:py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md md:rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium text-xs md:text-sm hover:shadow-lg"
              >
                <Share2 className="h-2.5 w-2.5 md:h-5 md:w-5" />
                <span>{post.shares || 0} Share</span>
              </button>
              
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 px-1.5 md:px-4 py-0.5 md:py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md md:rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium text-xs md:text-sm hover:shadow-lg lg:hidden"
              >
                <MessageCircle className="h-2.5 w-2.5 md:h-5 md:w-5" />
                <span>{post.comments || 0} Comment{post.comments !== 1 ? 's' : ''}</span>
              </button>
              
              {/* Desktop Comment Count Display */}
              <div className="hidden lg:flex items-center gap-1 px-2 md:px-4 py-1.5 md:py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg md:rounded-xl">
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                <span>{post.comments || 0} Comment{post.comments !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area - Two Column Layout on Desktop */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Main Article Content */}
          <div className="flex-1 lg:max-w-4xl">
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mb-4 md:mb-8"
            >
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 md:p-6 lg:p-8">
                  <div 
                    className="prose prose-xs md:prose-sm max-w-none dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:text-slate-900 dark:prose-code:text-white prose-code:bg-slate-100 dark:prose-code:bg-slate-700 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-700 prose-blockquote:border-emerald-500 prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 leading-relaxed text-xs md:text-sm"
                    dangerouslySetInnerHTML={{ __html: post.content.content.replace(/\n/g, '<br />') }}
                  />
                </div>
              </div>
            </motion.article>
          </div>

          {/* Comments Sidebar - Desktop Only */}
          <div className="lg:w-96 xl:w-[28rem] flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="sticky top-24"
            >
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3 md:mb-4">Comments</h3>
                  
                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="mb-4">
                    <div className="mb-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-xs"
                        rows={2}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Post Comment
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-2">
                    {comments.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 mx-auto mb-2 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {comment.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white text-xs">{comment.name}</span>
                              <span className="text-slate-500 dark:text-slate-400 text-xs ml-1">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{comment.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Comments Section - Hidden on Desktop */}
        <div className="lg:hidden">
          {showComments && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-4 md:mb-8"
            >
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 md:p-6 lg:p-8">
                  <h3 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6">Comments</h3>
                  
                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="mb-6 md:mb-8">
                    <div className="mb-4 md:mb-6">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts on this article..."
                        className="w-full p-4 md:p-6 border border-slate-200 dark:border-slate-600 rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-xs md:text-base"
                        rows={4}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 md:px-8 py-2 md:py-3 bg-emerald-500 text-white rounded-lg md:rounded-xl hover:bg-emerald-600 transition-all duration-200 font-medium text-xs md:text-base shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Post Comment
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4 md:space-y-6">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 md:py-12">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg md:rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                              {comment.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white text-xs md:text-base">{comment.name}</span>
                              <span className="text-slate-500 dark:text-slate-400 text-xs md:text-sm ml-2">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs md:text-base">{comment.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-4 md:mb-8"
        >
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-12 text-white overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white rounded-full -translate-y-12 translate-x-12 md:-translate-y-16 md:translate-x-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white rounded-full translate-y-8 -translate-x-8 md:translate-y-12 md:-translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Ready to Start Your Project?</h3>
              <p className="text-emerald-100 text-sm md:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
                Let's discuss how we can help bring your ideas to life with our expert development services.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-emerald-600 rounded-lg md:rounded-xl hover:bg-emerald-50 transition-all duration-200 font-semibold text-sm md:text-lg shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Get in Touch
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 rotate-180" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPost;
