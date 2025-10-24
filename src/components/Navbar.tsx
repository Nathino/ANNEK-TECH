import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, RefreshCw, User } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAppRefresh } from '../hooks/useAppRefresh';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { refreshApp, isRefreshing } = useAppRefresh();

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close user menu when route changes
  useEffect(() => {
    setShowUserMenu(false);
  }, [location]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/portfolio', label: 'PORTFOLIO' },
    { path: '/blog', label: 'BLOG' },
    { path: '/contact', label: 'CONTACT' }
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'shadow-xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/50 dark:border-slate-700/50' 
          : 'shadow-lg bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800'
      }`}
      style={{
        backgroundColor: scrolled 
          ? (isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)')
          : (isDark ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)')
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent hover:from-emerald-500 hover:via-teal-400 hover:to-emerald-500 transition-all duration-300">
                ANNEK TECH
              </h1>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveLink(link.path)
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                  {isActiveLink(link.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                  )}
                </Link>
              ))}
              <div className="ml-6 pl-4 border-l border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                {/* Refresh Button - Desktop */}
                <button
                  onClick={refreshApp}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh App"
                >
                  <RefreshCw className={`h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-180 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 group"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? 
                    <Sun className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-180 transition-transform duration-300" /> : 
                    <Moon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
                  }
                </button>

                {/* User Menu - Desktop */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 group"
                    title="User Menu"
                  >
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </button>

                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                        <button
                          onClick={() => {
                            refreshApp();
                            setShowUserMenu(false);
                          }}
                          disabled={isRefreshing}
                          className="w-full px-4 py-3 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                          <span>{isRefreshing ? 'Refreshing...' : 'Refresh App'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {/* Refresh Button - Mobile */}
            <button
              onClick={refreshApp}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isMobile ? "Pull down to refresh or tap to refresh" : "Refresh App"}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? 
                <Sun className="h-5 w-5" /> : 
                <Moon className="h-5 w-5" />
              }
            </button>

            {/* User Menu - Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                title="User Menu"
              >
                <User className="h-5 w-5" />
              </button>

              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    <button
                      onClick={() => {
                        refreshApp();
                        setShowUserMenu(false);
                      }}
                      disabled={isRefreshing}
                      className="w-full px-4 py-3 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Refreshing...' : 'Refresh App'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${
                  isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
                }`} />
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${
                  isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-4 space-y-1 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500'
                    : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Refresh Indicator */}
      {isMobile && isRefreshing && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-emerald-500 text-white text-center py-2 text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Refreshing app...</span>
          </div>
        </div>
      )}
    </nav>
  );
}