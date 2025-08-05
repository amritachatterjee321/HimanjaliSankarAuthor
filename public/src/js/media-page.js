import CONFIG from './config.js';
import ApiService from './api.js';
import Utils from './utils.js';
import { EventEmitter, NotificationSystem } from './services.js';
import { Header, Component } from './components.js';

// Media Page Component
class MediaPage extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.mediaData = null;
  }

  async fetchData() {
    try {
      this.mediaData = await this.apiService.getMedia();
    } catch (error) {
      console.error('Failed to fetch media:', error);
      // Fallback to static data
      this.mediaData = [
        {
          id: 1,
          title: "Author Interview - Literary Magazine",
          type: "interview",
          description: "An in-depth conversation about storytelling, inspiration, and the creative process behind 'Whispers in the Rain'.",
          date: "2024-01-15",
          source: "Literary Magazine",
          url: "https://example.com/interview",
          image: null
        },
        {
          id: 2,
          title: "Book Review - The Daily Reader",
          type: "review",
          description: "A glowing review of 'The Magic Garden' highlighting its appeal to young readers and educational value.",
          date: "2023-12-20",
          source: "The Daily Reader",
          url: "https://example.com/review",
          image: null
        },
        {
          id: 3,
          title: "Press Release - New Book Launch",
          type: "press",
          description: "Official announcement of the upcoming release of 'Echoes of Tomorrow' and book tour details.",
          date: "2024-02-01",
          source: "Publisher Press",
          url: "https://example.com/press-release",
          image: null
        },
        {
          id: 4,
          title: "Podcast Appearance - Writers' Corner",
          type: "podcast",
          description: "Featured guest on the popular 'Writers' Corner' podcast discussing contemporary fiction and writing techniques.",
          date: "2023-11-10",
          source: "Writers' Corner Podcast",
          url: "https://example.com/podcast",
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
      className: 'media-page-section'
    });

    const container = Utils.createElement('div', {
      className: 'media-page-container'
    });

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

    container.appendChild(categoriesContainer);
    section.appendChild(container);

    return section;
  }

  groupMediaByType(mediaData) {
    const grouped = {};
    mediaData.forEach(item => {
      const type = item.type || 'other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });
    return grouped;
  }

  createMediaTypeSection(type, mediaItems) {
    const typeSection = Utils.createElement('div', {
      className: 'media-type-section'
    });

    const typeHeader = Utils.createElement('div', {
      className: 'type-header'
    });

    const typeTitle = Utils.createElement('h2', {
      className: 'type-title',
      innerHTML: this.formatTypeTitle(type)
    });

    typeHeader.appendChild(typeTitle);

    const mediaGrid = Utils.createElement('div', {
      className: 'media-grid'
    });

    mediaItems.forEach(media => {
      const mediaCard = this.createMediaCard(media);
      mediaGrid.appendChild(mediaCard);
    });

    typeSection.appendChild(typeHeader);
    typeSection.appendChild(mediaGrid);

    return typeSection;
  }

  formatTypeTitle(type) {
    const titles = {
      'interview': 'Interviews',
      'review': 'Reviews',
      'press': 'Press Releases',
      'podcast': 'Podcasts',
      'article': 'Articles',
      'video': 'Videos',
      'other': 'Other Media'
    };
    return titles[type] || 'Media';
  }

  createMediaCard(media) {
    const mediaCard = Utils.createElement('div', {
      className: 'media-card'
    });

    const mediaContent = Utils.createElement('div', {
      className: 'media-content'
    });

    const mediaHeader = Utils.createElement('div', {
      className: 'media-header'
    });

    const mediaTitle = Utils.createElement('h3', {
      className: 'media-title',
      innerHTML: media.title
    });

    const mediaMeta = Utils.createElement('div', {
      className: 'media-meta'
    });

    const mediaDate = Utils.createElement('span', {
      className: 'media-date',
      innerHTML: this.formatDate(media.date)
    });

    const mediaSource = Utils.createElement('span', {
      className: 'media-source',
      innerHTML: media.source
    });

    mediaMeta.appendChild(mediaDate);
    mediaMeta.appendChild(mediaSource);

    mediaHeader.appendChild(mediaTitle);
    mediaHeader.appendChild(mediaMeta);

    const mediaDescription = Utils.createElement('p', {
      className: 'media-description',
      innerHTML: media.description
    });

    const mediaActions = Utils.createElement('div', {
      className: 'media-actions'
    });

    const readMoreButton = Utils.createElement('a', {
      href: media.url,
      className: 'media-link',
      target: '_blank',
      rel: 'noopener noreferrer',
      innerHTML: 'Read More'
    });

    mediaActions.appendChild(readMoreButton);

    mediaContent.appendChild(mediaHeader);
    mediaContent.appendChild(mediaDescription);
    mediaContent.appendChild(mediaActions);

    mediaCard.appendChild(mediaContent);

    return mediaCard;
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

      // Mount components
      await headerComponent.mount();
      await mediaPageComponent.mount();

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