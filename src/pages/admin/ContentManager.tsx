import { useState, useEffect } from 'react';
import { Edit, Trash, Plus, Eye } from 'lucide-react';
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
      githubUrl: string;
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
        return ['hero', 'services', 'projects', 'partners'];
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

  return (
    <div className="p-3 pt-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Content Manager</h1>
          <p className="text-slate-400 mt-0.5">Manage your website content</p>
        </div>
        <button
          onClick={() => navigate('/admin/content/new')}
          className="flex items-center px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Add New Content
        </button>
      </div>

      {/* Filters */}
      <div className="mb-2 flex gap-2">
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSelectedSection('all');
          }}
          className="bg-slate-800 text-slate-200 rounded-lg px-3 py-1.5 border border-slate-700"
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
          className="bg-slate-800 text-slate-200 rounded-lg px-3 py-1.5 border border-slate-700"
        >
          <option value="all">All Sections</option>
          {getSections(selectedType).map((section) => (
            <option key={section} value={section}>
              {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="text-center py-4 text-slate-400">Loading content...</div>
      ) : content.length === 0 ? (
        <div className="text-center py-4 text-slate-400">No content found. Add some content to get started.</div>
      ) : (
        <div className="bg-slate-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800">
                  <th className="px-6 py-4 text-left text-sm text-slate-400">Title</th>
                  <th className="px-6 py-4 text-left text-sm text-slate-400">Page</th>
                  <th className="px-6 py-4 text-left text-sm text-slate-400">Section</th>
                  <th className="px-6 py-4 text-left text-sm text-slate-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm text-slate-400">Last Modified</th>
                  <th className="px-6 py-4 text-left text-sm text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {content
                  .filter(item => selectedType === 'all' || item.type === selectedType)
                  .filter(item => selectedSection === 'all' || item.section === selectedSection)
                  .map((item, index) => (
                    <tr key={`${item.id}-${index}`} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 text-slate-200">{item.title}</td>
                      <td className="px-6 py-4 text-slate-400 capitalize">{item.type}</td>
                      <td className="px-6 py-4 text-slate-400 capitalize">{item.section}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(item.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              const previewUrl = item.type === 'blog' 
                                ? `/blog/${item.id}` 
                                : `/${item.type}`;
                              window.open(previewUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="text-slate-400 hover:text-slate-300"
                            title="Preview"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager; 