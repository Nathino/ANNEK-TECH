import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Leaf, Recycle, Download, ExternalLink } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import DemoCredentials from './DemoCredentials';

interface Project {
  title: string;
  image: string;
  description: string;
  icon: string;
  url: string;
  features?: string[];
  demoCredentials?: {
    email: string;
    password: string;
    instructions?: string;
  };
}

interface FeaturedProjectsContent {
  title: string;
  description: string;
  projects: Project[];
}


const ProjectSlider: React.FC = () => {
  const [content, setContent] = useState<FeaturedProjectsContent>({
    title: 'Our Projects',
    description: 'Explore our latest work',
    projects: []
  });
  const [shuffledProjects, setShuffledProjects] = useState<Project[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  // Function to get icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart': return <ShoppingCart className="h-5 w-5" />;
      case 'Leaf': return <Leaf className="h-5 w-5" />;
      case 'Recycle': return <Recycle className="h-5 w-5" />;
      case 'Download': return <Download className="h-5 w-5" />;
      default: return <ExternalLink className="h-5 w-5" />;
    }
  };

  // Function to shuffle array
  const shuffleArray = (array: Project[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleExpanded = (index: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  // Fetch featured projects from Firebase
  useEffect(() => {
    const q = query(
      collection(db, 'content'),
      where('type', '==', 'home'),
      where('section', '==', 'featured-projects'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log('🔄 Fetching featured projects from Firebase...');
        const doc = snapshot.docs[0];
        if (doc) {
          const data = doc.data();
          console.log(`📄 Featured projects document found: ${doc.id}`);
          console.log(`🔧 Projects count: ${data.content.projects?.length || 0}`);
          const projectsData = {
            title: data.content.title || 'Our Projects',
            description: data.content.description || 'Explore our latest work',
            projects: data.content.projects || []
          };
          setContent(projectsData);
          setShuffledProjects(projectsData.projects);
        } else {
          console.log('📄 No featured projects document found');
          // No data available
          setContent({
            title: 'Our Projects',
            description: 'Explore our latest work',
            projects: []
          });
          setShuffledProjects([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching featured projects:', error);
        toast.error('Failed to load projects');
        setContent({
          title: 'Our Projects',
          description: 'Explore our latest work',
          projects: []
        });
        setShuffledProjects([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Shuffle projects every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShuffledProjects(shuffleArray(content.projects));
      setShuffleKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [content.projects]);

  if (loading) {
    return <div className="py-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
    </div>;
  }

  if (content.projects.length === 0) {
    return null;
  }

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
            <h2 className="section-title">{content.title}</h2>
            <p className="section-subtitle mb-0">{content.description}</p>
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
        <motion.div 
          key={shuffleKey} 
          className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {shuffledProjects.map((project, index) => (
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
                    {getIconComponent(project.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {project.title}
                  </h3>
                </div>
                <div className="mb-4">
                  <p className="text-slate-600 dark:text-slate-300">
                    {expandedProjects.has(index) 
                      ? project.description 
                      : truncateDescription(project.description)
                    }
                  </p>
                  {project.description.length > 100 && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium mt-2 transition-colors"
                    >
                      {expandedProjects.has(index) ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
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
        </motion.div>

        {/* Mobile Horizontal Scroll View */}
        <div className="md:hidden">
          <div className="relative">
            <motion.div 
              key={shuffleKey} 
              className="flex overflow-x-auto scrollbar-hide gap-4 px-4 pb-4 snap-x snap-mandatory scroll-smooth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {shuffledProjects.map((project, index) => (
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
                        {getIconComponent(project.icon)}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {expandedProjects.has(index) 
                          ? project.description 
                          : truncateDescription(project.description, 80)
                        }
                      </p>
                      {project.description.length > 80 && (
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium mt-1 transition-colors"
                        >
                          {expandedProjects.has(index) ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                      
                      {/* Features */}
                      {project.features && project.features.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Key Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {project.features.slice(0, 3).map((feature, featureIndex) => (
                              <span
                                key={featureIndex}
                                className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                            {project.features.length > 3 && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                                +{project.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                      >
                        View Project <ArrowRight className="h-3 w-3" />
                      </a>
                      
                      {/* Demo Credentials */}
                      {project.demoCredentials?.email && project.demoCredentials?.password && (
                        <DemoCredentials 
                          credentials={project.demoCredentials}
                          projectUrl={project.url}
                          projectTitle={project.title}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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