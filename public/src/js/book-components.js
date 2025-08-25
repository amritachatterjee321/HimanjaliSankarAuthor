import CONFIG from './config.js';
import ApiService from './api.js';
import Utils, { ImageOptimizer } from './utils.js';
import { EventEmitter, NotificationSystem, FormValidator } from './services.js';
import { Component, Header } from './components.js';
import CloudinaryConfig from './cloudinary-config.js';

// Latest Book Component
class LatestBook extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.bookData = null;
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
      
      // Use latestReleaseText from book data (now included in API response)
      if (newData.latestReleaseText) {
        console.log('📝 Using latest release text from API:', newData.latestReleaseText);
      } else {
        newData.latestReleaseText = 'LATEST RELEASE';
        console.log('📝 Using default latest release text');
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
          pages: "324",
          latestReleaseText: "LATEST RELEASE"
        };
      }
    }
  }

  hasDataChanged(newData) {
    if (!this.bookData) return true;
    
    // Compare key fields to detect changes
    const fieldsToCompare = ['title', 'subtitle', 'genre', 'description', 'publicationYear', 'publisher', 'latestReleaseText'];
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

  // Auto-refresh disabled - data only loads on page refresh
  startAutoRefresh() {
    console.log('🔄 Auto-refresh disabled - data only loads on page refresh');
  }

  stopAutoRefresh() {
    console.log('🔄 Auto-refresh disabled');
  }

  fixCoverImageUrl(url) {
    console.log('🔧 Fixing cover image URL:', url);
    
    // If it's already an absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('✅ URL is already absolute:', url);
      return url;
    }
    
    // If it's a relative path starting with /uploads/, convert to a placeholder
    if (url.startsWith('/uploads/')) {
      console.log('📁 Uploads path detected, using placeholder image');
      // Use a more reliable placeholder image
      return 'https://via.placeholder.com/400x600/667eea/ffffff?text=Book+Cover';
    }
    
    // If it's a relative path without /uploads/, try to make it absolute
    if (url.startsWith('/')) {
      const absoluteUrl = `${window.location.origin}${url}`;
      console.log('🔗 Made relative path absolute:', absoluteUrl);
      return absoluteUrl;
    }
    
    // If it's a relative path without leading slash, add origin
    const absoluteUrl = `${window.location.origin}/${url}`;
    console.log('🔗 Added origin to relative path:', absoluteUrl);
    return absoluteUrl;
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

    // Latest Release subtitle - moved above book cover
    const subtitle = Utils.createElement('div', {
      className: 'book-subtitle',
      innerHTML: this.bookData.latestReleaseText || 'LATEST RELEASE'
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
    console.log('🖼️ Cover image data:', this.bookData.coverImage);
    if (this.bookData.coverImage && this.bookData.coverImage.url) {
      console.log('🖼️ Creating cover image with URL:', this.bookData.coverImage.url);
      
      // Optimize the image URL for Cloudinary
      const optimizedUrl = CloudinaryConfig.getOptimizedUrl(this.bookData.coverImage.url, 'bookCover');
      const lowResUrl = CloudinaryConfig.getProgressiveUrl(this.bookData.coverImage.url, 'bookCover');
      const srcSet = CloudinaryConfig.generateSrcSet(this.bookData.coverImage.url, 'bookCover');
      
      // Create optimized image with lazy loading
      const coverImg = ImageOptimizer.createResponsiveImage(bookCover, {
        url: optimizedUrl,
        lowResUrl: lowResUrl
      }, {
        lazy: true,
        progressive: true,
        sizes: '(max-width: 768px) 100vw, 400px',
        alt: `${this.bookData.title} cover`
      });
      
      // Add srcset for responsive images
      if (srcSet) {
        coverImg.srcset = srcSet;
      }
      
      bookCover.appendChild(coverImg);
      
      // Add has-cover-image class for styling
      bookCover.classList.add('has-cover-image');
    } else {
      console.log('⚠️ No cover image data available, using fallback');
      // Add fallback text or placeholder
      bookCover.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 1.2em; text-align: center; padding: 20px;">${this.bookData.title}</div>`;
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
      innerHTML: 'Buy now',
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

    // Add content elements to content div
    content.appendChild(bookTitle);
    if (awardsSection) {
      content.appendChild(awardsSection);
    }
    content.appendChild(description);
    content.appendChild(buyButton);

    container.appendChild(subtitle);
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

// Second Featured Book Component
class SecondFeaturedBook extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.bookData = null;
    this.lastUpdateTime = null;
  }

  async fetchData() {
    try {
      console.log('📖 Fetching second featured book data...');
      const newData = await this.apiService.getSecondFeaturedBook();
      
      // Use secondFeaturedReleaseText from book data (now included in API response)
      if (newData.secondFeaturedReleaseText) {
        console.log('📝 Using second featured release text from API:', newData.secondFeaturedReleaseText);
      } else {
        newData.secondFeaturedReleaseText = 'FEATURED RELEASE';
        console.log('📝 Using default second featured release text');
      }
      
      // Check if data has actually changed
      if (this.hasDataChanged(newData)) {
        console.log('🔄 New second featured book data detected, updating display...');
        console.log('Old data:', this.bookData);
        console.log('New data:', newData);
        this.bookData = newData;
        this.lastUpdateTime = new Date();
        this.render(); // Re-render with new data
      } else {
        console.log('📖 No changes detected in second featured book data');
      }
      
      return newData;
    } catch (error) {
      console.error('Failed to fetch second featured book:', error);
      // Don't overwrite existing data on error
      if (!this.bookData) {
        // Fallback to static data only if no data exists
        this.bookData = {
          title: "Whispers of Yesterday",
          subtitle: "Featured Release",
          genre: "A Novel",
          description: "A captivating story of love, loss, and the power of memories.",
          publicationYear: "2023",
          publisher: "Literary Press",
          amazonLink: "https://amazon.com/whispers-yesterday",
          pages: "298",
          secondFeaturedReleaseText: "FEATURED RELEASE"
        };
      }
    }
  }

  hasDataChanged(newData) {
    if (!this.bookData) return true;
    
    // Compare key fields to detect changes
    const fieldsToCompare = ['title', 'subtitle', 'genre', 'description', 'publicationYear', 'publisher', 'secondFeaturedReleaseText'];
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

  // Auto-refresh disabled - data only loads on page refresh
  startAutoRefresh() {
    console.log('🔄 Auto-refresh disabled - data only loads on page refresh');
  }

  stopAutoRefresh() {
    console.log('🔄 Auto-refresh disabled');
  }

  fixCoverImageUrl(url) {
    console.log('🔧 Fixing cover image URL:', url);
    
    // If it's already an absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('✅ URL is already absolute:', url);
      return url;
    }
    
    // If it's a relative path starting with /uploads/, convert to a placeholder
    if (url.startsWith('/uploads/')) {
      console.log('📁 Uploads path detected, using placeholder image');
      // Use a more reliable placeholder image
      return 'https://via.placeholder.com/400x600/4facfe/ffffff?text=Book+Cover';
    }
    
    // If it's a relative path without /uploads/, try to make it absolute
    if (url.startsWith('/')) {
      const absoluteUrl = `${window.location.origin}${url}`;
      console.log('🔗 Made relative path absolute:', absoluteUrl);
      return absoluteUrl;
    }
    
    // If it's a relative path without leading slash, add origin
    const absoluteUrl = `${window.location.origin}/${url}`;
    console.log('🔗 Added origin to relative path:', absoluteUrl);
    return absoluteUrl;
  }

  render() {
    if (!this.bookData) {
      return Utils.createElement('div', {
        className: 'loading',
        innerHTML: 'LOADING'
      });
    }

    const section = Utils.createElement('section', {
      className: 'second-featured-book-section'
    });

    const container = Utils.createElement('div', {
      className: 'second-featured-book-container'
    });

    // Second Featured Release subtitle - moved above book cover
    const subtitle = Utils.createElement('div', {
      className: 'book-subtitle',
      innerHTML: this.bookData.secondFeaturedReleaseText || 'FEATURED RELEASE'
    });

    // Book Image
    const imageContainer = Utils.createElement('div', {
      className: 'second-featured-book-image'
    });

    // Use dynamic cover class from CMS data, fallback to 'featured-2'
    const coverClass = this.bookData.coverClass || 'featured-2';
    
    const bookCover = Utils.createElement('div', {
      className: `book-cover-large ${coverClass} clickable`
    });

    // Add actual cover image if available from CMS
    console.log('🖼️ Cover image data:', this.bookData.coverImage);
    if (this.bookData.coverImage && this.bookData.coverImage.url) {
      console.log('🖼️ Creating cover image with URL:', this.bookData.coverImage.url);
      
      // Optimize the image URL for Cloudinary
      const optimizedUrl = CloudinaryConfig.getOptimizedUrl(this.bookData.coverImage.url, 'bookCover');
      const lowResUrl = CloudinaryConfig.getProgressiveUrl(this.bookData.coverImage.url, 'bookCover');
      const srcSet = CloudinaryConfig.generateSrcSet(this.bookData.coverImage.url, 'bookCover');
      
      // Create optimized image with lazy loading
      const coverImg = ImageOptimizer.createResponsiveImage(bookCover, {
        url: optimizedUrl,
        lowResUrl: lowResUrl
      }, {
        lazy: true,
        progressive: true,
        sizes: '(max-width: 768px) 100vw, 400px',
        alt: `${this.bookData.title} cover`
      });
      
      // Add srcset for responsive images
      if (srcSet) {
        coverImg.srcset = srcSet;
      }
      
      bookCover.appendChild(coverImg);
      
      // Add has-cover-image class for styling
      bookCover.classList.add('has-cover-image');
    } else {
      console.log('⚠️ No cover image data available, using fallback');
      // Add fallback text or placeholder
      bookCover.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 1.2em; text-align: center; padding: 20px;">${this.bookData.title}</div>`;
    }

    // Remove all text overlays - no more genre, title, or author text on covers
    imageContainer.appendChild(bookCover);

    // Make cover clickable
    bookCover.style.cursor = 'pointer';
    bookCover.addEventListener('click', () => {
      const bookId = this.bookData.id || 'second-featured';
      window.location.href = `/book-detail.html?id=${bookId}`;
    });

    // Book Content
    const content = Utils.createElement('div', {
      className: 'second-featured-book-content'
    });

    const bookTitle = Utils.createElement('h2', {
      innerHTML: this.bookData.title,
      className: 'clickable'
    });

    // Make title clickable
    bookTitle.style.cursor = 'pointer';
    bookTitle.addEventListener('click', () => {
      const bookId = this.bookData.id || 'second-featured';
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
      innerHTML: 'Buy now',
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

    // Add content elements to content div
    content.appendChild(bookTitle);
    if (awardsSection) {
      content.appendChild(awardsSection);
    }
    content.appendChild(description);
    content.appendChild(buyButton);

    container.appendChild(subtitle);
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

    const elements = this.element.querySelectorAll('.second-featured-book-image, .second-featured-book-content');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.8s ease';
      observer.observe(el);
    });
  }
}

export { SecondFeaturedBook };
