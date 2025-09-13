import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './admin/Sidebar';
import AdminNavbar from './admin/AdminNavbar';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="pt-16 md:pl-64 mx-4 my-1 md:mx-6 md:my-2">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 