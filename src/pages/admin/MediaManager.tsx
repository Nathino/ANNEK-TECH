import { useState, useEffect } from 'react';
import { Upload, Trash, Image, FileText, Film, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from '../../lib/cloudinary';
import { useAuth } from '../../hooks/useAuth';

interface MediaItem {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
  uploadDate: string;
  publicId: string;
}

const MediaManager: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchMedia();
    }
  }, [user, authLoading]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const mediaCollection = collection(db, 'media');
      const querySnapshot = await getDocs(mediaCollection);
      const mediaItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaItem[];
      setMedia(mediaItems);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to fetch media. Please ensure you are logged in as admin.');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleUpload(files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async (files: File[]) => {
    if (!user) {
      toast.error('Please log in as admin to upload files');
      return;
    }

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
        formData.append('folder', CLOUDINARY_CONFIG.folder);

        const response = await fetch(getCloudinaryUploadUrl(), {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Upload failed: ${errorData}`);
        }

        const data = await response.json();

        // Add the file metadata to Firestore
        const mediaCollection = collection(db, 'media');
        await addDoc(mediaCollection, {
          name: file.name,
          type: file.type,
          url: data.secure_url,
          size: formatFileSize(file.size),
          uploadDate: new Date().toISOString(),
          publicId: data.public_id
        });

        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Failed to upload ${file.name}. Please ensure you are logged in as admin.`);
      }
    }
    fetchMedia();
  };

  const handleDelete = async (id: string, publicId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      // Delete from Cloudinary
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
      
      const timestamp = Math.round((new Date()).getTime() / 1000);
      formData.append('timestamp', timestamp.toString());
      
      // Generate signature - Note: In production, this should be done server-side
      // For now, we'll just delete from Firestore
      
      // Delete from Firestore
      const mediaCollection = collection(db, 'media');
      await deleteDoc(doc(mediaCollection, id));

      toast.success('File deleted successfully');
      fetchMedia();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Film;
    if (type.startsWith('text/')) return FileText;
    return File;
  };

  return (
    <div className="p-3 pt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">Media Manager</h1>
          <p className="text-slate-400">Manage your media files</p>
        </div>
      </div>

      {authLoading ? (
        <div className="text-center py-8 text-slate-400">Checking authentication...</div>
      ) : !user ? (
        <div className="text-center py-8 text-slate-400">Please log in as admin to manage media</div>
      ) : (
        <>
          {/* Upload Area */}
          <div
            className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center ${
              dragActive
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-700 hover:border-emerald-500/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-300 mb-2">Drag and drop files here</p>
            <p className="text-slate-400 text-sm">or</p>
            <label className="mt-4 inline-block">
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))}
              />
              <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors">
                Select Files
              </span>
            </label>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading media...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {media.map((item) => {
                const FileIcon = getFileIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-800/50 rounded-xl overflow-hidden group hover:ring-2 hover:ring-emerald-500/50 transition-all"
                  >
                    <div className="aspect-square relative">
                      {item.type.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-700/50">
                          <FileIcon className="h-16 w-16 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(item.id, item.publicId)}
                          className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash className="h-5 w-5 text-white" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            toast.success('URL copied to clipboard');
                          }}
                          className="p-2 bg-emerald-500 rounded-full hover:bg-emerald-600 transition-colors"
                          title="Copy URL"
                        >
                          <FileText className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-300 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{item.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaManager; 