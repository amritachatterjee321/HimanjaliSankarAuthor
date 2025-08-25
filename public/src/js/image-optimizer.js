// Advanced Image Optimization Utility
class ImageOptimizer {
  constructor() {
    this.observer = null;
    this.intersectionOptions = {
      rootMargin: '50px 0px',
      threshold: 0.01
    };
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.optimizeExistingImages();
    this.setupMutationObserver();
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, falling back to immediate loading');
      this.loadAllImages();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, this.intersectionOptions);
  }

  setupMutationObserver() {
    // Watch for dynamically added images
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const images = node.querySelectorAll ? node.querySelectorAll('img[data-src]') : [];
            images.forEach(img => this.observer.observe(img));
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  optimizeExistingImages() {
    // Optimize all existing images
    document.querySelectorAll('img').forEach(img => {
      this.optimizeImage(img);
    });

    // Setup lazy loading for images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.observer.observe(img);
    });
  }

  optimizeImage(img) {
    // Skip if already optimized
    if (img.classList.contains('optimized')) return;

    // Add loading="lazy" for native lazy loading
    if (!img.loading) {
      img.loading = 'lazy';
    }

    // Convert to WebP if supported
    if (this.supportsWebP() && img.src && !img.src.includes('.webp')) {
      img.src = this.convertToWebP(img.src);
    }

    // Add error handling
    img.addEventListener('error', () => {
      img.classList.add('image-error');
      console.warn('Failed to load image:', img.src);
    });

    img.classList.add('optimized');
  }

  loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    // Create a new image to preload
    const tempImg = new Image();
    
    tempImg.onload = () => {
      // Optimize the URL before setting
      const optimizedSrc = this.optimizeImageUrl(src);
      img.src = optimizedSrc;
      img.classList.remove('lazy');
      img.classList.add('loaded');
      
      // Add fade-in effect
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease-in';
      requestAnimationFrame(() => {
        img.style.opacity = '1';
      });
    };

    tempImg.onerror = () => {
      img.classList.add('error');
      console.warn('Failed to load image:', src);
    };

    tempImg.src = src;
  }

  optimizeImageUrl(url, options = {}) {
    const {
      width = 400,
      height = 600,
      quality = 80,
      format = 'auto'
    } = options;

    // If it's already optimized, return as is
    if (url.includes('w_') || url.includes('h_') || url.includes('q_')) {
      return url;
    }



    // For local uploads, use optimized versions
    if (url.includes('/uploads/') && !url.includes('/optimized/')) {
      const optimizedUrl = url.replace('/uploads/', '/uploads/optimized/');
      const webpUrl = optimizedUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return this.supportsWebP() ? webpUrl : optimizedUrl;
    }

    return url;
  }



  convertToWebP(url) {
    if (!this.supportsWebP()) return url;
    
    if (url.includes('/uploads/')) {
      return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return url;
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  loadAllImages() {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.loadImage(img);
    });
  }

  preloadCriticalImages(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.optimizeImageUrl(url);
      document.head.appendChild(link);
    });
  }

  generateSrcSet(url, sizes) {
    // For now, return null since we're not using Cloudinary
    // This can be extended later for other image optimization services
    return null;
  }
}

// Initialize image optimizer
const imageOptimizer = new ImageOptimizer();

export default ImageOptimizer;
