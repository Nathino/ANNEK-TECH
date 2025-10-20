import { useState, useEffect } from 'react';
import { Edit, Trash, Plus, Eye, Folder, ExternalLink, ShoppingCart, Leaf, Recycle, Download, Users, Building2, Utensils, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface ContentItem {
  id: string;
  title: string;
  type: 'home' | 'portfolio' | 'contact' | 'blog';
  section: string;
  content: {
    // Home Page Content
    heroTitle?: string;
    heroDescription?: string;
    heroImage?: string;
    heroBackgroundImage?: string;
    
    // Services Section
    services?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    
    // Projects
    projects?: Array<{
      title: string;
      description: string;
      image: string;
      technologies: string[];
      liveUrl: string;
      demoUrl?: string;
    }>;
    
    // Featured Partners
    partners?: Array<{
      name: string;
      logo: string;
      description: string;
      category: string;
    }>;
    
    // Contact Info
    phone?: string;
    email?: string;
    address?: string;
    socialLinks?: {
      x?: string;
      facebook?: string;
      instagram?: string;
    };
    
    // Form Fields
    formFields?: {
      labels: {
        name: string;
        email: string;
        subject: string;
        message: string;
      };
      placeholders: {
        name: string;
        email: string;
        subject: string;
        message: string;
      };
    };
    
    // Blog Content
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    tags?: string[];
    author?: string;
    readTime?: number;
  };
  status: 'published' | 'draft';
  lastModified: string;
}

const ContentManager: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [showProjectsOverview, setShowProjectsOverview] = useState(false);
  const [showBlogsOverview, setShowBlogsOverview] = useState(false);

  // Function to get icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart': return <ShoppingCart className="h-5 w-5" />;
      case 'Users': return <Users className="h-5 w-5" />;
      case 'Building2': return <Building2 className="h-5 w-5" />;
      case 'Leaf': return <Leaf className="h-5 w-5" />;
      case 'Recycle': return <Recycle className="h-5 w-5" />;
      case 'Download': return <Download className="h-5 w-5" />;
      case 'Utensils': return <Utensils className="h-5 w-5" />;
      case 'QrCode': return <QrCode className="h-5 w-5" />;
      default: return <ExternalLink className="h-5 w-5" />;
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const contentCollection = collection(db, 'content');
      const snapshot = await getDocs(contentCollection);
      const contentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[];
      setContent(contentData);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/content/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const docRef = doc(db, 'content', id);
      await deleteDoc(docRef);
      toast.success('Content deleted successfully');
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const docRef = doc(db, 'content', id);
      await updateDoc(docRef, {
        status: currentStatus === 'published' ? 'draft' : 'published',
        lastModified: new Date().toISOString()
      });
      toast.success('Status updated successfully');
      fetchContent();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getSections = (type: string) => {
    switch(type) {
      case 'home':
        return ['hero', 'services', 'featured-projects', 'featured-partners'];
      case 'portfolio':
        return ['header', 'projects'];
      case 'contact':
        return ['header', 'contact-info', 'social-links', 'form'];
      case 'blog':
        return ['post'];
      default:
        return [];
    }
  };

  // Extract all projects from content
  const getAllProjects = () => {
    const allProjects: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
      icon: string;
      url: string;
      source: string;
      section: string;
      demoCredentials?: {
        email: string;
        password: string;
        instructions?: string;
      };
    }> = [];

    content.forEach(item => {
      if (item.content.projects && Array.isArray(item.content.projects)) {
        item.content.projects.forEach((project: any) => {
          allProjects.push({
            id: `${item.id}-${project.title}`,
            title: project.title,
            description: project.description,
            image: project.image,
            icon: project.icon || 'ExternalLink',
            url: project.url || project.liveUrl,
            source: item.type,
            section: item.section,
            demoCredentials: project.demoCredentials
          });
        });
      }
    });

    return allProjects;
  };

  // Extract all blogs from content
  const getAllBlogs = () => {
    const allBlogs: Array<{
      id: string;
      title: string;
      excerpt: string;
      featuredImage: string;
      author: string;
      readTime: number;
      category: string;
      status: string;
      lastModified: string;
    }> = [];

    content.forEach(item => {
      if (item.type === 'blog' && item.content) {
        allBlogs.push({
          id: item.id,
          title: item.title,
          excerpt: item.content.excerpt || '',
          featuredImage: item.content.featuredImage || '',
          author: item.content.author || 'ANNEK TECH',
          readTime: item.content.readTime || 5,
          category: (item.content as any).category || 'general',
          status: item.status,
          lastModified: item.lastModified
        });
      }
    });

    return allBlogs;
  };

  return (
    <div className="p-3 pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-400">Content Manager</h1>
          <p className="text-slate-400 mt-0.5 text-sm md:text-base">Manage your website content</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProjectsOverview(!showProjectsOverview)}
            className={`flex items-center px-3 md:px-4 py-2 md:py-2.5 rounded-lg transition-colors text-sm md:text-base ${
              showProjectsOverview 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Folder className="w-4 h-4 md:w-5 md:h-5 mr-1.5" />
            {showProjectsOverview ? 'Hide Projects' : 'View Projects'}
          </button>
          <button
            onClick={() => setShowBlogsOverview(!showBlogsOverview)}
            className={`flex items-center px-3 md:px-4 py-2 md:py-2.5 rounded-lg transition-colors text-sm md:text-base ${
              showBlogsOverview 
                ? 'bg-purple-500 text-white hover:bg-purple-600' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Folder className="w-4 h-4 md:w-5 md:h-5 mr-1.5" />
            {showBlogsOverview ? 'Hide Blogs' : 'View Blogs'}
          </button>
        <button
          onClick={() => navigate('/admin/content/new')}
          className="flex items-center px-3 md:px-4 py-2 md:py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1.5" />
          Add New Content
        </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-2 md:gap-3">
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSelectedSection('all');
          }}
          className="bg-slate-800 text-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 border border-slate-700 text-sm md:text-base"
        >
          <option value="all">All Pages</option>
          <option value="home">Home Page</option>
          <option value="portfolio">Portfolio</option>
          <option value="contact">Contact</option>
          <option value="blog">Blog</option>
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="bg-slate-800 text-slate-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 border border-slate-700 text-sm md:text-base"
        >
          <option value="all">All Sections</option>
          {getSections(selectedType).map((section) => (
            <option key={section} value={section}>
              {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Overview */}
      {showProjectsOverview && (
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-4 md:p-6 border border-blue-500/20">
            <h2 className="text-lg md:text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Projects Overview
            </h2>
            {(() => {
              const allProjects = getAllProjects();
              if (allProjects.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="text-slate-400 text-lg mb-2">No projects found</div>
                    <p className="text-slate-500 text-sm">Create some projects to see them here</p>
                  </div>
                );
              }
              
              // Group projects by source
              const groupedProjects = allProjects.reduce((acc, project) => {
                if (!acc[project.source]) {
                  acc[project.source] = [];
                }
                acc[project.source].push(project);
                return acc;
              }, {} as Record<string, typeof allProjects>);

              return (
                <div className="space-y-6">
                  {Object.entries(groupedProjects).map(([source, projects]) => (
                    <div key={source}>
                      <h3 className="text-md font-medium text-slate-300 mb-3 capitalize">
                        {source} Projects ({projects.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:shadow-lg group"
                          >
                            {/* Project Image */}
                            <div className="relative h-24 md:h-28 mb-3 rounded-lg overflow-hidden">
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80';
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <div className="h-6 w-6 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300">
                                  {getIconComponent(project.icon)}
                                </div>
                              </div>
                            </div>

                            {/* Project Info */}
                            <div className="space-y-2">
                              <h4 className="text-sm md:text-base font-semibold text-slate-200 line-clamp-1">
                                {project.title}
                              </h4>
                              <p className="text-xs text-slate-400 line-clamp-2">
                                {project.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 capitalize">
                                  {project.section}
                                </span>
                                {project.demoCredentials?.email && (
                                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                                    Demo Available
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => window.open(project.url, '_blank', 'noopener,noreferrer')}
                                className="flex-1 flex items-center justify-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 px-3 rounded-lg transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </button>
                              <button
                                onClick={() => {
                                  // Find the parent content item and navigate to edit
                                  const parentItem = content.find(item => 
                                    item.content.projects?.some((p: any) => p.title === project.title)
                                  );
                                  if (parentItem) {
                                    navigate(`/admin/content/edit/${parentItem.id}`);
                                  }
                                }}
                                className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 py-2 px-3 rounded-lg transition-colors"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Blogs Overview */}
      {showBlogsOverview && (
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 md:p-6 border border-purple-500/20">
            <h2 className="text-lg md:text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Blogs Overview
            </h2>
            {(() => {
              const allBlogs = getAllBlogs();
              if (allBlogs.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="text-slate-400 text-lg mb-2">No blogs found</div>
                    <p className="text-slate-500 text-sm">Create some blog posts to see them here</p>
                  </div>
                );
              }
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {allBlogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:shadow-lg group"
                    >
                      {/* Blog Image */}
                      <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            blog.status === 'published' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {blog.status}
                          </span>
                        </div>
                      </div>

                      {/* Blog Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm md:text-base font-semibold text-slate-200 line-clamp-2">
                          {blog.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="capitalize">{blog.category}</span>
                          <span>{blog.readTime} min read</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          By {blog.author} • {new Date(blog.lastModified).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/content/edit/${blog.id}`)}
                          className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 py-2 px-3 rounded-lg transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => window.open(`/blog/${blog.id}`, '_blank', 'noopener,noreferrer')}
                          className="flex-1 flex items-center justify-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 px-3 rounded-lg transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Content Cards */}
      {loading ? (
        <div className="text-center py-6 md:py-8 text-slate-400 text-sm md:text-base">Loading content...</div>
      ) : content.length === 0 ? (
        <div className="text-center py-6 md:py-8 text-slate-400 text-sm md:text-base">No content found. Add some content to get started.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                {content
                  .filter(item => selectedType === 'all' || item.type === selectedType)
                  .filter(item => selectedSection === 'all' || item.section === selectedSection)
                  .map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-slate-800/50 rounded-xl p-2 md:p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:shadow-lg">
                {/* Card Header */}
                <div className="mb-2 md:mb-3">
                  <div className="flex justify-between items-start mb-1 md:mb-2">
                    <h3 className="text-slate-200 font-semibold text-sm md:text-base flex-1 pr-2 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>{item.title}</h3>
                    <button
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`px-0.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs md:text-xs font-medium flex-shrink-0 ${
                        item.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {item.status}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="capitalize bg-slate-700/50 px-2 py-1 rounded">{item.type}</span>
                    <span className="capitalize bg-slate-700/50 px-2 py-1 rounded">{item.section}</span>
                  </div>
                </div>

                {/* Card Content Preview */}
                <div className="mb-2 md:mb-4">
                  <p className="text-slate-400 text-xs mb-1 md:mb-2">Last Modified:</p>
                  <p className="text-slate-300 text-sm">{new Date(item.lastModified).toLocaleDateString()}</p>
                </div>

                {/* Card Actions */}
                <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-slate-700/50">
                  <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item.id)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                      <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                      <Trash className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const previewUrl = item.type === 'blog' 
                                ? `/blog/${item.id}` 
                                : `/${item.type}`;
                              window.open(previewUrl, '_blank', 'noopener,noreferrer');
                            }}
                      className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-500/20 rounded-lg transition-colors"
                            title="Preview"
                          >
                      <Eye className="w-4 h-4" />
                          </button>
                        </div>
                </div>
              </div>
                  ))}
        </div>
      )}
    </div>
  );
};

export default ContentManager; 