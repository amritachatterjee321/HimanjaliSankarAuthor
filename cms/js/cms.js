// CMS Main JavaScript
class CMS {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.books = [];
    this.media = [];
    this.author = {};
    this.settings = {};
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.checkAuthentication();
    await this.loadData();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        this.showSection(section);
      });
    });

    // Forms
    this.setupFormListeners();
  }

  setupFormListeners() {
    // Book form
    const bookForm = document.getElementById('book-form');
    if (bookForm) {
      bookForm.addEventListener('submit', (e) => this.handleBookSubmit(e));
    }

    // Author form
    const authorForm = document.getElementById('author-form');
    if (authorForm) {
      authorForm.addEventListener('submit', (e) => this.handleAuthorSubmit(e));
    }

    // Media form
    const mediaForm = document.getElementById('media-form');
    if (mediaForm) {
      mediaForm.addEventListener('submit', (e) => this.handleMediaSubmit(e));
    }

    // Social form
    const socialForm = document.getElementById('social-form');
    if (socialForm) {
      socialForm.addEventListener('submit', (e) => this.handleSocialSubmit(e));
    }

    // Settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e));
    }
  }

  checkAuthentication() {
    const token = localStorage.getItem('cms_token');
    if (token) {
      this.isAuthenticated = true;
      this.showCMSInterface();
    } else {
      this.showLoginScreen();
    }
  }

  showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('cms-interface').classList.add('hidden');
  }

  showCMSInterface() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('cms-interface').classList.remove('hidden');
    this.showSection('dashboard');
  }

  async handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    // Simple authentication (in production, use proper auth)
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('cms_token', 'dummy_token');
      this.isAuthenticated = true;
      this.currentUser = { username };
      this.showCMSInterface();
      this.showNotification('Login successful!', 'success');
    } else {
      this.showNotification('Invalid credentials!', 'error');
    }
  }

  handleLogout() {
    localStorage.removeItem('cms_token');
    this.isAuthenticated = false;
    this.currentUser = null;
    this.showLoginScreen();
    this.showNotification('Logged out successfully!', 'success');
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Load section-specific data
    this.loadSectionData(sectionName);
  }

  async loadSectionData(sectionName) {
    switch (sectionName) {
      case 'dashboard':
        this.updateDashboardStats();
        break;
      case 'books':
        this.renderBooks();
        break;
      case 'media':
        this.renderMedia();
        break;
      case 'author':
        this.loadAuthorData();
        break;
      case 'social':
        this.loadSocialData();
        break;
      case 'settings':
        this.loadSettingsData();
        break;
    }
  }

  async loadData() {
    try {
      // Load books from API
      const booksResponse = await fetch('/api/books');
      if (booksResponse.ok) {
        const booksData = await booksResponse.json();
        this.books = booksData.books || [];
      }

      // Load other data (in a real app, these would come from API)
      this.media = this.loadFromStorage('media') || [];
      this.author = this.loadFromStorage('author') || {};
      this.settings = this.loadFromStorage('settings') || {
        siteTitle: 'Himanjali Sankar - Author',
        siteDescription: 'Official website of author Himanjali Sankar',
        adminUsername: 'admin'
      };

    } catch (error) {
      console.error('Error loading data:', error);
      this.showNotification('Error loading data!', 'error');
    }
  }

  updateDashboardStats() {
    document.getElementById('total-books').textContent = this.books.length;
    document.getElementById('total-media').textContent = this.media.length;
    document.getElementById('site-views').textContent = Math.floor(Math.random() * 1000) + 500; // Mock data
  }

  renderBooks() {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;

    booksGrid.innerHTML = '';

    this.books.forEach((book, index) => {
      const bookCard = this.createBookCard(book, index);
      booksGrid.appendChild(bookCard);
    });
  }

  createBookCard(book, index) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="card-header">
        <h4 class="card-title">${book.title}</h4>
        <div class="card-actions">
          <button class="btn btn-secondary" onclick="cms.editBook(${index})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger" onclick="cms.deleteBook(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <strong>Genre:</strong> ${book.genre} | <strong>Year:</strong> ${book.year}
        </div>
        <div class="card-description">
          ${book.description.substring(0, 150)}${book.description.length > 150 ? '...' : ''}
        </div>
      </div>
    `;
    return card;
  }

  renderMedia() {
    const mediaGrid = document.getElementById('media-grid');
    if (!mediaGrid) return;

    mediaGrid.innerHTML = '';

    this.media.forEach((item, index) => {
      const mediaCard = this.createMediaCard(item, index);
      mediaGrid.appendChild(mediaCard);
    });
  }

  createMediaCard(item, index) {
    const card = document.createElement('div');
    card.className = 'media-card';
    card.innerHTML = `
      <div class="card-header">
        <h4 class="card-title">${item.title}</h4>
        <div class="card-actions">
          <button class="btn btn-secondary" onclick="cms.editMedia(${index})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger" onclick="cms.deleteMedia(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <strong>Publication:</strong> ${item.publication} | <strong>Date:</strong> ${item.date}
        </div>
        <div class="card-description">
          ${item.excerpt ? item.excerpt.substring(0, 150) + '...' : 'No excerpt available'}
        </div>
      </div>
    `;
    return card;
  }

  // Modal Functions
  showBookForm(bookIndex = null) {
    const modal = document.getElementById('book-modal');
    const title = document.getElementById('book-modal-title');
    const form = document.getElementById('book-form');

    if (bookIndex !== null) {
      // Edit mode
      const book = this.books[bookIndex];
      title.textContent = 'Edit Book';
      this.populateBookForm(book);
      form.dataset.editIndex = bookIndex;
    } else {
      // Add mode
      title.textContent = 'Add New Book';
      form.reset();
      delete form.dataset.editIndex;
    }

    modal.classList.remove('hidden');
  }

  closeBookModal() {
    document.getElementById('book-modal').classList.add('hidden');
  }

  populateBookForm(book) {
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-genre').value = book.genre;
    document.getElementById('book-category').value = book.category;
    document.getElementById('book-year').value = book.year;
    document.getElementById('book-description').value = book.description;
    document.getElementById('book-cover-class').value = book.coverClass || '';
    document.getElementById('book-amazon-link').value = book.amazonLink || '';
    document.getElementById('book-goodreads-link').value = book.goodreadsLink || '';
  }

  async handleBookSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookData = {
      title: formData.get('title'),
      genre: formData.get('genre'),
      category: formData.get('category'),
      year: parseInt(formData.get('year')),
      description: formData.get('description'),
      coverClass: formData.get('coverClass'),
      amazonLink: formData.get('amazonLink'),
      goodreadsLink: formData.get('goodreadsLink')
    };

    const editIndex = e.target.dataset.editIndex;

    try {
      if (editIndex !== undefined) {
        // Update existing book
        this.books[editIndex] = { ...this.books[editIndex], ...bookData };
        this.showNotification('Book updated successfully!', 'success');
      } else {
        // Add new book
        this.books.push(bookData);
        this.showNotification('Book added successfully!', 'success');
      }

      // In a real app, you would save to the server here
      await this.saveBooks();
      
      this.closeBookModal();
      this.renderBooks();
      this.updateDashboardStats();
    } catch (error) {
      console.error('Error saving book:', error);
      this.showNotification('Error saving book!', 'error');
    }
  }

  async saveBooks() {
    // In a real app, this would be an API call
    // For now, we'll just simulate it
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  editBook(index) {
    this.showBookForm(index);
  }

  async deleteBook(index) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.books.splice(index, 1);
      await this.saveBooks();
      this.renderBooks();
      this.updateDashboardStats();
      this.showNotification('Book deleted successfully!', 'success');
    }
  }

  // Media Functions
  showMediaForm(mediaIndex = null) {
    const modal = document.getElementById('media-modal');
    const title = document.getElementById('media-modal-title');
    const form = document.getElementById('media-form');

    if (mediaIndex !== null) {
      title.textContent = 'Edit Media Coverage';
      this.populateMediaForm(this.media[mediaIndex]);
      form.dataset.editIndex = mediaIndex;
    } else {
      title.textContent = 'Add Media Coverage';
      form.reset();
      delete form.dataset.editIndex;
    }

    modal.classList.remove('hidden');
  }

  closeMediaModal() {
    document.getElementById('media-modal').classList.add('hidden');
  }

  populateMediaForm(item) {
    document.getElementById('media-title').value = item.title;
    document.getElementById('media-publication').value = item.publication;
    document.getElementById('media-date').value = item.date;
    document.getElementById('media-url').value = item.url;
    document.getElementById('media-excerpt').value = item.excerpt || '';
  }

  async handleMediaSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const mediaData = {
      title: formData.get('title'),
      publication: formData.get('publication'),
      date: formData.get('date'),
      url: formData.get('url'),
      excerpt: formData.get('excerpt')
    };

    const editIndex = e.target.dataset.editIndex;

    if (editIndex !== undefined) {
      this.media[editIndex] = mediaData;
      this.showNotification('Media coverage updated successfully!', 'success');
    } else {
      this.media.push(mediaData);
      this.showNotification('Media coverage added successfully!', 'success');
    }

    this.saveToStorage('media', this.media);
    this.closeMediaModal();
    this.renderMedia();
    this.updateDashboardStats();
  }

  editMedia(index) {
    this.showMediaForm(index);
  }

  deleteMedia(index) {
    if (confirm('Are you sure you want to delete this media coverage?')) {
      this.media.splice(index, 1);
      this.saveToStorage('media', this.media);
      this.renderMedia();
      this.updateDashboardStats();
      this.showNotification('Media coverage deleted successfully!', 'success');
    }
  }

  // Author Functions
  loadAuthorData() {
    const form = document.getElementById('author-form');
    if (form && this.author) {
      document.getElementById('author-name').value = this.author.name || '';
      document.getElementById('author-bio').value = this.author.bio || '';
      document.getElementById('author-email').value = this.author.email || '';
      document.getElementById('author-website').value = this.author.website || '';
      document.getElementById('author-location').value = this.author.location || '';
    }
  }

  async handleAuthorSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    this.author = {
      name: formData.get('name'),
      bio: formData.get('bio'),
      email: formData.get('email'),
      website: formData.get('website'),
      location: formData.get('location')
    };

    this.saveToStorage('author', this.author);
    this.showNotification('Author information saved successfully!', 'success');
  }

  // Social Functions
  loadSocialData() {
    const form = document.getElementById('social-form');
    if (form && this.settings) {
      document.getElementById('instagram-url').value = this.settings.instagramUrl || '';
      document.getElementById('facebook-url').value = this.settings.facebookUrl || '';
    }
  }

  async handleSocialSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    this.settings.instagramUrl = formData.get('instagram');
    this.settings.facebookUrl = formData.get('facebook');

    this.saveToStorage('settings', this.settings);
    this.showNotification('Social media links saved successfully!', 'success');
  }

  // Settings Functions
  loadSettingsData() {
    const form = document.getElementById('settings-form');
    if (form && this.settings) {
      document.getElementById('site-title').value = this.settings.siteTitle || '';
      document.getElementById('site-description').value = this.settings.siteDescription || '';
      document.getElementById('admin-username').value = this.settings.adminUsername || '';
    }
  }

  async handleSettingsSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    this.settings.siteTitle = formData.get('siteTitle');
    this.settings.siteDescription = formData.get('siteDescription');
    this.settings.adminUsername = formData.get('adminUsername');

    const newPassword = formData.get('adminPassword');
    if (newPassword) {
      this.settings.adminPassword = newPassword;
    }

    this.saveToStorage('settings', this.settings);
    this.showNotification('Settings saved successfully!', 'success');
  }

  // Utility Functions
  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  saveToStorage(key, data) {
    localStorage.setItem(`cms_${key}`, JSON.stringify(data));
  }

  loadFromStorage(key) {
    const data = localStorage.getItem(`cms_${key}`);
    return data ? JSON.parse(data) : null;
  }
}

// Global functions for onclick handlers
window.showSection = function(sectionName) {
  cms.showSection(sectionName);
};

window.showBookForm = function() {
  cms.showBookForm();
};

window.closeBookModal = function() {
  cms.closeBookModal();
};

window.showMediaForm = function() {
  cms.showMediaForm();
};

window.closeMediaModal = function() {
  cms.closeMediaModal();
};

// Initialize CMS
const cms = new CMS(); 