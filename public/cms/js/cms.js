// CMS Application
class CMS {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api/cms';
        this.isAuthenticated = false;
        this.currentSection = 'books';
        this.books = [];
        this.media = [];
        this.author = {};
        this.settings = {};
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.checkAuth();
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Book management
        document.getElementById('add-book-btn').addEventListener('click', () => {
            this.showBookModal();
        });

        document.getElementById('book-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookSubmit();
        });

        document.getElementById('cancel-book').addEventListener('click', () => {
            this.hideBookModal();
        });

        // Media management
        document.getElementById('add-media-btn').addEventListener('click', () => {
            this.showMediaModal();
        });

        document.getElementById('media-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMediaSubmit();
        });

        document.getElementById('cancel-media').addEventListener('click', () => {
            this.hideMediaModal();
        });

        // Form submissions
        document.getElementById('save-author-btn').addEventListener('click', () => {
            this.saveAuthor();
        });

        document.getElementById('save-social-btn').addEventListener('click', () => {
            this.saveSocial();
        });

        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
    }

    async checkAuth() {
        const token = localStorage.getItem('cms_token');
        if (token) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/auth/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    this.isAuthenticated = true;
                    this.showDashboard();
                    this.loadData();
                } else {
                    this.showLogin();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('cms_token', data.token);
                this.isAuthenticated = true;
                this.showDashboard();
                this.loadData();
                this.showNotification('Login successful!', 'success');
            } else {
                const error = await response.json();
                this.showLoginError(error.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Network error. Please try again.');
        }
    }

    logout() {
        localStorage.removeItem('cms_token');
        this.isAuthenticated = false;
        this.showLogin();
        this.showNotification('Logged out successfully', 'info');
    }

    showLogin() {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('dashboard').classList.remove('active');
    }

    showDashboard() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('dashboard').classList.add('active');
    }

    showLoginError(message) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;
    }

    async loadData() {
        await Promise.all([
            this.loadBooks(),
            this.loadMedia(),
            this.loadAuthor(),
            this.loadSocial()
        ]);
    }

    async loadBooks() {
        try {
            const response = await this.apiRequest('/books');
            this.books = response.books || [];
            this.renderBooks();
        } catch (error) {
            console.error('Failed to load books:', error);
            this.showNotification('Failed to load books', 'error');
        }
    }

    async loadMedia() {
        try {
            const response = await this.apiRequest('/media');
            this.media = response.media || [];
            this.renderMedia();
        } catch (error) {
            console.error('Failed to load media:', error);
            this.showNotification('Failed to load media', 'error');
        }
    }

    async loadAuthor() {
        try {
            const response = await this.apiRequest('/author');
            this.author = response.author || {};
            this.populateAuthorForm();
        } catch (error) {
            console.error('Failed to load author info:', error);
        }
    }

    async loadSocial() {
        try {
            const response = await this.apiRequest('/social');
            this.populateSocialForm(response.social || {});
        } catch (error) {
            console.error('Failed to load social links:', error);
        }
    }

    renderBooks() {
        const grid = document.getElementById('books-grid');
        grid.innerHTML = '';

        if (this.books.length === 0) {
            grid.innerHTML = '<p>No books found. Add your first book!</p>';
            return;
        }

        this.books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Year:</strong> ${book.year}</p>
                <p><strong>Category:</strong> ${book.category}</p>
                <p>${book.description}</p>
                <div class="book-actions">
                    <button class="btn btn-secondary" onclick="cms.editBook('${book.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="cms.deleteBook('${book.id}')">Delete</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderMedia() {
        const list = document.getElementById('media-list');
        list.innerHTML = '';

        if (this.media.length === 0) {
            list.innerHTML = '<p>No media coverage found. Add your first media item!</p>';
            return;
        }

        this.media.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.innerHTML = `
                <div class="media-info">
                    <h4>${item.title}</h4>
                    <p><strong>Source:</strong> ${item.source} | <strong>Date:</strong> ${item.date}</p>
                </div>
                <div class="media-actions">
                    <a href="${item.url}" target="_blank" class="btn btn-secondary">View</a>
                    <button class="btn btn-danger" onclick="cms.deleteMedia('${item.id}')">Delete</button>
                </div>
            `;
            list.appendChild(mediaItem);
        });
    }

    populateAuthorForm() {
        document.getElementById('author-name').value = this.author.name || '';
        document.getElementById('author-bio').value = this.author.bio || '';
        document.getElementById('author-email').value = this.author.email || '';
        document.getElementById('author-website').value = this.author.website || '';
    }

    populateSocialForm(social) {
        document.getElementById('instagram-url').value = social.instagram || '';
        document.getElementById('facebook-url').value = social.facebook || '';
    }

    showBookModal(book = null) {
        const modal = document.getElementById('book-modal');
        const title = document.getElementById('book-modal-title');
        const form = document.getElementById('book-form');

        if (book) {
            title.textContent = 'Edit Book';
            form.dataset.bookId = book.id;
            // Populate form with book data
            document.getElementById('book-title').value = book.title;
            document.getElementById('book-genre').value = book.genre;
            document.getElementById('book-year').value = book.year;
            document.getElementById('book-description').value = book.description;
            document.getElementById('book-amazon-link').value = book.amazonLink || '';
            document.getElementById('book-category').value = book.category;
        } else {
            title.textContent = 'Add New Book';
            form.dataset.bookId = '';
            form.reset();
        }

        modal.classList.remove('hidden');
    }

    hideBookModal() {
        document.getElementById('book-modal').classList.add('hidden');
    }

    showMediaModal(media = null) {
        const modal = document.getElementById('media-modal');
        const title = document.getElementById('media-modal-title');
        const form = document.getElementById('media-form');

        if (media) {
            title.textContent = 'Edit Media Item';
            form.dataset.mediaId = media.id;
            // Populate form with media data
            document.getElementById('media-title').value = media.title;
            document.getElementById('media-source').value = media.source;
            document.getElementById('media-url').value = media.url;
            document.getElementById('media-date').value = media.date;
        } else {
            title.textContent = 'Add Media Item';
            form.dataset.mediaId = '';
            form.reset();
        }

        modal.classList.remove('hidden');
    }

    hideMediaModal() {
        document.getElementById('media-modal').classList.add('hidden');
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    async handleBookSubmit() {
        const form = document.getElementById('book-form');
        const bookId = form.dataset.bookId;
        
        const bookData = {
            title: document.getElementById('book-title').value,
            genre: document.getElementById('book-genre').value,
            year: parseInt(document.getElementById('book-year').value),
            description: document.getElementById('book-description').value,
            amazonLink: document.getElementById('book-amazon-link').value,
            category: document.getElementById('book-category').value
        };

        try {
            if (bookId) {
                await this.apiRequest(`/books/${bookId}`, 'PUT', bookData);
                this.showNotification('Book updated successfully!', 'success');
            } else {
                await this.apiRequest('/books', 'POST', bookData);
                this.showNotification('Book added successfully!', 'success');
            }
            
            this.hideBookModal();
            this.loadBooks();
        } catch (error) {
            console.error('Book operation failed:', error);
            this.showNotification('Failed to save book', 'error');
        }
    }

    async handleMediaSubmit() {
        const form = document.getElementById('media-form');
        const mediaId = form.dataset.mediaId;
        
        const mediaData = {
            title: document.getElementById('media-title').value,
            source: document.getElementById('media-source').value,
            url: document.getElementById('media-url').value,
            date: document.getElementById('media-date').value
        };

        try {
            if (mediaId) {
                await this.apiRequest(`/media/${mediaId}`, 'PUT', mediaData);
                this.showNotification('Media item updated successfully!', 'success');
            } else {
                await this.apiRequest('/media', 'POST', mediaData);
                this.showNotification('Media item added successfully!', 'success');
            }
            
            this.hideMediaModal();
            this.loadMedia();
        } catch (error) {
            console.error('Media operation failed:', error);
            this.showNotification('Failed to save media item', 'error');
        }
    }

    async saveAuthor() {
        const authorData = {
            name: document.getElementById('author-name').value,
            bio: document.getElementById('author-bio').value,
            email: document.getElementById('author-email').value,
            website: document.getElementById('author-website').value
        };

        try {
            await this.apiRequest('/author', 'PUT', authorData);
            this.showNotification('Author information saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save author info:', error);
            this.showNotification('Failed to save author information', 'error');
        }
    }

    async saveSocial() {
        const socialData = {
            instagram: document.getElementById('instagram-url').value,
            facebook: document.getElementById('facebook-url').value
        };

        try {
            await this.apiRequest('/social', 'PUT', socialData);
            this.showNotification('Social media links saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save social links:', error);
            this.showNotification('Failed to save social media links', 'error');
        }
    }

    async saveSettings() {
        const settingsData = {
            username: document.getElementById('cms-username').value,
            password: document.getElementById('cms-password').value,
            apiBaseUrl: document.getElementById('api-base-url').value
        };

        try {
            await this.apiRequest('/settings', 'PUT', settingsData);
            this.settings = settingsData;
            localStorage.setItem('cms_settings', JSON.stringify(settingsData));
            this.showNotification('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await this.apiRequest(`/books/${bookId}`, 'DELETE');
            this.showNotification('Book deleted successfully!', 'success');
            this.loadBooks();
        } catch (error) {
            console.error('Failed to delete book:', error);
            this.showNotification('Failed to delete book', 'error');
        }
    }

    async deleteMedia(mediaId) {
        if (!confirm('Are you sure you want to delete this media item?')) return;

        try {
            await this.apiRequest(`/media/${mediaId}`, 'DELETE');
            this.showNotification('Media item deleted successfully!', 'success');
            this.loadMedia();
        } catch (error) {
            console.error('Failed to delete media item:', error);
            this.showNotification('Failed to delete media item', 'error');
        }
    }

    editBook(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (book) {
            this.showBookModal(book);
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('cms_settings');
        if (saved) {
            this.settings = JSON.parse(saved);
            this.apiBaseUrl = this.settings.apiBaseUrl || this.apiBaseUrl;
            
            // Populate settings form
            document.getElementById('cms-username').value = this.settings.username || '';
            document.getElementById('cms-password').value = this.settings.password || '';
            document.getElementById('api-base-url').value = this.apiBaseUrl;
        }
    }

    async apiRequest(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('cms_token');
        const url = `${this.apiBaseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }

        return response.json();
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
}

// Initialize CMS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cms = new CMS();
}); 