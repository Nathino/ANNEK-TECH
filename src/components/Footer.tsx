import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 rounded-t-[2rem]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-4">
              ANNEK TECH
            </h3>
            <p className="mb-4 text-slate-400">
              Transforming ideas into digital reality with cutting-edge software solutions.
            </p>
            <div className="space-y-3">
              <div className="flex items-center group">
                <Phone className="h-5 w-5 mr-3 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                <span className="group-hover:text-emerald-400 transition-colors">+233547214248</span>
              </div>
              <div className="flex items-center group">
                <Mail className="h-5 w-5 mr-3 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                <span className="group-hover:text-emerald-400 transition-colors">annektech.gh@gmail.com</span>
              </div>
              <div className="flex items-center group">
                <MapPin className="h-5 w-5 mr-3 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                <span className="group-hover:text-emerald-400 transition-colors">Koforidua, Eastern Region, Ghana</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-4">
              Quick Links
            </h3>
            <ul className="grid grid-cols-4 gap-2 md:grid-cols-1 md:space-y-3 md:gap-0">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors text-center md:text-left block">HOME</Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-emerald-400 transition-colors text-center md:text-left block">PORTFOLIO</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-emerald-400 transition-colors text-center md:text-left block">BLOG</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors text-center md:text-left block">CONTACT</Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-4">
              Follow Us
            </h3>
            <div className="flex space-x-6">
              <a 
                href="https://twitter.com/annektech" 
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors group"
              >
                <svg className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
              </a>
              <a 
                href="https://facebook.com/annektech" 
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors group"
              >
                <Facebook className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                Facebook
              </a>
              <a 
                href="https://instagram.com/annektech" 
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors group"
              >
                <Instagram className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400">&copy; {new Date().getFullYear()} <span className="text-emerald-400">ANNEK TECH</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;