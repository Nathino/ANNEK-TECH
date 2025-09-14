import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  Settings,
  Menu,
  X,
  Mail,
  BookOpen,
  BarChart3,
  Search
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { 
      name: 'Blog Management', 
      href: '/admin/blog', 
      icon: BookOpen,
      submenu: [
        { name: 'All Posts', href: '/admin/blog', icon: FileText },
        { name: 'Analytics', href: '/admin/blog/analytics', icon: BarChart3 },
      ]
    },
    { name: 'SEO Monitor', href: '/admin/seo', icon: Search },
    { name: 'Media', href: '/admin/media', icon: Image },
    { name: 'Messages', href: '/admin/messages', icon: Mail },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 md:hidden">
        <button
          onClick={onToggle}
          className="p-4 text-slate-400 hover:text-white focus:outline-none"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-slate-900">
            <Link to="/admin/dashboard" className="text-xl font-bold text-emerald-400">
              ANNEK TECH
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              
              return (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 768) { // Close sidebar on mobile when clicking a link
                        onToggle();
                      }
                    }}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-emerald-400' : ''}`} />
                    {item.name}
                  </Link>
                  
                  {/* Submenu */}
                  {hasSubmenu && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = currentPath === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                onToggle();
                              }
                            }}
                            className={`flex items-center px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                              isSubActive
                                ? 'bg-emerald-400/20 text-emerald-400'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
                            }`}
                          >
                            <subItem.icon className={`h-4 w-4 mr-2 ${isSubActive ? 'text-emerald-400' : ''}`} />
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 bg-slate-900/50">
            <div className="flex items-center px-4 py-3 text-sm text-slate-400">
              <Settings className="h-5 w-5 mr-3" />
              Admin Panel
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 