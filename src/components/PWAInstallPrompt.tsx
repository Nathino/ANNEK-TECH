import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallPromptProps {
  onClose?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isStandalone, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Show prompt if app is installable and not already installed
    if (isInstallable && !isInstalled && !isStandalone) {
      // Check if user has previously dismissed the prompt
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        // Show with a slight delay for better UX
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstallable, isInstalled, isStandalone]);

  const handleInstall = async () => {
    try {
      await installApp();
      setIsVisible(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsClosing(true);
    // Store dismissal in localStorage
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose?.();
    }, 300);
  };

  const handleClose = () => {
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Prompt Card */}
      <div 
        className={`relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all duration-300 ${
          isClosing 
            ? 'scale-95 opacity-0 translate-y-4' 
            : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Download className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
            Install ANNEK TECH
          </h3>
          
          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 text-center mb-6 leading-relaxed">
            Install our app for a better experience with offline access, faster loading, and native app features.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              Works offline with cached content
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              Faster loading and better performance
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              Access from your home screen
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              Push notifications for updates
            </div>
          </div>

          {/* Device Icons */}
          <div className="flex justify-center space-x-4 mb-6">
            <div className="flex flex-col items-center text-xs text-slate-500 dark:text-slate-400">
              <Smartphone className="h-6 w-6 mb-1" />
              Mobile
            </div>
            <div className="flex flex-col items-center text-xs text-slate-500 dark:text-slate-400">
              <Tablet className="h-6 w-6 mb-1" />
              Tablet
            </div>
            <div className="flex flex-col items-center text-xs text-slate-500 dark:text-slate-400">
              <Monitor className="h-6 w-6 mb-1" />
              Desktop
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors font-medium"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
