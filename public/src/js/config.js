// Configuration loaded from environment or API
const CONFIG = {
  author: {
    name: "HIMANJALI SANKAR"
  },
  api: {
    baseUrl: import.meta.env.PROD ? '' : 'http://localhost:3000',
    endpoints: {
      books: '/api/books',
      contact: '/api/contact'
    }
  },
  navigation: [
    { name: "HOME", href: "#home" },
    { name: "ABOUT", href: "#about" },
    { name: "BOOKS", href: "#books" },
    { name: "MEDIA", href: "#media" },
    { name: "CONTACT", href: "#contact" }
  ],
  social: [
    { name: "Instagram", icon: "I", url: import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com" },
    { name: "Facebook", icon: "F", url: import.meta.env.VITE_FACEBOOK_URL || "https://facebook.com" }
  ]
};

export default CONFIG;
