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
        this.images = [];
        this.homepageConfig = {
            featuredBook: null,
            homepageBooks: []
        };
        
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
            this.handleMediaSubmit(e);
        });

        document.getElementById('cancel-media').addEventListener('click', () => {
            this.hideMediaModal();
        });

        // Image management
        document.getElementById('upload-image-btn').addEventListener('click', () => {
            this.showImageUploadModal();
        });

        document.getElementById('image-upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleImageUpload();
        });

        document.getElementById('cancel-image-upload').addEventListener('click', () => {
            this.hideImageUploadModal();
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
        this.bindImagePreviewEvents();
        
        // Latest Release cover image preview

    }

    bindImagePreviewEvents() {
        // Book cover image preview
        const bookCoverInput = document.getElementById('book-cover-image');
        if (bookCoverInput) {
            bookCoverInput.addEventListener('change', (e) => {
                this.handleImagePreview(e, 'book-cover-preview');
            });
        }

        // Media image preview
        const mediaImageInput = document.getElementById('media-image');
        if (mediaImageInput) {
            mediaImageInput.addEventListener('change', (e) => {
                this.handleImagePreview(e, 'media-image-preview');
            });
        }

        // Image upload preview
        const imageUploadInput = document.getElementById('image-file');
        if (imageUploadInput) {
            imageUploadInput.addEventListener('change', (e) => {
                this.handleImagePreview(e, 'image-upload-preview');
            });
        }
    }

    handleImagePreview(event, previewId) {
        const file = event.target.files[0];
        const preview = document.getElementById(previewId);
        
        if (file && preview) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
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
            if (section === 'images') {
                this.loadImages();
            } else if (section === 'media') {
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
            this.loadImages(),
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
            console.log('🔍 Loading media data...');
            console.log('🔍 API Base URL:', this.apiBaseUrl);
            console.log('🔍 Full endpoint:', `${this.apiBaseUrl}/media`);
            
            const response = await this.apiRequest('/media');
            console.log('📰 Media API response:', response);
            console.log('📰 Response type:', typeof response);
            console.log('📰 Response keys:', Object.keys(response));
            
            if (response && response.media) {
            this.media = (response.media || []).map(media => ({
                ...media,
                id: media._id || media.id
            }));
                console.log('📰 Processed media data:', this.media);
                console.log('📰 Media count:', this.media.length);
            } else {
                console.log('📰 No media property in response, using empty array');
                this.media = [];
            }
            
            this.renderMedia();
        } catch (error) {
            console.error('❌ Failed to load media:', error);
            console.log('🔄 Using fallback sample media data');
            
            // Fallback to sample data if API fails
            this.media = [
                {
                    id: 'sample-1',
                    title: 'Sample Book Review - Literary Magazine',
                    type: 'review',
                    source: 'Literary Magazine',
                    url: 'https://example.com/review',
                    date: '2024-01-15',
                    description: 'A sample book review for testing purposes.'
                },
                {
                    id: 'sample-2',
                    title: 'Sample Short Story - Spring Anthology',
                    type: 'short-work',
                    source: 'Spring Anthology 2024',
                    url: 'https://example.com/short-story',
                    date: '2024-03-15',
                    description: 'A sample short story for testing purposes.'
                }
            ];
            
            this.renderMedia();
            this.showNotification('Using sample media data (API unavailable)', 'warning');
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
                coverImagePreview.innerHTML = `
                    <div class="current-cover">
                        <p><strong>Current Cover:</strong></p>
                        <img src="${book.coverImage.url}" alt="Current cover" style="max-width: 200px; max-height: 300px; border: 1px solid #ddd; border-radius: 4px;">
                        <p><small>Upload a new image to replace this cover</small></p>
                    </div>
                `;
            } else {
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
        
        // Get the cover image file
        const coverImageFile = document.getElementById('book-cover-image').files[0];
        
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

        try {
            if (bookId) {
                console.log('Updating book with ID:', bookId);
                console.log('Book data being sent:', bookData);
                
                // First update the book data
                await this.apiRequest(`/books/${bookId}`, 'PUT', bookData);
                
                // Then upload cover image if provided
                if (coverImageFile) {
                    console.log('Uploading cover image for book:', bookId);
                    console.log('Cover image file details:', coverImageFile.name, 'Size:', coverImageFile.size);
                    await this.uploadBookCover(bookId, coverImageFile);
                }
                
                this.showNotification('Book updated successfully!', 'success');
            } else {
                console.log('Creating new book with data:', bookData);
                const newBook = await this.apiRequest('/books', 'POST', bookData);
                
                // Upload cover image if provided
                if (coverImageFile && newBook.book && newBook.book._id) {
                    console.log('Uploading cover image for new book:', newBook.book._id);
                    await this.uploadBookCover(newBook.book._id, coverImageFile);
                }
                
                this.showNotification('Book added successfully!', 'success');
            }
            
            this.hideBookModal();
            this.loadBooks();
        } catch (error) {
            console.error('Book operation failed:', error);
            this.showNotification('Failed to save book', 'error');
        }
    }

    async uploadBookCover(bookId, coverImageFile) {
        try {
            console.log('Starting cover upload for book ID:', bookId);
            console.log('Cover image file:', coverImageFile.name, 'Size:', coverImageFile.size);
            
            const formData = new FormData();
            formData.append('coverImage', coverImageFile);
            
            console.log('Uploading to endpoint:', `/books/${bookId}/cover`);
            await this.apiRequest(`/books/${bookId}/cover`, 'POST', formData, true);
            console.log('Cover image uploaded successfully for book:', bookId);
        } catch (error) {
            console.error('Failed to upload cover image for book ID:', bookId, error);
            throw new Error('Cover image upload failed');
        }
    }

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

    async uploadAuthorImage(authorImageFile) {
        try {
            console.log('Starting author image upload:', authorImageFile.name, 'Size:', authorImageFile.size);
            
            const formData = new FormData();
            formData.append('authorImage', authorImageFile);
            
            console.log('Uploading to endpoint:', '/author/image');
            await this.apiRequest('/author/image', 'POST', formData, true);
            console.log('Author image uploaded successfully');
        } catch (error) {
            console.error('Failed to upload author image:', error);
            throw new Error('Author image upload failed');
        }
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
           const authorImageFile = document.getElementById('author-image').files[0];

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

        try {
            // First save the author data
            await this.apiRequest('/author', 'PUT', authorData);
            
            // Then upload author image if provided
            if (authorImageFile) {
                console.log('Uploading author image:', authorImageFile.name);
                await this.uploadAuthorImage(authorImageFile);
            }
            
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

    async saveHomepageConfig() {
        try {
            await this.apiRequest('/homepage-config', 'PUT', this.homepageConfig);
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

    async apiRequest(endpoint, method = 'GET', data = null, isFile = false) {
        const token = localStorage.getItem('cms_token');
        const url = `${this.apiBaseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        if (data && method !== 'GET') {
            if (isFile) {
                // Don't set Content-Type for file uploads - let the browser set it
                options.body = data;
            } else {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                let errorMessage = 'Request failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
                } catch (parseError) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                console.error('API response error:', response.status, errorMessage);
                throw new Error(errorMessage);
            }
            
            return await response.json();
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

    hideImageUploadModal() {
        document.getElementById('image-upload-modal').classList.add('hidden');
    }

    showImageUploadModal() {
        const modal = document.getElementById('image-upload-modal');
        const form = document.getElementById('image-upload-form');
        form.reset();
        document.getElementById('image-upload-preview').innerHTML = '';
        modal.classList.remove('hidden');
    }

    async handleImageUpload() {
        const form = document.getElementById('image-upload-form');
        const formData = new FormData(form);
        
        try {
            await this.apiRequest('/images', 'POST', formData, true);
            this.showNotification('Image uploaded successfully!', 'success');
            this.hideImageUploadModal();
            this.loadImages();
        } catch (error) {
            console.error('Image upload failed:', error);
            this.showNotification('Failed to upload image', 'error');
        }
    }

    async loadImages() {
        try {
            const response = await this.apiRequest('/images');
            this.images = response.images || [];
            this.renderImages();
        } catch (error) {
            console.error('Failed to load images:', error);
            this.showNotification('Failed to load images', 'error');
        }
    }

    async loadHomepageConfig() {
        try {
            const response = await this.apiRequest('/homepage-config');
            this.homepageConfig = response.homepageConfig || {
                featuredBook: null,
                homepageBooks: []
            };
            this.renderHomepageConfig();
        } catch (error) {
            console.error('Failed to load homepage config:', error);
            // Use default config if API fails
            this.homepageConfig = {
                featuredBook: null,
                homepageBooks: []
            };
            this.renderHomepageConfig();
        }
    }

    renderImages() {
        const container = document.getElementById('images-grid');
        if (!container) return;

        if (this.images.length === 0) {
            container.innerHTML = '<p class="no-data">No images uploaded yet.</p>';
            return;
        }

        container.innerHTML = this.images.map(image => `
            <div class="image-card" data-image-id="${image._id || image.id}" data-image-url="${image.url}">
                <img src="${image.url}" alt="${image.title}">
                <div class="image-card-content">
                    <h4>${image.title}</h4>
                    <p><strong>Category:</strong> ${image.category}</p>
                    ${image.description ? `<p>${image.description}</p>` : ''}
                    <div class="image-card-actions">
                        <button class="btn btn-secondary copy-image-url-btn">Copy URL</button>
                        <button class="btn btn-danger delete-image-btn">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for the new buttons
        this.bindImageEvents();
    }

    renderHomepageConfig() {
        this.renderFeaturedBookSelect();
        this.renderFeaturedBookPreview();
        this.renderHomepageBooksList();
        this.renderSelectedBooks();
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
            option.value = book.id || book._id;
            option.textContent = book.title;
            if (this.homepageConfig.featuredBook === (book.id || book._id)) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    renderFeaturedBookPreview() {
        const preview = document.getElementById('featured-book-preview');
        if (!preview) return;

        if (this.homepageConfig.featuredBook) {
            const featuredBook = this.books.find(book => 
                (book.id || book._id) === this.homepageConfig.featuredBook
            );

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

    renderHomepageBooksList() {
        const container = document.getElementById('homepage-books-list');
        if (!container) return;

        if (this.books.length === 0) {
            container.innerHTML = '<p class="no-data">No books available</p>';
            return;
        }

        container.innerHTML = `
            <h4>Available Books</h4>
            <div class="available-books">
                ${this.books.map(book => `
                    <div class="book-checkbox-item ${this.homepageConfig.homepageBooks.includes(book.id || book._id) ? 'selected' : ''}" 
                         data-book-id="${book.id || book._id}">
                        <input type="checkbox" id="book-${book.id || book._id}" 
                               ${this.homepageConfig.homepageBooks.includes(book.id || book._id) ? 'checked' : ''}>
                        <label for="book-${book.id || book._id}">
                            <strong>${book.title}</strong><br>
                            <small>${book.year} • ${book.category}</small>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSelectedBooks() {
        const container = document.getElementById('selected-books-container');
        if (!container) return;

        if (this.homepageConfig.homepageBooks.length === 0) {
            container.innerHTML = '<div class="empty-state">No books selected for homepage display</div>';
            return;
        }

        container.innerHTML = this.homepageConfig.homepageBooks.map((bookId, index) => {
            const book = this.books.find(b => (b.id || b._id) === bookId);
            if (!book) return '';

            return `
                <div class="selected-book-item" data-book-id="${bookId}" data-index="${index}">
                    <div class="book-info">
                        <div class="book-title">${book.title}</div>
                        <div class="book-meta">${book.year} • ${book.category}</div>
                    </div>
                    <div class="drag-handle">⋮⋮</div>
                    <button class="remove-btn" data-book-id="${bookId}">×</button>
                </div>
            `;
        }).join('');
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

        // Book checkboxes
        document.querySelectorAll('.book-checkbox-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                
                const bookId = item.dataset.bookId;
                const checkbox = item.querySelector('input[type="checkbox"]');
                
                if (checkbox.checked) {
                    if (!this.homepageConfig.homepageBooks.includes(bookId)) {
                        this.homepageConfig.homepageBooks.push(bookId);
                    }
                    item.classList.add('selected');
                } else {
                    const index = this.homepageConfig.homepageBooks.indexOf(bookId);
                    if (index > -1) {
                        this.homepageConfig.homepageBooks.splice(index, 1);
                    }
                    item.classList.remove('selected');
                }
                
                this.renderSelectedBooks();
            });
        });

        // Remove book buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.target.dataset.bookId;
                const index = this.homepageConfig.homepageBooks.indexOf(bookId);
                if (index > -1) {
                    this.homepageConfig.homepageBooks.splice(index, 1);
                }
                
                // Update checkbox
                const checkboxItem = document.querySelector(`[data-book-id="${bookId}"]`);
                if (checkboxItem) {
                    const checkbox = checkboxItem.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = false;
                        checkboxItem.classList.remove('selected');
                    }
                }
                
                this.renderSelectedBooks();
            });
        });

        // Drag and drop functionality
        this.initializeDragAndDrop();
    }

    initializeDragAndDrop() {
        const container = document.getElementById('selected-books-container');
        if (!container) return;

        let draggedItem = null;

        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('selected-book-item')) {
                draggedItem = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.outerHTML);
            }
        });

        container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('selected-book-item')) {
                e.target.classList.remove('dragging');
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (e.target.classList.contains('selected-book-item')) {
                e.target.classList.add('drag-over');
            }
        });

        container.addEventListener('dragleave', (e) => {
            if (e.target.classList.contains('selected-book-item')) {
                e.target.classList.remove('drag-over');
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (e.target.classList.contains('selected-book-item') && draggedItem) {
                const targetIndex = parseInt(e.target.dataset.index);
                const draggedIndex = parseInt(draggedItem.dataset.index);
                
                // Reorder the array
                const [movedBook] = this.homepageConfig.homepageBooks.splice(draggedIndex, 1);
                this.homepageConfig.homepageBooks.splice(targetIndex, 0, movedBook);
                
                // Re-render to update indices
                this.renderSelectedBooks();
                this.bindHomepageEvents();
            }
            
            // Remove drag-over styling
            document.querySelectorAll('.drag-over').forEach(item => {
                item.classList.remove('drag-over');
            });
        });

        // Make items draggable
        document.querySelectorAll('.selected-book-item').forEach(item => {
            item.draggable = true;
        });
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
            this.loadImages();
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

    bindImageEvents() {
        document.querySelectorAll('.copy-image-url-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const imageUrl = e.currentTarget.closest('.image-card').dataset.imageUrl;
                this.copyImageUrl(imageUrl);
            });
        });

        document.querySelectorAll('.delete-image-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const imageId = e.currentTarget.closest('.image-card').dataset.imageId;
                this.deleteImage(imageId);
            });
        });
    }
}

// Initialize CMS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cms = new CMS();
}); 