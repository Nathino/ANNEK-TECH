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
      description: "Explore our latest projects and see how we've helped businesses transform their digital presence."
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
          title: 'E-Commerce Platform',
          description: 'A full-featured online shopping platform with advanced features including real-time inventory management, secure payment processing, and an intuitive admin dashboard.',
          image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80',
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          liveUrl: '#',
          githubUrl: '#'
        },
        {
          title: 'Healthcare Management System',
          description: 'Comprehensive healthcare solution for medical facilities featuring patient records management, appointment scheduling, and billing integration.',
          image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80',
          technologies: ['React', 'Firebase', 'Material-UI', 'Node.js'],
          liveUrl: '#',
          githubUrl: '#'
        },
        {
          title: 'Educational Platform',
          description: 'Interactive learning management system with video conferencing, course creation tools, and progress tracking for students and educators.',
          image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80',
          technologies: ['React', 'WebRTC', 'Express', 'PostgreSQL'],
          liveUrl: '#',
          githubUrl: '#'
        },
        {
          title: 'Real Estate Management',
          description: 'Property management platform with virtual tours, automated rental processes, and maintenance request tracking.',
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80',
          technologies: ['React', 'Next.js', 'Supabase', 'Tailwind'],
          liveUrl: '#',
          githubUrl: '#'
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