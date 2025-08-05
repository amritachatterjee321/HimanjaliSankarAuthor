import CONFIG from './config.js';
import ApiService from './api.js';
import Utils from './utils.js';
import { EventEmitter, NotificationSystem } from './services.js';
import { Header, Component } from './components.js';

// Books Page Component
class BooksPage extends Component {
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
          },
          {
            id: 3,
            title: "The Burnings",
            genre: "Horror",
            coverClass: "adult-3",
            year: "2024",
            description: "A gothic horror novel.",
            amazonLink: "https://amazon.com/burnings"
          }
        ],
        children: [
          {
            id: 2,
            title: "The Magic Garden",
            genre: "Children's Book",
            coverClass: "children-2",
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
      className: 'books-page-section'
    });

    const container = Utils.createElement('div', {
      className: 'books-page-container'
    });

    // Books Categories Container
    const categoriesContainer = Utils.createElement('div', {
      className: 'books-categories-container'
    });

    // Adult Fiction Section
    if (this.booksData.adults && this.booksData.adults.length > 0) {
      const adultSection = this.createCategorySection('Adult Fiction', this.booksData.adults);
      categoriesContainer.appendChild(adultSection);
    }

    // Children's Fiction Section
    if (this.booksData.children && this.booksData.children.length > 0) {
      const childrenSection = this.createCategorySection("Children's Fiction", this.booksData.children);
      categoriesContainer.appendChild(childrenSection);
    }

    container.appendChild(categoriesContainer);
    section.appendChild(container);

    return section;
  }

  createCategorySection(categoryName, books) {
    const categorySection = Utils.createElement('div', {
      className: 'books-category-section'
    });

    const categoryHeader = Utils.createElement('div', {
      className: 'category-header'
    });

    const categoryTitle = Utils.createElement('h2', {
      className: 'category-title',
      innerHTML: categoryName
    });

    categoryHeader.appendChild(categoryTitle);

    const booksGrid = Utils.createElement('div', {
      className: 'books-grid'
    });

    books.forEach(book => {
      const bookCard = this.createBookCard(book);
      booksGrid.appendChild(bookCard);
    });

    categorySection.appendChild(categoryHeader);
    categorySection.appendChild(booksGrid);

    return categorySection;
  }

  createBookCard(book) {
    const bookCard = Utils.createElement('div', {
      className: 'book-card'
    });

    const bookCover = Utils.createElement('div', {
      className: `book-cover ${book.coverClass || 'default-cover'}`
    });

    const bookInfo = Utils.createElement('div', {
      className: 'book-info'
    });

    const bookTitle = Utils.createElement('h3', {
      className: 'book-title',
      innerHTML: book.title
    });

    const bookGenre = Utils.createElement('p', {
      className: 'book-genre',
      innerHTML: book.genre
    });

    const bookYear = Utils.createElement('p', {
      className: 'book-year',
      innerHTML: book.year
    });

    const bookDescription = Utils.createElement('p', {
      className: 'book-description',
      innerHTML: book.description
    });

    const bookActions = Utils.createElement('div', {
      className: 'book-actions'
    });

    const amazonButton = Utils.createElement('a', {
      href: book.amazonLink,
      className: 'book-link',
      target: '_blank',
      rel: 'noopener noreferrer',
      innerHTML: 'View on Amazon'
    });

    bookActions.appendChild(amazonButton);

    bookInfo.appendChild(bookTitle);
    bookInfo.appendChild(bookGenre);
    bookInfo.appendChild(bookYear);
    bookInfo.appendChild(bookDescription);
    bookInfo.appendChild(bookActions);

    bookCard.appendChild(bookCover);
    bookCard.appendChild(bookInfo);

    return bookCard;
  }

  async mount() {
    try {
      await this.fetchData();
      const element = this.render();
      this.container.appendChild(element);
      this.bindEvents();
    } catch (error) {
      console.error('Error mounting BooksPage:', error);
    }
  }

  bindEvents() {
    // Add any event listeners here if needed
  }
}

// Main Books Page Application
class BooksPageApp {
  constructor() {
    this.eventBus = new EventEmitter();
    this.notificationSystem = new NotificationSystem();
    this.apiService = new ApiService(CONFIG.api.baseUrl);
    this.init();
  }

  async init() {
    try {
      // Hide loading screen
      this.hideLoadingScreen();

      // Initialize app container
      const app = document.getElementById('app');
      app.innerHTML = '';

      // Create main structure
      const header = document.createElement('header');
      const main = document.createElement('main');
      const footer = document.createElement('footer');

      main.className = 'main-content';

      app.appendChild(header);
      app.appendChild(main);
      app.appendChild(footer);

      // Initialize components
      const headerComponent = new Header(header, this.eventBus);
      const booksPageComponent = new BooksPage(main, this.eventBus, this.apiService);

      // Mount components
      await headerComponent.mount();
      await booksPageComponent.mount();

      console.log('✅ Books page components mounted successfully');

    } catch (error) {
      console.error('Error initializing books page:', error);
      this.hideLoadingScreen();
      this.notificationSystem.show(
        'Error loading books page. Please refresh the page.',
        'error',
        'Loading Error'
      );
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    // Ensure main content is visible
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
      mainContent.style.visibility = 'visible';
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global app instance
  window.booksPageApp = new BooksPageApp();
  
  // Development helpers
  if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.Utils = Utils;
    console.log('🚀 Books Page initialized in development mode');
  }
});

// Export for module systems
export default BooksPageApp; 