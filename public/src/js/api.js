// API Service for handling HTTP requests
class ApiService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    // Add cache-busting parameter to prevent browser caching
    const cacheBuster = `_t=${Date.now()}`;
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${endpoint}${separator}${cacheBuster}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Books API
  async getBooks() {
    return this.request('/api/books');
  }

  async getLatestBook() {
    return this.request('/api/books/latest');
  }

  async getBooksByCategory(category) {
    return this.request(`/api/books/category/${category}`);
  }

  async getBook(id) {
    return this.request(`/api/books/${id}`);
  }

  // Contact API
  async getContactInfo() {
    return this.request('/api/cms?endpoint=contact');
  }

  async submitContactForm(formData) {
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }

  // About API
  async getAuthorInfo() {
    return this.request('/api/about');
  }

  // Social Media API
  async getSocialMedia() {
    return this.request('/api/social');
  }

  // Media API
  async getMedia() {
    return this.request('/api/media');
  }


}

export default ApiService;
