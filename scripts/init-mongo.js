// MongoDB initialization script for Himanjali project
// This script runs when the MongoDB container starts for the first time

// Switch to the himanjali database
db = db.getSiblingDB('himanjali');

// Create collections and add sample data
print('Setting up Himanjali database...');

// Create books collection with sample data
db.createCollection('books');
db.books.insertMany([
  {
    _id: "book-1",
    title: "The Burnings",
    year: "2024",
    shortDescription: "A compelling narrative about resilience and transformation.",
    coverImage: {
      url: "/uploads/coverImage-1754499536304-173385349.jpg"
    },
    amazonLink: "https://amazon.com/dp/B0C1234567",
    category: "adults"
  },
  {
    _id: "book-2",
    title: "Sample YA Book",
    year: "2023",
    shortDescription: "A young adult novel exploring identity and belonging.",
    coverImage: {
      url: "/uploads/coverImage-1755191178860-508004155.jpg"
    },
    amazonLink: "https://amazon.com/dp/B0C7654321",
    category: "young-adult"
  }
]);

// Create media collection with sample data
db.createCollection('media');
db.media.insertMany([
  {
    _id: "media-1",
    title: "Short story for BLink",
    type: "short-work",
    source: "BLink - The Hindu Business Line",
    url: "https://example.com/story",
    date: "2024-02-05",
    description: "A compelling short story published in BLink."
  },
  {
    _id: "media-2",
    title: "Interview with Author",
    type: "interview",
    source: "Literary Magazine",
    url: "https://example.com/interview",
    date: "2024-01-15",
    description: "An in-depth interview about writing process and inspiration."
  }
]);

// Create social collection with sample data
db.createCollection('social');
db.social.insertMany([
  {
    _id: "social-1",
    name: "Instagram",
    url: "https://instagram.com/himanjalisankar",
    icon: "I",
    active: true
  },
  {
    _id: "social-2",
    name: "Twitter",
    url: "https://twitter.com/himanjalisankar",
    icon: "T",
    active: true
  },
  {
    _id: "social-3",
    name: "LinkedIn",
    url: "https://linkedin.com/in/himanjalisankar",
    icon: "L",
    active: false
  }
]);

// Create author collection with sample data
db.createCollection('author');
db.author.insertOne({
  _id: "author-1",
  name: "Himanjali Sankar",
  bio: "Himanjali Sankar is an accomplished author known for her compelling narratives and unique storytelling style.",
  image: {
    url: "/uploads/authorImage-1755236114057-519818418.jpeg"
  },
  email: "contact@himanjalisankar.com",
  website: "https://himanjalisankar.com"
});

// Create settings collection with sample data
db.createCollection('settings');
db.settings.insertOne({
  _id: "site-settings",
  siteName: "Himanjali Sankar",
  siteDescription: "Author website showcasing books, media, and literary works",
  contactEmail: "contact@himanjalisankar.com",
  socialLinks: [
    {
      name: "Instagram",
      url: "https://instagram.com/himanjalisankar",
      icon: "I"
    },
    {
      name: "Twitter", 
      url: "https://twitter.com/himanjalisankar",
      icon: "T"
    }
  ]
});

// Create indexes for better performance
db.books.createIndex({ "category": 1 });
db.books.createIndex({ "year": 1 });
db.media.createIndex({ "type": 1 });
db.media.createIndex({ "date": 1 });

print('Database setup complete!');
print('Collections created: books, media, social, author, settings');
print('Sample data inserted successfully.');
