import CONFIG from './config.js';
import ApiService from './api.js';
import Utils from './utils.js';
import { EventEmitter, NotificationSystem } from './services.js';
import { Header, Component } from './components.js';
import { Footer } from './app-components.js';

// Book Detail Page Component
class BookDetailPage extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.bookData = null;
    this.bookId = this.getBookIdFromUrl();
    console.log('🔍 BookDetailPage constructor called');
    console.log('🔍 Book ID from URL:', this.bookId);
  }

  getBookIdFromUrl() {
    console.log('🔍 getBookIdFromUrl called');
    console.log('🔍 Current pathname:', window.location.pathname);
    
    // First try to get book ID from path parameter (/book/:id)
    const pathMatch = window.location.pathname.match(/\/book\/(.+)/);
    console.log('🔍 Path match result:', pathMatch);
    
    if (pathMatch) {
      console.log('🔍 Found book ID from path:', pathMatch[1]);
      return pathMatch[1];
    }
    
    // Fallback to query parameter (?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    console.log('🔍 Query parameter ID:', queryId);
    
    if (queryId) {
      console.log('🔍 Using query parameter ID:', queryId);
      return queryId;
    }
    
    console.log('🔍 No book ID found, using default: latest');
    return 'latest';
  }

  async fetchData() {
    console.log('🔍 fetchData called with book ID:', this.bookId);
    try {
      console.log('🔍 Calling API service for book:', this.bookId);
      this.bookData = await this.apiService.getBook(this.bookId);
      console.log('🔍 Book data received:', this.bookData);
      console.log('🔍 Complete book data structure:', JSON.stringify(this.bookData, null, 2));
      console.log('🔍 Amazon link field:', {
        amazonLink: this.bookData.amazonLink,
        hasAmazonLink: !!this.bookData.amazonLink,
        amazonLinkType: typeof this.bookData.amazonLink,
        allFields: Object.keys(this.bookData)
      });
      
      // Update page title with book title
      if (this.bookData && this.bookData.title) {
        document.title = `${this.bookData.title} - Himanjali Sankar | Author`;
        console.log('🔍 Updated page title to:', document.title);
      }
    } catch (error) {
      console.error('❌ Failed to fetch book details:', error);
      this.showError('Failed to load book details');
    }
  }

  showError(message) {
    console.error('Book Detail Error:', message);
    if (window.app && window.app.notificationSystem) {
      window.app.notificationSystem.show(message, 'error', 'Error');
    }
  }

  render() {
    if (!this.bookData) {
      return Utils.createElement('div', {
        className: 'loading',
        innerHTML: 'LOADING'
      });
    }

    const section = Utils.createElement('section', {
      className: 'book-detail-section'
    });

    const container = Utils.createElement('div', {
      className: 'book-detail-container'
    });

    // Back to Books button
    const backButton = Utils.createElement('a', {
      href: '/books.html',
      className: 'back-button',
      innerHTML: '<i class="fas fa-arrow-left"></i> Back to Books'
    });

    // Book Cover and Basic Info
    const bookHeader = Utils.createElement('div', {
      className: 'book-detail-header'
    });

    const coverContainer = Utils.createElement('div', {
      className: 'book-detail-cover'
    });

    // Create book cover - prioritize CMS image, fallback to CSS class
    let bookCover;
    if (this.bookData.coverImage && this.bookData.coverImage.url) {
      // Use actual book cover image from CMS
      console.log('🖼️ Main cover: Using CMS cover image:', this.bookData.coverImage.url);
      bookCover = Utils.createElement('div', {
        className: 'book-cover-large has-cover-image'
      });
      
      const coverImg = Utils.createElement('img', {
        src: this.bookData.coverImage.url,
        alt: `${this.bookData.title} cover`,
        className: 'book-cover-image'
      });
      bookCover.appendChild(coverImg);
    } else if (this.bookData.coverImage && typeof this.bookData.coverImage === 'string') {
      // Handle case where coverImage is directly a string URL
      console.log('🖼️ Main cover: Using direct cover image URL:', this.bookData.coverImage);
      bookCover = Utils.createElement('div', {
        className: 'book-cover-large has-cover-image'
      });
      
      const coverImg = Utils.createElement('img', {
        src: this.bookData.coverImage,
        alt: `${this.bookData.title} cover`,
        className: 'book-cover-image'
      });
      bookCover.appendChild(coverImg);
    } else {
      // Fallback to CSS-based cover
      console.log('🖼️ Main cover: No cover image, using fallback CSS class');
      const coverClass = this.bookData.coverClass || 'featured';
      bookCover = Utils.createElement('div', {
        className: `book-cover-large ${coverClass}`,
        innerHTML: `<div class="cover-placeholder-large">${this.bookData.title}</div>`
      });
    }

    coverContainer.appendChild(bookCover);

    const basicInfo = Utils.createElement('div', {
      className: 'book-detail-basic-info'
    });

    const bookTitle = Utils.createElement('h1', {
      className: 'book-detail-title',
      innerHTML: this.bookData.title
    });

    basicInfo.appendChild(bookTitle);

    // Add awards section right after title if available
    if (this.bookData.awards && this.bookData.awards.length > 0) {
      const awardsSection = Utils.createElement('div', {
        className: 'book-detail-awards'
      });

      const awardsList = Utils.createElement('ul', {
        className: 'awards-list'
      });

      this.bookData.awards.forEach(award => {
        const awardItem = Utils.createElement('li', {
          innerHTML: award
        });
        awardsList.appendChild(awardItem);
      });

      awardsSection.appendChild(awardsList);
      basicInfo.appendChild(awardsSection);
    }

    bookHeader.appendChild(coverContainer);
    bookHeader.appendChild(basicInfo);

    // Book Description
    const descriptionSection = Utils.createElement('div', {
      className: 'book-detail-description'
    });

    const description = Utils.createElement('p', {
      className: 'book-detail-description-text',
      innerHTML: this.bookData.description
    });

    descriptionSection.appendChild(description);

    // Add reviews above the buy button if available
    if (this.bookData.reviews && this.bookData.reviews.length > 0) {
      const reviewsSection = Utils.createElement('div', {
        className: 'book-detail-reviews'
      });

      const reviewsList = Utils.createElement('div', {
        className: 'reviews-list'
      });

      this.bookData.reviews.forEach(review => {
        const reviewItem = Utils.createElement('div', {
          className: 'review-item'
        });

        // Handle review as a string (current format) or object (future format)
        let reviewText, reviewSource;
        
        if (typeof review === 'string') {
          // Current format: review is a string like "xknxkvn - hey"
          // Split by dash to separate review text and source
          const parts = review.split(' - ');
          const reviewContent = parts[0] || review; // Use first part or full string if no dash
          const reviewSourceText = parts[1] || 'Review'; // Use second part or 'Review' if no dash
          
          reviewText = Utils.createElement('p', {
            className: 'review-text',
            innerHTML: `"${reviewContent}"`
          });
          
          // Display the source without hyperlink
          reviewSource = Utils.createElement('p', {
            className: 'review-source',
            innerHTML: `— ${reviewSourceText}`
          });
        } else if (typeof review === 'object' && review.text) {
          // Future format: review is an object with text and source properties
          reviewText = Utils.createElement('p', {
            className: 'review-text',
            innerHTML: `"${review.text}"`
          });

          // Create clickable review source with link if available
          if (review.link) {
            reviewSource = Utils.createElement('a', {
              href: review.link,
              className: 'review-source clickable',
              target: '_blank',
              rel: 'noopener noreferrer',
              innerHTML: `— ${review.source}`
            });
          } else {
            reviewSource = Utils.createElement('p', {
              className: 'review-source',
              innerHTML: `— ${review.source}`
            });
          }
        }

        if (reviewText) {
          reviewItem.appendChild(reviewText);
          reviewItem.appendChild(reviewSource);
          reviewsList.appendChild(reviewItem);
        }
      });

      reviewsSection.appendChild(reviewsList);
      descriptionSection.appendChild(reviewsSection);
    }

    // Add Amazon Buy Button below reviews
    console.log('🛒 Book Amazon link data:', {
      hasAmazonLink: !!this.bookData.amazonLink,
      amazonLink: this.bookData.amazonLink,
      bookTitle: this.bookData.title
    });

    // Check for Amazon link in various possible field names
    const amazonLink = this.bookData.amazonLink || 
                      this.bookData.amazon_link || 
                      this.bookData.amazonUrl || 
                      this.bookData.amazon_url ||
                      this.bookData.purchaseLink ||
                      this.bookData.purchase_link;

    console.log('🛒 Resolved Amazon link:', {
      amazonLink: amazonLink,
      hasLink: !!amazonLink,
      fieldNames: {
        amazonLink: this.bookData.amazonLink,
        amazon_link: this.bookData.amazon_link,
        amazonUrl: this.bookData.amazonUrl,
        amazon_url: this.bookData.amazon_url,
        purchaseLink: this.bookData.purchaseLink,
        purchase_link: this.bookData.purchase_link
      }
    });

    if (amazonLink) {
      const buyButtonSection = Utils.createElement('div', {
        className: 'book-detail-buy-section'
      });

      const buyButton = Utils.createElement('a', {
        href: amazonLink,
        className: 'buy-button large',
        target: '_blank',
        rel: 'noopener noreferrer',
        innerHTML: 'Buy Now'
      });

      // Add inline styles to ensure button is visible
      buyButton.style.cssText = `
        padding: 20px 45px !important;
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 1.5px !important;
        background: #9b6b9e !important;
        color: #ffffff !important;
        border: 2px solid #9b6b9e !important;
        border-radius: 8px !important;
        text-decoration: none !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 15px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
        cursor: pointer !important;
        min-width: 200px !important;
        justify-content: center !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        line-height: 1.2 !important;
        position: relative !important;
        z-index: 10 !important;
      `;

      // Verify button href is set correctly
      console.log('🛒 Button created with href:', buyButton.href);
      console.log('🛒 Expected Amazon link:', amazonLink);
      console.log('🛒 Button element:', buyButton);

      // Add click tracking
      buyButton.addEventListener('click', (e) => {
        console.log('🛒 Amazon buy button clicked for book:', this.bookData.title);
        console.log('🛒 Redirecting to:', amazonLink);
        console.log('🛒 Button href attribute:', buyButton.href);
        console.log('🛒 Current button href:', buyButton.getAttribute('href'));
        
        // Track the purchase click
        if (window.app && window.app.notificationSystem) {
          window.app.notificationSystem.show(
            'Redirecting to Amazon...',
            'info',
            'Purchase'
          );
        }
      });

      // Add a simple test to ensure button is working
      buyButton.addEventListener('mouseenter', () => {
        console.log('🛒 Button hover detected');
      });

      // Test button accessibility
      console.log('🛒 Button accessibility test:', {
        hasHref: !!buyButton.href,
        hrefValue: buyButton.href,
        isClickable: buyButton.style.pointerEvents !== 'none',
        tabIndex: buyButton.tabIndex,
        role: buyButton.getAttribute('role')
      });

      buyButtonSection.appendChild(buyButton);
      descriptionSection.appendChild(buyButtonSection);
      
      // Add essential logging
      console.log('🛒 Buy button added successfully for book:', this.bookData.title);
      console.log('🛒 Amazon link:', amazonLink);
    } else {
      // Add a message for books without Amazon links
      const noLinkSection = Utils.createElement('div', {
        className: 'book-detail-no-link-section'
      });

      const noLinkMessage = Utils.createElement('p', {
        className: 'no-link-message',
        innerHTML: 'Amazon link coming soon!'
      });

      noLinkSection.appendChild(noLinkMessage);
      descriptionSection.appendChild(noLinkSection);
    }

    // Add description to basic info section
    basicInfo.appendChild(descriptionSection);

    // Reviews are now added above the buy button in the description section





    // Assemble the page
    container.appendChild(backButton);
    container.appendChild(bookHeader);

    // Add Other Books Carousel
    // Note: Carousel will be added after mount() completes
    this.otherBooksPromise = this.createOtherBooksCarousel();

    section.appendChild(container);

    return section;
  }

  async createOtherBooksCarousel() {
    try {
      // Fetch all books to show in carousel
      const allBooks = await this.apiService.getBooks();
      const otherBooks = [];
      
      // Collect books from all categories, excluding current book
      if (allBooks.adults) {
        otherBooks.push(...allBooks.adults.filter(book => book.id.toString() !== this.bookId.toString()));
      }
      if (allBooks.children) {
        otherBooks.push(...allBooks.children.filter(book => book.id.toString() !== this.bookId.toString()));
      }
      if (allBooks.latest && allBooks.latest.id.toString() !== this.bookId.toString()) {
        otherBooks.push(allBooks.latest);
      }

      if (otherBooks.length === 0) {
        return Utils.createElement('div', { className: 'hidden' });
      }

      const carouselSection = Utils.createElement('div', {
        className: 'other-books-carousel'
      });

      const carouselTitle = Utils.createElement('h3', {
        className: 'carousel-title',
        innerHTML: 'Other Books by Himanjali Sankar'
      });

      const carouselContainer = Utils.createElement('div', {
        className: 'carousel-container'
      });

      const carouselTrack = Utils.createElement('div', {
        className: 'carousel-track'
      });

      otherBooks.forEach(book => {
        const bookCard = Utils.createElement('div', {
          className: 'carousel-book-card'
        });

        // Create book cover - prioritize CMS image, fallback to CSS class
        let bookCover;
        if (book.coverImage && book.coverImage.url) {
          // Use actual book cover image from CMS
          console.log('🖼️ Carousel: Using CMS cover image for', book.title, ':', book.coverImage.url);
          bookCover = Utils.createElement('div', {
            className: 'book-cover-small has-cover-image clickable'
          });
          
          const coverImg = Utils.createElement('img', {
            src: book.coverImage.url,
            alt: `${book.title} cover`,
            className: 'book-cover-image'
          });
          bookCover.appendChild(coverImg);
        } else if (book.coverImage && typeof book.coverImage === 'string') {
          // Handle case where coverImage is directly a string URL
          console.log('🖼️ Carousel: Using direct cover image URL for', book.title, ':', book.coverImage);
          bookCover = Utils.createElement('div', {
            className: 'book-cover-small has-cover-image clickable'
          });
          
          const coverImg = Utils.createElement('img', {
            src: book.coverImage,
            alt: `${book.title} cover`,
            className: 'book-cover-image'
          });
          bookCover.appendChild(coverImg);
        } else {
          // Fallback to CSS-based cover with placeholder text
          console.log('🖼️ Carousel: No cover image for', book.title, ', using fallback CSS class');
          bookCover = Utils.createElement('div', {
            className: `book-cover-small ${book.coverClass || 'default-cover'} clickable`,
            innerHTML: `<div class="cover-placeholder-small">${book.title}</div>`
          });
        }

        // Make cover clickable
        bookCover.style.cursor = 'pointer';
        bookCover.addEventListener('click', () => {
          const bookId = book._id || book.id || 'latest';
          console.log('🖱️ Carousel book cover clicked, navigating to book ID:', bookId);
          window.location.href = `/book-detail.html?id=${bookId}`;
        });

        const bookTitle = Utils.createElement('h4', {
          className: 'carousel-book-title',
          innerHTML: book.title
        });

        bookCard.appendChild(bookCover);
        bookCard.appendChild(bookTitle);
        carouselTrack.appendChild(bookCard);
      });

      // Add navigation arrows
      // const prevButton = Utils.createElement('button', {
      //   className: 'carousel-nav prev',
      //   innerHTML: '<i class="fas fa-chevron-left"></i>',
      //   onClick: () => this.scrollCarousel('prev')
      // });

      // const nextButton = Utils.createElement('button', {
      //   className: 'carousel-nav next',
      //   innerHTML: '<i class="fas fa-chevron-right"></i>',
      //   onClick: () => this.scrollCarousel('next')
      // });

      // carouselContainer.appendChild(prevButton);
      carouselContainer.appendChild(carouselTrack);
      // carouselContainer.appendChild(nextButton);

      carouselSection.appendChild(carouselTitle);
      carouselSection.appendChild(carouselContainer);

      // Auto-scroll functionality removed

      return carouselSection;
    } catch (error) {
      console.error('Error creating other books carousel:', error);
      return Utils.createElement('div', { className: 'hidden' });
    }
  }





  async mount() {
    try {
      if (!this.container) {
        console.error('Container is null, cannot mount BookDetailPage');
        return;
      }
      
      await this.fetchData();
      const element = this.render();
      this.container.appendChild(element);
      this.bindEvents();
      
      // Add the carousel after the main content is rendered
      if (this.otherBooksPromise) {
        const otherBooksSection = await this.otherBooksPromise;
        if (otherBooksSection && !otherBooksSection.classList.contains('hidden')) {
          this.container.appendChild(otherBooksSection);
        }
      }
    } catch (error) {
      console.error('Error mounting BookDetailPage:', error);
    }
  }

  bindEvents() {
    // Remove the carousel touch events call
    // this.addCarouselTouchEvents();
  }

  cleanup() {
    // Auto-scroll functionality removed
  }


}

// Initialize the app
class BookDetailApp {
  constructor() {
    this.container = document.getElementById('app');
    this.eventBus = new EventEmitter();
    this.apiService = new ApiService();
    this.notificationSystem = new NotificationSystem();
    
    // Make notification system globally available
    window.app = {
      notificationSystem: this.notificationSystem
    };
    
    this.init();
  }

  async init() {
    try {
      // Add header
      const header = new Header(this.container, this.eventBus);
      await header.mount();

      // Create main content area for book detail page
      const main = document.createElement('main');
      main.className = 'main-content';
      this.container.appendChild(main);

      // Add book detail page to main content area
      const bookDetailPage = new BookDetailPage(main, this.eventBus, this.apiService);
      await bookDetailPage.mount();

      // Add footer
      const footer = document.createElement('footer');
      this.container.appendChild(footer);
      const footerComponent = new Footer(footer, this.eventBus);
      await footerComponent.mount();

      // Hide loading screen
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
    } catch (error) {
      console.error('Error initializing BookDetailApp:', error);
    }
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BookDetailApp();
});
