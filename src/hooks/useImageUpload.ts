import { useState } from 'react';
import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from '../lib/cloudinary';
import { compressImage, CompressedImage, COMPRESSION_PRESETS } from '../utils/imageCompression';
import toast from 'react-hot-toast';

export interface UploadProgress {
  stage: 'compressing' | 'uploading' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface UseImageUploadOptions {
  folder: string;
  preset: keyof typeof COMPRESSION_PRESETS;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (url: string, compressed: CompressedImage) => void;
  onError?: (error: string) => void;
}

export const useImageUpload = (options: UseImageUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    stage: 'complete',
    progress: 0,
    message: ''
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    if (uploading) return null;

    try {
      setUploading(true);
      
      // Stage 1: Compression
      setProgress({
        stage: 'compressing',
        progress: 0,
        message: 'Compressing image...'
      });

      const compressed = await compressImage(file, COMPRESSION_PRESETS[options.preset]);
      
      setProgress({
        stage: 'compressing',
        progress: 50,
        message: `Compressed from ${compressed.originalSize}KB to ${compressed.compressedSize}KB`
      });

      // Stage 2: Upload
      setProgress({
        stage: 'uploading',
        progress: 60,
        message: 'Uploading to Cloudinary...'
      });

      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
      formData.append('folder', `${CLOUDINARY_CONFIG.folder}/${options.folder}`);

      const response = await fetch(getCloudinaryUploadUrl(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'Upload completed successfully!'
      });

      // Call success callback
      options.onSuccess?.(data.secure_url, compressed);
      
      // Show success message
      toast.success(`Image uploaded successfully! (${compressed.compressedSize}KB)`);
      
      return data.secure_url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage
      });

      options.onError?.(errorMessage);
      toast.error(errorMessage);
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  const resetProgress = () => {
    setProgress({
      stage: 'complete',
      progress: 0,
      message: ''
    });
  };

  return {
    uploadImage,
    uploading,
    progress,
    resetProgress
  };
};
