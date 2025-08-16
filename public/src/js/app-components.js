import CONFIG from './config.js';
import ApiService from './api.js';
import Utils from './utils.js';
import { EventEmitter, NotificationSystem, FormValidator } from './services.js';
import { Component, Header } from './components.js';
import { LatestBook } from './book-components.js';

// Books Grid Component
class BooksGrid extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.booksData = null;
  }

  async fetchData() {
    try {
      this.booksData = await this.apiService.getBooks();
      console.log('🔍 Fetched books data:', this.booksData);
      
      // Transform the API response to include homepageBooks for the carousel
      if (this.booksData.adults || this.booksData.children) {
        // Combine adults and children books for the homepage carousel
        const allBooks = [
          ...(this.booksData.adults || []),
          ...(this.booksData.children || [])
        ];
        
        // Add homepageBooks property for the carousel
        this.booksData.homepageBooks = allBooks;
        
        console.log('🔍 Transformed homepage books:', this.booksData.homepageBooks);
        this.booksData.homepageBooks.forEach((book, index) => {
          console.log(`🔍 Book ${index}:`, {
            title: book.title,
            _id: book._id,
            id: book.id,
            coverImage: book.coverImage,
            coverClass: book.coverClass
          });
        });
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      // Fallback to static data
      this.booksData = {
        adults: [
          {
            id: 1,
            title: "Whispers in the Rain",
            genre: "Stories",
            coverClass: "adult-1",
            year: "2023",
            description: "A collection of interconnected short stories.",
            amazonLink: "https://amazon.com/whispers-rain"
          }
        ],
        children: [
          {
            id: 4,
            title: "The Magic Garden",
            genre: "Children's Book",
            coverClass: "children-1",
            year: "2023",
            description: "A delightful story about friendship.",
            amazonLink: "https://amazon.com/magic-garden"
          }
        ]
      };
      
      // Add homepageBooks for fallback data too
      this.booksData.homepageBooks = [
        ...this.booksData.adults,
        ...this.booksData.children
      ];
    }
  }

  render() {
    if (!this.booksData) {
      return Utils.createElement('div', {
        className: 'loading',
        innerHTML: 'LOADING'
      });
    }

    const section = Utils.createElement('section', {
      className: 'books-grid-section'
    });

    const container = Utils.createElement('div', {
      className: 'books-grid-container'
    });

    const header = Utils.createElement('div', {
      className: 'section-header'
    });

    const title = Utils.createElement('h2', {
      className: 'section-title',
      innerHTML: 'Previous Works'
    });

    header.appendChild(title);

    const categoriesContainer = Utils.createElement('div', {
      className: 'books-categories'
    });

    // Previous Works Section - Books from Homepage Featuring CMS
    const homepageBooks = this.booksData.homepageBooks || [];
    
    if (homepageBooks.length > 0) {
      const previousWorksSection = this.createCategorySection('', homepageBooks); // Empty title to avoid duplicate
      categoriesContainer.appendChild(previousWorksSection);
    }

    container.appendChild(header);
    container.appendChild(categoriesContainer);
    section.appendChild(container);

    return section;
  }

  createCategorySection(categoryName, books) {
    console.log('🔍 Debug: createCategorySection called with', books.length, 'books:', books.map(b => b.title));
    
    // Check for duplicate books in the original data
    const bookTitles = books.map(b => b.title);
    const uniqueTitles = [...new Set(bookTitles)];
    if (bookTitles.length !== uniqueTitles.length) {
      console.warn('⚠️ Warning: Duplicate book titles found in original data!');
      console.warn('Original titles:', bookTitles);
      console.warn('Unique titles:', uniqueTitles);
    }
    
    const categorySection = Utils.createElement('div', {
      className: 'category-section'
    });

    // Only show title if categoryName is not empty
    if (categoryName) {
      const categoryTitle = Utils.createElement('h3', {
        className: 'category-title',
        innerHTML: categoryName
      });
      categorySection.appendChild(categoryTitle);
    }

    // Create double-line carousel container
    const carouselContainer = Utils.createElement('div', {
      className: 'books-carousel-container'
    });

    // Create different book sets for top and bottom rows - ensure uniqueness
    const uniqueBooks = books.filter((book, index, self) => 
      index === self.findIndex(b => b.title === book.title)
    );
    
    if (uniqueBooks.length !== books.length) {
      console.warn('⚠️ Warning: Filtered out duplicate books. Original:', books.length, 'Unique:', uniqueBooks.length);
    }
    
    // Split books into two equal parts for top and bottom rows
    const midPoint = Math.ceil(uniqueBooks.length / 2);
    const topRowBooks = uniqueBooks.slice(0, midPoint);
    const bottomRowBooks = uniqueBooks.slice(midPoint);
    
    // Sort top row A-Z, bottom row Z-A
    topRowBooks.sort((a, b) => a.title.localeCompare(b.title));
    bottomRowBooks.sort((a, b) => b.title.localeCompare(a.title));
    
    console.log('🔍 Debug: Top row books (A-Z):', topRowBooks.map(b => b.title));
    console.log('🔍 Debug: Bottom row books (Z-A):', bottomRowBooks.map(b => b.title));
    
    // Top row - scrolls left to right
    const topCarouselTrack = Utils.createElement('div', {
      className: 'books-carousel-track top-track'
    });
    
    // Bottom row - scrolls right to left
    const bottomCarouselTrack = Utils.createElement('div', {
      className: 'books-carousel-track bottom-track'
    });
    
    // Populate top row (left to right)
    console.log('🔍 Debug: Adding top row books:', topRowBooks.length);
    topRowBooks.forEach((book, index) => {
      const bookCard = this.createBookCard(book);
      topCarouselTrack.appendChild(bookCard);
    });
    
    // Repeat top row books for seamless infinite scrolling
    topRowBooks.forEach((book, index) => {
      const bookCard = this.createBookCard(book);
      topCarouselTrack.appendChild(bookCard);
    });
    
    // Populate bottom row (right to left)
    console.log('🔍 Debug: Adding bottom row books:', bottomRowBooks.length);
    bottomRowBooks.forEach((book, index) => {
      const bookCard = this.createBookCard(book);
      bottomCarouselTrack.appendChild(bookCard);
    });
    
    // Repeat bottom row books for seamless infinite scrolling
    bottomRowBooks.forEach((book, index) => {
      const bookCard = this.createBookCard(book);
      bottomCarouselTrack.appendChild(bookCard);
    });

    carouselContainer.appendChild(topCarouselTrack);
    carouselContainer.appendChild(bottomCarouselTrack);
    
    console.log('🔍 Debug: Top track has', topCarouselTrack.children.length, 'book cards');
    console.log('🔍 Debug: Bottom track has', bottomCarouselTrack.children.length, 'book cards');
    
    // Start animations for both rows with different directions
    this.startCarouselAnimation(carouselContainer, topCarouselTrack, topRowBooks.length, 'left-to-right');
    this.startCarouselAnimation(carouselContainer, bottomCarouselTrack, bottomRowBooks.length, 'right-to-left');

    categorySection.appendChild(carouselContainer);

    return categorySection;
  }

  startCarouselAnimation(container, track, bookCount, direction = 'left-to-right') {
    // CSS animations are now handled by CSS keyframes
    // This function now just sets up hover pause functionality
    
    // Pause animation on hover
    track.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    
    track.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
    
    // Set animation duration based on number of books
    const baseDuration = 60; // base duration in seconds
    const adjustedDuration = Math.max(baseDuration, bookCount * 8); // adjust based on book count
    
    if (direction === 'left-to-right') {
      track.style.animation = `scrollLeftToRight ${adjustedDuration}s linear infinite`;
    } else {
      track.style.animation = `scrollRightToLeft ${adjustedDuration}s linear infinite`;
    }
    
    console.log(`🎬 Started ${direction} animation for ${bookCount} books with ${adjustedDuration}s duration`);
  }

  createBookCard(book) {
    const bookCard = Utils.createElement('div', {
      className: 'book-card',
      onClick: () => this.navigateToBookPage(book)
    });

    // Generate a cover class if none exists
    const coverClass = book.coverClass || this.generateCoverClass(book);
    
    const bookCover = Utils.createElement('div', {
      className: `book-cover ${coverClass}`
    });

    // Add book cover image if available, otherwise show title
    if (book.coverImage && book.coverImage.url) {
      const img = Utils.createElement('img', {
        src: book.coverImage.url,
        alt: book.title,
        className: 'book-cover-image'
      });
      bookCover.appendChild(img);
      bookCover.classList.add('has-cover-image');
    } else {
      // Fallback: show book title
      const title = Utils.createElement('h4', {
        className: 'book-title',
        innerHTML: book.title
      });
      bookCover.appendChild(title);
    }

    bookCard.appendChild(bookCover);

    return bookCard;
  }

  generateCoverClass(book) {
    // Generate a cover class based on book title or category
    if (book.category === 'adults') {
      return 'adult-1';
    } else if (book.category === 'children') {
      return 'children-1';
    } else {
      // Generate a hash-based class for consistent styling
      const hash = book.title.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      return `book-${Math.abs(hash) % 5 + 1}`;
    }
  }

  navigateToBookPage(book) {
    console.log('🔍 Navigating to book page for:', book.title);
    console.log('🔍 Book data:', book);
    console.log('🔍 Book ID (_id):', book._id);
    console.log('🔍 Book ID (id):', book.id);
    
    // Navigate to the individual book page
    if (book._id || book.id) {
      const bookId = book._id || book.id;
      console.log('🔍 Using book ID for navigation:', bookId);
      window.location.href = `/book/${bookId}`;
    } else {
      console.log('❌ No book ID found for navigation');
      // Fallback: show notification if book ID is not available
      window.app.notificationSystem.show(
        `Book page not available for "${book.title}"`,
        'warning',
        'Navigation'
      );
    }
  }

  async mount() {
    await this.fetchData();
    return super.mount();
  }

  bindEvents() {
    // Stagger animation for book cards
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
        }
      });
    }, { threshold: 0.1 });

    const bookCards = this.element.querySelectorAll('.book-card');
    bookCards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.6s ease';
      observer.observe(card);
    });
  }
}

// About Component
class About extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.authorData = null;
  }

  render() {
    const aboutSection = Utils.createElement('section', {
      id: 'about',
      className: 'about-section'
    });

    const container = Utils.createElement('div', {
      className: 'container'
    });

    const header = Utils.createElement('div', {
      className: 'section-header'
    });

    const title = Utils.createElement('h2', {
      className: 'section-title',
      innerHTML: 'About'
    });

    header.appendChild(title);
    container.appendChild(header);

    // Create about content
    const aboutContent = Utils.createElement('div', {
      className: 'about-content'
    });

    // Author photo section
    const authorPhoto = Utils.createElement('div', {
      className: 'author-photo'
    });

    if (this.authorData?.image?.url) {
      // Show actual author image from CMS
      const authorImage = Utils.createElement('img', {
        src: this.authorData.image.url,
        alt: 'Himanjali Sankar - Author',
        className: 'author-image'
      });
      authorPhoto.appendChild(authorImage);
    } else {
      // Show placeholder if no image
      const photoPlaceholder = Utils.createElement('div', {
        className: 'photo-placeholder',
        innerHTML: '<i class="fas fa-user"></i>'
      });
      authorPhoto.appendChild(photoPlaceholder);
    }

    // Author bio section
    const authorBio = Utils.createElement('div', {
      className: 'author-bio'
    });

    const bioText = Utils.createElement('div', {
      className: 'bio-text',
      innerHTML: this.authorData?.bio || 'A passionate author who loves to tell stories that touch the heart and inspire the mind. With a deep appreciation for the power of storytelling, Himanjali creates narratives that resonate with readers of all ages.'
    });

    authorBio.appendChild(bioText);

    // Awards section removed - no longer displayed

    // Assemble about content
    aboutContent.appendChild(authorPhoto);
    aboutContent.appendChild(authorBio);

    container.appendChild(aboutContent);
    aboutSection.appendChild(container);

    return aboutSection;
  }

  async mount() {
    try {
      // Load author data
      this.authorData = await this.loadAuthorData();
    } catch (error) {
      console.error('Error loading author data:', error);
      // Use fallback data with simplified fields
      this.authorData = {
        bio: 'A passionate author who loves to tell stories that touch the heart and inspire the mind. With a deep appreciation for the power of storytelling, Himanjali creates narratives that resonate with readers of all ages. Her work spans multiple genres, from contemporary fiction to children\'s literature, always with a focus on creating meaningful connections through words.',
        awards: [
          'Multiple published works across different genres',
          'Recognition for storytelling excellence',
          'Growing reader community worldwide'
        ]
      };
    }
    
    // Always mount the component
    await super.mount();
  }

  async loadAuthorData() {
    try {
      // Try to load from API first
      const response = await this.apiService.getAuthorInfo();
      if (response.success && response.data) {
        console.log('Successfully loaded author data from API:', response.data);
        return response.data;
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.warn('API failed, falling back to static JSON:', error);
      try {
        // Fallback to static JSON file
        const response = await fetch('/data/author.json');
        if (response.ok) {
          const data = await response.json();
          console.log('Successfully loaded author data from static file:', data);
          return data;
        } else {
          throw new Error(`Failed to load author data: ${response.status}`);
        }
      } catch (fallbackError) {
        console.error('Both API and static file failed:', fallbackError);
        throw fallbackError;
      }
    }
  }
}

// Footer Component
class Footer extends Component {
  constructor(container, eventBus) {
    super(container, eventBus);
    this.apiService = new ApiService();
    this.socialData = null;
  }

  async mount() {
    try {
      // Load social media data from CMS
      await this.loadSocialData();
    } catch (error) {
      console.error('Error loading social media data:', error);
      // Use fallback data if CMS fails
      this.socialData = {
        instagram: '#',
        facebook: '#'
      };
    }
    
    // Always mount the component
    await super.mount();
  }

  async loadSocialData() {
    try {
      // Try to load from CMS API first
      const response = await this.apiService.getSocialMedia();
      if (response && response.social) {
        console.log('Successfully loaded social media data from CMS:', response.social);
        this.socialData = response.social;
      } else {
        throw new Error('Invalid CMS response');
      }
    } catch (error) {
      console.warn('CMS API failed, using fallback data:', error);
      // Fallback to basic social data
      this.socialData = {
        instagram: '#',
        facebook: '#'
      };
    }
  }

  render() {
    const footer = Utils.createElement('footer', {
      className: 'footer'
    });

    const footerContent = Utils.createElement('div', {
      className: 'footer-content'
    });

    const footerLinks = Utils.createElement('div', {
      className: 'footer-links'
    });

    CONFIG.navigation.forEach(item => {
      const link = Utils.createElement('a', {
        href: item.href,
        className: 'footer-link',
        innerHTML: item.name,
        onClick: (e) => {
          e.preventDefault();
          if (item.href === '#home') {
            // If we're on the homepage, scroll to top
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              // If we're on another page, navigate to homepage
              window.location.href = '/';
            }
          } else if (item.href === '/about') {
            // Navigate to the About page
            window.location.href = '/about';
          } else if (item.href === '/books') {
            // Navigate to the Books page
            window.location.href = '/books';
          } else if (item.href === '/media') {
            // Navigate to the Media page
            window.location.href = '/media';
          } else if (item.href === '/contact') {
            // Navigate to the Contact page
            window.location.href = '/contact';
          } else if (item.href.startsWith('#')) {
            // Handle other anchor links (like #contact)
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
              // If we're on the homepage, scroll to the section
              const target = document.querySelector(item.href);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            } else {
              // If we're on another page, navigate to homepage and then scroll
              window.location.href = `/${item.href}`;
            }
          } else {
            // For any other pages, navigate directly
            window.location.href = item.href;
          }
        }
      });
      footerLinks.appendChild(link);
    });

    const socialLinks = Utils.createElement('div', {
      className: 'social-links'
    });

    // Create Instagram and Facebook links from CMS data
    if (this.socialData) {
      // Instagram link
      if (this.socialData.instagram && this.socialData.instagram !== '#') {
        const instagramLink = Utils.createElement('a', {
          href: this.socialData.instagram,
          className: 'social-link',
          'aria-label': 'Instagram',
          innerHTML: 'Instagram',
          target: '_blank',
          rel: 'noopener noreferrer'
        });
        socialLinks.appendChild(instagramLink);
      }

      // Facebook link
      if (this.socialData.facebook && this.socialData.facebook !== '#') {
        const facebookLink = Utils.createElement('a', {
          href: this.socialData.facebook,
          className: 'social-link',
          'aria-label': 'Facebook',
          innerHTML: 'Facebook',
          target: '_blank',
          rel: 'noopener noreferrer'
        });
        socialLinks.appendChild(facebookLink);
      }
    }

    const copyright = Utils.createElement('div', {
      className: 'copyright',
      innerHTML: `&copy; 2025 ${CONFIG.author.name}. All rights reserved.`
    });

    const websiteCredit = Utils.createElement('div', {
      className: 'website-credit',
      innerHTML: 'Website by Amrita Chatterjee'
    });

    footerContent.appendChild(footerLinks);
    footerContent.appendChild(socialLinks);
    footerContent.appendChild(copyright);
    footerContent.appendChild(websiteCredit);
    footer.appendChild(footerContent);

    return footer;
  }
}

// Loading Manager
class LoadingManager {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
  }

  show() {
    this.loadingScreen.classList.remove('hidden');
  }

  hide() {
    this.loadingScreen.classList.add('hidden');
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
    }, 500);
  }

  async simulateLoading(duration = 1500) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.hide();
        resolve();
      }, duration);
    });
  }
}

export { BooksGrid, Footer, LoadingManager, About };
