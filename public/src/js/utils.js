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
        rootMargin: '50px 0px', // Start loading 50px before image comes into view
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

    // For Cloudinary URLs, use their transformation API
    if (url.includes('cloudinary.com')) {
      const cloudinaryUrl = this.transformCloudinaryUrl(url, {
        width,
        height,
        quality,
        format,
        crop,
        gravity
      });
      return cloudinaryUrl;
    }

    // For external image services, add optimization parameters
    if (url.includes('unsplash.com')) {
      return `${url}?w=${width}&h=${height}&fit=crop&q=${quality}`;
    }

    // For local images served from /uploads/, add optimization parameters
    if (url.includes('/uploads/')) {
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set('width', width);
      urlObj.searchParams.set('height', height);
      urlObj.searchParams.set('quality', quality);
      if (format !== 'auto') {
        urlObj.searchParams.set('format', format);
      }
      return urlObj.toString();
    }

    // For other local images, return as is
    return url;
  }

  static transformCloudinaryUrl(url, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = 'auto',
      crop = 'fill',
      gravity = 'auto',
      fetchFormat = 'auto'
    } = options;

    // Parse Cloudinary URL to extract components
    const cloudinaryRegex = /https:\/\/([^.]+)\.cloudinary\.com\/([^\/]+)\/upload\/([^\/]*)\/(.+)/;
    const match = url.match(cloudinaryRegex);
    
    if (!match) {
      console.warn('Invalid Cloudinary URL format:', url);
      return url;
    }

    const [, subdomain, cloudName, existingTransformations, publicId] = match;
    
    // Build transformation string
    let transformations = [];
    
    // Add existing transformations if any
    if (existingTransformations) {
      transformations.push(existingTransformations);
    }
    
    // Add new transformations
    const newTransformations = [];
    
    if (width) newTransformations.push(`w_${width}`);
    if (height) newTransformations.push(`h_${height}`);
    if (crop) newTransformations.push(`c_${crop}`);
    if (gravity) newTransformations.push(`g_${gravity}`);
    if (quality) newTransformations.push(`q_${quality}`);
    if (format !== 'auto') newTransformations.push(`f_${format}`);
    if (fetchFormat !== 'auto') newTransformations.push(`fl_${fetchFormat}`);
    
    if (newTransformations.length > 0) {
      transformations.push(newTransformations.join(','));
    }
    
    // Reconstruct URL
    const transformationString = transformations.join('/');
    return `https://${subdomain}.cloudinary.com/${cloudName}/upload/${transformationString}/${publicId}`;
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
    if (url.includes('cloudinary.com')) {
      return this.transformCloudinaryUrl(url, { 
        width, 
        height: Math.round(width * 1.5), // Maintain aspect ratio
        quality: 30,
        crop: 'fill',
        gravity: 'auto'
      });
    }
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
      if (url.includes('cloudinary.com')) {
        return this.transformCloudinaryUrl(url, { format: 'webp' });
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
