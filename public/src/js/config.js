// Configuration loaded from environment or API
const CONFIG = {
  author: {
    name: "HIMANJALI SANKAR"
  },
  api: {
    baseUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000' : '',
    endpoints: {
      books: '/api/books',
      contact: '/api/contact',
      about: '/api/about',
      social: '/api/social',
      media: '/api/media'
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
  ],
  // Fallback data for production when API is not available
  fallback: {
    books: [
      {
        _id: "fallback-1",
        title: "The Burnings",
        year: "2024",
        shortDescription: "A compelling narrative that explores themes of resilience and hope.",
        coverImage: { url: "/images/book-cover-placeholder.jpg" },
        amazonLink: "https://amazon.com"
      },
      {
        _id: "fallback-2", 
        title: "Echoes of Tomorrow",
        year: "2023",
        shortDescription: "A thought-provoking story about the future and human connection.",
        coverImage: { url: "/images/book-cover-placeholder.jpg" },
        amazonLink: "https://amazon.com"
      }
    ],
    media: [
      {
        _id: "fallback-media-1",
        title: "Sample Book Review - Literary Magazine",
        type: "review",
        source: "Literary Magazine",
        url: "https://example.com/review",
        date: "2024-01-15",
        description: "A sample book review for testing purposes."
      },
      {
        _id: "fallback-media-2",
        title: "Sample Short Story - Spring Anthology",
        type: "short-work",
        source: "Spring Anthology 2024",
        url: "https://example.com/short-story",
        date: "2024-03-15",
        description: "A sample short story for testing purposes."
      }
    ],
    social: [
      { name: "Instagram", url: "https://instagram.com/himanjalisankar" },
      { name: "Facebook", url: "https://facebook.com/himanjalisankar" }
    ]
  }
};

// Environment detection
if (typeof window !== 'undefined') {
  const isProduction = window.location.hostname !== 'localhost';
  console.log(`🔧 Environment: ${isProduction ? 'Production' : 'Development'}`);
  if (isProduction) {
    console.log('📱 Using production API endpoints');
  }
}

export default CONFIG;
