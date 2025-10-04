import { db, auth } from '../lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const content = [
  // Home Page - Hero Section
  {
    id: 'home-hero',
    title: 'Home Hero Section',
    type: 'home',
    section: 'hero',
    content: {
      heroTitle: 'Transforming Ideas into Digital Reality',
      heroDescription: 'ANNEK TECH delivers cutting-edge software solutions that drive business growth and innovation.',
      heroBackgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80'
    },
    status: 'published',
    lastModified: new Date().toISOString()
  },

  // Home Page - Services Section
  {
    id: 'home-services',
    title: 'Home Services Section',
    type: 'home',
    section: 'services',
    content: {
      services: [
        {
          icon: 'Code',
          title: 'Web Development',
          description: 'Custom web applications built with modern technologies'
        },
        {
          icon: 'Building2',
          title: 'Enterprise Solutions',
          description: 'Scalable software for growing businesses'
        },
        {
          icon: 'Users',
          title: 'Digital Transformation',
          description: 'Modernizing businesses for the digital age'
        }
      ]
    },
    status: 'published',
    lastModified: new Date().toISOString()
  },

  // Featured Partners Section
  {
    id: 'home-partners',
    title: 'Featured Partners',
    type: 'home',
    section: 'featured-partners',
    content: {
      title: 'Our Featured Partners',
      description: 'Collaborating with industry leaders to deliver exceptional solutions',
      partners: [
        {
          name: 'Volkswagen',
          logo: '/images/vw-logo.png',
          description: 'Leading automotive innovation and sustainable mobility solutions. Partnering to drive the future of transportation technology.',
          category: 'We Grow Together'
        },
        {
          name: 'Spotify',
          logo: '/images/spotify-logo.png',
          description: 'Revolutionizing digital music streaming and entertainment. Collaborating on cutting-edge audio technology solutions.',
          category: 'We Grow Together'
        },
        {
          name: 'Corporate Solutions',
          logo: '/images/corporate-building.png',
          description: 'Enterprise-level business transformation and digital solutions. Delivering scalable technology for modern businesses.',
          category: 'We Grow Together'
        }
      ]
    },
    status: 'published',
    lastModified: new Date().toISOString()
  },

  // Partner Showcase
  {
    id: 'home-partner-showcase',
    title: 'Partner Showcase',
    type: 'home',
    section: 'partner-showcase',
    content: {
      title: 'Trusted by Industry Leaders',
      description: 'Partnering with innovative companies to deliver excellence',
      partners: [
        {
          name: 'Tech Corp',
          logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80'
        },
        {
          name: 'Digital Solutions',
          logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80'
        },
        {
          name: 'Innovation Hub',
          logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80'
        }
      ]
    },
    status: 'published',
    lastModified: new Date().toISOString()
  },

  // Portfolio Page - Header
  {
    id: 'portfolio-header',
    title: 'Portfolio Header',
    type: 'portfolio',
    section: 'header',
    content: {
      title: 'Our Portfolio',
      description: "Discover our innovative solutions and successful projects that have transformed businesses across Ghana and beyond. From e-commerce platforms to agricultural technology, see how ANNEK TECH delivers cutting-edge digital solutions."
    },
    status: 'published',
    lastModified: new Date().toISOString()
  },

  // Portfolio Projects
  {
    id: 'portfolio-projects',
    title: 'Portfolio Projects',
    type: 'portfolio',
    section: 'projects',
    content: {
      projects: [
        {
          title: 'SALES MONITOR',
          description: 'A comprehensive sales tracking system for businesses to monitor transactions, inventory, and customer relationships in real-time with analytics dashboards.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: 'https://mysalesmonitor.web.app',
          icon: 'ShoppingCart',
          demoUrl: '/contact?product=SALES MONITOR&demo=true'
        },
        {
          title: 'THE WELFARE',
          description: 'A welfare platform designed to help manage community support, donations, and charitable initiatives with easy tracking of funds and beneficiaries.',
          image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: 'https://the-welfare.web.app/',
          icon: 'Users'
        },
        {
          title: 'AGROPAL GHANA',
          description: 'An integrated agricultural platform connecting farmers with expert advice, local markets and agricultural inputs. Features include crop tracking, seasonal planning, and pest management tools for Ghanaian farmers.',
          image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: 'https://agropalgh.web.app',
          icon: 'Leaf'
        },
        {
          title: 'ECO-GHANA',
          description: 'A comprehensive environmental platform that educates Ghanaians on sustainable practices, tracks local conservation efforts, and connects eco-conscious communities. Features waste management resources and climate change awareness tools.',
          image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: 'https://eco-ghana.web.app',
          icon: 'Recycle'
        },
        {
          title: 'HQ DOWNLOADER',
          description: 'A powerful web application that allows users to download high-quality media content from various platforms with format conversion options.',
          image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: 'https://hq-downloader.web.app/',
          icon: 'Download'
        },
        {
          title: 'ORTHYS',
          description: 'A comprehensive business management suite designed for shops, restaurants, and hotels. Features include inventory management, staff scheduling, customer tracking, and financial reporting.',
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: 'https://food-hub-b8e39.web.app',
          icon: 'Utensils',
          demoUrl: '/contact?product=ORTHYS&demo=true'
        },
        {
          title: 'TRACK FOOD GH',
          description: 'A comprehensive system for tracking food supplies in schools across Ghana, ensuring proper distribution and inventory management of school feeding programs.',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: '#',
          icon: 'Utensils'
        },
        {
          title: 'GRADE IT',
          description: 'An advanced school grading system designed for comprehensive assessment record keeping, grade calculation, and academic performance tracking in educational institutions.',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: '#',
          icon: 'BookOpen'
        },
        {
          title: 'STORY VIBEZ',
          description: 'An interactive storytelling platform where users can create, share, and explore captivating stories with rich media integration and community engagement.',
          image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: 'https://story-vibez.web.app/',
          icon: 'BookOpen'
        },
        {
          title: 'ULTIMATE QR CODE',
          description: 'A QR code generator and scanner with advanced customization options, analytics, and business integration capabilities for marketing and inventory management.',
          image: 'https://images.unsplash.com/photo-1598291286794-d417e2685f85?auto=format&fit=crop&q=80',
          technologies: [],
          liveUrl: 'https://ultimateqrcode.web.app/',
          icon: 'QrCode'
        }
      ]
    },
    status: 'published',
    lastModified: new Date().toISOString()
  },

  // Contact Page - Header
  {
    id: 'contact-header',
    title: 'Contact Header',
    type: 'contact',
    section: 'header',
    content: {
      title: 'Get in Touch',
      description: "We'd love to hear from you. Let's discuss how we can help transform your ideas into reality."
    },
    status: 'published',
    lastModified: new Date().toISOString()
  },

  // Contact Information
  {
    id: 'contact-info',
    title: 'Contact Information',
    type: 'contact',
    section: 'contact-info',
    content: {
      phone: '+233547214248',
      email: 'annektech.gh@gmail.com',
      address: 'Ghana, Eastern region, Koforidua\nOpposite Ghanass SHS',
      socialLinks: {
        x: 'https://twitter.com/annekmultimedia',
        facebook: 'https://facebook.com/annekmultimedia',
        instagram: 'https://instagram.com/annekmultimedia'
      }
    },
    status: 'published',
    lastModified: new Date().toISOString()
  },

  // Contact Form Fields
  {
    id: 'contact-form',
    title: 'Contact Form',
    type: 'contact',
    section: 'form',
    content: {
      formFields: {
        labels: {
          name: 'Full Name',
          email: 'Email Address',
          subject: 'Subject',
          message: 'Message'
        },
        placeholders: {
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'How can we help?',
          message: 'Tell us about your project...'
        }
      }
    },
    status: 'published',
    lastModified: new Date().toISOString()
  }
];

const seedContent = async () => {
  try {
    // First ensure admin is authenticated
    await signInWithEmailAndPassword(auth, "adminannektech@gmail.com", "Nat@0543485978");

    // Use batch write for better performance and atomicity
    const batch = writeBatch(db);
    const contentCollection = collection(db, 'content');

    for (const item of content) {
      // Use the predefined ID instead of auto-generating one
      const docRef = doc(contentCollection, item.id);
      batch.set(docRef, {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Prepared content: ${item.title}`);
    }

    // Commit the batch
    await batch.commit();
    console.log('Content seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding content:', error);
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      console.error('Authentication required. Please ensure you are logged in as admin.');
    }
    throw error;
  }
};

export default seedContent; 