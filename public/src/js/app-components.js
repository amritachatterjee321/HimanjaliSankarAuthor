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

    // Adult Books Section
    if (this.booksData.adults && this.booksData.adults.length > 0) {
      const adultSection = this.createCategorySection('Adult Fiction', this.booksData.adults);
      categoriesContainer.appendChild(adultSection);
    }

    // Children's Books Section
    if (this.booksData.children && this.booksData.children.length > 0) {
      const childrenSection = this.createCategorySection("Children's Books", this.booksData.children);
      categoriesContainer.appendChild(childrenSection);
    }

    container.appendChild(header);
    container.appendChild(categoriesContainer);
    section.appendChild(container);

    return section;
  }

  createCategorySection(categoryName, books) {
    const categorySection = Utils.createElement('div', {
      className: 'category-section'
    });

    const categoryTitle = Utils.createElement('h3', {
      className: 'category-title',
      innerHTML: categoryName
    });

    const booksGrid = Utils.createElement('div', {
      className: 'books-grid'
    });

    books.forEach(book => {
      const bookCard = this.createBookCard(book);
      booksGrid.appendChild(bookCard);
    });

    categorySection.appendChild(categoryTitle);
    categorySection.appendChild(booksGrid);

    return categorySection;
  }

  createBookCard(book) {
    const bookCard = Utils.createElement('div', {
      className: 'book-card',
      onClick: () => this.showBookInfo(book)
    });

    const bookCover = Utils.createElement('div', {
      className: `book-cover ${book.coverClass}`
    });

    const genre = Utils.createElement('div', {
      className: 'book-genre',
      innerHTML: book.genre
    });

    const title = Utils.createElement('h4', {
      className: 'book-title',
      innerHTML: book.title
    });

    const author = Utils.createElement('div', {
      className: 'book-author',
      innerHTML: CONFIG.author.name
    });

    bookCover.appendChild(genre);
    bookCover.appendChild(title);
    bookCover.appendChild(author);

    const bookInfo = Utils.createElement('div', {
      className: 'book-info'
    });

    const infoTitle = Utils.createElement('h3', {
      innerHTML: book.title
    });

    const year = Utils.createElement('div', {
      className: 'book-year',
      innerHTML: book.year
    });

    const description = Utils.createElement('p', {
      className: 'book-description-short',
      innerHTML: book.description
    });

    const link = Utils.createElement('a', {
      href: book.amazonLink,
      className: 'book-link',
      innerHTML: 'View on Amazon',
      target: '_blank',
      onClick: (e) => {
        e.stopPropagation();
        window.app.notificationSystem.show(
          `Opening ${book.title} on Amazon...`,
          'info'
        );
      }
    });

    bookInfo.appendChild(infoTitle);
    bookInfo.appendChild(year);
    bookInfo.appendChild(description);
    bookInfo.appendChild(link);

    bookCard.appendChild(bookCover);
    bookCard.appendChild(bookInfo);

    return bookCard;
  }

  showBookInfo(book) {
    window.app.notificationSystem.show(
      `Learn more about "${book.title}" - Published in ${book.year}`,
      'info',
      'Book Details'
    );
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

    const subtitle = Utils.createElement('p', {
      className: 'section-subtitle',
      innerHTML: this.authorData?.shortBio || 'Award-winning author crafting heartwarming stories that bridge generations and cultures.'
    });

    header.appendChild(title);
    header.appendChild(subtitle);
    container.appendChild(header);

    // Create about content
    const aboutContent = Utils.createElement('div', {
      className: 'about-content'
    });

    // Author photo placeholder
    const authorPhoto = Utils.createElement('div', {
      className: 'author-photo'
    });

    const photoPlaceholder = Utils.createElement('div', {
      className: 'photo-placeholder',
      innerHTML: '<i class="fas fa-user"></i>'
    });

    authorPhoto.appendChild(photoPlaceholder);

    // Author bio
    const authorBio = Utils.createElement('div', {
      className: 'author-bio'
    });

    const bioText = Utils.createElement('p', {
      className: 'bio-text',
      innerHTML: this.authorData?.bio || 'A passionate author who loves to tell stories that touch the heart and inspire the mind. With a deep appreciation for the power of storytelling, Himanjali creates narratives that resonate with readers of all ages.'
    });

    // Assemble bio section
    authorBio.appendChild(bioText);

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
      // Use fallback data
      this.authorData = {
        name: 'Himanjali Sankar',
        bio: 'A passionate author who loves to tell stories that touch the heart and inspire the mind. With a deep appreciation for the power of storytelling, Himanjali creates narratives that resonate with readers of all ages. Her work spans multiple genres, from contemporary fiction to children\'s literature, always with a focus on creating meaningful connections through words.',
        email: 'himanjali@example.com',
        website: 'https://himanjali.com',
        location: 'India',
        genres: ['Contemporary Fiction', 'Children\'s Literature', 'Short Stories'],
        writingStyle: 'Heartwarming, Inspirational, Engaging',
        achievements: [
          'Multiple published works across different genres',
          'Recognition for storytelling excellence',
          'Growing reader community worldwide'
        ],
        inspiration: 'Everyday life, human relationships, and the power of hope and resilience'
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

    const socialIcons = Utils.createElement('div', {
      className: 'social-icons'
    });

    CONFIG.social.forEach(social => {
      const icon = Utils.createElement('a', {
        href: social.url,
        className: 'social-icon',
        'aria-label': social.name,
        innerHTML: social.icon,
        target: '_blank',
        onClick: (e) => {
          e.preventDefault();
          window.app.notificationSystem.show(
            `Visit ${social.name} page coming soon!`,
            'info',
            'Social Media'
          );
        }
      });
      socialIcons.appendChild(icon);
    });

    const copyright = Utils.createElement('div', {
      className: 'copyright',
      innerHTML: `&copy; 2025 ${CONFIG.author.name}. All rights reserved.`
    });

    footerContent.appendChild(footerLinks);
    footerContent.appendChild(socialIcons);
    footerContent.appendChild(copyright);
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
