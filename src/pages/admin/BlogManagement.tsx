import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  Calendar, 
  User, 
  Tag,
  BarChart3,
  TrendingUp,
  Clock,
  Filter,
  Search,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
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

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastModified');

  // Category info for display
  const categoryInfo = {
    'general': { name: 'General', icon: '📁', color: 'bg-slate-500' },
    'technology': { name: 'Technology', icon: '💻', color: 'bg-blue-500' },
    'web-development': { name: 'Web Development', icon: '🌐', color: 'bg-green-500' },
    'tutorials': { name: 'Tutorials', icon: '📚', color: 'bg-purple-500' },
    'news': { name: 'News', icon: '📰', color: 'bg-red-500' },
    'case-studies': { name: 'Case Studies', icon: '📊', color: 'bg-orange-500' },
    'tips': { name: 'Tips & Tricks', icon: '💡', color: 'bg-yellow-500' }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'content'),
      where('type', '==', 'blog'),
      orderBy('lastModified', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const blogPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          views: doc.data().views || 0,
          likes: doc.data().likes || 0,
          shares: doc.data().shares || 0,
          comments: doc.data().comments || 0,
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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.content.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (post.content.category || 'general') === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'views':
        return (b.views || 0) - (a.views || 0);
      case 'likes':
        return (b.likes || 0) - (a.likes || 0);
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });

  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);
  const publishedPosts = posts.filter(post => post.status === 'published').length;
  const draftPosts = posts.filter(post => post.status === 'draft').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteDoc(doc(db, 'content', postId));
        toast.success('Blog post deleted successfully');
      } catch (error) {
        console.error('Error deleting blog post:', error);
        toast.error('Failed to delete blog post');
      }
    }
  };

  const handleToggleStatus = async (postId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await updateDoc(doc(db, 'content', postId), {
        status: newStatus,
        lastModified: new Date().toISOString()
      });
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error('Failed to update post status');
    }
  };

  if (loading) {
    return (
      <div className="p-3 pt-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-3 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-emerald-400 mb-2">
                Blog Management
              </h1>
              <p className="text-slate-400 mt-0.5">
                Manage your blog posts, track analytics, and monitor engagement
              </p>
            </div>
            <Link
              to="/admin/content/new"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Post
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Posts</p>
                <p className="text-2xl font-bold text-slate-200">{posts.length}</p>
              </div>
              <div className="p-3 bg-emerald-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-400">
              <span className="text-emerald-400 font-medium">{publishedPosts} published</span>
              <span className="mx-2">•</span>
              <span>{draftPosts} drafts</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Views</p>
                <p className="text-2xl font-bold text-slate-200">{totalViews.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>All time</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Likes</p>
                <p className="text-2xl font-bold text-slate-200">{totalLikes.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-900/30 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-400">
              <Heart className="h-4 w-4 mr-1" />
              <span>Engagement</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Shares</p>
                <p className="text-2xl font-bold text-slate-200">{totalShares.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-lg">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-400">
              <Share2 className="h-4 w-4 mr-1" />
              <span>Social reach</span>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-200">Filters & Search</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700 text-slate-200"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700 text-slate-200"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700 text-slate-200"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryInfo).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700 text-slate-200"
            >
              <option value="lastModified">Last Modified</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
              <option value="likes">Likes</option>
            </select>
          </div>
        </div>

        {/* Blog Posts Table */}
        <div className="bg-slate-800/50 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Analytics
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sortedPosts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={post.content.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
                            alt={post.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-200 line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-sm text-slate-400 line-clamp-1">
                            {post.content.excerpt}
                          </div>
                          <div className="flex items-center mt-1 text-xs text-slate-400">
                            <User className="h-3 w-3 mr-1" />
                            {post.content.author}
                            <Clock className="h-3 w-3 ml-2 mr-1" />
                            {post.content.readTime} min read
                          </div>
                          {(post.content.tags && post.content.tags.length > 0) && (
                            <div className="flex items-center mt-1 text-xs text-slate-400">
                              <Tag className="h-3 w-3 mr-1" />
                              <span className="line-clamp-1">
                                {post.content.tags.slice(0, 3).join(', ')}
                                {post.content.tags.length > 3 && ` +${post.content.tags.length - 3} more`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full ${categoryInfo[post.content.category as keyof typeof categoryInfo]?.color || 'bg-slate-500'}`}>
                        {categoryInfo[post.content.category as keyof typeof categoryInfo]?.icon || '📁'} {categoryInfo[post.content.category as keyof typeof categoryInfo]?.name || post.content.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === 'published'
                          ? 'bg-emerald-900/30 text-emerald-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views || 0}
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes || 0}
                        </div>
                        <div className="flex items-center">
                          <Share2 className="h-4 w-4 mr-1" />
                          {post.shares || 0}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(post.lastModified)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/blog/${post.id}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
                          title="View Post"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/content/edit/${post.id}`}
                          className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
                          title="Edit Post"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(post.id, post.status)}
                          className={`p-2 transition-colors ${
                            post.status === 'published'
                              ? 'text-yellow-400 hover:text-yellow-600'
                              : 'text-emerald-400 hover:text-emerald-600'
                          }`}
                          title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {post.status === 'published' ? '📝' : '🚀'}
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="relative group">
                          <button
                            className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
                            title="More Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 top-8 bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                            <div className="py-1">
                              <button
                                className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/blog/${post.id}`)}
                              >
                                Copy Link
                              </button>
                              <button
                                className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                                onClick={() => window.open(`/blog/${post.id}`, '_blank')}
                              >
                                Open in New Tab
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sortedPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No blog posts found matching your criteria.'
                : 'No blog posts available yet. Create your first post!'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
