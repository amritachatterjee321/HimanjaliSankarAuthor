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

    // Save settings button
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', (e) => this.handleSettingsSubmit(e));
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

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
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

    try {
      const response = await fetch('/api/cms/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('cms_token', data.token);
        this.isAuthenticated = true;
        this.currentUser = { username: data.username, email: data.email };
        this.showCMSInterface();
        this.showNotification('Login successful!', 'success');
      } else {
        const errorData = await response.json();
        this.showNotification(errorData.error || 'Invalid credentials!', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showNotification('Login failed. Please try again.', 'error');
    }
  }

  handleLogout() {
    localStorage.removeItem('cms_token');
    this.isAuthenticated = false;
    this.currentUser = null;
    this.showLoginScreen();
    this.showNotification('Logged out successfully!', 'success');
  }

  async showSection(sectionName) {
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
      case 'contact':
        this.loadContactData();
        break;
      case 'settings':
        await this.loadSettingsData();
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
      const token = localStorage.getItem('cms_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (editIndex !== undefined) {
        // Update existing book
        const bookId = this.books[editIndex]._id;
        const response = await fetch(`/api/cms/books/${bookId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(bookData)
        });

        if (response.ok) {
          const result = await response.json();
          this.books[editIndex] = result.book;
          this.showNotification('Book updated successfully!', 'success');
        } else {
          throw new Error('Failed to update book');
        }
      } else {
        // Add new book
        const response = await fetch('/api/cms/books', {
          method: 'POST',
          headers,
          body: JSON.stringify(bookData)
        });

        if (response.ok) {
          const result = await response.json();
          this.books.push(result.book);
          this.showNotification('Book added successfully!', 'success');
        } else {
          throw new Error('Failed to create book');
        }
      }
      
      this.closeBookModal();
      this.renderBooks();
      this.updateDashboardStats();
    } catch (error) {
      console.error('Error saving book:', error);
      this.showNotification('Error saving book!', 'error');
    }
  }

  editBook(index) {
    this.showBookForm(index);
  }

  async deleteBook(index) {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        const bookId = this.books[index]._id;
        const token = localStorage.getItem('cms_token');
        const response = await fetch(`/api/cms/books/${bookId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.books.splice(index, 1);
          this.renderBooks();
          this.updateDashboardStats();
          this.showNotification('Book deleted successfully!', 'success');
        } else {
          throw new Error('Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        this.showNotification('Error deleting book!', 'error');
      }
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

    try {
      const token = localStorage.getItem('cms_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (editIndex !== undefined) {
        // Update existing media
        const mediaId = this.media[editIndex]._id;
        const response = await fetch(`/api/cms/media/${mediaId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(mediaData)
        });

        if (response.ok) {
          const result = await response.json();
          this.media[editIndex] = result.media;
          this.showNotification('Media coverage updated successfully!', 'success');
        } else {
          throw new Error('Failed to update media');
        }
      } else {
        // Add new media
        const response = await fetch('/api/cms/media', {
          method: 'POST',
          headers,
          body: JSON.stringify(mediaData)
        });

        if (response.ok) {
          const result = await response.json();
          this.media.push(result.media);
          this.showNotification('Media coverage added successfully!', 'success');
        } else {
          throw new Error('Failed to create media');
        }
      }
      
      this.closeMediaModal();
      this.renderMedia();
      this.updateDashboardStats();
    } catch (error) {
      console.error('Error saving media:', error);
      this.showNotification('Error saving media!', 'error');
    }
  }

  editMedia(index) {
    this.showMediaForm(index);
  }

  async deleteMedia(index) {
    if (confirm('Are you sure you want to delete this media coverage?')) {
      try {
        const mediaId = this.media[index]._id;
        const token = localStorage.getItem('cms_token');
        const response = await fetch(`/api/cms/media/${mediaId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.media.splice(index, 1);
          this.renderMedia();
          this.updateDashboardStats();
          this.showNotification('Media coverage deleted successfully!', 'success');
        } else {
          throw new Error('Failed to delete media');
        }
      } catch (error) {
        console.error('Error deleting media:', error);
        this.showNotification('Error deleting media!', 'error');
      }
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

  // Contact Functions
  async loadContactData() {
    try {
      const response = await fetch('/api/cms?endpoint=contact');
      if (response.ok) {
        const data = await response.json();
        const contact = data.contact || {};
        
        const form = document.getElementById('contact-form');
        if (form) {
          document.getElementById('contact-email').value = contact.email || '';
          document.getElementById('contact-instagram').value = contact.instagram || '';
          document.getElementById('contact-facebook').value = contact.facebook || '';
          document.getElementById('contact-description').value = contact.description || '';
          document.getElementById('contact-success-message').value = contact.successMessage || '';
        }
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
      this.showNotification('Error loading contact data!', 'error');
    }
  }

  async handleContactSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const contactData = {
      email: formData.get('email'),
      instagram: formData.get('instagram'),
      facebook: formData.get('facebook'),
      description: formData.get('description'),
      successMessage: formData.get('successMessage')
    };

    try {
      const token = localStorage.getItem('cms_token');
      const response = await fetch('/api/cms?endpoint=contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactData)
      });

      if (response.ok) {
        this.showNotification('Contact information saved successfully!', 'success');
      } else {
        throw new Error('Failed to save contact information');
      }
    } catch (error) {
      console.error('Error saving contact information:', error);
      this.showNotification('Error saving contact information!', 'error');
    }
  }

  // Settings Functions
  async loadSettingsData() {
    try {
      const token = localStorage.getItem('cms_token');
      const response = await fetch('/api/cms?endpoint=settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.settings = data.settings;
        this.populateSettingsForm();
        console.log('✅ Settings loaded from database');
      } else {
        console.error('Failed to load settings:', response.status);
        this.showNotification('Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showNotification('Error loading settings', 'error');
    }
  }

  populateSettingsForm() {
    const form = document.getElementById('settings-form');
    if (form && this.settings) {
      document.getElementById('cms-username').value = this.settings.username || '';
      document.getElementById('admin-email').value = this.settings.adminEmail || '';
      document.getElementById('site-title').value = this.settings.siteTitle || '';
      document.getElementById('site-description').value = this.settings.siteDescription || '';
      
      // Clear password fields for security
      document.getElementById('cms-password').value = '';
      document.getElementById('cms-confirm-password').value = '';
    }
  }

  async handleSettingsSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Validate password confirmation
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password && password !== confirmPassword) {
      this.showNotification('Passwords do not match!', 'error');
      return;
    }
    
    if (password && password.length < 6) {
      this.showNotification('Password must be at least 6 characters long!', 'error');
      return;
    }

    const settingsData = {
      username: formData.get('username'),
      password: password, // Will be hashed on the server
      adminEmail: formData.get('adminEmail'),
      siteTitle: formData.get('siteTitle'),
      siteDescription: formData.get('siteDescription')
    };

    try {
      const token = localStorage.getItem('cms_token');
      const response = await fetch('/api/cms?endpoint=settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsData)
      });

      if (response.ok) {
        const result = await response.json();
        this.settings = result.settings;
        this.showNotification('Settings saved successfully!', 'success');
        
        // Clear password fields after successful save
        document.getElementById('cms-password').value = '';
        document.getElementById('cms-confirm-password').value = '';
        
        console.log('✅ Settings updated in database');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showNotification(`Error saving settings: ${error.message}`, 'error');
    }
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
  cms.showSection(sectionName).catch(error => {
    console.error('Error showing section:', error);
  });
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