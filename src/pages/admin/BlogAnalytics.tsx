import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  Calendar,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  content: {
    category: string;
    author: string;
    readTime: number;
  };
  status: 'published' | 'draft';
  lastModified: string;
  createdAt: string;
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
}

interface AnalyticsData {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  averageReadTime: number;
  topPosts: BlogPost[];
  categoryStats: Record<string, number>;
  monthlyStats: Record<string, number>;
}

const BlogAnalytics: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'views' | 'interactions' | 'performance'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    averageReadTime: 0,
    topPosts: [],
    categoryStats: {},
    monthlyStats: {}
  });

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
        calculateAnalytics(blogPosts);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching blog posts:', error);
        toast.error('Failed to load blog analytics');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const calculateAnalytics = (blogPosts: BlogPost[]) => {
    const publishedPosts = blogPosts.filter(post => post.status === 'published');
    const totalViews = blogPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = blogPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalShares = blogPosts.reduce((sum, post) => sum + (post.shares || 0), 0);
    const totalComments = blogPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
    const averageReadTime = publishedPosts.length > 0 
      ? publishedPosts.reduce((sum, post) => sum + post.content.readTime, 0) / publishedPosts.length 
      : 0;

    // Top posts by views
    const topPosts = [...publishedPosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    // Category statistics
    const categoryStats = blogPosts.reduce((acc, post) => {
      const category = post.content.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly statistics (simplified)
    const monthlyStats = blogPosts.reduce((acc, post) => {
      const month = new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setAnalytics({
      totalPosts: blogPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: blogPosts.length - publishedPosts.length,
      totalViews,
      totalLikes,
      totalShares,
      totalComments,
      averageReadTime: Math.round(averageReadTime),
      topPosts,
      categoryStats,
      monthlyStats
    });
  };

  const categoryInfo = {
    'general': { name: 'General', icon: '📁', color: 'bg-slate-500' },
    'technology': { name: 'Technology', icon: '💻', color: 'bg-blue-500' },
    'web-development': { name: 'Web Development', icon: '🌐', color: 'bg-green-500' },
    'tutorials': { name: 'Tutorials', icon: '📚', color: 'bg-purple-500' },
    'news': { name: 'News', icon: '📰', color: 'bg-red-500' },
    'case-studies': { name: 'Case Studies', icon: '📊', color: 'bg-orange-500' },
    'tips': { name: 'Tips & Tricks', icon: '💡', color: 'bg-yellow-500' }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                Blog Analytics
              </h1>
              <p className="text-slate-400 mt-0.5">
                Track your blog performance, views, and engagement metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700 text-slate-200"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'views', name: 'Views & Stats', icon: Eye },
                { id: 'interactions', name: 'Interactions', icon: Heart },
                { id: 'performance', name: 'Performance', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Posts</p>
                <p className="text-2xl font-bold text-slate-200">{analytics.totalPosts}</p>
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {analytics.publishedPosts} published, {analytics.draftPosts} drafts
                </p>
              </div>
              <div className="p-3 bg-emerald-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
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
                <p className="text-2xl font-bold text-slate-200">{analytics.totalViews.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
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
                <p className="text-sm font-medium text-slate-400">Total Engagement</p>
                <p className="text-2xl font-bold text-slate-200">
                  {(analytics.totalLikes + analytics.totalShares + analytics.totalComments).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {analytics.totalLikes} likes, {analytics.totalShares} shares, {analytics.totalComments} comments
                </p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-lg">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
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
                <p className="text-sm font-medium text-slate-400">Avg. Read Time</p>
                <p className="text-2xl font-bold text-slate-200">{analytics.averageReadTime} min</p>
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  Per published post
                </p>
              </div>
              <div className="p-3 bg-orange-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
              Top Performing Posts
            </h3>
            <div className="space-y-4">
              {analytics.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-emerald-900/30 rounded-full flex items-center justify-center text-sm font-bold text-emerald-600 mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200 line-clamp-1">{post.title}</p>
                      <p className="text-sm text-slate-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.views || 0}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
              Category Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.categoryStats).map(([category, count]) => {
                const percentage = analytics.totalPosts > 0 ? (count / analytics.totalPosts) * 100 : 0;
                const categoryData = categoryInfo[category as keyof typeof categoryInfo];
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{categoryData?.icon || '📁'}</span>
                      <span className="text-sm font-medium text-slate-200">
                        {categoryData?.name || category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${categoryData?.color || 'bg-slate-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-400 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Recent Posts Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-slate-800/50 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
            Recent Posts Activity
          </h3>
          <div className="space-y-3">
            {posts.slice(0, 5).map((post, index) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-emerald-900/30 rounded-full flex items-center justify-center text-sm font-bold text-emerald-600 mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200 line-clamp-1">{post.title}</p>
                    <p className="text-sm text-slate-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(post.lastModified)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    post.status === 'published'
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {post.status}
                  </span>
                  <div className="flex items-center text-sm text-slate-400">
                    <Eye className="h-4 w-4 mr-1" />
                    {post.views || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-slate-800/50 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2 text-emerald-600" />
            Engagement Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-900/20 rounded-lg">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{analytics.totalLikes.toLocaleString()}</p>
              <p className="text-sm text-slate-400 flex items-center justify-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                Total Likes
              </p>
            </div>
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <Share2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{analytics.totalShares.toLocaleString()}</p>
              <p className="text-sm text-slate-400">Total Shares</p>
            </div>
            <div className="text-center p-4 bg-green-900/20 rounded-lg">
              <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{analytics.totalComments.toLocaleString()}</p>
              <p className="text-sm text-slate-400">Total Comments</p>
            </div>
          </div>
        </motion.div>
          </>
        )}

        {/* Views & Stats Tab */}
        {activeTab === 'views' && (
          <div className="space-y-8">
            {/* Views Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total Views</p>
                    <p className="text-3xl font-bold text-slate-200">{analytics.totalViews.toLocaleString()}</p>
                    <p className="text-xs text-emerald-400 mt-1 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-900/30 rounded-lg">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
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
                    <p className="text-sm font-medium text-slate-400">Avg. Views per Post</p>
                    <p className="text-3xl font-bold text-slate-200">
                      {analytics.publishedPosts > 0 ? Math.round(analytics.totalViews / analytics.publishedPosts) : 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Per published post</p>
                  </div>
                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
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
                    <p className="text-sm font-medium text-slate-400">Most Viewed Post</p>
                    <p className="text-lg font-bold text-slate-200">
                      {analytics.topPosts[0]?.views || 0} views
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {analytics.topPosts[0]?.title || 'No posts yet'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-900/30 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top Viewed Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-emerald-600" />
                Top Viewed Posts
              </h3>
              <div className="space-y-4">
                {analytics.topPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400 mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200 line-clamp-1">{post.title}</p>
                        <p className="text-sm text-slate-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-slate-400">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.views || 0} views
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.content.readTime} min read
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Interactions Tab */}
        {activeTab === 'interactions' && (
          <div className="space-y-8">
            {/* Interaction Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
              >
                <div className="text-center">
                  <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-200">{analytics.totalLikes.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total Likes</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
              >
                <div className="text-center">
                  <Share2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-200">{analytics.totalShares.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total Shares</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
              >
                <div className="text-center">
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-200">{analytics.totalComments.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total Comments</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
              >
                <div className="text-center">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-200">
                    {(analytics.totalLikes + analytics.totalShares + analytics.totalComments).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">Total Engagement</p>
                </div>
              </motion.div>
            </div>

            {/* Most Engaging Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-emerald-600" />
                Most Engaging Posts
              </h3>
              <div className="space-y-4">
                {posts
                  .sort((a, b) => ((b.likes || 0) + (b.shares || 0) + (b.comments || 0)) - ((a.likes || 0) + (a.shares || 0) + (a.comments || 0)))
                  .slice(0, 5)
                  .map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400 mr-4">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 line-clamp-1">{post.title}</p>
                          <p className="text-sm text-slate-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
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
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                  Content Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Published Posts</span>
                    <span className="text-slate-200 font-semibold">{analytics.publishedPosts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Draft Posts</span>
                    <span className="text-slate-200 font-semibold">{analytics.draftPosts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Avg. Read Time</span>
                    <span className="text-slate-200 font-semibold">{analytics.averageReadTime} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Engagement Rate</span>
                    <span className="text-slate-200 font-semibold">
                      {analytics.totalViews > 0 ? Math.round(((analytics.totalLikes + analytics.totalShares + analytics.totalComments) / analytics.totalViews) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                  Category Performance
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.categoryStats).map(([category, count]) => {
                    const percentage = analytics.totalPosts > 0 ? (count / analytics.totalPosts) * 100 : 0;
                    const categoryData = categoryInfo[category as keyof typeof categoryInfo];
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{categoryData?.icon || '📁'}</span>
                          <span className="text-sm font-medium text-slate-200">
                            {categoryData?.name || category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${categoryData?.color || 'bg-slate-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-400 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {posts.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-emerald-900/30 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400 mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200 line-clamp-1">{post.title}</p>
                        <p className="text-sm text-slate-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(post.lastModified)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === 'published'
                          ? 'bg-emerald-900/30 text-emerald-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {post.status}
                      </span>
                      <div className="flex items-center text-sm text-slate-400">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.views || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogAnalytics;
