import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ShoppingCart, Leaf, Recycle, Download, Utensils, BookOpen, QrCode, Users } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl: string;
  githubUrl?: string;
  icon?: React.ReactNode;
}

interface PortfolioContent {
  title?: string;
  description?: string;
  projects?: Project[];
}

const Portfolio: React.FC = () => {
  const [content, setContent] = useState<PortfolioContent>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // We're just setting loading to false without waiting for Firebase
    // This forces the app to use the defaultProjects
    setLoading(false);

    /* Comment out Firebase code to use the local data only
    const q = query(
      collection(db, 'content'),
      where('type', '==', 'portfolio'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const portfolioContent: PortfolioContent = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.section === 'header') {
            portfolioContent.title = data.content.title;
            portfolioContent.description = data.content.description;
          } else if (data.section === 'projects') {
            portfolioContent.projects = data.content.projects;
          }
        });
        setContent(portfolioContent);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching portfolio content:', error);
        toast.error('Failed to load portfolio');
        setLoading(false);
      }
    );

    return () => unsubscribe();
    */
  }, []);

  if (loading) {
    return <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
    </div>;
  }

  // Updated projects with the ones provided by the user
  const defaultProjects = [
    {
      title: "Sales Monitor",
      description: "A comprehensive sales tracking system for businesses to monitor transactions, inventory, and customer relationships in real-time with analytics dashboards.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
      technologies: ["React", "Firebase", "Chart.js", "TailwindCSS"],
      liveUrl: "https://mysalesmonitor.web.app",
      githubUrl: "",
      icon: <ShoppingCart className="h-5 w-5" />
    },
    {
      title: "The Welfare",
      description: "A welfare platform designed to help manage community support, donations, and charitable initiatives with easy tracking of funds and beneficiaries.",
      image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80",
      technologies: ["React", "Firebase", "TailwindCSS", "Chart.js"],
      liveUrl: "https://the-welfare.web.app/",
      githubUrl: "",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "AgroPal Ghana",
      description: "An integrated agricultural platform connecting farmers with expert advice, local markets and agricultural inputs. Features include crop tracking, seasonal planning, and pest management tools for Ghanaian farmers.",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80",
      technologies: ["React", "Node.js", "MongoDB", "TailwindCSS"],
      liveUrl: "https://agropalgh.web.app",
      githubUrl: "",
      icon: <Leaf className="h-5 w-5" />
    },
    {
      title: "Eco-Ghana",
      description: "A comprehensive environmental platform that educates Ghanaians on sustainable practices, tracks local conservation efforts, and connects eco-conscious communities. Features waste management resources and climate change awareness tools.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80",
      technologies: ["React", "Firebase", "Framer Motion", "TailwindCSS"],
      liveUrl: "https://eco-ghana.web.app",
      githubUrl: "",
      icon: <Recycle className="h-5 w-5" />
    },
    {
      title: "HQ Downloader",
      description: "A powerful web application that allows users to download high-quality media content from various platforms with format conversion options.",
      image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80",
      technologies: ["React", "Node.js", "Express", "FFmpeg"],
      liveUrl: "https://hq-downloader.web.app/",
      githubUrl: "",
      icon: <Download className="h-5 w-5" />
    },
    {
      title: "Food Hub",
      description: "A food delivery and restaurant discovery platform featuring menus, reviews, and real-time order tracking for an enhanced dining experience.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80",
      technologies: ["React", "Firebase", "Google Maps API", "Stripe"],
      liveUrl: "https://food-hub-b8e39.web.app",
      githubUrl: "",
      icon: <Utensils className="h-5 w-5" />
    },
    {
      title: "Story Vibez",
      description: "An interactive storytelling platform where users can create, share, and explore captivating stories with rich media integration and community engagement.",
      image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&q=80",
      technologies: ["React", "Firebase", "Draft.js", "Cloudinary"],
      liveUrl: "https://story-vibez.web.app/",
      githubUrl: "",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      title: "Ultimate QR Code",
      description: "A QR code generator and scanner with advanced customization options, analytics, and business integration capabilities for marketing and inventory management.",
      image: "https://images.unsplash.com/photo-1598291286794-d417e2685f85?auto=format&fit=crop&q=80",
      technologies: ["React", "Firebase", "QR Code API", "Canvas"],
      liveUrl: "https://ultimateqrcode.web.app/",
      githubUrl: "",
      icon: <QrCode className="h-5 w-5" />
    }
  ];
  
  const categories = ['all', 'web app', 'mobile', 'e-commerce'];
  // Force the use of defaultProjects by not checking content.projects
  const projects = defaultProjects;

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.technologies.some(t => t.toLowerCase().includes(filter.toLowerCase())));

  return (
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {content.title || "Our Portfolio"}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            {content.description || "Explore our latest projects and see how we've helped businesses transform their digital presence."}
          </p>
          
          {/* Filter buttons - Hidden for now */}
          <div className="hidden flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === category 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner text-emerald-600 dark:text-emerald-400">
                    {project.icon || <ExternalLink className="h-5 w-5" />}
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {project.title}
                  </h3>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Live Demo
                  </a>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      Source Code
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Portfolio;