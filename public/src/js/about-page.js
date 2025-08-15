import CONFIG from './config.js';
import ApiService from './api.js';
import Utils from './utils.js';
import { EventEmitter, NotificationSystem } from './services.js';
import { Header } from './components.js';
import { About, Footer } from './app-components.js';

// About Page Component
class AboutPage {
  constructor() {
    this.eventBus = new EventEmitter();
    this.notificationSystem = new NotificationSystem();
    this.apiService = new ApiService(CONFIG.api.baseUrl);
    this.components = new Map();
    
    this.init();
  }

  async init() {
    try {
      // Initialize app container
      const app = document.getElementById('app');
      app.innerHTML = '';

      // Create page structure
      await this.createPageStructure(app);

      // Mount components
      await this.mountComponents();

      // Hide loading screen
      this.hideLoadingScreen();

      // Bind global events
      this.bindGlobalEvents();

    } catch (error) {
      console.error('Error initializing About page:', error);
      this.hideLoadingScreen();
      this.notificationSystem.show(
        'Error loading About page. Please refresh.',
        'error',
        'Loading Error'
      );
    }
  }

  async createPageStructure(app) {
    // Create main structure
    const header = document.createElement('header');
    const main = document.createElement('main');
    const footer = document.createElement('footer');

    main.className = 'main-content about-page-main';

    app.appendChild(header);
    app.appendChild(main);
    app.appendChild(footer);

    // Initialize components
    this.components.set('header', new Header(header, this.eventBus));
    this.components.set('about', new About(main, this.eventBus, this.apiService));
    this.components.set('footer', new Footer(footer, this.eventBus));
  }

  async mountComponents() {
    for (const [name, component] of this.components) {
      try {
        await component.mount();
        console.log(`✅ ${name} component mounted successfully`);
        
        // Debug: Check if component rendered content
        if (name === 'about') {
          const aboutContent = document.querySelector('.about-section');
          console.log('🔍 About section found:', !!aboutContent);
          if (aboutContent) {
            console.log('📄 About section HTML:', aboutContent.innerHTML.substring(0, 200) + '...');
          }
        }
      } catch (error) {
        console.error(`❌ Failed to mount ${name} component:`, error);
      }
    }
  }

  bindGlobalEvents() {
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.notificationSystem.show(
        'An unexpected error occurred.',
        'error',
        'Error'
      );
    });

    // Make components available globally for debugging
    window.aboutPage = this;
  }

  getComponent(name) {
    return this.components.get(name);
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
    
    // Also hide the app loading state
    const appLoading = document.querySelector('.app-loading');
    if (appLoading) {
      appLoading.style.display = 'none';
    }
    
    // Ensure main content is visible
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
      mainContent.style.visibility = 'visible';
    }
  }

  destroy() {
    for (const [name, component] of this.components) {
      try {
        component.unmount();
        console.log(`✅ ${name} component unmounted successfully`);
      } catch (error) {
        console.error(`❌ Failed to unmount ${name} component:`, error);
      }
    }
    this.components.clear();
  }
}

// Initialize About Page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AboutPage();
});

export default AboutPage; 