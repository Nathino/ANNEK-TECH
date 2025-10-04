import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard';
import Login from '../pages/admin/Login';
import ContentManager from '../pages/admin/ContentManager';
import ContentEdit from '../pages/admin/ContentEdit';
import MediaManager from '../pages/admin/MediaManager';
import Settings from '../pages/admin/Settings';
import SEOMonitor from '../pages/admin/SEOMonitor';
import PartnerSubmissions from '../pages/admin/PartnerSubmissions';
import ProtectedRoute from '../components/ProtectedRoute';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="content"
        element={
          <ProtectedRoute>
            <ContentManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="content/edit/:id"
        element={
          <ProtectedRoute>
            <ContentEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="media"
        element={
          <ProtectedRoute>
            <MediaManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="seo"
        element={
          <ProtectedRoute>
            <SEOMonitor />
          </ProtectedRoute>
        }
      />
      <Route
        path="partners"
        element={
          <ProtectedRoute>
            <PartnerSubmissions />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes; 