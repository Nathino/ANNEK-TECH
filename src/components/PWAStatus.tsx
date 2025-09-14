import React from 'react';
import { Wifi, WifiOff, Download, CheckCircle, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface PWAStatusProps {
  showInstallButton?: boolean;
  className?: string;
}

const PWAStatus: React.FC<PWAStatusProps> = ({ 
  showInstallButton = true, 
  className = '' 
}) => {
  const { isOnline, isInstalled, isStandalone, isInstallable, installApp } = usePWA();

  const handleInstall = async () => {
    try {
      await installApp();
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <Wifi className="h-5 w-5 text-emerald-500" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-500" />
        )}
        <span className={`text-sm font-medium ${
          isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* PWA Status */}
      {isInstalled || isStandalone ? (
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            App Installed
          </span>
        </div>
      ) : isInstallable && showInstallButton ? (
        <button
          onClick={handleInstall}
          className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          <span>Install App</span>
        </button>
      ) : null}

      {/* PWA Indicator */}
      {isStandalone && (
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <Smartphone className="h-4 w-4" />
          <span className="text-xs">PWA Mode</span>
        </div>
      )}
    </div>
  );
};

export default PWAStatus;
