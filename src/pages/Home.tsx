import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Building2, LineChart, Server, Smartphone, PenTool, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectSlider from '../components/ProjectSlider';
import FeaturedPartners from '../components/FeaturedPartners';
import SEOHead from '../components/SEOHead';
import SEOMonitor from '../components/SEOMonitor';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface HomeContent {
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
  services?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

const Home: React.FC = () => {
  const [content, setContent] = useState<HomeContent>({});
  const [loading, setLoading] = useState(true);
  
  // Force rebuild to clear any cached stats references

  useEffect(() => {
    // Subscribe to content changes
    const q = query(
      collection(db, 'content'),
      where('type', '==', 'home'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const homeContent: HomeContent = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.section === 'hero') {
            homeContent.heroTitle = data.content.heroTitle;
            homeContent.heroDescription = data.content.heroDescription;
            homeContent.heroImage = data.content.heroImage;
          } else if (data.section === 'services') {
            homeContent.services = data.content.services;
          }
        });
        setContent(homeContent);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching home content:', error);
        toast.error('Failed to load content');
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'code': return <Code2 className="h-10 w-10" />;
      case 'building': return <Building2 className="h-10 w-10" />;
      case 'chart': return <LineChart className="h-10 w-10" />;
      case 'server': return <Server className="h-10 w-10" />;
      case 'mobile': return <Smartphone className="h-10 w-10" />;
      case 'design': return <PenTool className="h-10 w-10" />;
      default: return <Code2 className="h-10 w-10" />;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
    </div>;
  }

  // Organization structured data
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ANNEK TECH",
    "description": "Transforming ideas into digital reality with cutting-edge software solutions",
    "url": "https://annektech.web.app",
    "logo": "https://annektech.web.app/annek_tech.png",
    "sameAs": [
      "https://twitter.com/annektech",
      "https://facebook.com/annektech",
      "https://instagram.com/annektech"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+233-XXX-XXXX",
      "contactType": "customer service",
      "areaServed": "GH",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GH",
      "addressRegion": "Greater Accra"
    },
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "ANNEK TECH Team"
      }
    ]
  };

  return (
    <div className="pt-16">
      <SEOHead
        title="ANNEK TECH - Digital Solutions & Web Development"
        description="Transform your ideas into digital reality with ANNEK TECH's cutting-edge software solutions. Expert web development and digital transformation services in Ghana"
        keywords={[
          'ANNEK TECH', 
          'web development Ghana', 
          'software development', 
          'digital solutions', 
          'enterprise software', 
          'custom web applications', 
          'technology consulting', 
          'Ghana tech company',
          'mobile app development',
          'e-commerce solutions',
          'cloud computing',
          'digital transformation',
          'IT services Ghana',
          'web design Ghana',
          'programming services'
        ]}
        canonicalUrl="https://annektech.web.app"
        structuredData={organizationStructuredData}
      />
      <SEOMonitor 
        pageType="home" 
        pageData={{
          title: content.heroTitle || "ANNEK TECH - Digital Solutions",
          description: content.heroDescription || "Transforming ideas into digital reality with cutting-edge software solutions",
          keywords: ['ANNEK TECH', 'web development', 'software development', 'digital solutions', 'Ghana technology'],
          url: 'https://annektech.web.app'
        }}
      />
      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-emerald-900/90 to-slate-900/95" />
          <img
            src={content.heroImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"}
            alt="Tech Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white text-center lg:text-left"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-white">
                {content.heroTitle || "Transforming Ideas into Digital Reality"}
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-4 md:mb-6 text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {content.heroDescription || "ANNEK TECH delivers cutting-edge software solutions that drive business growth and innovation."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link 
                  to="/portfolio" 
                  className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold"
                >
                  View Our Work <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-emerald-400 rounded-lg hover:bg-emerald-400 hover:text-slate-900 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>

            </motion.div>

            {/* Right Content - Floating Tech Elements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-96">
                {/* Floating Tech Icons */}
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-10 left-10 w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-emerald-400/30"
                >
                  <Code2 className="h-8 w-8 text-emerald-400" />
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, 15, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute top-20 right-16 w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-400/30"
                >
                  <Server className="h-7 w-7 text-blue-400" />
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, 3, 0]
                  }}
                  transition={{ 
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute bottom-20 left-8 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-400/30"
                >
                  <Smartphone className="h-6 w-6 text-purple-400" />
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, 12, 0],
                    rotate: [0, -3, 0]
                  }}
                  transition={{ 
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute bottom-16 right-8 w-18 h-18 bg-orange-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-orange-400/30"
                >
                  <Building2 className="h-8 w-8 text-orange-400" />
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, -6, 0],
                    rotate: [0, 4, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                  className="absolute top-32 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-teal-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-teal-400/30"
                >
                  <LineChart className="h-8 w-8 text-teal-400" />
                </motion.div>

                {/* Central Glow Effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-white/70 hover:text-white transition-colors cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-sm mb-2">Scroll Down</span>
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Services
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Comprehensive solutions tailored to your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {(content.services || [
              {
                icon: 'code',
                title: "Web Development",
                description: "Custom web applications built with modern technologies that deliver exceptional user experiences and drive business results."
              },
              {
                icon: 'server',
                title: "Enterprise Solutions",
                description: "Scalable software infrastructure for growing businesses with secure cloud architecture and robust backend systems."
              },
              {
                icon: 'chart',
                title: "Digital Transformation",
                description: "Strategic technology implementation to modernize operations and enhance customer experiences in the digital age."
              }
            ]).map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700/50 p-8 hover:shadow-xl transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-800/50 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6 flex items-center justify-center shadow-md group-hover:shadow-emerald-200/30 dark:group-hover:shadow-emerald-700/30 transition-all duration-300 group-hover:scale-110">
                    <div className="text-emerald-600 dark:text-emerald-400">
                      {getIconComponent(service.icon)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      <ProjectSlider />

      {/* Featured Partners */}
      <FeaturedPartners />
    </div>
  );
}

export default Home;