import { Database, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {

  const handleSeedContent = async () => {
    toast.error('Content seeding feature is currently unavailable.');
  };

  return (
    <div className="p-1 pt-8 md:p-3">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1 md:mb-2">Settings</h1>
          <p className="text-slate-400 text-sm md:text-base">Manage your website settings</p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-8">
        {/* Database Management */}
        <div className="card bg-slate-800/50">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Database className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
            <h2 className="text-lg md:text-xl font-semibold text-white">Database Management</h2>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 flex-shrink-0 mt-0.5 md:mt-1" />
              <div>
                <h3 className="font-medium text-yellow-500 mb-1 text-sm md:text-base">Content Seeding</h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  This will populate your database with initial content. Only use this on a fresh installation.
                </p>
              </div>
            </div>

            <button
              onClick={handleSeedContent}
              disabled={true}
              className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-slate-600 text-slate-400 cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
            >
              <Database className="h-4 w-4 md:h-5 md:w-5" />
              Seed Content (Unavailable)
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings; 