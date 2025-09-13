export const CLOUDINARY_CONFIG = {
  cloudName: 'dt8iutyk1',
  apiKey: '591742133835776',
  apiSecret: '',
  uploadPreset: 'annek_tech',
  folder: 'annek-tech-uploads'
};

// Helper function to get the upload URL
export const getCloudinaryUploadUrl = () => 
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;

// Helper function to get the delete URL
export const getCloudinaryDeleteUrl = () =>
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/destroy`;