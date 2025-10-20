import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface Partner {
  name: string;
  logo: string;
  description: string;
  category: string;
}

interface FeaturedPartnersContent {
  title: string;
  description: string;
  partners: Partner[];
}

const FeaturedPartners: React.FC = () => {
  const [content, setContent] = useState<FeaturedPartnersContent>({
    title: 'Our Featured Partners',
    description: 'Collaborating with industry leaders to deliver exceptional solutions',
    partners: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to partners content changes
    const q = query(
      collection(db, 'content'),
      where('type', '==', 'home'),
      where('section', '==', 'featured-partners'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const doc = snapshot.docs[0];
        if (doc) {
          const data = doc.data();
          setContent({
            title: data.content.title || content.title,
            description: data.content.description || content.description,
            partners: data.content.partners || []
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching partners:', error);
        toast.error('Failed to load partners');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="py-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
    </div>;
  }

  if (content.partners.length === 0) {
    return null;
  }

  return (
    <motion.section 
      className="py-8 md:py-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-400/10 to-emerald-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="inline-block mb-6">
            <span className="px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-emerald-200 dark:border-emerald-800">
              Trusted Partnerships
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            {content.title}
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        <div className="flex overflow-x-auto gap-4 sm:gap-6 lg:gap-8 pb-4 sm:grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 sm:overflow-visible sm:pb-0">
          {content.partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.15,
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true, amount: 0.3 }}
              className="group relative flex-shrink-0 w-80 sm:w-auto"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/20 transition-all duration-500 hover:scale-105 border border-white/20 dark:border-slate-700/50 h-full">
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-[2px]">
                  <div className="w-full h-full bg-white/90 dark:bg-slate-800/90 rounded-2xl" />
                </div>
                
                {/* Content */}
                <div className="relative p-4 lg:p-6 flex flex-col h-full">
                  {/* Category Badge */}
                  <div className="text-center mb-3">
                    <span className="inline-block px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                      {partner.category}
                    </span>
                  </div>

                  {/* Logo Container */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500" />
                    <div className="absolute inset-0.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain p-1 transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {partner.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                        {partner.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                  
                  {/* Floating particles effect */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <a 
            href="/contact#partner"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <span>Become Our Partner</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturedPartners; 