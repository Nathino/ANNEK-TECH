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
      <motion.section 
        className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-emerald-900/90 to-slate-900/95" />
          <motion.img
            src={content.heroImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"}
            alt="Tech Background"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
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
      </motion.section>

      {/* Services Section */}
      <motion.section 
        className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Services
            </h2>
            <motion.div 
              className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6"
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true, amount: 0.5 }}
            ></motion.div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Comprehensive solutions tailored to your business needs
            </p>
          </motion.div>
          
          {/* Desktop Grid View */}
          <div className="hidden md:grid grid-cols-3 gap-8 px-4">
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
            ]).map((service, index) => {
              const colors = [
                { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100', dark: 'bg-emerald-900/30' },
                { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-100', dark: 'bg-teal-900/30' },
                { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-100', dark: 'bg-cyan-900/30' }
              ];
              const color = colors[index];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="group relative"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-8 hover:shadow-2xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 h-full">
                    <div className="flex flex-col items-center text-center h-full">
                      {/* Icon container */}
                      <div className={`w-20 h-20 ${color.light} dark:${color.dark} rounded-2xl mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <div className={color.text}>
                          {getIconComponent(service.icon)}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className={`text-2xl font-bold mb-4 ${color.text} group-hover:scale-105 transition-transform duration-300`}>
                        {service.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center flex-grow">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Horizontal Scroll View */}
          <div className="md:hidden">
            <div className="relative">
              <div className="flex overflow-x-auto scrollbar-hide gap-4 px-4 pb-4 snap-x snap-mandatory scroll-smooth">
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
              ]).map((service, index) => {
                const colors = [
                  { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100', dark: 'bg-emerald-900/30' },
                  { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-100', dark: 'bg-teal-900/30' },
                  { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-100', dark: 'bg-cyan-900/30' }
                ];
                const color = colors[index];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex-shrink-0 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 group snap-center"
                  >
                    <div className="flex flex-col items-center text-center h-full">
                      {/* Icon container */}
                      <div className={`w-16 h-16 ${color.light} dark:${color.dark} rounded-xl mb-4 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
                        <div className={color.text}>
                          {getIconComponent(service.icon)}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className={`text-lg font-bold mb-3 ${color.text} group-hover:scale-105 transition-transform duration-300`}>
                        {service.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-center flex-grow">
                        {service.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              </div>
              {/* Scroll indicator */}
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Project Showcase */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <ProjectSlider />
      </motion.div>

      {/* Featured Partners */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <FeaturedPartners />
      </motion.div>
    </div>
  );
}

export default Home;