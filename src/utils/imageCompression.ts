// Image compression utilities
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressedImage {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
}

// Default compression settings
const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  maxSizeKB: 500,
  format: 'jpeg'
};

// Validate file type
export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};

// Get file size in KB
export const getFileSizeKB = (file: File): number => {
  return Math.round(file.size / 1024);
};

// Resize image using canvas
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  format: string = 'jpeg'
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Compress image with multiple attempts if needed
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImage> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate file
  if (!validateImageFile(file)) {
    throw new Error('Invalid file type. Please upload a valid image file.');
  }

  const originalSize = getFileSizeKB(file);
  
  // If file is already small enough, return as is
  if (originalSize <= opts.maxSizeKB) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      dimensions: { width: 0, height: 0 } // Will be filled by the component
    };
  }

  try {
    // First attempt with specified quality
    let compressedFile = await resizeImage(
      file,
      opts.maxWidth,
      opts.maxHeight,
      opts.quality,
      opts.format
    );

    let compressedSize = getFileSizeKB(compressedFile);
    let quality = opts.quality;

    // If still too large, reduce quality progressively
    while (compressedSize > opts.maxSizeKB && quality > 0.1) {
      quality -= 0.1;
      compressedFile = await resizeImage(
        file,
        opts.maxWidth,
        opts.maxHeight,
        quality,
        opts.format
      );
      compressedSize = getFileSizeKB(compressedFile);
    }

    // Get final dimensions
    const dimensions = await getImageDimensions(compressedFile);

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: compressedSize / originalSize,
      dimensions
    };
  } catch (error) {
    throw new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get image dimensions
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Compression presets for different use cases
export const COMPRESSION_PRESETS = {
  // For blog content images
  blogContent: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.8,
    maxSizeKB: 300,
    format: 'jpeg' as const
  },
  // For featured images
  featured: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    maxSizeKB: 500,
    format: 'jpeg' as const
  },
  // For thumbnails
  thumbnail: {
    maxWidth: 400,
    maxHeight: 300,
    quality: 0.7,
    maxSizeKB: 100,
    format: 'jpeg' as const
  },
  // For media manager
  media: {
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 0.8,
    maxSizeKB: 400,
    format: 'jpeg' as const
  }
};
