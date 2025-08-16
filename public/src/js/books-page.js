console.log('🔄 Books page: Starting to load modules...');

import CONFIG from './config.js';
console.log('✅ CONFIG loaded');

import ApiService from './api.js';
console.log('✅ ApiService loaded');

import Utils from './utils.js';
console.log('✅ Utils loaded');

import { EventEmitter, NotificationSystem } from './services.js';
console.log('✅ Services loaded');

import { Header, Component } from './components.js';
console.log('✅ Components loaded');

import { Footer } from './app-components.js';
console.log('✅ App components loaded');

console.log('🔄 Books page: All modules loaded successfully');

// Books Page Component
class BooksPage extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.booksData = null;
  }

  async fetchData() {
    try {
      console.log('🔄 Books page: Starting to fetch data...');
      const response = await this.apiService.getBooks();
      console.log('📚 Books data from API:', response);
      console.log('📚 Response type:', typeof response);
      console.log('📚 Response keys:', Object.keys(response));
      
      // The API returns { adults: [...], children: [...], latest: {...}, homepageBooks: [...] }
      if (response && typeof response === 'object') {
        if (response.adults || response.children) {
          console.log('📚 Found structured response with adults/children arrays');
          this.booksData = {
            adults: response.adults || [],
            children: response.children || []
          };
          console.log('📚 Direct assignment from API response:', this.booksData);
        } else {
          // Fallback: try to find any array in the response
          const keys = Object.keys(response);
          let booksArray = [];
          
          for (const key of keys) {
            if (Array.isArray(response[key])) {
              booksArray = response[key];
              console.log(`📚 Found books array in response.${key}:`, booksArray);
              break;
            }
          }
          
          if (booksArray.length > 0) {
            // Transform API data to match our expected format
            this.booksData = this.transformApiData(booksArray);
            console.log('📚 Transformed booksData:', this.booksData);
          } else {
            console.log('📚 No books found in response:', response);
            this.booksData = { adults: [], children: [] };
          }
        }
      } else {
        console.log('📚 Invalid response format:', response);
        this.booksData = { adults: [], children: [] };
      }
      
    } catch (error) {
      console.error('Failed to fetch books:', error);
      // Fallback to static data
      this.booksData = {
        adults: [
          {
            id: "whispers-in-rain",
            title: "Whispers in the Rain",
            genre: "Stories",
            coverClass: "adults-whispers-in-rain",
            year: "2023",
            description: "A collection of interconnected short stories.",
            amazonLink: "https://amazon.com/whispers-rain"
          },
          {
            id: "the-burnings",
            title: "The Burnings",
            genre: "Horror",
            coverClass: "adults-the-burnings",
            year: "2024",
            description: "A gothic horror novel.",
            amazonLink: "https://amazon.com/burnings"
          }
        ],
        children: [
          {
            id: "magic-garden",
            title: "The Magic Garden",
            genre: "Children's Book",
            coverClass: "children-magic-garden",
            year: "2023",
            description: "A delightful story about friendship.",
            amazonLink: "https://amazon.com/magic-garden"
          }
        ]
      };
    }
  }

  transformApiData(books) {
    console.log('🔄 transformApiData called with:', books);
    console.log('🔄 Books type:', typeof books);
    console.log('🔄 Is array:', Array.isArray(books));
    
    if (!Array.isArray(books)) {
      console.log('🔄 Not an array, returning empty data');
      return { adults: [], children: [] };
    }
    
    if (books.length === 0) {
      console.log('🔄 Empty books array, returning empty data');
      return { adults: [], children: [] };
    }
    
    console.log('🔄 Processing', books.length, 'books');
    const adults = [];
    const children = [];
    
    books.forEach((book, index) => {
      console.log(`🔄 Processing book ${index}:`, book);
      console.log(`🔄 Book coverImage data:`, book.coverImage);
      
      // Ensure book is an object
      if (!book || typeof book !== 'object') {
        console.log(`🔄 Skipping invalid book ${index}:`, book);
        return;
      }
      
      console.log(`🔄 Book category:`, book.category);
      
      const transformedBook = {
        id: book._id || book.id || `book-${index}`,
        _id: book._id, // Preserve original MongoDB ID
        title: book.title || 'Untitled',
        year: book.year || 'Unknown Year',
        description: book.shortDescription || book.description || 'No description available',
        coverImage: book.coverImage?.url || book.coverImage || null,
        category: book.category || 'adults',
        amazonLink: book.amazonLink || null
      };
      
      console.log(`🔄 Transformed book:`, transformedBook);
      
      // Normalize category to handle case variations
      const normalizedCategory = (book.category || 'adults').toLowerCase().trim();
      
      if (normalizedCategory === 'children' || normalizedCategory === 'childrens') {
        children.push(transformedBook);
        console.log(`🔄 Added to children array`);
      } else {
        adults.push(transformedBook);
        console.log(`🔄 Added to adults array`);
      }
    });
    
    console.log('🔄 Final transformed data:', { adults, children });
    return { adults, children };
  }

  render() {
    console.log('🎨 Render method called');
    console.log('🎨 booksData:', this.booksData);
    
    if (!this.booksData) {
      console.log('🎨 No booksData, showing loading');
      return Utils.createElement('div', {
        className: 'loading',
        innerHTML: 'LOADING'
      });
    }

    console.log('🎨 Creating books page section');
    const section = Utils.createElement('section', {
      className: 'books-page-section'
    });
    
    console.log('🎨 Section element created:', section);
    console.log('🎨 Section className:', section.className);

    const container = Utils.createElement('div', {
      className: 'books-page-container'
    });

    // Books Categories Container
    const categoriesContainer = Utils.createElement('div', {
      className: 'books-categories-container'
    });

    // Adult Fiction Section
    console.log('🎨 Checking adults section:', this.booksData.adults);
    if (this.booksData.adults && this.booksData.adults.length > 0) {
      console.log('🎨 Creating adult section with', this.booksData.adults.length, 'books');
      const adultSection = this.createCategorySection('Adult Fiction', this.booksData.adults);
      categoriesContainer.appendChild(adultSection);
    }

    // Children's Fiction Section
    console.log('🎨 Checking children section:', this.booksData.children);
    if (this.booksData.children && this.booksData.children.length > 0) {
      console.log('🎨 Creating children section with', this.booksData.children.length, 'books');
      const childrenSection = this.createCategorySection("Children's Fiction", this.booksData.children);
      categoriesContainer.appendChild(childrenSection);
    } else {
      console.log('🎨 No children books to display');
    }

    container.appendChild(categoriesContainer);
    
    // Check if we have any books to display
    if ((!this.booksData.adults || this.booksData.adults.length === 0) && 
        (!this.booksData.children || this.booksData.children.length === 0)) {
      console.log('🎨 No books found, showing empty state');
      const emptyState = Utils.createElement('div', {
        className: 'empty-state',
        innerHTML: `
          <h3>No Books Found</h3>
          <p>No books are currently available. Please check back later or contact the administrator.</p>
          <p><strong>Debug Info:</strong> API returned ${this.booksData ? 'data but no books' : 'no data'}</p>
          <button id="test-api-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #9b6b9e; color: white; border: none; border-radius: 4px; cursor: pointer;">Test API</button>
        `
      });
      container.appendChild(emptyState);
      
      // Add test button functionality
      setTimeout(() => {
        const testBtn = document.getElementById('test-api-btn');
        if (testBtn) {
          testBtn.addEventListener('click', async () => {
            console.log('🧪 Test API button clicked');
            try {
              const testResponse = await this.apiService.getBooks();
              console.log('🧪 Test API response:', testResponse);
              alert(`API Response: ${JSON.stringify(testResponse, null, 2)}`);
            } catch (error) {
              console.error('🧪 Test API error:', error);
              alert(`API Error: ${error.message}`);
            }
          });
        }
      }, 100);
    }
    
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

    // Create book cover - use CMS image if available, otherwise fallback to CSS class
    let bookCover;
    if (book.coverImage && book.coverImage.url) {
      // Use actual book cover image from CMS
      console.log('🖼️ Using CMS cover image:', book.coverImage.url);
      bookCover = Utils.createElement('img', {
        className: 'book-cover-image',
        src: book.coverImage.url,
        alt: `Cover of ${book.title}`,
        loading: 'lazy'
      });
    } else if (book.coverImage && typeof book.coverImage === 'string') {
      // Handle case where coverImage is directly a string URL
      console.log('🖼️ Using direct cover image URL:', book.coverImage);
      bookCover = Utils.createElement('img', {
        className: 'book-cover-image',
        src: book.coverImage,
        alt: `Cover of ${book.title}`,
        loading: 'lazy'
      });
    } else {
      // Fallback to CSS-based cover
      console.log('🖼️ No cover image, using fallback CSS class');
      bookCover = Utils.createElement('div', {
        className: `book-cover ${book.coverClass || 'default-cover'}`,
        innerHTML: `<div class="cover-placeholder">Cover of ${book.title}</div>`
      });
    }

    // Make cover clickable
    bookCover.style.cursor = 'pointer';
    bookCover.addEventListener('click', () => {
      const bookId = book._id || book.id || 'latest';
      console.log('🖱️ Book cover clicked, navigating to book ID:', bookId);
      window.location.href = `/book-detail.html?id=${bookId}`;
    });

    const bookInfo = Utils.createElement('div', {
      className: 'book-info'
    });

    const bookTitle = Utils.createElement('h3', {
      className: 'book-title clickable',
      innerHTML: book.title
    });

    // Make title clickable
    bookTitle.style.cursor = 'pointer';
    bookTitle.addEventListener('click', () => {
      const bookId = book._id || book.id || 'latest';
      console.log('🖱️ Book title clicked, navigating to book ID:', bookId);
      window.location.href = `/book-detail.html?id=${bookId}`;
    });

    const bookYear = Utils.createElement('p', {
      className: 'book-year',
      innerHTML: book.year
    });

    // Use short description if available, otherwise truncate the full description
    const shortDescription = book.shortDescription || 
      (book.description && book.description.length > 150 ? 
        book.description.substring(0, 150) + '...' : 
        book.description);

    const bookDescription = Utils.createElement('p', {
      className: 'book-description',
      innerHTML: shortDescription
    });

    bookInfo.appendChild(bookTitle);
    bookInfo.appendChild(bookYear);
    bookInfo.appendChild(bookDescription);

    // Only show Amazon link if available - now below description
    if (book.amazonLink) {
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
      bookInfo.appendChild(bookActions);
    }

    bookCard.appendChild(bookCover);
    bookCard.appendChild(bookInfo);

    return bookCard;
  }

  async mount() {
    try {
      console.log('🔧 BooksPage: Starting mount...');
      await this.fetchData();
      console.log('🔧 BooksPage: Data fetched, rendering...');
      const element = this.render();
      console.log('🔧 BooksPage: Element rendered:', element);
      console.log('🔧 BooksPage: Container:', this.container);
      this.container.appendChild(element);
      console.log('🔧 BooksPage: Element appended to container');
      this.bindEvents();
      console.log('🔧 BooksPage: Mount completed successfully');
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
      const footerComponent = new Footer(footer, this.eventBus);

      // Mount components
      await headerComponent.mount();
      await booksPageComponent.mount();
      await footerComponent.mount();

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