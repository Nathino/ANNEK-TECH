import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from '../../lib/cloudinary';

interface NewContentItem {
  title: string;
  type: 'home' | 'portfolio' | 'contact' | 'project' | 'partner' | 'blog';
  section: string;
  content: Record<string, any>;
  status: 'published' | 'draft';
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
}

const ContentNew: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [content, setContent] = useState<NewContentItem>({
    title: '',
    type: 'home',
    section: 'hero',
    content: {},
    status: 'draft',
    slug: '',
    seoTitle: '',
    seoDescription: ''
  });

  // Generate URL slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Generate SEO title from content
  const generateSEOTitle = (title: string, type: string) => {
    if (type === 'blog') {
      return `${title} | ANNEK TECH Blog`;
    }
    return `${title} | ANNEK TECH`;
  };

  // Generate SEO description from content
  const generateSEODescription = (content: NewContentItem) => {
    if (content.type === 'blog') {
      // Use excerpt if available, otherwise truncate title
      const excerpt = content.content.excerpt || '';
      if (excerpt.length > 0) {
        return excerpt.length > 160 ? excerpt.substring(0, 157) + '...' : excerpt;
      }
      return `Read our latest blog post: ${content.title}. Expert insights and updates from ANNEK TECH.`;
    }
    return `Discover ${content.title} at ANNEK TECH. Professional web development and technology solutions.`;
  };

  // Auto-generate SEO fields when content changes
  const autoGenerateSEO = (newContent: NewContentItem) => {
    const seoTitle = newContent.seoTitle || generateSEOTitle(newContent.title, newContent.type);
    const seoDescription = newContent.seoDescription || generateSEODescription(newContent);
    const slug = newContent.slug || (newContent.type === 'blog' ? generateSlug(newContent.title) : '');

    return {
      ...newContent,
      seoTitle,
      seoDescription,
      slug
    };
  };

  // Validation functions
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title':
        if (!value || value.trim().length === 0) {
          newErrors.title = 'Title is required';
        } else if (value.length < 3) {
          newErrors.title = 'Title must be at least 3 characters';
        } else {
          delete newErrors.title;
        }
        break;
      
      case 'excerpt':
        if (content.type === 'blog' && (!value || value.trim().length === 0)) {
          newErrors.excerpt = 'Blog excerpt is required';
        } else if (content.type === 'blog' && value.length < 10) {
          newErrors.excerpt = 'Excerpt must be at least 10 characters';
        } else {
          delete newErrors.excerpt;
        }
        break;
      
      case 'content':
        if (content.type === 'blog' && (!value || value.trim().length === 0)) {
          newErrors.content = 'Blog content is required';
        } else if (content.type === 'blog' && value.length < 50) {
          newErrors.content = 'Content must be at least 50 characters';
        } else {
          delete newErrors.content;
        }
        break;
      
      case 'tags':
        if (content.type === 'blog' && (!value || value.length === 0)) {
          newErrors.tags = 'At least one tag is required';
        } else {
          delete newErrors.tags;
        }
        break;
      
      case 'seoTitle':
        if (value && value.length > 60) {
          newErrors.seoTitle = 'SEO title must be 60 characters or less';
        } else {
          delete newErrors.seoTitle;
        }
        break;
      
      case 'seoDescription':
        if (value && value.length > 160) {
          newErrors.seoDescription = 'SEO description must be 160 characters or less';
        } else {
          delete newErrors.seoDescription;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fieldsToValidate = ['title'];
    
    if (content.type === 'blog') {
      fieldsToValidate.push('excerpt', 'content', 'tags');
    }
    
    let isValid = true;
    fieldsToValidate.forEach(field => {
      const value = field === 'tags' ? content.content.tags : 
                   field === 'excerpt' ? content.content.excerpt :
                   field === 'content' ? content.content.content :
                   content[field as keyof NewContentItem];
      if (!validateField(field, value)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast.error('Please log in as admin to upload images');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
      formData.append('folder', `${CLOUDINARY_CONFIG.folder}/blog`);

      const response = await fetch(getCloudinaryUploadUrl(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleTypeChange = (selectedType: 'home' | 'portfolio' | 'contact' | 'project' | 'partner' | 'blog') => {
    let newContent = {};
    let newSection = '';

    switch (selectedType) {
      case 'home':
        newSection = 'hero';
        break;
      case 'portfolio':
        newSection = 'header';
        break;
      case 'contact':
        newSection = 'contact-info';
        break;
      case 'project':
        newSection = 'projects';
        newContent = {
          title: '',
          description: '',
          image: '',
          technologies: [],
          liveDemoUrl: '',
          githubUrl: ''
        };
        break;
      case 'partner':
        newSection = 'partners';
        newContent = {
          name: '',
          logo: '',
          description: '',
          category: 'We Grow Together'
        };
        break;
      case 'blog':
        newSection = 'post';
        newContent = {
          excerpt: '',
          content: '',
          featuredImage: '',
          tags: [],
          author: 'ANNEK TECH',
          readTime: 5,
          category: 'general'
        };
        break;
    }

    const updatedContent = {
      ...content,
      type: selectedType,
      section: newSection,
      content: newContent
    };
    
    // Auto-generate SEO fields
    const contentWithSEO = autoGenerateSEO(updatedContent);
    setContent(contentWithSEO);
  };

  const getSections = (type: string) => {
    switch(type) {
      case 'home':
        return ['hero', 'services', 'featured-partners'];
      case 'portfolio':
        return ['header', 'projects'];
      case 'contact':
        return ['header', 'contact-info', 'form'];
      case 'project':
        return ['projects'];
      case 'partner':
        return ['partners'];
      case 'blog':
        return ['post'];
      default:
        return [];
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please log in as admin to add content');
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);
      const contentCollection = collection(db, 'content');
      
      // Generate slug if not provided
      const slug = content.slug || generateSlug(content.title);
      
      // Generate SEO title and description if not provided
      const seoTitle = content.seoTitle || content.title;
      const seoDescription = content.seoDescription || 
        (content.type === 'blog' ? content.content.excerpt : '') || 
        content.title;
      
      const docData = {
        ...content,
        slug,
        seoTitle,
        seoDescription,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(contentCollection, docData);
      toast.success('Content created successfully');
      navigate('/admin/content');
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">Please log in as admin to add content</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-2 pt-24 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/content')}
              className="p-3 text-slate-400 hover:text-slate-200 transition-colors hover:bg-slate-800 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-emerald-400 mb-2">Add New Content</h1>
              <p className="text-slate-400 text-sm md:text-lg">Create new content for your website</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || Object.keys(errors).length > 0}
            className="flex items-center px-4 md:px-6 py-2 md:py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25 text-sm md:text-base"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Content'}
          </button>
        </div>

        {/* Content Type Selection */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-4 md:p-6 border border-emerald-500/20">
            <h2 className="text-lg md:text-xl font-semibold text-slate-200 mb-3 md:mb-4">Content Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {[
                { value: 'home', label: 'Home Page', icon: '🏠' },
                { value: 'portfolio', label: 'Portfolio', icon: '💼' },
                { value: 'contact', label: 'Contact', icon: '📞' },
                { value: 'project', label: 'Project', icon: '🚀' },
                { value: 'partner', label: 'Partner', icon: '🤝' },
                { value: 'blog', label: 'Blog Post', icon: '📝' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTypeChange(option.value as NewContentItem['type'])}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${
                    content.type === option.value
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xl md:text-2xl mb-1 md:mb-2">{option.icon}</div>
                  <div className="text-xs md:text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-4 md:p-8 space-y-6 md:space-y-8 border border-slate-700/50">
          {/* Basic Information */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-semibold text-slate-200 mb-3 md:mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content Title *
                </label>
                <input
                  type="text"
                  value={content.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const updatedContent = { 
                      ...content, 
                      title: newTitle
                    };
                    
                    // Auto-generate SEO fields when title changes
                    const contentWithSEO = autoGenerateSEO(updatedContent);
                    setContent(contentWithSEO);
                    validateField('title', newTitle);
                  }}
                  className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.title 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-slate-600 focus:ring-emerald-500/50 focus:border-emerald-500'
                  }`}
                  placeholder="Enter content title"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Section
                </label>
                <select
                  value={content.section}
                  onChange={(e) => setContent(prev => ({ ...prev, section: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
                >
                  {getSections(content.type).map((section) => (
                    <option key={section} value={section}>
                      {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={content.status}
                  onChange={(e) => setContent(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
                >
                  <option value="draft">📝 Draft</option>
                  <option value="published">🚀 Published</option>
                </select>
              </div>

              {content.type === 'blog' && content.slug && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Preview URL
                  </label>
                  <div className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-300 text-sm">
                    /blog/{content.slug}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Fields */}
          {content.type === 'project' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Project Description
                </label>
                <textarea
                  value={content.content.description || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, description: e.target.value }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Enter project description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={content.content.image || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, image: e.target.value }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={content.content.technologies?.join(', ') || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, technologies: e.target.value.split(',').map(t => t.trim()) }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="React, TypeScript, Firebase, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Live Demo URL
                </label>
                <input
                  type="text"
                  value={content.content.liveDemoUrl || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, liveDemoUrl: e.target.value }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  GitHub URL
                </label>
                <input
                  type="text"
                  value={content.content.githubUrl || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, githubUrl: e.target.value }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          )}

          {/* Partner Fields */}
          {content.type === 'partner' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Partner Name
                </label>
                <input
                  type="text"
                  value={content.content.name || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, name: e.target.value }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter partner name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={content.content.logo || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, logo: e.target.value }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter logo URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  value={content.content.description || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, description: e.target.value }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Enter partner description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={content.content.category || 'We Grow Together'}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    content: { ...prev.content, category: e.target.value }
                  }))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter category"
                />
              </div>
            </div>
          )}

          {/* Blog Post Fields */}
          {content.type === 'blog' && (
            <div className="space-y-6 md:space-y-8">
              {/* SEO Fields */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-4 md:p-6 border border-blue-500/20">
                <h3 className="text-lg md:text-xl font-semibold text-slate-200 mb-3 md:mb-4 flex items-center gap-2">
                  <span>🔍</span> SEO Settings
                </h3>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                  <p className="text-sm text-blue-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">💡</span>
                    <span>
                      SEO fields are automatically generated based on your content. You can customize them manually if needed. 
                      The system will create SEO-optimized titles, descriptions, and URL slugs for better search engine visibility.
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      URL Slug
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Auto-generated</span>
                    </label>
                    <input
                      type="text"
                      value={content.slug || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="blog-post-url-slug"
                    />
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <span>🔗</span> URL: /blog/{content.slug || 'your-slug'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      SEO Title
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Auto-generated</span>
                    </label>
                    <input
                      type="text"
                      value={content.seoTitle || ''}
                      onChange={(e) => {
                        setContent(prev => ({ ...prev, seoTitle: e.target.value }));
                        validateField('seoTitle', e.target.value);
                      }}
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.seoTitle 
                          ? 'border-red-500 focus:ring-red-500/50' 
                          : 'border-slate-600 focus:ring-blue-500/50 focus:border-blue-500'
                      }`}
                      placeholder="SEO optimized title (60 characters max)"
                      maxLength={60}
                    />
                    <p className={`text-xs mt-2 flex items-center gap-1 ${
                      (content.seoTitle?.length || 0) > 60 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      <span>📊</span> {content.seoTitle?.length || 0}/60 characters
                    </p>
                    {errors.seoTitle && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <span>⚠️</span> {errors.seoTitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    SEO Description
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Auto-generated</span>
                  </label>
                  <textarea
                    value={content.seoDescription || ''}
                    onChange={(e) => {
                      setContent(prev => ({ ...prev, seoDescription: e.target.value }));
                      validateField('seoDescription', e.target.value);
                    }}
                    className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.seoDescription 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-slate-600 focus:ring-blue-500/50 focus:border-blue-500'
                    }`}
                    rows={3}
                    placeholder="SEO meta description (160 characters max)"
                    maxLength={160}
                  />
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    (content.seoDescription?.length || 0) > 160 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    <span>📊</span> {content.seoDescription?.length || 0}/160 characters
                  </p>
                  {errors.seoDescription && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.seoDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Blog Content */}
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-slate-200 mb-3 md:mb-4 flex items-center gap-2">
                  <span>📝</span> Blog Content
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Blog Excerpt *
                  </label>
                  <textarea
                    value={content.content.excerpt || ''}
                    onChange={(e) => {
                      const newExcerpt = e.target.value;
                      const updatedContent = {
                        ...content,
                        content: { ...content.content, excerpt: newExcerpt }
                      };
                      
                      // Auto-generate SEO description when excerpt changes
                      const contentWithSEO = autoGenerateSEO(updatedContent);
                      setContent(contentWithSEO);
                      validateField('excerpt', newExcerpt);
                    }}
                    className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.excerpt 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-slate-600 focus:ring-emerald-500/50 focus:border-emerald-500'
                    }`}
                    rows={3}
                    placeholder="Enter a brief excerpt for the blog post"
                    required
                  />
                  {errors.excerpt && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.excerpt}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Blog Content *
                  </label>
                  <textarea
                    value={content.content.content || ''}
                    onChange={(e) => {
                      setContent(prev => ({
                        ...prev,
                        content: { ...prev.content, content: e.target.value }
                      }));
                      validateField('content', e.target.value);
                    }}
                    className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.content 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-slate-600 focus:ring-emerald-500/50 focus:border-emerald-500'
                    }`}
                    rows={10}
                    placeholder="Enter the main blog post content"
                    required
                  />
                  {errors.content && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.content}
                    </p>
                  )}
                </div>
                
                {/* Featured Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Featured Image
                  </label>
                  <div className="space-y-4">
                    {content.content.featuredImage && (
                      <div className="relative group">
                        <img
                          src={content.content.featuredImage}
                          alt="Featured"
                          className="w-full h-48 object-cover rounded-xl border border-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => setContent(prev => ({
                            ...prev,
                            content: { ...prev.content, featuredImage: '' }
                          }))}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl cursor-pointer hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-emerald-500/25">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleImageUpload(file);
                              if (url) {
                                setContent(prev => ({
                                  ...prev,
                                  content: { ...prev.content, featuredImage: url }
                                }));
                              }
                            }
                          }}
                          disabled={uploading}
                        />
                      </label>
                      
                      <div className="flex-1">
                        <input
                          type="text"
                          value={content.content.featuredImage || ''}
                          onChange={(e) => setContent(prev => ({
                            ...prev,
                            content: { ...prev.content, featuredImage: e.target.value }
                          }))}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
                          placeholder="Or enter image URL directly"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={content.content.category || 'general'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        content: { ...prev.content, category: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tags * (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={content.content.tags?.join(', ') || ''}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                        setContent(prev => ({
                          ...prev,
                          content: { ...prev.content, tags }
                        }));
                        validateField('tags', tags);
                      }}
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.tags 
                          ? 'border-red-500 focus:ring-red-500/50' 
                          : 'border-slate-600 focus:ring-emerald-500/50 focus:border-emerald-500'
                      }`}
                      placeholder="Technology, Web Development, etc."
                      required
                    />
                    {errors.tags && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <span>⚠️</span> {errors.tags}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={content.content.author || 'ANNEK TECH'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        content: { ...prev.content, author: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter author name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={content.content.readTime || 5}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      content: { ...prev.content, readTime: parseInt(e.target.value) || 5 }
                    }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
                    placeholder="5"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentNew; 