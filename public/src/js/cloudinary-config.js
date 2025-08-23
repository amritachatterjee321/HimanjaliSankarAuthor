// Cloudinary Configuration and Optimization Settings
class CloudinaryConfig {
  static CLOUDINARY_DOMAINS = [
    'res.cloudinary.com',
    'cloudinary.com'
  ];

  static DEFAULT_TRANSFORMATIONS = {
    // Book cover images (featured/latest book)
    bookCover: {
      width: 400,
      height: 600,
      quality: 85,
      crop: 'fill',
      gravity: 'auto',
      format: 'auto',
      fetchFormat: 'auto'
    },

    // Book card images (grid/carousel)
    bookCard: {
      width: 300,
      height: 450,
      quality: 80,
      crop: 'fill',
      gravity: 'auto',
      format: 'auto',
      fetchFormat: 'auto'
    },

    // Thumbnail images
    thumbnail: {
      width: 150,
      height: 225,
      quality: 70,
      crop: 'fill',
      gravity: 'auto',
      format: 'auto',
      fetchFormat: 'auto'
    },

    // Author image
    authorImage: {
      width: 300,
      height: 300,
      quality: 85,
      crop: 'fill',
      gravity: 'face',
      format: 'auto',
      fetchFormat: 'auto'
    },

    // Progressive loading (low-res)
    progressive: {
      width: 50,
      height: 75,
      quality: 30,
      crop: 'fill',
      gravity: 'auto',
      format: 'auto',
      fetchFormat: 'auto'
    }
  };

  static RESPONSIVE_BREAKPOINTS = {
    mobile: {
      maxWidth: 480,
      transformations: {
        bookCover: { width: 280, height: 420 },
        bookCard: { width: 140, height: 210 },
        thumbnail: { width: 100, height: 150 }
      }
    },
    tablet: {
      maxWidth: 768,
      transformations: {
        bookCover: { width: 320, height: 480 },
        bookCard: { width: 200, height: 300 },
        thumbnail: { width: 120, height: 180 }
      }
    },
    desktop: {
      maxWidth: 1024,
      transformations: {
        bookCover: { width: 400, height: 600 },
        bookCard: { width: 300, height: 450 },
        thumbnail: { width: 150, height: 225 }
      }
    }
  };

  static isCloudinaryUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return this.CLOUDINARY_DOMAINS.some(domain => url.includes(domain));
  }

  static getResponsiveTransformations(imageType, screenWidth) {
    const baseTransformations = this.DEFAULT_TRANSFORMATIONS[imageType];
    if (!baseTransformations) {
      console.warn(`Unknown image type: ${imageType}`);
      return {};
    }

    // Find the appropriate breakpoint
    let breakpoint = 'desktop';
    for (const [name, config] of Object.entries(this.RESPONSIVE_BREAKPOINTS)) {
      if (screenWidth <= config.maxWidth) {
        breakpoint = name;
        break;
      }
    }

    // Merge base transformations with responsive overrides
    const responsiveOverrides = this.RESPONSIVE_BREAKPOINTS[breakpoint]?.transformations[imageType] || {};
    return { ...baseTransformations, ...responsiveOverrides };
  }

  static generateSrcSet(url, imageType) {
    if (!this.isCloudinaryUrl(url)) return null;

    const srcSet = [];
    const formats = ['webp', 'auto'];

    for (const [breakpoint, config] of Object.entries(this.RESPONSIVE_BREAKPOINTS)) {
      const transformations = this.getResponsiveTransformations(imageType, config.maxWidth);
      
      for (const format of formats) {
        const formatTransformations = { ...transformations, format };
        const optimizedUrl = this.transformUrl(url, formatTransformations);
        const descriptor = `${config.maxWidth}w`;
        srcSet.push(`${optimizedUrl} ${descriptor}`);
      }
    }

    return srcSet.join(', ');
  }

  static transformUrl(url, transformations) {
    if (!this.isCloudinaryUrl(url)) return url;

    // Parse Cloudinary URL
    const cloudinaryRegex = /https:\/\/([^.]+)\.cloudinary\.com\/([^\/]+)\/upload\/([^\/]*)\/(.+)/;
    const match = url.match(cloudinaryRegex);
    
    if (!match) {
      console.warn('Invalid Cloudinary URL format:', url);
      return url;
    }

    const [, subdomain, cloudName, existingTransformations, publicId] = match;
    
    // Build transformation string
    let transformationsList = [];
    
    // Add existing transformations if any
    if (existingTransformations) {
      transformationsList.push(existingTransformations);
    }
    
    // Add new transformations
    const newTransformations = [];
    
    Object.entries(transformations).forEach(([key, value]) => {
      if (value && value !== 'auto') {
        switch (key) {
          case 'width':
            newTransformations.push(`w_${value}`);
            break;
          case 'height':
            newTransformations.push(`h_${value}`);
            break;
          case 'quality':
            newTransformations.push(`q_${value}`);
            break;
          case 'crop':
            newTransformations.push(`c_${value}`);
            break;
          case 'gravity':
            newTransformations.push(`g_${value}`);
            break;
          case 'format':
            newTransformations.push(`f_${value}`);
            break;
          case 'fetchFormat':
            newTransformations.push(`fl_${value}`);
            break;
        }
      }
    });
    
    if (newTransformations.length > 0) {
      transformationsList.push(newTransformations.join(','));
    }
    
    // Reconstruct URL
    const transformationString = transformationsList.join('/');
    return `https://${subdomain}.cloudinary.com/${cloudName}/upload/${transformationString}/${publicId}`;
  }

  static getOptimizedUrl(url, imageType, options = {}) {
    if (!this.isCloudinaryUrl(url)) return url;

    const screenWidth = options.screenWidth || window.innerWidth;
    const transformations = this.getResponsiveTransformations(imageType, screenWidth);
    
    // Override with any custom options
    const finalTransformations = { ...transformations, ...options };
    
    return this.transformUrl(url, finalTransformations);
  }

  static getProgressiveUrl(url, imageType) {
    if (!this.isCloudinaryUrl(url)) return url;

    const progressiveTransformations = this.DEFAULT_TRANSFORMATIONS.progressive;
    return this.transformUrl(url, progressiveTransformations);
  }

  static getWebPUrl(url, imageType, options = {}) {
    if (!this.isCloudinaryUrl(url)) return url;

    const screenWidth = options.screenWidth || window.innerWidth;
    const transformations = this.getResponsiveTransformations(imageType, screenWidth);
    const webpTransformations = { ...transformations, ...options, format: 'webp' };
    
    return this.transformUrl(url, webpTransformations);
  }
}

export default CloudinaryConfig;
