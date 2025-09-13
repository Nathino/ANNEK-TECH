import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Eye,
  FileText,
  Loader2,
  BookOpen,
  TrendingUp,
  Heart
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  status: 'published' | 'draft';
  createdAt: string;
  lastModified: string;
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  content: {
    category: string;
    readTime: number;
  };
}

interface ContentItem {
  id: string;
  title: string;
  type: 'page' | 'blog' | 'project';
  status: 'published' | 'draft';
  lastModified: string;
  views?: number;
}

interface DashboardData {
  stats: {
    totalContent: number;
    publishedContent: number;
    draftContent: number;
    totalViews: number;
    totalBlogPosts: number;
    publishedBlogs: number;
    totalBlogViews: number;
    totalEngagement: number;
  };
  recentContent: ContentItem[];
  topBlogPosts: BlogPost[];
  categoryStats: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyStats: Array<{
    name: string;
    content: number;
    blogs: number;
  }>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalContent: 0,
      publishedContent: 0,
      draftContent: 0,
      totalViews: 0,
      totalBlogPosts: 0,
      publishedBlogs: 0,
      totalBlogViews: 0,
      totalEngagement: 0
    },
    recentContent: [],
    topBlogPosts: [],
    categoryStats: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (retry = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all content
      const contentRef = collection(db, 'content');
      const contentSnapshot = await getDocs(contentRef);
      const allContent = contentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (ContentItem & BlogPost)[];

      // Separate content by type
      const blogs = allContent.filter(item => item.type === 'blog') as BlogPost[];

      // Calculate stats
      const totalContent = allContent.length;
      const publishedContent = allContent.filter(item => item.status === 'published').length;
      const draftContent = totalContent - publishedContent;
      const totalViews = allContent.reduce((sum, item) => sum + (item.views || 0), 0);
      const totalBlogPosts = blogs.length;
      const publishedBlogs = blogs.filter(blog => blog.status === 'published').length;
      const totalBlogViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      const totalEngagement = blogs.reduce((sum, blog) => 
        sum + (blog.likes || 0) + (blog.shares || 0) + (blog.comments || 0), 0
      );

      // Get recent content (last 5 items)
      const recentContent = allContent
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          status: item.status,
          lastModified: item.lastModified,
          views: item.views || 0
        }));

      // Get top blog posts by views
      const topBlogPosts = blogs
        .filter(blog => blog.status === 'published')
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

      // Calculate category stats
      const categoryCounts = blogs.reduce((acc, blog) => {
        const category = blog.content?.category || 'general';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryStats = Object.entries(categoryCounts).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
        value,
        color: ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'][index % 6]
      }));

      // Generate monthly stats (last 6 months)
      const monthlyStats = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthContent = allContent.filter(item => {
          const itemDate = new Date(item.createdAt);
          return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
        });
        
        const monthBlogs = monthContent.filter(item => item.type === 'blog');
        
        monthlyStats.push({
          name: monthName,
          content: monthContent.length,
          blogs: monthBlogs.length
        });
      }

      setDashboardData({
        stats: {
          totalContent,
          publishedContent,
          draftContent,
          totalViews,
          totalBlogPosts,
          publishedBlogs,
          totalBlogViews,
          totalEngagement
        },
        recentContent,
        topBlogPosts,
        categoryStats,
        monthlyStats
      });
      setRetryCount(0);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
      
      // Implement retry logic
      if (retry < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(retry + 1);
          fetchDashboardData(retry + 1);
        }, RETRY_DELAY * (retry + 1));
      } else {
        toast.error('Failed to fetch dashboard data after multiple attempts');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    { name: 'Total Content', value: dashboardData.stats.totalContent, icon: FileText, color: 'emerald', iconClass: 'text-emerald-400', bgClass: 'bg-emerald-400/10', ringClass: 'ring-emerald-400/20' },
    { name: 'Published Content', value: dashboardData.stats.publishedContent, icon: Eye, color: 'blue', iconClass: 'text-blue-400', bgClass: 'bg-blue-400/10', ringClass: 'ring-blue-400/20' },
    { name: 'Blog Posts', value: dashboardData.stats.totalBlogPosts, icon: BookOpen, color: 'purple', iconClass: 'text-purple-400', bgClass: 'bg-purple-400/10', ringClass: 'ring-purple-400/20' },
    { name: 'Total Views', value: dashboardData.stats.totalViews.toLocaleString(), icon: TrendingUp, color: 'pink', iconClass: 'text-pink-400', bgClass: 'bg-pink-400/10', ringClass: 'ring-pink-400/20' }
  ];

  const blogStats = [
    { name: 'Blog Views', value: dashboardData.stats.totalBlogViews.toLocaleString(), icon: Eye, color: 'emerald', iconClass: 'text-emerald-400', bgClass: 'bg-emerald-400/10', ringClass: 'ring-emerald-400/20' },
    { name: 'Published Blogs', value: dashboardData.stats.publishedBlogs, icon: BookOpen, color: 'blue', iconClass: 'text-blue-400', bgClass: 'bg-blue-400/10', ringClass: 'ring-blue-400/20' },
    { name: 'Total Engagement', value: dashboardData.stats.totalEngagement.toLocaleString(), icon: Heart, color: 'purple', iconClass: 'text-purple-400', bgClass: 'bg-purple-400/10', ringClass: 'ring-purple-400/20' },
    { name: 'Draft Content', value: dashboardData.stats.draftContent, icon: FileText, color: 'orange', iconClass: 'text-orange-400', bgClass: 'bg-orange-400/10', ringClass: 'ring-orange-400/20' }
  ];


  // Add navigation handlers
  const handleNavigate = (path: string) => {
    navigate(`/admin/${path}`);
  };

  const handleContentClick = (item: ContentItem) => {
    switch (item.type) {
      case 'blog':
        navigate(`/admin/content/edit/${item.id}`);
        break;
      case 'page':
        navigate(`/admin/content/edit/${item.id}`);
        break;
      case 'project':
        navigate(`/admin/content/edit/${item.id}`);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-3 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Dashboard</h1>
            <p className="text-slate-400">Welcome back, Admin</p>
          </div>
          <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1 shadow-md mt-1 sm:mt-0">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeSection === 'overview'
                  ? 'bg-emerald-400/10 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('analytics')}
              className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeSection === 'analytics'
                  ? 'bg-emerald-400/10 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[35vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
              <p className="text-slate-400">
                {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading dashboard data...'}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[35vh]">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchDashboardData()}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : activeSection === 'overview' ? (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 flex items-center gap-2 sm:gap-4 cursor-pointer hover:bg-slate-800/70 transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50 group shadow-lg hover:shadow-xl"
                  onClick={() => handleNavigate(stat.name.toLowerCase().replace(' ', '-'))}
                >
                  <div className={`p-3 sm:p-4 rounded-xl ${stat.bgClass} group-hover:${stat.bgClass.replace('/10', '/20')} transition-colors duration-300 ring-1 ${stat.ringClass}`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1 truncate">{stat.name}</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-200 truncate">{stat.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Blog Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {blogStats.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 flex items-center gap-2 sm:gap-4 cursor-pointer hover:bg-slate-800/70 transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50 group shadow-lg hover:shadow-xl"
                  onClick={() => handleNavigate('blog')}
                >
                  <div className={`p-3 sm:p-4 rounded-xl ${stat.bgClass} group-hover:${stat.bgClass.replace('/10', '/20')} transition-colors duration-300 ring-1 ${stat.ringClass}`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1 truncate">{stat.name}</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-200 truncate">{stat.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Content */}
              <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-xl font-semibold text-slate-200">Recent Content</h2>
                </div>
                {dashboardData.recentContent.length > 0 ? (
                  <div className="divide-y divide-slate-700/50">
                    {dashboardData.recentContent.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors group"
                        onClick={() => handleContentClick(item)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 rounded-lg bg-slate-700/50 group-hover:bg-slate-700/70 transition-colors">
                            {item.type === 'blog' ? (
                              <BookOpen className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <FileText className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 font-medium group-hover:text-emerald-400 transition-colors truncate">{item.title}</p>
                            <p className="text-sm text-slate-400 capitalize">{item.type} • {item.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Eye className="h-4 w-4" />
                          {item.views || 0}
                          <span className="ml-2">{formatDate(item.lastModified)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    No content to display
                  </div>
                )}
              </div>

              {/* Top Blog Posts */}
              <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-xl font-semibold text-slate-200">Top Blog Posts</h2>
                </div>
                {dashboardData.topBlogPosts.length > 0 ? (
                  <div className="divide-y divide-slate-700/50">
                    {dashboardData.topBlogPosts.map((post, index) => (
                      <div
                        key={post.id}
                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors group"
                        onClick={() => handleContentClick({ ...post, type: 'blog' as const })}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-8 h-8 bg-emerald-900/30 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 font-medium group-hover:text-emerald-400 transition-colors truncate">{post.title}</p>
                            <p className="text-sm text-slate-400">{post.content?.category || 'General'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    No blog posts to display
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Monthly Content Creation Chart */}
            <div className="bg-slate-800/50 rounded-xl p-3 sm:p-6 mb-8 border border-slate-700/50 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-200 mb-6">Content Creation Trends</h2>
              <div className="h-80 -ml-2 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.monthlyStats} margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94A3B8" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#E2E8F0'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="content"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', r: 4 }}
                      name="Total Content"
                    />
                    <Line
                      type="monotone"
                      dataKey="blogs"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      name="Blog Posts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Blog Category Distribution */}
            <div className="bg-slate-800/50 rounded-xl p-3 sm:p-6 border border-slate-700/50 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-200 mb-6">Blog Category Distribution</h2>
              <div className="h-80 -ml-2 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.categoryStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={entry.value > 2 ? '#047857' : undefined}
                          strokeWidth={entry.value > 2 ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#E2E8F0'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
    </div>
  );
};

export default Dashboard;