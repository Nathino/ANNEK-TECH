import { useState } from 'react';
import { Database, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import seedContent from '../../scripts/seedContent';

const Settings: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSeedContent = async () => {
    setShowConfirmDialog(true);
  };

  const confirmSeed = async () => {
    setShowConfirmDialog(false);
    setIsSeeding(true);
    try {
      await seedContent();
      toast.success('Content seeded successfully!');
    } catch (error) {
      toast.error('Failed to seed content. Please try again.');
      console.error('Seeding error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-3 pt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">Settings</h1>
          <p className="text-slate-400">Manage your website settings</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Database Management */}
        <div className="card bg-slate-800/50">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Database Management</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-yellow-500 mb-1">Content Seeding</h3>
                <p className="text-slate-400 text-sm">
                  This will populate your database with initial content. Only use this on a fresh installation.
                </p>
              </div>
            </div>

            <button
              onClick={handleSeedContent}
              disabled={isSeeding}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors duration-200"
            >
              <Database className="h-5 w-5" />
              {isSeeding ? 'Seeding Content...' : 'Seed Content'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 relative">
            <button 
              onClick={() => setShowConfirmDialog(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white">Confirm Action</h3>
            </div>
            
            <p className="text-slate-300 mb-6">
              This will seed initial content to the database. This action cannot be undone. Are you sure you want to continue?
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSeed}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 