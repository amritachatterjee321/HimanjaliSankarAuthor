import CONFIG from './config.js';
import ApiService from './api.js';
import Utils, { ImageOptimizer } from './utils.js';
import { EventEmitter, NotificationSystem } from './services.js';
import PerformanceMonitor from './performance-monitor.js';
import { Header } from './components.js';
import { LatestBook, SecondFeaturedBook } from './book-components.js';
import { BooksGrid, Footer, LoadingManager } from './app-components.js';

// Main Application Class
class App {
  constructor() {
    this.components = new Map();
    this.eventBus = new EventEmitter();
    this.notificationSystem = new NotificationSystem();
    this.loadingManager = new LoadingManager();
    this.apiService = new ApiService(CONFIG.api.baseUrl);
    this.currentRoute = window.location.pathname;
    
    this.init();
  }

  async init() {
    try {
      // Show loading
      this.loadingManager.show();

      // Initialize app container
      const app = document.getElementById('app');
      app.innerHTML = '';

      // Create components based on current page
      await this.createComponents(app);

      // Mount components
      await this.mountComponents();

      // Simulate loading time
      await this.loadingManager.simulateLoading();

      // Initialize image optimization
      ImageOptimizer.init();

      // Bind global events
      this.bindGlobalEvents();

      // Handle initial route
      this.handleRouteChange(this.currentRoute);

    } catch (error) {
      console.error('Error initializing app:', error);
      this.loadingManager.hide();
      this.notificationSystem.show(
        'Error loading website. Please refresh the page.',
        'error',
        'Loading Error'
      );
    }
  }

  async createComponents(app) {
    // Create main structure
    const header = document.createElement('header');
    const main = document.createElement('main');
    const footer = document.createElement('footer');

    main.className = 'main-content';

    app.appendChild(header);
    app.appendChild(main);
    app.appendChild(footer);

    // Initialize header and footer for all pages
    this.components.set('header', new Header(header, this.eventBus));
    this.components.set('footer', new Footer(footer, this.eventBus));

    // Only create homepage-specific components on the homepage
    if (this.isHomepage()) {
      console.log('🏠 Homepage detected - creating homepage components');
      this.components.set('latestBook', new LatestBook(main, this.eventBus, this.apiService));
      this.components.set('secondFeaturedBook', new SecondFeaturedBook(main, this.eventBus, this.apiService));
      this.components.set('booksGrid', new BooksGrid(main, this.eventBus, this.apiService));
    } else {
      console.log('📄 Non-homepage detected - skipping homepage components');
      // For non-homepage pages, create a placeholder or let the page-specific JS handle content
      const pageContent = document.createElement('div');
      pageContent.className = 'page-content-placeholder';
      pageContent.innerHTML = '<div class="loading">Page content loading...</div>';
      main.appendChild(pageContent);
    }
  }

  isHomepage() {
    // Check if current page is the homepage
    const homepagePaths = ['/', '/index.html', '/index'];
    return homepagePaths.includes(this.currentRoute);
  }

  async mountComponents() {
    for (const [name, component] of this.components) {
      try {
        await component.mount();
        console.log(`✅ ${name} component mounted successfully`);
      } catch (error) {
        console.error(`❌ Failed to mount ${name} component:`, error);
      }
    }
  }

  handleRouteChange(path) {
    console.log(`🔄 Route changed to: ${path}`);
    this.currentRoute = path;
    
    // Update active navigation only - no page redirects
    const header = this.components.get('header');
    if (header && header.setActiveLink) {
      header.setActiveLink(path);
    }
    
    // Don't handle page navigation here - each page has its own HTML file
    // The navigation is handled by the browser's default behavior
  }

  // Page loading methods removed - each page has its own HTML file
  // Navigation is handled by the browser's default behavior

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

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.notificationSystem.show(
        'Something went wrong. Please try again.',
        'error',
        'Error'
      );
    });

    // Smooth scroll to top on page load
    window.addEventListener('load', () => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });

    // Performance monitoring
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 Page loaded in ${loadTime}ms`);
        
        // Send analytics event (if configured)
        if (typeof gtag === 'function') {
          gtag('event', 'page_load_time', {
            custom_parameter: loadTime
          });
        }
      });
    }

    // Add CSS for slideOut animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Public API methods
  getComponent(name) {
    return this.components.get(name);
  }

  destroy() {
    this.components.forEach(component => {
      component.unmount();
    });
    this.components.clear();
    this.notificationSystem.clear();
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global app instance
  window.app = new App();
  
  // Development helpers
  if (import.meta.env.DEV) {
    window.CONFIG = CONFIG;
    window.Utils = Utils;
    console.log('🚀 Himanjali Author Website initialized in development mode');
  }
});

// Export for module systems
export default App;
