// API Service for handling HTTP requests
class ApiService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
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

  // Media API
  async getMedia() {
    return this.request('/api/cms/media');
  }
}

export default ApiService;
