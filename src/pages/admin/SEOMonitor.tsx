import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Globe, 
  BarChart3,
  RefreshCw,
  Download,
  Target,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { useSEOMonitoring } from '../../hooks/useSEOMonitoring';
import toast from 'react-hot-toast';

const SEOMonitor: React.FC = () => {
  const {
    metrics,
    issues,
    loading,
    lastUpdated,
    refreshData,
    getOverallScore,
    getTotalIssues,
    getPerformanceInsights
  } = useSEOMonitoring();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const exportSEOData = () => {
    const dataStr = JSON.stringify({ metrics, issues, lastUpdated }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-metrics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SEO data exported successfully!');
  };

  const handleRefresh = () => {
    refreshData();
    toast.success('SEO data refreshed!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Search className="h-8 w-8 text-emerald-500" />
                SEO Monitor
              </h1>
              <p className="text-slate-400 mt-2">
                Monitor and analyze your website's SEO performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportSEOData}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Average SEO Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(getOverallScore())}`}>
                  {getOverallScore()}
                </p>
              </div>
              <div className="p-3 bg-emerald-900/30 rounded-lg">
                <Target className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pages Monitored</p>
                <p className="text-3xl font-bold text-white">{metrics.length}</p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Issues Found</p>
                <p className="text-3xl font-bold text-red-500">{getTotalIssues()}</p>
              </div>
              <div className="p-3 bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Last Updated</p>
                <p className="text-sm font-medium text-white">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-lg">
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Page Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Page SEO Metrics
            </h2>
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{metric.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(metric.seoScore)} bg-slate-700`}>
                      {metric.seoScore}/100
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{metric.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {metric.pageType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      LCP: {metric.performance.lcp}s
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      CLS: {metric.performance.cls}
                    </span>
                  </div>
                  {metric.issues.length > 0 && (
                    <div className="mt-2 text-xs text-red-500">
                      Issues: {metric.issues.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* SEO Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              SEO Issues
            </h2>
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {issue.message}
                      </h3>
                      <p className="text-sm text-slate-400 mb-2">
                        Found on {issue.count} page{issue.count !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {issue.pages.map((page, pageIndex) => (
                          <span
                            key={pageIndex}
                            className="px-2 py-1 bg-slate-700 text-xs rounded-full text-slate-400"
                          >
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-slate-800 rounded-xl p-6 shadow-lg"
        >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Performance Insights
          </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {getPerformanceInsights().lcp.toFixed(1)}s
                </div>
                <div className="text-sm text-slate-400">Average LCP</div>
                <div className="text-xs text-green-500 mt-1">Good</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {Math.round(getPerformanceInsights().fid)}ms
                </div>
                <div className="text-sm text-slate-400">Average FID</div>
                <div className="text-xs text-green-500 mt-1">Good</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {getPerformanceInsights().cls.toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">Average CLS</div>
                <div className="text-xs text-green-500 mt-1">Good</div>
              </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SEOMonitor;
