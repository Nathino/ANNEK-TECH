import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, ExternalLink, Key } from 'lucide-react';
import toast from 'react-hot-toast';

interface DemoCredentialsProps {
  credentials: {
    email: string;
    password: string;
    instructions?: string;
  };
  projectUrl: string;
  projectTitle: string;
}

const DemoCredentials: React.FC<DemoCredentialsProps> = ({ 
  credentials, 
  projectUrl, 
  projectTitle 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleTryDemo = () => {
    window.open(projectUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 md:p-6 border border-emerald-200 dark:border-emerald-700/50 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Key className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Demo Credentials
        </h3>
      </div>

      <div className="space-y-4">
        {/* Instructions */}
        {credentials.instructions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">💡 Note:</span> {credentials.instructions}
            </p>
          </div>
        )}

        {/* Credentials */}
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Email
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-900 dark:text-white flex-1">
                  {credentials.email}
                </span>
                <button
                  onClick={() => copyToClipboard(credentials.email, 'Email')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  title="Copy email"
                >
                  <AnimatePresence mode="wait">
                    {copiedField === 'Email' ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-4 w-4 text-emerald-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Password
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-900 dark:text-white flex-1">
                  {showPassword ? credentials.password : '••••••••'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(credentials.password, 'Password')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title="Copy password"
                  >
                    <AnimatePresence mode="wait">
                      {copiedField === 'Password' ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="h-4 w-4 text-emerald-500" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Copy className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Try Demo Button */}
        <motion.button
          onClick={handleTryDemo}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Try {projectTitle} Demo
        </motion.button>

        {/* Quick Login Instructions */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            <span className="font-medium">Quick Login:</span> Click "Try Demo" → Use the credentials above to login
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoCredentials;
