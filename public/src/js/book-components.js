import CONFIG from './config.js';
import ApiService from './api.js';
import Utils from './utils.js';
import { EventEmitter, NotificationSystem, FormValidator } from './services.js';
import { Component, Header } from './components.js';

// Latest Book Component
class LatestBook extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.bookData = null;
    this.refreshInterval = null;
    this.lastUpdateTime = null;
  }

  async fetchData() {
    try {
      console.log('🔄 Fetching latest book data...');
      const newData = await this.apiService.getLatestBook();
      console.log('📖 Received data:', newData);
      console.log('📖 Short description:', newData.shortDescription);
      console.log('📖 Awards:', newData.awards);
      console.log('📖 Reviews:', newData.reviews);
      
      // Fix cover image URL for Vercel deployment
      if (newData.coverImage && newData.coverImage.url) {
        newData.coverImage.url = this.fixCoverImageUrl(newData.coverImage.url);
      }
      
      // Check if data has actually changed
      if (this.hasDataChanged(newData)) {
        console.log('🔄 New book data detected, updating display...');
        console.log('Old data:', this.bookData);
        console.log('New data:', newData);
        this.bookData = newData;
        this.lastUpdateTime = new Date();
        this.render(); // Re-render with new data
      } else {
        console.log('📖 No changes detected in book data');
      }
      
      return newData;
    } catch (error) {
      console.error('Failed to fetch latest book:', error);
      // Don't overwrite existing data on error
      if (!this.bookData) {
        // Fallback to static data only if no data exists
        this.bookData = {
          title: "Echoes of Tomorrow",
          subtitle: "Latest Release",
          genre: "A Novel",
          description: "A compelling exploration of memory, time, and the choices that define us.",
          publicationYear: "2024",
          publisher: "Literary Press",
          amazonLink: "https://amazon.com/echoes-tomorrow",
          pages: "324"
        };
      }
    }
  }

  hasDataChanged(newData) {
    if (!this.bookData) return true;
    
    // Compare key fields to detect changes
    const fieldsToCompare = ['title', 'subtitle', 'genre', 'description', 'publicationYear', 'publisher'];
    const hasChanges = fieldsToCompare.some(field => {
      const oldValue = this.bookData[field];
      const newValue = newData[field];
      if (oldValue !== newValue) {
        console.log(`🔄 Field "${field}" changed:`, { old: oldValue, new: newValue });
        return true;
      }
      return false;
    });
    
    return hasChanges;
  }

  startAutoRefresh() {
    // Refresh every 30 seconds to check for CMS updates
    this.refreshInterval = setInterval(async () => {
      await this.fetchData();
    }, 30000); // 30 seconds
    
    console.log('🔄 Auto-refresh enabled: checking for CMS updates every 30 seconds');
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('🔄 Auto-refresh disabled');
    }
  }

  fixCoverImageUrl(url) {
    // If it's already an absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative path starting with /uploads/, convert to a placeholder
    if (url.startsWith('/uploads/')) {
      // For now, use a placeholder image since Vercel can't serve /uploads/
      // You can replace this with your actual image hosting service URL
      return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop';
    }
    
    // If it's a relative path without /uploads/, try to make it absolute
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    
    // If it's a relative path without leading slash, add origin
    return `${window.location.origin}/${url}`;
  }

  render() {
    if (!this.bookData) {
      return Utils.createElement('div', {
        className: 'loading',
        innerHTML: 'LOADING'
      });
    }

    const section = Utils.createElement('section', {
      className: 'latest-book-section'
    });

    const container = Utils.createElement('div', {
      className: 'latest-book-container'
    });

    // Book Image
    const imageContainer = Utils.createElement('div', {
      className: 'latest-book-image'
    });

    // Use dynamic cover class from CMS data, fallback to 'featured'
    const coverClass = this.bookData.coverClass || 'featured';
    
    const bookCover = Utils.createElement('div', {
      className: `book-cover-large ${coverClass} clickable`
    });

    // Add actual cover image if available from CMS
    if (this.bookData.coverImage && this.bookData.coverImage.url) {
      const coverImg = Utils.createElement('img', {
        src: this.bookData.coverImage.url,
        alt: `${this.bookData.title} cover`,
        className: 'book-cover-image'
      });
      bookCover.appendChild(coverImg);
      
      // Add has-cover-image class for styling
      bookCover.classList.add('has-cover-image');
    }

    // Remove all text overlays - no more genre, title, or author text on covers
    imageContainer.appendChild(bookCover);

    // Make cover clickable
    bookCover.style.cursor = 'pointer';
    bookCover.addEventListener('click', () => {
      const bookId = this.bookData.id || 'latest';
      window.location.href = `/book-detail.html?id=${bookId}`;
    });

    // Book Content
    const content = Utils.createElement('div', {
      className: 'latest-book-content'
    });

    const subtitle = Utils.createElement('div', {
      className: 'book-subtitle',
      innerHTML: 'Latest Release'
    });

    const bookTitle = Utils.createElement('h2', {
      innerHTML: this.bookData.title,
      className: 'clickable'
    });

    // Make title clickable
    bookTitle.style.cursor = 'pointer';
    bookTitle.addEventListener('click', () => {
      const bookId = this.bookData.id || 'latest';
      window.location.href = `/book-detail.html?id=${bookId}`;
    });

    // Add awards above description if available
    let awardsSection = null;
    if (this.bookData.awards && Array.isArray(this.bookData.awards) && this.bookData.awards.length > 0) {
      awardsSection = Utils.createElement('div', {
        className: 'book-awards'
      });
      
      const awardsList = Utils.createElement('ul', {
        className: 'awards-list'
      });
      
      this.bookData.awards.forEach(award => {
        const awardItem = Utils.createElement('li', {
          className: 'award-item',
          innerHTML: award
        });
        awardsList.appendChild(awardItem);
      });
      
      awardsSection.appendChild(awardsList);
    }

    const description = Utils.createElement('p', {
      className: 'book-description',
      innerHTML: this.bookData.shortDescription || this.bookData.description
    });

    // Create buy button with fallback if no Amazon link
    const amazonLink = this.bookData.amazonLink || '#';
    console.log('🛒 Creating buy button with Amazon link:', amazonLink);
    
    const buyButton = Utils.createElement('a', {
      href: amazonLink,
      className: 'buy-button',
      target: '_blank',
      innerHTML: 'Buy Now on Amazon',
      onClick: (e) => {
        if (!this.bookData.amazonLink) {
          e.preventDefault();
          console.log('⚠️ No Amazon link available, showing notification');
          if (window.app && window.app.notificationSystem) {
            window.app.notificationSystem.show(
              'Amazon link not available yet',
              'warning',
              'Purchase'
            );
          }
          return;
        }
        
        // Track the purchase click
        console.log('🛒 Redirecting to Amazon:', this.bookData.amazonLink);
        if (window.app && window.app.notificationSystem) {
          window.app.notificationSystem.show(
            'Redirecting to Amazon...',
            'info',
            'Purchase'
          );
        }
      }
    });

    // Add some debugging styles to ensure button is visible
    buyButton.style.cssText = `
      background: #9b6b9e !important;
      color: #ffffff !important;
      border: 2px solid #9b6b9e !important;
      border-radius: 8px !important;
      padding: 20px 45px !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      text-decoration: none !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 15px !important;
      cursor: pointer !important;
      margin-top: 10px !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
    `;

    content.appendChild(subtitle);
    content.appendChild(bookTitle);
    if (awardsSection) {
      content.appendChild(awardsSection);
    }
    content.appendChild(description);
    content.appendChild(buyButton);

    container.appendChild(imageContainer);
    container.appendChild(content);
    section.appendChild(container);

    return section;
  }

  async mount() {
    await this.fetchData();
    this.startAutoRefresh(); // Start auto-refresh on mount
    return super.mount();
  }

  destroy() {
    this.stopAutoRefresh(); // Clean up interval when component is destroyed
    super.destroy();
  }

  bindEvents() {
    // Add animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    const elements = this.element.querySelectorAll('.latest-book-image, .latest-book-content');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.8s ease';
      observer.observe(el);
    });
  }
}

export { LatestBook };
