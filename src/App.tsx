import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Sitemap from './pages/Sitemap';
import AdminLayout from './components/AdminLayout';
import Login from './pages/admin/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load admin pages for better performance
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));
const ContentNew = lazy(() => import('./pages/admin/ContentNew'));
const ContentEdit = lazy(() => import('./pages/admin/ContentEdit'));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement'));
const BlogAnalytics = lazy(() => import('./pages/admin/BlogAnalytics'));
const MediaManager = lazy(() => import('./pages/admin/MediaManager'));
const Messages = lazy(() => import('./pages/admin/Messages'));
const Settings = lazy(() => import('./pages/admin/Settings'));

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Toaster position="top-right" />
      {!isAdminRoute && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/sitemap" element={<Sitemap />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="dashboard" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense></ProtectedRoute>} />
                <Route path="content" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><ContentManager /></Suspense></ProtectedRoute>} />
                <Route path="content/new" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><ContentNew /></Suspense></ProtectedRoute>} />
                <Route path="content/edit/:id" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><ContentEdit /></Suspense></ProtectedRoute>} />
                <Route path="blog" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><BlogManagement /></Suspense></ProtectedRoute>} />
                <Route path="blog/analytics" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><BlogAnalytics /></Suspense></ProtectedRoute>} />
                <Route path="media" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><MediaManager /></Suspense></ProtectedRoute>} />
                <Route path="messages" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Messages /></Suspense></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Settings /></Suspense></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </Router>
  );
};

export default App;