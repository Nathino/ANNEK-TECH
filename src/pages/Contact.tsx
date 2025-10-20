import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Send, Loader2, Users } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import BecomePartner from '../components/BecomePartner';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  product: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    product: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Handle demo booking parameters
  useEffect(() => {
    const product = searchParams.get('product');
    const isDemo = searchParams.get('demo');
    
    if (product) {
      setFormData(prev => ({
        ...prev,
        product: product
      }));
    }
    
    if (isDemo === 'true') {
      setFormData(prev => ({
        ...prev,
        subject: `Demo Session Request - ${product || 'Product'}`,
        message: `Hi, I'm interested in booking a demo session for ${product || 'your product'}. Please let me know your available times and how we can proceed.`
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        ...formData,
        status: 'unread',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success('Message sent successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        product: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Contact page structured data
  const contactStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact ANNEK TECH",
    "description": "Get in touch with ANNEK TECH for professional web development, custom software solutions, mobile app development, and digital transformation services in Ghana. Our expert team provides consultation, project planning, and technical support.",
    "url": "https://annektech.web.app/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "ANNEK TECH",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+233547214248",
        "contactType": "customer service",
        "email": "annektech.gh@gmail.com",
        "areaServed": "GH",
        "availableLanguage": "English"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Opposite Ghanass SHS",
        "addressLocality": "Koforidua",
        "addressRegion": "Eastern Region",
        "addressCountry": "GH"
      },
      "sameAs": [
        "https://twitter.com/annektech",
        "https://facebook.com/annektech",
        "https://instagram.com/annektech"
      ]
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900">
      <SEOHead
        title="Contact ANNEK TECH | Web Development & Software Solutions"
        description="Get in touch with ANNEK TECH for professional web development, custom software solutions, and digital transformation services in Ghana. Expert consultation."
        keywords={[
          'contact ANNEK TECH', 
          'web development Ghana', 
          'software development contact', 
          'digital solutions Ghana', 
          'tech consulting contact', 
          'Ghana web developers',
          'get in touch',
          'consultation request',
          'project inquiry',
          'tech support Ghana',
          'development services contact',
          'IT consultation',
          'web design consultation',
          'software development inquiry',
          'technology partnership'
        ]}
        canonicalUrl="https://annektech.web.app/contact"
        structuredData={contactStructuredData}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            We'd love to hear from you. Let's discuss how we can help transform your ideas into reality.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Contact Information */}
          <div className="lg:mb-0">
            <div className="space-y-3">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-1 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300">
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Phone</p>
                    <p className="text-slate-900 dark:text-white font-bold text-lg">+233547214248</p>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-1 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300">
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Email</p>
                    <p className="text-slate-900 dark:text-white font-bold text-sm break-all">annektech.gh@gmail.com</p>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-1 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300">
                <div className="flex items-start bg-white dark:bg-slate-900 rounded-xl p-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Location</p>
                    <p className="text-slate-900 dark:text-white font-bold text-sm leading-tight">
                      Ghana, Eastern region, Koforidua<br />
                      Opposite Ghanass SHS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Follow Us
              </h3>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <a 
                  href="https://twitter.com/annektech" 
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group text-sm sm:text-base"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X
                </a>
                <a 
                  href="https://facebook.com/annektech" 
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group text-sm sm:text-base"
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                  Facebook
                </a>
                <a 
                  href="https://instagram.com/annektech" 
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group text-sm sm:text-base"
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                  Instagram
                </a>
                <a 
                  href="https://linkedin.com/company/annektech" 
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group text-sm sm:text-base"
                >
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Send us a Message</h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">We'll get back to you within 24 hours</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="block w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="block w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                    />
                  </div>
                </div>
                <div className="group">
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+233 24 123 4567"
                    className="block w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                  />
                </div>
                <div className="group">
                  <label htmlFor="product" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
                    Product/Service Interest
                  </label>
                  <select
                    id="product"
                    value={formData.product}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <option value="">Select a product/service</option>
                    <option value="Custom Web Development">Custom Web Development</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="E-Commerce Solutions">E-Commerce Solutions</option>
                    <option value="Enterprise Solutions">Enterprise Solutions</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="group">
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="block w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                  />
                </div>
                <div className="group">
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
                    Message
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Tell us about your project..."
                      className="block w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
                      style={{ minHeight: '120px' }}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-slate-500">
                      {formData.message.length}/1000
                    </div>
                  </div>
                </div>
                <div className="pt-4 space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="h-5 w-5 transform group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-200" />
                      </>
                    )}
                  </button>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">or</span>
                    </div>
                  </div>
                  
                  {/* Partner Button */}
                  <div id="partner">
                    <button
                      type="button"
                      onClick={() => setIsPartnerModalOpen(true)}
                      className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 group"
                    >
                      <Users className="h-5 w-5" />
                      <span>Become Our Partner</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Become Partner Modal */}
      <BecomePartner 
        isOpen={isPartnerModalOpen} 
        onClose={() => setIsPartnerModalOpen(false)} 
      />
    </div>
  );
};

export default Contact;