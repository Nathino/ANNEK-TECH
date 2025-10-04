import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Leaf, Recycle, Download } from 'lucide-react';

// Updated projects to include the client's actual work
const projects = [
  {
    title: "Sales Monitor",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
    description: "Business sales tracking and analytics platform",
    icon: <ShoppingCart className="h-5 w-5" />,
    url: "https://mysalesmonitor.web.app"
  },
  {
    title: "AgroPal Ghana",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80",
    description: "Agricultural resources and marketplace platform",
    icon: <Leaf className="h-5 w-5" />,
    url: "https://agropalgh.web.app"
  },
  {
    title: "Eco-Ghana",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80",
    description: "Environmental sustainability platform",
    icon: <Recycle className="h-5 w-5" />,
    url: "https://eco-ghana.web.app"
  },
  {
    title: "HQ Downloader",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80",
    description: "High-quality media content downloader",
    icon: <Download className="h-5 w-5" />,
    url: "https://hq-downloader.web.app/"
  }
];

const ProjectSlider: React.FC = () => {
  return (
    <motion.section 
      className="py-20 bg-white dark:bg-slate-900"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="section-title">Our Projects</h2>
            <p className="section-subtitle mb-0">Explore our latest work</p>
          </div>
          <Link 
            to="/portfolio"
            className="group inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            View All Projects 
            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="card group hover:shadow-xl transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-800 p-0 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner text-emerald-600 dark:text-emerald-400">
                    {project.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {project.title}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {project.description}
                </p>
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                >
                  View Project <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll View */}
        <div className="md:hidden">
          <div className="relative">
            <div className="flex overflow-x-auto scrollbar-hide gap-4 px-4 pb-4 snap-x snap-mandatory scroll-smooth">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-800/50 snap-center"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner text-emerald-600 dark:text-emerald-400">
                        {project.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      {project.description}
                    </p>
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                    >
                      View Project <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Scroll indicator */}
            <div className="flex justify-center mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ProjectSlider;