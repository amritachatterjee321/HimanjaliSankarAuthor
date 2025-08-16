console.log('🔄 Media page: Starting to load modules...');

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

console.log('🔄 Media page: All modules loaded successfully');

// Media Page Component
class MediaPage extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.mediaData = null;
  }

  async fetchData() {
    try {
      console.log('🔄 Media page: Starting to fetch data...');
      console.log('🔍 Fetching media data from API...');
      const response = await this.apiService.getMedia();
      console.log('📰 API response:', response);
      
      if (response && response.media) {
        this.mediaData = response.media;
        console.log('✅ Media data loaded from API:', this.mediaData);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('❌ Failed to fetch media from API:', error);
      console.log('🔄 Using fallback sample data');
      
      // Fallback to static data - only reviews and short works
      this.mediaData = [
        {
          id: 1,
          title: "Book Review - The Daily Reader",
          type: "review",
          description: "A glowing review of 'The Magic Garden' highlighting its appeal to young readers and educational value.",
          date: "2023-12-20",
          source: "The Daily Reader",
          url: "https://example.com/review",
          image: null
        },
        {
          id: 2,
          title: "Literary Review - Modern Fiction",
          type: "review",
          description: "An insightful analysis of 'Whispers in the Rain' exploring themes of hope and resilience.",
          date: "2024-01-10",
          source: "Modern Fiction Journal",
          url: "https://example.com/literary-review",
          image: null
        },
        {
          id: 3,
          title: "Short Story - 'The Last Leaf'",
          type: "short-work",
          description: "A poignant short story about hope and perseverance, published in the Spring 2024 anthology.",
          date: "2024-03-15",
          source: "Spring Anthology 2024",
          url: "https://example.com/short-story",
          image: null
        },
        {
          id: 4,
          title: "Flash Fiction - 'Morning Coffee'",
          type: "short-work",
          description: "A brief but powerful piece capturing the quiet moments of daily life.",
          date: "2024-02-28",
          source: "Flash Fiction Weekly",
          url: "https://example.com/flash-fiction",
          image: null
        }
      ];
    }
  }

  render() {
    if (!this.mediaData) {
      return Utils.createElement('div', {
        className: 'loading',
        innerHTML: 'LOADING'
      });
    }

    const section = Utils.createElement('section', {
      className: 'media-page'
    });

    // Page Header
    const pageHeader = Utils.createElement('div', {
      className: 'media-page-header'
    });

    const pageTitle = Utils.createElement('h1', {
      innerHTML: 'Media & Publications'
    });

    pageHeader.appendChild(pageTitle);

    // Media Categories Container
    const categoriesContainer = Utils.createElement('div', {
      className: 'media-categories-container'
    });

    // Group media by type
    const mediaByType = this.groupMediaByType(this.mediaData);

    // Create sections for each media type
    Object.entries(mediaByType).forEach(([type, mediaItems]) => {
      const typeSection = this.createMediaTypeSection(type, mediaItems);
      categoriesContainer.appendChild(typeSection);
    });

    section.appendChild(pageHeader);
    section.appendChild(categoriesContainer);

    return section;
  }

  groupMediaByType(mediaData) {
    const grouped = {};
    console.log('🔍 Grouping media data:', mediaData);
    
    mediaData.forEach(item => {
      // Ensure consistent ID handling
      const mediaItem = {
        ...item,
        id: item._id || item.id
      };
      
      const type = mediaItem.type || 'other';
      console.log(`📝 Processing media item: ${mediaItem.title} (Type: ${type})`);
      
      // Only include reviews and short works
      if (type === 'review' || type === 'short-work') {
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(mediaItem);
      }
    });
    
    console.log('📊 Grouped media data:', grouped);
    return grouped;
  }

  createMediaTypeSection(type, mediaItems) {
    const typeSection = Utils.createElement('div', {
      className: 'media-section'
    });

    const typeTitle = Utils.createElement('h2', {
      innerHTML: this.formatTypeTitle(type)
    });

    const mediaGrid = Utils.createElement('div', {
      className: 'media-grid'
    });

    mediaItems.forEach(media => {
      const mediaCard = this.createMediaCard(media);
      mediaGrid.appendChild(mediaCard);
    });

    typeSection.appendChild(typeTitle);
    typeSection.appendChild(mediaGrid);

    return typeSection;
  }

  formatTypeTitle(type) {
    const titles = {
      'review': 'Reviews',
      'short-work': 'Short Works',
      'other': 'Other Media'
    };
    return titles[type] || 'Media';
  }

  createMediaCard(mediaItem) {
    const card = Utils.createElement('div', { className: 'media-card' });
    
    const title = Utils.createElement('h3', { 
        className: 'media-title', 
        innerHTML: mediaItem.title || 'Untitled' 
    });
    
    // Build the media info with conditional fields
    let mediaInfoHTML = '';
    
    if (mediaItem.source && mediaItem.source.trim()) {
        mediaInfoHTML += `<span class="media-source">${mediaItem.source}</span>`;
    }
    
    if (mediaItem.date) {
        if (mediaInfoHTML) mediaInfoHTML += ' • ';
        mediaInfoHTML += `<span class="media-date">${mediaItem.date}</span>`;
    }
    
    const metaInfo = Utils.createElement('div', { 
        className: 'media-meta', 
        innerHTML: mediaInfoHTML 
    });
    
    card.appendChild(title);
    card.appendChild(metaInfo);
    
    if (mediaItem.description && mediaItem.description.trim()) {
        const description = Utils.createElement('p', { 
            className: 'media-description', 
            innerHTML: mediaItem.description 
        });
        card.appendChild(description);
    }
    
    if (mediaItem.url) {
        const link = Utils.createElement('a', {
            href: mediaItem.url,
            className: 'media-link',
            target: '_blank',
            rel: 'noopener noreferrer',
            innerHTML: 'READ MORE'
        });
        card.appendChild(link);
    }
    
    return card;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async mount() {
    try {
      await this.fetchData();
      const element = this.render();
      this.container.appendChild(element);
      this.bindEvents();
    } catch (error) {
      console.error('Error mounting MediaPage:', error);
    }
  }

  bindEvents() {
    // Add any event listeners here if needed
  }
}

// Main Media Page Application
class MediaPageApp {
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
      const mediaPageComponent = new MediaPage(main, this.eventBus, this.apiService);
      const footerComponent = new Footer(footer, this.eventBus);

      // Mount components
      await headerComponent.mount();
      await mediaPageComponent.mount();
      await footerComponent.mount();

      console.log('✅ Media page components mounted successfully');

    } catch (error) {
      console.error('Error initializing media page:', error);
      this.hideLoadingScreen();
      this.notificationSystem.show(
        'Error loading media page. Please refresh the page.',
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
  window.mediaPageApp = new MediaPageApp();
  
  // Development helpers
  if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.Utils = Utils;
    console.log('🚀 Media Page initialized in development mode');
  }
});

// Export for module systems
export default MediaPageApp; 