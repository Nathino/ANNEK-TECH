import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, UserCircle, Settings, LogOut, RefreshCw } from 'lucide-react';
import { useAppRefresh } from '../../hooks/useAppRefresh';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { refreshApp, isRefreshing } = useAppRefresh();

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/admin/login');
  };

  return (
    <nav className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-slate-800 border-b border-slate-700">
      <div className="px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center md:hidden">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Center ANNEK TECH on mobile */}
          <div className="flex-1 text-center md:hidden">
            <h1 className="text-xl font-bold text-emerald-400">ANNEK TECH</h1>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshApp}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh App"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Admin Profile Section with Dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors"
            >
              <UserCircle className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">Admin</span>
            </button>

            {showDropdown && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/50 md:hidden"
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => {
                      refreshApp();
                      setShowDropdown(false);
                    }}
                    disabled={isRefreshing}
                    className="w-full px-4 py-3 text-left text-slate-400 hover:bg-slate-700 hover:text-white flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh App'}</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/settings');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-slate-400 hover:bg-slate-700 hover:text-white flex items-center gap-3"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-slate-400 hover:bg-slate-700 hover:text-white flex items-center gap-3"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 