import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['axios']
  },
  resolve: {
    alias: {
      '@firebase/app': '@firebase/app',
      '@firebase/auth': '@firebase/auth',
      '@firebase/firestore': '@firebase/firestore',
      '@firebase/analytics': '@firebase/analytics',
      '@firebase/storage': '@firebase/storage'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-hot-toast'],
          // Admin chunks
          'admin-pages': [
            './src/pages/admin/BlogManagement.tsx',
            './src/pages/admin/ContentEdit.tsx',
            './src/pages/admin/Messages.tsx',
            './src/pages/admin/MediaManager.tsx',
            './src/pages/admin/Settings.tsx'
          ],
          // Public pages
          'public-pages': [
            './src/pages/Home.tsx',
            './src/pages/Blog.tsx',
            './src/pages/BlogPost.tsx',
            './src/pages/Contact.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
