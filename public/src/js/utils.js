// Utility Functions
class Utils {
  static createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });

    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });

    return element;
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static smoothScroll(targetId, offset = 150) {
    const target = document.querySelector(targetId);
    if (target) {
      const targetPosition = target.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const elementHeight = rect.bottom - rect.top;
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    return visibleHeight / elementHeight >= threshold;
  }
}

// Image Optimization Utilities
class ImageOptimizer {
  static init() {
    // Initialize lazy loading for all images
    this.initLazyLoading();
    
    // Add intersection observer for progressive loading
    this.initProgressiveLoading();
  }

  static initLazyLoading() {
    // Optimize all existing images first
    document.querySelectorAll('img').forEach(img => {
      this.optimizeImage(img);
    });

    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '100px 0px', // Start loading 100px before image comes into view
        threshold: 0.01
      });

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  static optimizeImage(img) {
    // Skip if already optimized
    if (img.classList.contains('optimized')) return;

    // Add native lazy loading for better performance
    if (!img.loading) {
      img.loading = 'lazy';
    }

    // Add decoding="async" for better performance
    if (!img.decoding) {
      img.decoding = 'async';
    }

    // Add fetchpriority for above-the-fold images
    if (img.classList.contains('hero-image') || img.classList.contains('above-fold')) {
      img.fetchPriority = 'high';
    } else {
      img.fetchPriority = 'low';
    }

    // Add error handling
    img.addEventListener('error', () => {
      img.classList.add('image-error');
      console.warn('Failed to load image:', img.src);
    });

    img.classList.add('optimized');
  }

  static initProgressiveLoading() {
    // Add progressive loading for large images
    const progressiveObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadProgressiveImage(img);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.progressive-image').forEach(img => {
      progressiveObserver.observe(img);
    });
  }

  static loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    // Create a new image to preload
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
      
      // Add fade-in effect
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease-in';
      setTimeout(() => {
        img.style.opacity = '1';
      }, 10);
    };

    tempImg.onerror = () => {
      img.classList.add('error');
      console.warn('Failed to load image:', src);
    };

    tempImg.src = src;
  }

  static loadProgressiveImage(img) {
    const lowResSrc = img.getAttribute('data-low-res');
    const highResSrc = img.getAttribute('data-src') || img.src;
    
    if (!lowResSrc) return;

    // Load low resolution first
    img.src = lowResSrc;
    img.classList.add('low-res-loaded');

    // Then load high resolution
    const highResImg = new Image();
    highResImg.onload = () => {
      img.src = highResSrc;
      img.classList.add('high-res-loaded');
    };
    highResImg.src = highResSrc;
  }

  static loadAllImages() {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.loadImage(img);
    });
  }

  static optimizeImageUrl(url, options = {}) {
    const {
      width = 400,
      height = 600,
      quality = 80,
      format = 'auto',
      crop = 'fill',
      gravity = 'auto'
    } = options;

    // If it's already an optimized URL, return as is
    if (url.includes('w_') || url.includes('h_') || url.includes('q_')) {
      return url;
    }



    // For external image services, add optimization parameters
    if (url.includes('unsplash.com')) {
      return `${url}?w=${width}&h=${height}&fit=crop&q=${quality}`;
    }

    // For local images served from /uploads/, use optimized versions
    if (url.includes('/uploads/')) {
      // Check if optimized version exists
      const optimizedUrl = url.replace('/uploads/', '/uploads/optimized/');
      
      // Determine the best size based on width
      let sizeSuffix = '';
      if (width <= 150) sizeSuffix = '-thumbnail';
      else if (width <= 300) sizeSuffix = '-small';
      else if (width <= 600) sizeSuffix = '-medium';
      else if (width <= 1200) sizeSuffix = '-large';
      
      // Convert to WebP if supported
      if (this.supportsWebP()) {
        const webpUrl = optimizedUrl.replace(/\.(jpg|jpeg|png)$/i, `${sizeSuffix}.webp`);
        return webpUrl;
      } else {
        // Fallback to original format with size suffix
        const sizedUrl = optimizedUrl.replace(/\.(jpg|jpeg|png)$/i, `${sizeSuffix}.$1`);
        return sizedUrl;
      }
    }

    // For other local images, return as is
    return url;
  }



  static createResponsiveImage(element, imageData, options = {}) {
    const {
      lazy = true,
      progressive = false,
      sizes = '(max-width: 768px) 100vw, 400px',
      alt = 'Book cover'
    } = options;

    const img = document.createElement('img');
    
    // Set alt text
    img.alt = alt;
    
    // Add responsive attributes
    img.sizes = sizes;
    
    if (lazy) {
      img.setAttribute('data-src', imageData.url);
      img.classList.add('lazy');
      
      // Add loading attribute for native lazy loading
      img.loading = 'lazy';
    } else {
      img.src = imageData.url;
      // High priority for above-the-fold images
      img.fetchPriority = 'high';
      img.decoding = 'async';
    }
    
    // CLS Prevention - Set explicit dimensions
    if (options.width && options.height) {
      img.width = options.width;
      img.height = options.height;
    } else {
      // Default dimensions for book covers
      if (element.classList.contains('book-cover-large')) {
        img.width = 400;
        img.height = 600;
      } else if (element.classList.contains('book-cover')) {
        img.width = 150;
        img.height = 225;
      }
    }

    if (progressive && imageData.lowResUrl) {
      img.setAttribute('data-low-res', imageData.lowResUrl);
      img.classList.add('progressive-image');
    }

    // Add optimization classes
    img.classList.add('optimized-image');
    
    return img;
  }

  static generateLowResUrl(url, width = 50) {
    // Generate a low-resolution version for progressive loading
    return this.optimizeImageUrl(url, { width, quality: 30 });
  }

  static preloadCriticalImages(urls) {
    // Preload critical images (above the fold)
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  static convertToWebP(url) {
    // Convert image URL to WebP format if supported
    if (this.supportsWebP()) {
      // For external services, add WebP format
      if (url.includes('unsplash.com')) {
        return `${url}&fm=webp`;
      }
    }
    return url;
  }

  static supportsWebP() {
    // Check if browser supports WebP
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  static getImageDimensions(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}

export default Utils;
export { ImageOptimizer };
