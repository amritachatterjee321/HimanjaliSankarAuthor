// Performance Monitoring Utility
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      imageLoadTimes: [],
      totalImageSize: 0,
      optimizedImageSize: 0,
      lazyLoadedImages: 0,
      progressiveLoadedImages: 0
    };
    
    this.init();
  }

  init() {
    // Monitor page load time
    this.monitorPageLoad();
    
    // Monitor image loading
    this.monitorImageLoading();
    
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
  }

  monitorPageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.pageLoadTime = loadTime;
      
      console.log(`📊 Page loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send to analytics if available
      if (window.gtag) {
        window.gtag('event', 'page_load_time', {
          value: Math.round(loadTime),
          custom_parameter: 'image_optimization'
        });
      }
    });
  }

  monitorImageLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.trackImageLoad(img);
        }
      });
    });

    // Observe all images
    document.querySelectorAll('img').forEach(img => {
      observer.observe(img);
    });
  }

  trackImageLoad(img) {
    const startTime = performance.now();
    
    img.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      this.metrics.imageLoadTimes.push(loadTime);
      
      // Track image size
      if (img.naturalWidth && img.naturalHeight) {
        const estimatedSize = this.estimateImageSize(img);
        this.metrics.totalImageSize += estimatedSize;
      }
      
      // Track optimization metrics
      if (img.classList.contains('lazy')) {
        this.metrics.lazyLoadedImages++;
      }
      
      if (img.classList.contains('progressive-image')) {
        this.metrics.progressiveLoadedImages++;
      }
      
      console.log(`🖼️ Image loaded in ${loadTime.toFixed(2)}ms: ${img.src}`);
    });
  }

  estimateImageSize(img) {
    // Rough estimation based on dimensions and format
    const pixels = img.naturalWidth * img.naturalHeight;
    const format = img.src.includes('.webp') ? 'webp' : 'jpeg';
    
    // Average compression ratios
    const compressionRatios = {
      'webp': 0.25,
      'jpeg': 0.4,
      'png': 0.8
    };
    
    return pixels * 3 * (compressionRatios[format] || 0.4); // 3 bytes per pixel for RGB
  }

  monitorCoreWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        
        if (window.gtag) {
          window.gtag('event', 'lcp', {
            value: Math.round(lastEntry.startTime),
            custom_parameter: 'image_optimization'
          });
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Monitor First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log(`📊 FID: ${entry.processingStart - entry.startTime}ms`);
          
          if (window.gtag) {
            window.gtag('event', 'fid', {
              value: Math.round(entry.processingStart - entry.startTime),
              custom_parameter: 'image_optimization'
            });
          }
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  getMetrics() {
    const avgImageLoadTime = this.metrics.imageLoadTimes.length > 0 
      ? this.metrics.imageLoadTimes.reduce((a, b) => a + b, 0) / this.metrics.imageLoadTimes.length 
      : 0;
    
    return {
      ...this.metrics,
      averageImageLoadTime: avgImageLoadTime,
      totalImages: this.metrics.imageLoadTimes.length,
      optimizationSavings: this.metrics.totalImageSize - this.metrics.optimizedImageSize
    };
  }

  logReport() {
    const metrics = this.getMetrics();
    
    console.log('\n📊 Performance Report:');
    console.log(`⏱️ Page Load Time: ${metrics.pageLoadTime.toFixed(2)}ms`);
    console.log(`🖼️ Total Images Loaded: ${metrics.totalImages}`);
    console.log(`📈 Average Image Load Time: ${metrics.averageImageLoadTime.toFixed(2)}ms`);
    console.log(`🚀 Lazy Loaded Images: ${metrics.lazyLoadedImages}`);
    console.log(`🔄 Progressive Loaded Images: ${metrics.progressiveLoadedImages}`);
    console.log(`💾 Total Image Size: ${(metrics.totalImageSize / 1024 / 1024).toFixed(2)}MB`);
    
    return metrics;
  }

  // Export metrics for external monitoring
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...this.getMetrics()
    };
  }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();

// Export for global access
window.performanceMonitor = performanceMonitor;

export default PerformanceMonitor;
