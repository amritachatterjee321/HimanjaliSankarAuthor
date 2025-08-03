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
        innerHTML: 'Loading books...'
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.app.notificationSystem.show(
              `${item.name} page coming soon!`,
              'info',
              'Coming Soon'
            );
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

export { BooksGrid, Footer, LoadingManager };
