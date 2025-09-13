import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Tag, Eye, Heart, Share2, MessageCircle } from 'lucide-react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
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

            // Add article structured data
            const structuredData = {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": seoTitle,
              "description": seoDescription,
              "image": featuredImage,
              "author": {
                "@type": "Organization",
                "name": author
              },
              "publisher": {
                "@type": "Organization",
                "name": "ANNEK TECH",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://annektech.web.app/annek_tech.png"
                }
              },
              "datePublished": publishedDate,
              "dateModified": data.lastModified,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": window.location.href
              },
              "keywords": tags.join(', ')
            };

            // Remove existing structured data
            const existingScript = document.querySelector('script[type="application/ld+json"]');
            if (existingScript) {
              existingScript.remove();
            }

            // Add new structured data
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);

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
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative h-64 md:h-96 overflow-hidden rounded-xl">
            <img
              src={post.content.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          </div>
        </motion.div>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4"
        >
          {/* Category and Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Category Badge */}
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white font-medium rounded-full">
              📁 {post.content.category || 'General'}
            </span>
            
            {/* Tags */}
            {(post.content.tags || []).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            {post.content.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{post.content.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(post.lastModified)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{post.content.readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span>{post.views || 0} views</span>
            </div>
          </div>

          {/* Interaction Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                liked 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span>{post.likes || 0} {liked ? 'Liked' : 'Like'}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span>{post.shares || 0} Share</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments || 0} Comment{post.comments !== 1 ? 's' : ''}</span>
            </button>
          </div>
        </motion.header>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="prose prose-lg max-w-none dark:prose-invert"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg">
            <div 
              className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </motion.article>

        {/* Comments Section */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Comments</h3>
              
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Post Comment
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-b border-slate-200 dark:border-slate-600 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">{comment.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 sm:p-6 text-white">
            <h3 className="text-2xl font-bold mb-3">Ready to Start Your Project?</h3>
            <p className="text-emerald-100 mb-4">
              Let's discuss how we can help bring your ideas to life with our expert development services.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
            >
              Get in Touch
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPost;
