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
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {content.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {content.partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="group relative flex flex-col h-full"
            >
              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform origin-left transition-transform duration-300 group-hover:scale-x-100" />
                
                <div className="p-6 lg:p-8 flex flex-col h-full">
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 text-sm rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      {partner.category}
                    </span>
                  </div>

                  <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 transform transition-transform duration-300 group-hover:scale-110">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl" />
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="relative w-full h-full object-contain p-3"
                    />
                  </div>

                  <div className="text-center flex-grow flex flex-col justify-between">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                      {partner.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {partner.description}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPartners; 