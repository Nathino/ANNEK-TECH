import React, { useMemo, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/quill.css';
import { useImageUpload } from '../hooks/useImageUpload';
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

  // Use the image upload hook with compression
  const { uploadImage, uploading } = useImageUpload({
    folder: 'blog-content',
    preset: 'blogContent',
    onError: (error) => {
      console.error('Image upload error:', error);
    }
  });

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
                  quill.insertText(range?.index || 0, uploading ? 'Compressing and uploading image...' : 'Uploading image...');
                  
                  // Upload to Cloudinary with compression
                  const imageUrl = await uploadImage(file);
                  
                  if (imageUrl) {
                    // Insert image URL into editor
                    if (range) {
                      quill.deleteText(range.index, 40); // Remove loading text
                      quill.insertEmbed(range.index, 'image', imageUrl);
                    }
                  } else {
                    // Remove loading text on failure
                    if (range) {
                      quill.deleteText(range.index, 40);
                    }
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
