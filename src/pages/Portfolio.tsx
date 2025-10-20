import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, ShoppingCart, Leaf, Recycle, Download, Utensils, QrCode, Users, Building2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import DemoCredentials from '../components/DemoCredentials';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl: string;
  icon?: React.ReactNode | string;
  demoUrl?: string;
  features?: string[];
  demoCredentials?: {
    email: string;
    password: string;
    instructions?: string;
  };
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
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart': return <ShoppingCart className="h-5 w-5" />;
      case 'Users': return <Users className="h-5 w-5" />;
      case 'Building2': return <Building2 className="h-5 w-5" />;
      case 'Leaf': return <Leaf className="h-5 w-5" />;
      case 'Recycle': return <Recycle className="h-5 w-5" />;
      case 'Download': return <Download className="h-5 w-5" />;
      case 'Utensils': return <Utensils className="h-5 w-5" />;
      case 'QrCode': return <QrCode className="h-5 w-5" />;
      default: return <ExternalLink className="h-5 w-5" />;
    }
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

  const truncateDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    // Fetch both portfolio and featured projects
    const portfolioQuery = query(
      collection(db, 'content'),
      where('type', '==', 'portfolio'),
      where('status', '==', 'published')
    );

    const featuredProjectsQuery = query(
      collection(db, 'content'),
      where('type', '==', 'home'),
      where('section', '==', 'featured-projects'),
      where('status', '==', 'published')
    );

    const unsubscribePortfolio = onSnapshot(portfolioQuery,
      (snapshot) => {
        const portfolioContent: PortfolioContent = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.section === 'header') {
            portfolioContent.title = data.content.title;
            portfolioContent.description = data.content.description;
          } else if (data.section === 'projects') {
            portfolioContent.projects = data.content.projects || [];
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

    const unsubscribeFeatured = onSnapshot(featuredProjectsQuery,
      (snapshot) => {
        const doc = snapshot.docs[0];
        if (doc) {
          const data = doc.data();
          const featuredProjects = data.content.projects || [];
          
          // Merge featured projects with existing portfolio projects
          setContent(prevContent => ({
            ...prevContent,
            projects: [...(prevContent.projects || []), ...featuredProjects]
          }));
        }
      },
      (error) => {
        console.error('Error fetching featured projects for portfolio:', error);
      }
    );

    return () => {
      unsubscribePortfolio();
      unsubscribeFeatured();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
    </div>;
  }

  
  const categories = ['all', 'web app', 'mobile', 'e-commerce'];
  // Use projects from Firebase content
  const projects = content.projects || [];

  // Calculate years of experience automatically
  // Note: Currently hardcoded to 2+ for 2024, will be 3+ in 2025
  const getYearsOfExperience = () => {
    const startYear = 2022; // ANNEK TECH started in 2022
    const currentYear = new Date().getFullYear();
    return currentYear - startYear;
  };

  const filteredProjects = projects;

  // Portfolio structured data
  const portfolioStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "ANNEK TECH Portfolio",
    "description": "Explore our latest projects and see how we've helped businesses transform their digital presence with cutting-edge software solutions.",
    "url": "https://annektech.web.app/portfolio",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": projects.map((project, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": project.title,
          "description": project.description,
          "url": project.liveUrl,
          "creator": {
            "@type": "Organization",
            "name": "ANNEK TECH"
          },
          "keywords": project.technologies.join(", ")
        }
      }))
    }
  };

  return (
    <motion.div 
      className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <SEOHead
        title="ANNEK TECH Portfolio | Web Development Projects"
        description="Explore ANNEK TECH's portfolio of successful web development projects and software solutions. See how we've helped businesses transform their digital presence."
        keywords={[
          'ANNEK TECH portfolio', 
          'web development projects', 
          'software solutions Ghana', 
          'mobile app development', 
          'custom web applications', 
          'digital transformation projects',
          'project showcase',
          'case studies',
          'success stories',
          'client work',
          'development portfolio',
          'tech projects Ghana',
          'web apps portfolio',
          'software portfolio',
          'development examples'
        ]}
        canonicalUrl="https://annektech.web.app/portfolio"
        structuredData={portfolioStructuredData}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            {content.description || "Discover our innovative solutions and successful projects that have transformed businesses across Ghana and beyond. From e-commerce platforms to agricultural technology, see how ANNEK TECH delivers cutting-edge digital solutions."}
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

        {/* Business Overview Section */}
        <motion.section
          className="py-8 md:py-16 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Left Content */}
              <div>
                <motion.h2 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  Transforming Ideas into Digital Reality
                </motion.h2>
                <motion.p 
                  className="text-sm md:text-lg text-slate-600 dark:text-slate-300 mb-4 md:mb-6 leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  At ANNEK TECH, we specialize in creating innovative digital solutions that drive business growth and digital transformation. Based in Ghana, we've successfully delivered over 25+ projects across various industries, from e-commerce platforms to agricultural technology solutions.
                </motion.p>
                <motion.p 
                  className="text-sm md:text-lg text-slate-600 dark:text-slate-300 mb-6 md:mb-8 leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  Our expertise spans modern web technologies, mobile app development, and enterprise solutions. We pride ourselves on delivering high-quality, scalable applications that meet the unique needs of businesses in Ghana and beyond.
                </motion.p>
                
                {/* Stats */}
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <div className="text-center">
                    <div className="text-xl md:text-3xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 md:mb-2">25+</div>
                    <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Projects Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-3xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 md:mb-2">{getYearsOfExperience()}+</div>
                    <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-3xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 md:mb-2">100%</div>
                    <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Client Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-3xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 md:mb-2">24/7</div>
                    <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Support</div>
                  </div>
                </motion.div>
              </div>

              {/* Right Content - Services */}
              <motion.div 
                className="space-y-4 md:space-y-6"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mb-4 md:mb-6">Our Expertise</h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg md:text-xl">🌐</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm md:text-base">Web Development</h4>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Custom web applications with modern frameworks and technologies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg md:text-xl">📱</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm md:text-base">Mobile Apps</h4>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Cross-platform mobile applications for iOS and Android</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg md:text-xl">🏢</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm md:text-base">Enterprise Solutions</h4>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Scalable business solutions and digital transformation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg md:text-xl">🛒</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm md:text-base">E-Commerce</h4>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Online stores and marketplace platforms</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Projects Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore some of our most successful projects that showcase our technical expertise and innovative solutions.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          {filteredProjects.length > 0 ? filteredProjects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card group hover:shadow-xl transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-800 p-0 overflow-hidden"
            >
              <div className="relative h-40 md:h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    {typeof project.icon === 'string' ? getIconComponent(project.icon) : (project.icon || <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />)}
                  </div>
                  <h3 className="text-lg md:text-2xl font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                    {expandedProjects.has(index) 
                      ? project.description 
                      : truncateDescription(project.description)
                    }
                  </p>
                  {project.description.length > 120 && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium mt-2 transition-colors"
                    >
                      {expandedProjects.has(index) ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                  
                  {/* Features */}
                  {project.features && project.features.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.features.slice(0, 4).map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {project.features.length > 4 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1">
                            +{project.features.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-sm md:text-base py-2 px-6 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Live Demo
                    </a>
                  </div>
                  
                  {/* Demo Credentials */}
                  {project.demoCredentials?.email && project.demoCredentials?.password && (
                    <DemoCredentials 
                      credentials={project.demoCredentials}
                      projectUrl={project.liveUrl}
                      projectTitle={project.title}
                    />
                  )}
                  
                  {project.demoUrl && (
                    <div className="flex justify-center">
                      <Link
                        to={project.demoUrl}
                        className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors text-sm md:text-base py-2 px-6 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                      >
                        <span className="text-lg">📅</span>
                        Book Demo Session
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-12">
              <div className="text-slate-400 text-lg mb-4">No projects available yet.</div>
              <p className="text-slate-500">Add projects through the admin interface to see them here.</p>
            </div>
          )}
        </motion.div>

        {/* Call to Action Section */}
        <motion.section
          className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              Ready to Start Your Next Project?
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              Let's discuss how we can help transform your ideas into innovative digital solutions that drive business growth.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started Today
                <ExternalLink className="h-5 w-5" />
              </Link>
              <a
                href="tel:+233547214248"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Call Us Now
                <span className="text-lg">📞</span>
              </a>
            </motion.div>
        </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default Portfolio;