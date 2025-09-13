import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 