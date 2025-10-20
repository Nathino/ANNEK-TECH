import React, { useMemo, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/quill.css';
import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from '../lib/cloudinary';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  height = "300px"
}) => {
  const quillRef = useRef<ReactQuill>(null);

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
      formData.append('folder', `${CLOUDINARY_CONFIG.folder}/blog-content`);

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
      throw error;
    }
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['code-block', 'blockquote'],
        ['clean']
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
              try {
                // Show loading state
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  const range = quill.getSelection();
                  quill.insertText(range?.index || 0, 'Uploading image...');
                  
                  // Upload to Cloudinary
                  const imageUrl = await handleImageUpload(file);
                  
                  // Insert image URL into editor
                  if (range) {
                    quill.deleteText(range.index, 18); // Remove "Uploading image..." text
                    quill.insertEmbed(range.index, 'image', imageUrl);
                  }
                }
              } catch (error) {
                console.error('Image upload failed:', error);
                toast.error('Failed to upload image');
              }
            }
          };
        }
      }
    }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'align',
    'link', 'image', 'code-block', 'blockquote'
  ];

  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: height }}
      />
    </div>
  );
};

export default RichTextEditor;
