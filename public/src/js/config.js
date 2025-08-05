// Configuration loaded from environment or API
const CONFIG = {
  author: {
    name: "HIMANJALI SANKAR"
  },
  api: {
    baseUrl: 'http://localhost:3000',
    endpoints: {
      books: '/api/books',
      contact: '/api/contact'
    }
  },
  navigation: [
    { name: "HOME", href: "#home" },
    { name: "ABOUT", href: "/about" },
    { name: "BOOKS", href: "/books" },
    { name: "MEDIA", href: "/media" },
    { name: "CONTACT", href: "/contact" }
  ],
  social: [
    { name: "Instagram", icon: "I", url: "https://instagram.com" },
    { name: "Facebook", icon: "F", url: "https://facebook.com" }
  ]
};

// Development mode detection
if (typeof window !== 'undefined') {
  console.log('🔧 Development mode detected');
}

export default CONFIG;
