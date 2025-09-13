import React from 'react';
import { motion } from 'framer-motion';

const partners = [
  {
    name: "Tech Corp",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80"
  },
  {
    name: "Digital Solutions",
    logo: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80"
  },
  {
    name: "Innovation Hub",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80"
  }
];

const PartnerShowcase: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="section-title">Trusted by Industry Leaders</h2>
          <p className="section-subtitle">
            Partnering with innovative companies to deliver excellence
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center justify-center"
            >
              <div className="w-full aspect-square max-w-[200px] relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800 p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-contain filter dark:brightness-90 transition-all duration-300 group-hover:scale-110"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerShowcase;