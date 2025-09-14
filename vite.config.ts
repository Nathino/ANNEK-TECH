import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(
  ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
    chunkSizeWarningLimit: 1000,
    // PWA optimization
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // PWA specific configurations
  define: {
    // Make environment variables available to the app
    'process.env': env,
    __PWA_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },
  server: {
    host: true
  }
  };
});
