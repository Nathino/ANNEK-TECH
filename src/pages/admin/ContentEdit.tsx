import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface ContentItem {
  id: string;
  title: string;
  type: 'home' | 'portfolio' | 'contact' | 'blog';
  section: string;
  content: Record<string, any>;
  status: 'published' | 'draft';
  lastModified: string;
}

const ContentEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ContentItem | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalContent, setOriginalContent] = useState<ContentItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [id]);

  // Add beforeunload event listener to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchContent = async () => {
    if (!id) {
      console.log('No ID provided');
      return;
    }
    try {
      setLoading(true);
      console.log('Fetching content with ID:', id);
      const docRef = doc(db, 'content', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        const data = docSnap.data();
        // Ensure content is properly structured
        const contentData = {
          id: docSnap.id,
          type: data.type || '',
          section: data.section || '',
          content: data.content || {},
          status: data.status || 'draft',
          lastModified: data.lastModified || new Date().toISOString(),
          title: data.title || ''
        } as ContentItem;
        
        setContent(contentData);
        setOriginalContent(JSON.parse(JSON.stringify(contentData))); // Deep copy
        setHasUnsavedChanges(false);
      } else {
        console.log('No document found with ID:', id);
        toast.error('Content not found');
        navigate('/admin/content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (key: string, value: any) => {
    if (!content) return;
    
    try {
      let updatedContent = { ...content };
      
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        updatedContent.content = {
          ...updatedContent.content,
          [parent]: {
            ...(updatedContent.content[parent] || {}),
            [child]: value
          }
        };
      } else {
        updatedContent.content = {
          ...updatedContent.content,
          [key]: value
        };
      }
      
      // Directly update the state without any JSON operations
      setContent(updatedContent);
      setHasUnsavedChanges(checkForChanges(updatedContent));
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };

  // Function to check if content has changed
  const checkForChanges = (newContent: ContentItem) => {
    if (!originalContent) return false;
    return JSON.stringify(newContent) !== JSON.stringify(originalContent);
  };


  // Function to handle navigation with unsaved changes check
  const handleNavigation = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate('/admin/content');
    }
  };

  // Function to confirm navigation (discard changes)
  const confirmNavigation = () => {
    setShowConfirmDialog(false);
    setHasUnsavedChanges(false);
    navigate('/admin/content');
  };

  // Function to cancel navigation (stay on page)
  const cancelNavigation = () => {
    setShowConfirmDialog(false);
  };

  const handleSave = async () => {
    if (!content || !id) return;
    
    try {
      setSaving(true);
      const docRef = doc(db, 'content', id);
      
      // Create a clean copy of the data for Firestore
      const updateData = {
        type: content.type,
        section: content.section,
        content: { ...content.content }, // Create a shallow copy
        status: content.status,
        lastModified: new Date().toISOString(),
        title: content.title
      };
      
      // Update Firestore directly
      await updateDoc(docRef, updateData);
      setOriginalContent(JSON.parse(JSON.stringify(content))); // Update original
      setHasUnsavedChanges(false);
      toast.success('Content updated successfully');
      navigate('/admin/content');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 pt-24 text-center text-slate-400">Loading content...</div>;
  }

  if (!content) {
    return <div className="p-8 pt-24 text-center text-slate-400">Content not found</div>;
  }

  const renderEditFields = () => {
    switch (content.type) {
      case 'home':
        switch (content.section) {
          case 'hero':
            return (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={content.content.heroTitle || ''}
                    onChange={(e) => handleContentChange('heroTitle', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Hero Description</label>
                  <textarea
                    value={content.content.heroDescription || ''}
                    onChange={(e) => handleContentChange('heroDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Background Image URL</label>
                  <input
                    type="text"
                    value={content.content.heroBackgroundImage || ''}
                    onChange={(e) => handleContentChange('heroBackgroundImage', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    value={content.content.ctaText || ''}
                    onChange={(e) => handleContentChange('ctaText', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
              </div>
            );

          case 'services':
            return (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Section Title</label>
                  <input
                    type="text"
                    value={content.content.sectionTitle || ''}
                    onChange={(e) => handleContentChange('sectionTitle', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Section Subtitle</label>
                  <input
                    type="text"
                    value={content.content.sectionSubtitle || ''}
                    onChange={(e) => handleContentChange('sectionSubtitle', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-slate-200">Services</h3>
                  {(content.content.services || []).map((service: any, index: number) => (
                    <div key={index} className="p-3 md:p-4 bg-slate-700 rounded-lg space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Service Title</label>
                        <input
                          type="text"
                          value={service.title || ''}
                          onChange={(e) => {
                            const newServices = [...(content.content.services || [])];
                            newServices[index] = { ...service, title: e.target.value };
                            handleContentChange('services', newServices);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Description</label>
                        <textarea
                          value={service.description || ''}
                          onChange={(e) => {
                            const newServices = [...(content.content.services || [])];
                            newServices[index] = { ...service, description: e.target.value };
                            handleContentChange('services', newServices);
                          }}
                          rows={2}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Icon</label>
                        <input
                          type="text"
                          value={service.icon || ''}
                          onChange={(e) => {
                            const newServices = [...(content.content.services || [])];
                            newServices[index] = { ...service, icon: e.target.value };
                            handleContentChange('services', newServices);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'featured-partners':
            return (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Section Title</label>
                  <input
                    type="text"
                    value={content.content.title || ''}
                    onChange={(e) => handleContentChange('title', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Section Description</label>
                  <textarea
                    value={content.content.description || ''}
                    onChange={(e) => handleContentChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-slate-200">Partners</h3>
                  {(content.content.partners || []).map((partner: any, index: number) => (
                    <div key={index} className="p-3 md:p-4 bg-slate-700 rounded-lg space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Partner Name</label>
                        <input
                          type="text"
                          value={partner.name || ''}
                          onChange={(e) => {
                            const newPartners = [...(content.content.partners || [])];
                            newPartners[index] = { ...partner, name: e.target.value };
                            handleContentChange('partners', newPartners);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Logo URL</label>
                        <input
                          type="text"
                          value={partner.logo || ''}
                          onChange={(e) => {
                            const newPartners = [...(content.content.partners || [])];
                            newPartners[index] = { ...partner, logo: e.target.value };
                            handleContentChange('partners', newPartners);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Description</label>
                        <textarea
                          value={partner.description || ''}
                          onChange={(e) => {
                            const newPartners = [...(content.content.partners || [])];
                            newPartners[index] = { ...partner, description: e.target.value };
                            handleContentChange('partners', newPartners);
                          }}
                          rows={3}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Category</label>
                        <input
                          type="text"
                          value={partner.category || ''}
                          onChange={(e) => {
                            const newPartners = [...(content.content.partners || [])];
                            newPartners[index] = { ...partner, category: e.target.value };
                            handleContentChange('partners', newPartners);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newPartners = [...(content.content.partners || [])];
                          newPartners.splice(index, 1);
                          handleContentChange('partners', newPartners);
                        }}
                        className="px-3 md:px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm md:text-base"
                      >
                        Remove Partner
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newPartners = [...(content.content.partners || []), {
                        name: '',
                        logo: '',
                        description: '',
                        category: 'We Grow Together'
                      }];
                      handleContentChange('partners', newPartners);
                    }}
                    className="px-3 md:px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm md:text-base"
                  >
                    Add Partner
                  </button>
                </div>
              </div>
            );
        }
        break;
      
      case 'contact':
        switch (content.section) {
          case 'header':
            return (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Page Title</label>
                  <input
                    type="text"
                    value={content.content.title || ''}
                    onChange={(e) => handleContentChange('title', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Description</label>
                  <textarea
                    value={content.content.description || ''}
                    onChange={(e) => handleContentChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
              </div>
            );

          case 'contact-info':
            return (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Phone</label>
                  <input
                    type="text"
                    value={content.content.phone || ''}
                    onChange={(e) => handleContentChange('phone', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Email</label>
                  <input
                    type="email"
                    value={content.content.email || ''}
                    onChange={(e) => handleContentChange('email', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Address</label>
                  <textarea
                    value={content.content.address || ''}
                    onChange={(e) => handleContentChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-slate-200">Social Links</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">X (Twitter)</label>
                    <input
                      type="text"
                      value={content.content.socialLinks?.x || ''}
                      onChange={(e) => handleContentChange('socialLinks.x', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Facebook</label>
                    <input
                      type="text"
                      value={content.content.socialLinks?.facebook || ''}
                      onChange={(e) => handleContentChange('socialLinks.facebook', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Instagram</label>
                    <input
                      type="text"
                      value={content.content.socialLinks?.instagram || ''}
                      onChange={(e) => handleContentChange('socialLinks.instagram', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            );
        }
        break;

      case 'portfolio':
        switch (content.section) {
          case 'header':
            return (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Page Title</label>
                  <input
                    type="text"
                    value={content.content.title || ''}
                    onChange={(e) => handleContentChange('title', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Description</label>
                  <textarea
                    value={content.content.description || ''}
                    onChange={(e) => handleContentChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  />
                </div>
              </div>
            );

          case 'projects':
            return (
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-slate-200">Projects</h3>
                  {(content.content.projects || []).map((project: any, index: number) => (
                    <div key={index} className="p-3 md:p-4 bg-slate-700 rounded-lg space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Project Title</label>
                        <input
                          type="text"
                          value={project.title || ''}
                          onChange={(e) => {
                            const newProjects = [...(content.content.projects || [])];
                            newProjects[index] = { ...project, title: e.target.value };
                            handleContentChange('projects', newProjects);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Description</label>
                        <textarea
                          value={project.description || ''}
                          onChange={(e) => {
                            const newProjects = [...(content.content.projects || [])];
                            newProjects[index] = { ...project, description: e.target.value };
                            handleContentChange('projects', newProjects);
                          }}
                          rows={3}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Image URL</label>
                        <input
                          type="text"
                          value={project.image || ''}
                          onChange={(e) => {
                            const newProjects = [...(content.content.projects || [])];
                            newProjects[index] = { ...project, image: e.target.value };
                            handleContentChange('projects', newProjects);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Technologies (comma-separated)</label>
                        <input
                          type="text"
                          value={(project.technologies || []).join(', ')}
                          onChange={(e) => {
                            const newProjects = [...(content.content.projects || [])];
                            newProjects[index] = { 
                              ...project, 
                              technologies: e.target.value.split(',').map((t: string) => t.trim())
                            };
                            handleContentChange('projects', newProjects);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Live Demo URL</label>
                        <input
                          type="text"
                          value={project.liveUrl || ''}
                          onChange={(e) => {
                            const newProjects = [...(content.content.projects || [])];
                            newProjects[index] = { ...project, liveUrl: e.target.value };
                            handleContentChange('projects', newProjects);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">GitHub URL</label>
                        <input
                          type="text"
                          value={project.githubUrl || ''}
                          onChange={(e) => {
                            const newProjects = [...(content.content.projects || [])];
                            newProjects[index] = { ...project, githubUrl: e.target.value };
                            handleContentChange('projects', newProjects);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
        }
        break;

      case 'blog':
        switch (content.section) {
          case 'post':
            return (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Blog Title</label>
                  <input
                    type="text"
                    value={content.title || ''}
                    onChange={(e) => {
                      if (content) {
                        const updatedContent = { ...content, title: e.target.value };
                        setContent(updatedContent);
                        setHasUnsavedChanges(checkForChanges(updatedContent));
                      }
                    }}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="Enter the blog post title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Blog Excerpt</label>
                  <textarea
                    value={content.content.excerpt || ''}
                    onChange={(e) => handleContentChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="Enter a brief excerpt for the blog post"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Blog Content</label>
                  <textarea
                    value={content.content.content || ''}
                    onChange={(e) => handleContentChange('content', e.target.value)}
                    rows={10}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="Enter the main blog post content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Featured Image URL</label>
                  <input
                    type="text"
                    value={content.content.featuredImage || ''}
                    onChange={(e) => handleContentChange('featuredImage', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="Enter featured image URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Category</label>
                  <select
                    value={content.content.category || 'general'}
                    onChange={(e) => handleContentChange('category', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                  >
                    <option value="general">📁 General</option>
                    <option value="technology">💻 Technology</option>
                    <option value="web-development">🌐 Web Development</option>
                    <option value="tutorials">📚 Tutorials</option>
                    <option value="news">📰 News</option>
                    <option value="case-studies">📊 Case Studies</option>
                    <option value="tips">💡 Tips & Tricks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={(content.content.tags || []).join(', ')}
                    onChange={(e) => handleContentChange('tags', e.target.value.split(',').map(t => t.trim()))}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="Technology, Web Development, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Author</label>
                  <input
                    type="text"
                    value={content.content.author || 'ANNEK TECH'}
                    onChange={(e) => handleContentChange('author', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 md:mb-2">Read Time (minutes)</label>
                  <input
                    type="number"
                    value={content.content.readTime || 5}
                    onChange={(e) => handleContentChange('readTime', parseInt(e.target.value) || 5)}
                    className="w-full px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="5"
                  />
                </div>
              </div>
            );
        }
        break;
    }

    return <div className="text-slate-400">No editor available for this content type.</div>;
  };

  return (
    <div className="p-1 pt-24 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleNavigation}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1 md:mb-2">Edit Content</h1>
              <p className="text-slate-400 text-sm md:text-base">{content.title}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-3 md:px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <Save className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 md:p-6">
          {renderEditFields()}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-4 md:p-6 max-w-md w-full mx-2 md:mx-4 relative">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-yellow-500/20 rounded-lg">
                <svg className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white">Unsaved Changes</h3>
            </div>
            
            <p className="text-slate-300 mb-4 md:mb-6 text-sm md:text-base">
              You have unsaved changes. If you leave now, your changes will be lost. Are you sure you want to continue?
            </p>
            
            <div className="flex gap-2 md:gap-4">
              <button
                onClick={cancelNavigation}
                className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm md:text-base"
              >
                Stay on Page
              </button>
              <button
                onClick={confirmNavigation}
                className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors text-sm md:text-base"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentEdit; 