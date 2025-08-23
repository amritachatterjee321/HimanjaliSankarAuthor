// CMS Application
class CMS {
    constructor() {
        this.isAuthenticated = false;
        this.currentSection = 'books';
        this.books = [];
        this.media = [];
        this.author = {};
        this.settings = {};
        this.homepageConfig = {
            featuredBook: null,
            latestReleaseText: 'LATEST RELEASE'
        };
        
        this.init().catch(error => {
            console.error('Failed to initialize CMS:', error);
        });
    }

    async init() {
        console.log('🚀 CMS initializing...');
        this.bindEvents();
        await this.loadSettings();
        console.log('🔐 Starting authentication check...');
        this.checkAuth();
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Clear tokens button
        document.getElementById('clear-tokens-btn').addEventListener('click', () => {
            localStorage.removeItem('cms_token');
            this.showNotification('Tokens cleared, please refresh the page', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        });

        // Password toggle buttons
        this.setupPasswordToggles();

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
            this.handleMediaSubmit(e);
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

        document.getElementById('save-contact-btn').addEventListener('click', () => {
            this.saveContact();
        });

        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('save-homepage-btn').addEventListener('click', () => {
            this.saveHomepageConfig();
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

        // Image preview functionality
        // Removed bindImagePreviewEvents function - now using URL-based image management
        
        // Latest Release cover image preview
    }

    setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle-btn');
        
        toggleButtons.forEach(button => {
            // Remove existing event listeners to prevent duplicates
            button.removeEventListener('click', this.handlePasswordToggle);
            // Add new event listener
            button.addEventListener('click', this.handlePasswordToggle.bind(this));
        });
    }

    handlePasswordToggle(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const targetId = button.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const icon = button.querySelector('.toggle-icon');
        
        if (!passwordInput) {
            console.error('Password input not found:', targetId);
            return;
        }
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            button.classList.add('show-password');
            icon.className = 'fas fa-eye-slash toggle-icon';
            button.setAttribute('title', 'Hide password');
        } else {
            passwordInput.type = 'password';
            button.classList.remove('show-password');
            icon.className = 'fas fa-eye toggle-icon';
            button.setAttribute('title', 'Show password');
        }
    }

    setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle-btn');
        
        toggleButtons.forEach(button => {
            // Remove existing event listeners to prevent duplicates
            button.removeEventListener('click', this.handlePasswordToggle);
            // Add new event listener
            button.addEventListener('click', this.handlePasswordToggle.bind(this));
        });
    }

    handlePasswordToggle(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const targetId = button.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const icon = button.querySelector('.toggle-icon');
        
        if (!passwordInput) {
            console.error('Password input not found:', targetId);
            return;
        }
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            button.classList.add('show-password');
            icon.className = 'fas fa-eye-slash toggle-icon';
            button.setAttribute('title', 'Hide password');
        } else {
            passwordInput.type = 'password';
            button.classList.remove('show-password');
            icon.className = 'fas fa-eye toggle-icon';
            button.setAttribute('title', 'Show password');
        }
    }

    // Removed bindImagePreviewEvents function - now using URL-based image management

    async checkAuth() {
        console.log('🔐 Checking authentication...');
        
        const token = localStorage.getItem('cms_token');
        console.log('🔐 Token in localStorage:', token ? 'Present' : 'Not present');
        
        if (!token) {
            console.log('🔐 No token found, showing login screen');
            this.showLogin();
            return;
        }

        try {
            console.log('🔐 Verifying token with API...');
            const response = await fetch('/api/cms/auth/verify', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('🔐 Verification response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('🔐 Token verified successfully:', data);
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.showDashboard();
                this.loadData();
            } else {
                console.log('🔐 Token verification failed, removing token');
                localStorage.removeItem('cms_token');
                this.showLogin();
            }
        } catch (error) {
            console.error('🔐 Auth check failed:', error);
            localStorage.removeItem('cms_token');
            this.showLogin();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        console.log('🔐 Login attempt for username:', username);
        console.log('🔐 Password provided:', password ? 'Yes' : 'No');

        try {
            console.log('🔐 Making login request to API...');
            const response = await fetch('/api/cms/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('🔐 Login response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('🔐 Login successful, storing token');
                console.log('🔐 Token received:', data.token ? 'Present' : 'Missing');
                localStorage.setItem('cms_token', data.token);
                console.log('🔐 Token stored in localStorage');
                this.isAuthenticated = true;
                this.currentUser = data.user;
                console.log('🔐 Showing dashboard after successful login');
                this.showDashboard();
                this.loadData();
            } else {
                const errorData = await response.json();
                console.log('🔐 Login failed:', errorData);
                this.showNotification(errorData.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('🔐 Login error:', error);
            this.showNotification('Login error: ' + error.message, 'error');
        }
    }

    logout() {
        localStorage.removeItem('cms_token');
        this.isAuthenticated = false;
        this.showLogin();
        this.showNotification('Logged out successfully', 'info');
    }

    showLogin() {
        console.log('🔐 Showing login screen');
        const loginScreen = document.getElementById('login-screen');
        const dashboard = document.getElementById('dashboard');
        
        if (loginScreen) {
            loginScreen.classList.add('active');
            console.log('✅ Login screen activated');
        } else {
            console.error('❌ Login screen element not found');
        }
        
        if (dashboard) {
            dashboard.classList.remove('active');
            console.log('✅ Dashboard deactivated');
        } else {
            console.error('❌ Dashboard element not found');
        }
    }

    showDashboard() {
        console.log('🔐 Showing dashboard');
        const loginScreen = document.getElementById('login-screen');
        const dashboard = document.getElementById('dashboard');
        
        if (loginScreen) {
            loginScreen.classList.remove('active');
            console.log('✅ Login screen deactivated');
        } else {
            console.error('❌ Login screen element not found');
        }
        
        if (dashboard) {
            dashboard.classList.add('active');
            console.log('✅ Dashboard activated');
        } else {
            console.error('❌ Dashboard element not found');
        }
    }

    showLoginError(message) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    switchSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected section
        const targetSection = document.getElementById(`${section}-section`);
        const targetBtn = document.querySelector(`[data-section="${section}"]`);
        
        if (targetSection && targetBtn) {
            targetSection.classList.add('active');
            targetBtn.classList.add('active');
            this.currentSection = section;
            
            // Load section-specific data
            if (section === 'media') {
                this.loadMedia();
            }
        }
    }

    async loadData() {
        await Promise.all([
            this.loadBooks(),
            this.loadMedia(),
            this.loadAuthor(),
            this.loadSocial(),
            this.loadHomepageConfig()
        ]);
    }

    async loadBooks() {
        try {
            const response = await this.apiRequest('/books');
            console.log('Books loaded from API:', response.books);
            this.books = (response.books || []).map(book => {
                // Ensure consistent ID handling - always use _id as the primary identifier
                const bookWithConsistentId = {
                ...book,
                    _id: book._id || book.id, // Ensure _id is always present
                    id: book._id || book.id   // Keep id for backward compatibility
                };
                // Ensure _id is always a string for consistent comparison
                if (bookWithConsistentId._id) {
                    bookWithConsistentId._id = bookWithConsistentId._id.toString();
                }
                console.log('Book with consistent ID:', bookWithConsistentId.title, 'ID:', bookWithConsistentId._id);
                return bookWithConsistentId;
            });
            console.log('Books after mapping:', this.books);
            this.renderBooks();
        } catch (error) {
            console.error('Failed to load books:', error);
            this.showNotification('Failed to load books', 'error');
        }
    }

    async loadMedia() {
        try {
            console.log('🔍 Loading media from API...');
            const response = await this.apiRequest('/media', 'GET');
            
            if (response.media) {
                this.media = response.media;
                this.renderMedia();
                console.log('✅ Media loaded from API:', this.media.length, 'items');
            } else {
                console.log('⚠️ No media property in response, using empty array');
                this.media = [];
                this.renderMedia();
            }
        } catch (error) {
            console.error('Failed to load media:', error);
            this.showNotification('Failed to load media', 'error');
            this.media = [];
            this.renderMedia();
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

    async loadContact() {
        try {
            const response = await this.apiRequest('/contact');
            this.populateContactForm(response.contact || {});
        } catch (error) {
            console.error('Failed to load contact information:', error);
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
            // Always use _id as the primary identifier
            card.dataset.bookId = book._id;
            card.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Year:</strong> ${book.year}</p>
                <p><strong>Category:</strong> ${book.category}</p>
                <p><strong>Short Description:</strong> ${book.shortDescription || book.description?.substring(0, 100) + '...' || 'No description'}</p>
                ${book.awards && book.awards.length > 0 ? `<p><strong>Awards:</strong> ${book.awards.join(', ')}</p>` : ''}
                ${book.reviews && book.reviews.length > 0 ? `<p><strong>Reviews:</strong> ${book.reviews.length} review(s)</p>` : ''}
                <div class="book-actions">
                    <button class="btn btn-secondary edit-book-btn">Edit</button>
                    <button class="btn btn-danger delete-book-btn">Delete</button>
                </div>
            `;
            grid.appendChild(card);
        });

        // Add event listeners for the new buttons
        this.bindBookEvents();
    }

    renderMedia() {
        const list = document.getElementById('media-list');
        list.innerHTML = '';

        this.media.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.mediaId = item._id || item.id;
            
            const typeLabel = item.type === 'review' ? 'Review' : 
                             item.type === 'short-work' ? 'Short Work' : 
                             item.type || 'Other';
            
            // Build the media info with conditional fields
            let mediaInfoHTML = `<h4>${item.title}</h4>`;
            mediaInfoHTML += `<p><strong>Type:</strong> ${typeLabel}`;
            
            if (item.source && item.source.trim()) {
                mediaInfoHTML += ` | <strong>Source:</strong> ${item.source}`;
            }
            
            mediaInfoHTML += ` | <strong>Date:</strong> ${item.date}</p>`;
            
            if (item.description && item.description.trim()) {
                mediaInfoHTML += `<p><strong>Description:</strong> ${item.description}</p>`;
            }
            
            mediaItem.innerHTML = `
                <div class="media-info">
                    ${mediaInfoHTML}
                </div>
                <div class="media-actions">
                    <button class="btn btn-secondary edit-media-btn">Edit</button>
                    <a href="${item.url}" target="_blank" class="btn btn-secondary">View</a>
                    <button class="btn btn-danger delete-media-btn">Delete</button>
                </div>
            `;
            
            list.appendChild(mediaItem);
        });

        this.bindMediaEvents();
    }

    populateAuthorForm() {
           // Populate bio fields - handle rich text editor
           const bioEditor = document.getElementById('author-bio-editor');
           const bioTextarea = document.getElementById('author-bio');
           
           if (bioEditor && this.author.bio) {
               bioEditor.innerHTML = this.author.bio;
           } else if (bioEditor) {
               bioEditor.innerHTML = '';
           }
           
           // Keep the hidden textarea in sync
           if (bioTextarea) {
               bioTextarea.value = this.author.bio || '';
           }
           
        document.getElementById('author-awards').value = Array.isArray(this.author.awards) ? this.author.awards.join('\n') : '';

           // Show current author image if it exists
           const imagePreview = document.getElementById('author-image-preview');
           if (this.author.image && this.author.image.url) {
               imagePreview.innerHTML = `
                   <div class="current-image">
                       <p><strong>Current Image:</strong></p>
                       <img src="${this.author.image.url}" alt="Current author image" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;">
                       <p><small>Upload a new image to replace this one</small></p>
                   </div>
               `;
           } else {
               imagePreview.innerHTML = '<p><em>No author image set</em></p>';
           }
           
           // Initialize rich text editor after form is populated
           setTimeout(() => {
               this.initRichTextEditor();
           }, 100);
    }

    populateSocialForm(social) {
        document.getElementById('instagram-url').value = social.instagram || '';
        document.getElementById('facebook-url').value = social.facebook || '';
        document.getElementById('twitter-url').value = social.twitter || '';
        document.getElementById('linkedin-url').value = social.linkedin || '';
    }

    populateContactForm(contact) {
        document.getElementById('contact-email').value = contact.email || '';
        document.getElementById('contact-instagram').value = contact.instagram || '';
        document.getElementById('contact-facebook').value = contact.facebook || '';
        document.getElementById('contact-location').value = contact.location || '';
        document.getElementById('contact-description').value = contact.description || '';
        document.getElementById('contact-success-message').value = contact.successMessage || '';
    }

    showBookModal(book = null) {
        const modal = document.getElementById('book-modal');
        const title = document.getElementById('book-modal-title');
        const form = document.getElementById('book-form');
        const coverImagePreview = document.getElementById('book-cover-preview');

        if (book) {
            title.textContent = 'Edit Book';
            // Always use _id as the primary identifier
            const bookId = book._id;
            console.log('Setting book ID in form:', bookId);
            console.log('Book title being edited:', book.title);
            form.dataset.bookId = bookId;
            // Populate form with book data
            document.getElementById('book-title').value = book.title || '';
            document.getElementById('book-year').value = book.year || '';
            document.getElementById('book-description').value = book.description || '';
            document.getElementById('book-short-description').value = book.shortDescription || '';
            document.getElementById('book-amazon-link').value = book.amazonLink || '';
            document.getElementById('book-category').value = book.category || 'adults';
            document.getElementById('book-awards').value = Array.isArray(book.awards) ? book.awards.join('\n') : (book.awards || '');
            document.getElementById('book-reviews').value = Array.isArray(book.reviews) ? book.reviews.join('\n') : (book.reviews || '');
            
            // Show current cover image if it exists
            if (book.coverImage && book.coverImage.url) {
                document.getElementById('book-cover-image').value = book.coverImage.url;
                coverImagePreview.innerHTML = `
                    <div class="current-cover">
                        <p><strong>Current Cover:</strong></p>
                        <img src="${book.coverImage.url}" alt="Current cover" style="max-width: 200px; max-height: 300px; border: 1px solid #ddd; border-radius: 4px;">
                        <p><small>Enter a new image URL to replace this cover</small></p>
                    </div>
                `;
            } else {
                document.getElementById('book-cover-image').value = '';
                coverImagePreview.innerHTML = '<p><em>No cover image set</em></p>';
            }
        } else {
            title.textContent = 'Add New Book';
            form.dataset.bookId = '';
            form.reset();
            coverImagePreview.innerHTML = '';
        }

        modal.classList.remove('hidden');
    }

    hideBookModal() {
        document.getElementById('book-modal').classList.add('hidden');
    }

    showMediaModal(media = null) {
        const modal = document.getElementById('media-modal');
        const form = document.getElementById('media-form');
        const title = document.getElementById('media-modal-title');
        
        // Reset form
        form.reset();
        form.dataset.mediaId = '';

        if (media) {
            title.textContent = 'Edit Media Item';
            form.dataset.mediaId = media._id || media.id;
            document.getElementById('media-title').value = media.title;
            document.getElementById('media-type').value = media.type || '';
            document.getElementById('media-source').value = media.source || '';
            document.getElementById('media-url').value = media.url;
            document.getElementById('media-date').value = media.date;
            document.getElementById('media-description').value = media.description || '';
            // Populate image URL if it exists
            if (media.image && media.image.url) {
                document.getElementById('media-image').value = media.image.url;
            } else {
                document.getElementById('media-image').value = '';
            }
        } else {
            title.textContent = 'Add New Media Item';
        }

        modal.classList.remove('hidden');
    }

    hideMediaModal() {
        const modal = document.getElementById('media-modal');
        modal.classList.add('hidden');
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    async handleBookSubmit() {
        const form = document.getElementById('book-form');
        const bookId = form.dataset.bookId;
        console.log('Form dataset:', form.dataset);
        console.log('Book ID from form:', bookId);
        
        // Get the cover image URL
        const coverImageUrl = document.getElementById('book-cover-image').value.trim();
        
        const bookData = {
            title: document.getElementById('book-title').value,
            year: parseInt(document.getElementById('book-year').value),
            description: document.getElementById('book-description').value,
            shortDescription: document.getElementById('book-short-description').value,
            amazonLink: document.getElementById('book-amazon-link').value,
            category: document.getElementById('book-category').value,
            awards: document.getElementById('book-awards').value.split('\n').filter(award => award.trim()),
            reviews: document.getElementById('book-reviews').value.split('\n').filter(review => review.trim())
        };

        // Add cover image URL if provided
        if (coverImageUrl) {
            bookData.coverImage = {
                url: coverImageUrl,
                altText: `Cover image for ${bookData.title}`
            };
        }

        try {
            if (bookId) {
                console.log('Updating book with ID:', bookId);
                console.log('Book data being sent:', bookData);
                
                // Update the book data (including cover image)
                await this.apiRequest(`/books/${bookId}`, 'PUT', bookData);
                
                this.showNotification('Book updated successfully!', 'success');
            } else {
                console.log('Creating new book with data:', bookData);
                const newBook = await this.apiRequest('/books', 'POST', bookData);
                
                this.showNotification('Book added successfully!', 'success');
            }
            
            this.hideBookModal();
            this.loadBooks();
        } catch (error) {
            console.error('Book operation failed:', error);
            this.showNotification('Failed to save book', 'error');
        }
    }

    // Removed uploadBookCover function - now using URL-based image management

    initRichTextEditor() {
        const editor = document.getElementById('author-bio-editor');
        const toolbar = document.querySelector('.editor-toolbar');
        
        if (!editor || !toolbar) {
            console.log('Rich text editor elements not found');
            return;
        }
        
        console.log('Initializing rich text editor...');
        
        // Bind formatting buttons with better event handling
        toolbar.addEventListener('click', (e) => {
            console.log('Toolbar clicked:', e.target);
            
            // Find the closest format button (handles clicks on child elements)
            const formatBtn = e.target.closest('.format-btn');
            if (formatBtn) {
                e.preventDefault();
                const command = formatBtn.dataset.command;
                console.log('Format button clicked:', command);
                this.execFormatCommand(command);
            } else {
                console.log('Clicked element is not a format button:', e.target.className);
            }
        });
        
        // Sync content with hidden textarea
        editor.addEventListener('input', () => {
            const textarea = document.getElementById('author-bio');
            if (textarea) {
                textarea.value = editor.innerHTML;
            }
        });
        
        // Handle paste to clean HTML
        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            this.insertTextAtCursor(text);
        });
        
        // Handle keydown for formatting shortcuts
        editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.execFormatCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.execFormatCommand('italic');
                        break;
                }
            }
        });
        
        // Update button states when selection changes
        editor.addEventListener('selectionchange', () => {
            this.updateFormatButtonStates();
        });
        
        // Update button states when clicking in editor
        editor.addEventListener('click', () => {
            setTimeout(() => this.updateFormatButtonStates(), 10);
        });
        
        // Add test button for debugging
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Test Format';
        testBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: red; color: white; padding: 10px;';
        testBtn.onclick = () => {
            console.log('Test button clicked');
            const editor = document.getElementById('author-bio-editor');
            if (editor) {
                editor.innerHTML = '<strong>Bold Test</strong> and <em>Italic Test</em>';
                console.log('Test formatting applied');
            } else {
                console.log('Editor not found for test');
            }
        };
        document.body.appendChild(testBtn);
        
        // Add visual feedback for button clicks
        const formatButtons = toolbar.querySelectorAll('.format-btn');
        formatButtons.forEach(btn => {
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'scale(0.95)';
            });
            btn.addEventListener('mouseup', () => {
                btn.style.transform = '';
            });
        });
        
        console.log('Rich text editor initialized successfully');
    }
    
    execFormatCommand(command) {
        const editor = document.getElementById('author-bio-editor');
        if (!editor) {
            console.log('Editor not found');
            return;
        }
        
        // Ensure editor has focus
        editor.focus();
        
        // If no text is selected, select all text in the editor
        const selection = window.getSelection();
        if (selection.rangeCount === 0 || selection.toString().length === 0) {
            console.log('No text selected, selecting all text');
            const range = document.createRange();
            range.selectNodeContents(editor);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        console.log('Executing format command:', command);
        
        // Use a simpler approach that should work reliably
        switch (command) {
            case 'bold':
                this.simpleFormat('strong');
                break;
            case 'italic':
                this.simpleFormat('em');
                break;
            case 'insertParagraph':
                this.insertParagraph();
                break;
            case 'removeFormat':
                this.removeFormat();
                break;
        }
        
        // Update button states
        this.updateFormatButtonStates();
    }
    
    simpleFormat(tagName) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            console.log('No text selected');
            return;
        }
        
        const range = selection.getRangeAt(0);
        const content = range.toString();
        
        if (content.length === 0) {
            console.log('No text selected');
            return;
        }
        
        console.log('Formatting text:', content, 'with tag:', tagName);
        
        // Check if the selection is already within the target tag
        const parent = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
            ? range.commonAncestorContainer.parentNode 
            : range.commonAncestorContainer;
        
        // If clicking on already formatted text, remove the formatting
        if (parent.tagName === tagName.toUpperCase()) {
            console.log('Removing existing formatting');
            const textContent = parent.textContent;
            const textNode = document.createTextNode(textContent);
            parent.parentNode.replaceChild(textNode, parent);
            
            // Select the text that was just unformatted
            const newRange = document.createRange();
            newRange.setStart(textNode, 0);
            newRange.setEnd(textNode, textContent.length);
            selection.removeAllRanges();
            selection.addRange(newRange);
        } else {
            // Apply new formatting
            const element = document.createElement(tagName);
            element.textContent = content;
            
            // Replace the selected text
            range.deleteContents();
            range.insertNode(element);
            
            // Clear selection
            selection.removeAllRanges();
        }
        
        // Sync with hidden textarea
        const textarea = document.getElementById('author-bio');
        if (textarea) {
            textarea.value = document.getElementById('author-bio-editor').innerHTML;
        }
        
        console.log('Formatting applied/removed successfully');
    }
    
    insertParagraph() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        
        range.insertNode(p);
        range.setStartAfter(p);
        range.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    removeFormat() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const content = range.extractContents();
        const text = document.createTextNode(content.textContent);
        
        range.insertNode(text);
        range.selectNodeContents(text);
        range.collapse(false);
        
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    insertTextAtCursor(text) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(text);
        
        range.deleteContents();
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    updateFormatButtonStates() {
        const editor = document.getElementById('author-bio-editor');
        const buttons = document.querySelectorAll('.format-btn');
        
        if (!editor) return;
        
        buttons.forEach(btn => {
            const command = btn.dataset.command;
            if (command === 'bold' || command === 'italic') {
                // Check if current selection is within bold/italic tags
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const parent = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
                        ? range.commonAncestorContainer.parentNode 
                        : range.commonAncestorContainer;
                    
                    // Check if the parent or any ancestor has the target tag
                    let hasFormat = false;
                    let currentElement = parent;
                    
                    while (currentElement && currentElement !== editor) {
                        if (command === 'bold' && currentElement.tagName === 'STRONG') {
                            hasFormat = true;
                            break;
                        } else if (command === 'italic' && currentElement.tagName === 'EM') {
                            hasFormat = true;
                            break;
                        }
                        currentElement = currentElement.parentNode;
                    }
                    
                    if (hasFormat) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    }

    async handleMediaSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const mediaId = form.dataset.mediaId;
        
        const mediaData = {
            title: document.getElementById('media-title').value,
            type: document.getElementById('media-type').value,
            source: document.getElementById('media-source').value.trim() || null,
            url: document.getElementById('media-url').value,
            date: document.getElementById('media-date').value,
            description: document.getElementById('media-description').value.trim() || null
        };

        // Add image URL if provided
        const imageUrl = document.getElementById('media-image').value.trim();
        if (imageUrl) {
            mediaData.image = {
                url: imageUrl,
                altText: `Image for ${mediaData.title}`
            };
        }

        try {
            if (mediaId) {
                // Update existing media
                await this.apiRequest(`/media/${mediaId}`, 'PUT', mediaData);
                this.showNotification('Media updated successfully!', 'success');
            } else {
                // Create new media
                await this.apiRequest('/media', 'POST', mediaData);
                this.showNotification('Media added successfully!', 'success');
            }
            
            this.hideMediaModal();
            await this.loadMedia();
        } catch (error) {
            console.error('Error saving media:', error);
            this.showNotification('Error saving media. Please try again.', 'error');
        }
    }

    async saveAuthor() {
        const form = document.getElementById('author-form');
        const authorImageUrl = document.getElementById('author-image').value.trim();

        // Get form values - handle rich text editor
        const bioEditor = document.getElementById('author-bio-editor');
        const bio = bioEditor ? bioEditor.innerHTML.trim() : document.getElementById('author-bio').value.trim();
        const awards = document.getElementById('author-awards').value.split('\n').map(a => a.trim()).filter(a => a);

        // Validate required fields
        if (!bio) {
            this.showNotification('Full bio is required', 'error');
            return;
        }
        
        const authorData = {
            bio: bio,
            awards: awards
        };

        // Add image URL if provided
        if (authorImageUrl) {
            authorData.image = {
                url: authorImageUrl,
                altText: 'Author portrait'
            };
        }

        try {
            // Save the author data (including image URL)
            await this.apiRequest('/author', 'PUT', authorData);
            
            this.showNotification('Author information saved successfully!', 'success');
            this.loadAuthor();
        } catch (error) {
            console.error('Failed to save author:', error);
            this.showNotification('Failed to save author information', 'error');
        }
    }

    async saveSocial() {
        const form = document.getElementById('social-form');
        const formData = new FormData(form);
        
        const socialData = {
            instagram: formData.get('instagram'),
            facebook: formData.get('facebook'),
            twitter: formData.get('twitter'),
            linkedin: formData.get('linkedin')
        };

        try {
            await this.apiRequest('/social', 'PUT', socialData);
            this.showNotification('Social media links saved successfully!', 'success');
            this.loadSocial();
        } catch (error) {
            console.error('Failed to save social:', error);
            this.showNotification('Failed to save social media links', 'error');
        }
    }

    async saveContact() {
        const form = document.getElementById('contact-form');
        const formData = new FormData(form);
        
        const contactData = {
            email: formData.get('email'),
            instagram: formData.get('instagram'),
            facebook: formData.get('facebook'),
            location: formData.get('location'),
            description: formData.get('description'),
            successMessage: formData.get('successMessage')
        };

        try {
            await this.apiRequest('/contact', 'PUT', contactData);
            this.showNotification('Contact information saved successfully!', 'success');
            this.loadContact();
        } catch (error) {
            console.error('Failed to save contact:', error);
            this.showNotification('Failed to save contact information', 'error');
        }
    }

    async saveSettings() {
        const password = document.getElementById('cms-password').value;
        const confirmPassword = document.getElementById('cms-confirm-password').value;
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }
        
        // Validate password strength
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters long!', 'error');
            return;
        }

        const settingsData = {
            username: document.getElementById('cms-username').value,
            password: password,
            adminEmail: document.getElementById('admin-email').value,
            siteTitle: document.getElementById('site-title').value,
            siteDescription: document.getElementById('site-description').value
        };

        try {
            await this.apiRequest('/settings', 'PUT', settingsData);
            this.settings = settingsData;
            localStorage.setItem('cms_settings', JSON.stringify(settingsData));
            this.showNotification('Settings saved successfully!', 'success');
            
            // Clear password fields after successful save
            document.getElementById('cms-password').value = '';
            document.getElementById('cms-confirm-password').value = '';
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }

    async saveHomepageConfig() {
        console.log('🏠 Saving homepage config...');
        console.log('🏠 Current homepage config:', this.homepageConfig);
        try {
            // Only send the fields that should be updated, excluding database metadata
            const { _id, __v, createdAt, updatedAt, homepageBooks, ...cleanConfig } = this.homepageConfig;
            await this.apiRequest('/homepage-config', 'PUT', cleanConfig);
            this.showNotification('Homepage configuration saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save homepage config:', error);
            this.showNotification('Failed to save homepage configuration', 'error');
        }
    }

    async editBook(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (book) {
            this.showBookModal(book);
        }
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await this.apiRequest(`/books/${bookId}`, 'DELETE');
            this.showNotification('Book deleted successfully!', 'success');
            await this.loadBooks();
        } catch (error) {
            console.error('Failed to delete book:', error);
            this.showNotification('Failed to delete book', 'error');
        }
    }

    async deleteMedia(mediaId) {
        if (!confirm('Are you sure you want to delete this media item?')) return;

        try {
            await this.apiRequest(`/media/${mediaId}`, 'DELETE');
            this.showNotification('Media deleted successfully!', 'success');
            await this.loadMedia();
        } catch (error) {
            console.error('Failed to delete media:', error);
            this.showNotification('Failed to delete media', 'error');
        }
    }

    async loadSettings() {
        try {
            // Try to load settings from API first
            const response = await this.apiRequest('/settings', 'GET');
            if (response.settings) {
                this.settings = response.settings;
                
                // Populate settings form
                document.getElementById('cms-username').value = this.settings.username || '';
                document.getElementById('admin-email').value = this.settings.adminEmail || '';
                document.getElementById('site-title').value = this.settings.siteTitle || '';
                document.getElementById('site-description').value = this.settings.siteDescription || '';
                
                // Don't populate password fields for security
                document.getElementById('cms-password').value = '';
                document.getElementById('cms-confirm-password').value = '';
                
                console.log('✅ Settings loaded from database');
            }
        } catch (error) {
            console.log('⚠️ Failed to load settings from API, using localStorage fallback');
            
            // Fallback to localStorage
            const saved = localStorage.getItem('cms_settings');
            if (saved) {
                this.settings = JSON.parse(saved);
                
                // Populate settings form
                document.getElementById('cms-username').value = this.settings.username || '';
                document.getElementById('admin-email').value = this.settings.adminEmail || '';
                document.getElementById('site-title').value = this.settings.siteTitle || '';
                document.getElementById('site-description').value = this.settings.siteDescription || '';
                
                // Don't populate password fields for security
                document.getElementById('cms-password').value = '';
                document.getElementById('cms-confirm-password').value = '';
            }
        }
    }

    async apiRequest(endpoint, method = 'GET', data = null, isFile = false) {
        const token = localStorage.getItem('cms_token');
        console.log('🔍 API Request - Endpoint:', endpoint);
        console.log('🔍 API Request - Method:', method);
        console.log('🔍 API Request - Token present:', token ? 'Yes' : 'No');
        console.log('🔍 API Request - Token value:', token ? token.substring(0, 20) + '...' : 'null');
        console.log('🔍 API Request - Data:', data);
        
        // Map CMS endpoints to the correct API paths
        let apiPath = endpoint;
        if (endpoint.startsWith('/books')) {
            apiPath = endpoint.replace('/books', '/api/cms/books');
        } else if (endpoint.startsWith('/media')) {
            apiPath = endpoint.replace('/media', '/api/cms/media');
        } else if (endpoint.startsWith('/social')) {
            apiPath = endpoint.replace('/social', '/api/cms/social');
        } else if (endpoint.startsWith('/auth')) {
            apiPath = endpoint.replace('/auth', '/api/cms/auth');
        } else if (endpoint.startsWith('/author')) {
            apiPath = endpoint.replace('/author', '/api/cms/author');
        } else if (endpoint.startsWith('/settings')) {
            apiPath = endpoint.replace('/settings', '/api/cms/settings');
        } else if (endpoint.startsWith('/homepage-config')) {
            apiPath = endpoint.replace('/homepage-config', '/api/cms/homepage-config');
        } else {
            apiPath = `/api/cms${endpoint}`;
        }
        
        const url = apiPath;
        console.log('🔍 Making API request to:', url);
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        try {
            console.log('🔍 Sending request with options:', {
                method: options.method,
                headers: options.headers,
                body: options.body ? 'Present' : 'Not present'
            });
            
            const response = await fetch(url, options);
            console.log('🔍 Response status:', response.status);
            console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                console.error('🔍 Response not OK:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('🔍 Error response body:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log('🔍 Response data:', responseData);
            return responseData;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
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

    async loadHomepageConfig() {
        try {
            console.log('🏠 Loading homepage config from API...');
            const response = await this.apiRequest('/homepage-config');
            console.log('🏠 API response:', response);
            
            this.homepageConfig = response.homepageConfig || {
                featuredBook: null,
                latestReleaseText: 'LATEST RELEASE'
            };
            console.log('🏠 Loaded homepage config:', this.homepageConfig);
            this.renderHomepageConfig();
        } catch (error) {
            console.error('Failed to load homepage config:', error);
            console.error('Error details:', error.message);
            // Use default config if API fails
            this.homepageConfig = {
                featuredBook: null,
                latestReleaseText: 'LATEST RELEASE'
            };
            this.renderHomepageConfig();
        }
    }

    renderHomepageConfig() {
        this.renderFeaturedBookSelect();
        this.renderFeaturedBookPreview();
        this.populateLatestReleaseText();
        this.bindHomepageEvents();
    }

    renderFeaturedBookSelect() {
        const select = document.getElementById('featured-book-select');
        if (!select) return;

        // Clear existing options
        select.innerHTML = '<option value="">Select a book...</option>';

        // Add book options
        this.books.forEach(book => {
            const option = document.createElement('option');
            const bookId = book._id || book.id;
            // Convert to string for consistent comparison
            const bookIdString = bookId?.toString() || bookId;
            option.value = bookIdString;
            option.textContent = book.title;
            if (this.homepageConfig.featuredBook === bookIdString) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    renderFeaturedBookPreview() {
        const preview = document.getElementById('featured-book-preview');
        if (!preview) return;

        if (this.homepageConfig.featuredBook) {
            const featuredBook = this.books.find(book => {
                const bookId = book._id || book.id;
                const bookIdString = bookId?.toString() || bookId;
                return bookIdString === this.homepageConfig.featuredBook;
            });

            if (featuredBook) {
                preview.innerHTML = `
                    <div class="book-info">
                        <div class="book-title">${featuredBook.title}</div>
                        <div class="book-meta">
                            <strong>Year:</strong> ${featuredBook.year} | 
                            <strong>Category:</strong> ${featuredBook.category}
                        </div>
                        ${featuredBook.shortDescription ? `<div class="book-short-desc">${featuredBook.shortDescription}</div>` : ''}
                    </div>
                `;
                preview.classList.add('has-book');
            } else {
                preview.innerHTML = '<p>Selected book not found</p>';
                preview.classList.remove('has-book');
            }
        } else {
            preview.innerHTML = '<p>No featured book selected</p>';
            preview.classList.remove('has-book');
        }
    }

    populateLatestReleaseText() {
        const latestReleaseInput = document.getElementById('latest-release-text');
        if (latestReleaseInput) {
            latestReleaseInput.value = this.homepageConfig.latestReleaseText || 'LATEST RELEASE';
        }
    }





    bindHomepageEvents() {
        // Featured book selection
        const featuredSelect = document.getElementById('featured-book-select');
        if (featuredSelect) {
            featuredSelect.addEventListener('change', (e) => {
                this.homepageConfig.featuredBook = e.target.value;
                this.renderFeaturedBookPreview();
            });
        }

        // Latest release text input
        const latestReleaseInput = document.getElementById('latest-release-text');
        if (latestReleaseInput) {
            latestReleaseInput.addEventListener('input', (e) => {
                this.homepageConfig.latestReleaseText = e.target.value;
            });
        }
    }



    copyImageUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('Image URL copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy URL', 'error');
        });
    }

    async deleteImage(imageId) {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await this.apiRequest(`/images/${imageId}`, 'DELETE');
            this.showNotification('Image deleted successfully!', 'success');
        } catch (error) {
            console.error('Failed to delete image:', error);
            this.showNotification('Failed to delete image', 'error');
        }
    }

    bindBookEvents() {
        document.querySelectorAll('.edit-book-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookId = e.currentTarget.closest('.book-card').dataset.bookId;
                this.editBook(bookId);
            });
        });

        document.querySelectorAll('.delete-book-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookId = e.currentTarget.closest('.book-card').dataset.bookId;
                this.deleteBook(bookId);
            });
        });
    }

    bindMediaEvents() {
        document.querySelectorAll('.edit-media-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const mediaId = e.currentTarget.closest('.media-item').dataset.mediaId;
                this.showMediaModal(this.media.find(m => m._id === mediaId || m.id === mediaId));
            });
        });

        document.querySelectorAll('.delete-media-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const mediaId = e.currentTarget.closest('.media-item').dataset.mediaId;
                this.deleteMedia(mediaId);
            });
        });
    }
}

// Initialize CMS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cms = new CMS();
}); 