import CONFIG from './config.js';
import ApiService from './api.js';
import Utils from './utils.js';
import { EventEmitter, NotificationSystem, FormValidator } from './services.js';
import { Component, Header } from './components.js';

// Latest Book Component
class LatestBook extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.bookData = null;
  }

  async fetchData() {
    try {
      this.bookData = await this.apiService.getLatestBook();
    } catch (error) {
      console.error('Failed to fetch latest book:', error);
      // Fallback to static data
      this.bookData = {
        title: "Echoes of Tomorrow",
        subtitle: "Latest Release",
        genre: "A Novel",
        description: "A compelling exploration of memory, time, and the choices that define us.",
        publicationYear: "2024",
        publisher: "Literary Press",
        amazonLink: "https://amazon.com/echoes-tomorrow",
        pages: "324"
      };
    }
  }

  render() {
    if (!this.bookData) {
      return Utils.createElement('div', {
        className: 'loading',
        innerHTML: 'Loading...'
      });
    }

    const section = Utils.createElement('section', {
      className: 'latest-book-section'
    });

    const container = Utils.createElement('div', {
      className: 'latest-book-container'
    });

    // Book Image
    const imageContainer = Utils.createElement('div', {
      className: 'latest-book-image'
    });

    const bookCover = Utils.createElement('div', {
      className: 'book-cover-large featured'
    });

    const genre = Utils.createElement('div', {
      className: 'book-genre-large',
      innerHTML: this.bookData.genre
    });

    const title = Utils.createElement('h1', {
      className: 'book-title-large',
      innerHTML: this.bookData.title
    });

    const author = Utils.createElement('div', {
      className: 'book-author-large',
      innerHTML: CONFIG.author.name
    });

    bookCover.appendChild(genre);
    bookCover.appendChild(title);
    bookCover.appendChild(author);
    imageContainer.appendChild(bookCover);

    // Book Content
    const content = Utils.createElement('div', {
      className: 'latest-book-content'
    });

    const subtitle = Utils.createElement('div', {
      className: 'book-subtitle',
      innerHTML: this.bookData.subtitle
    });

    const bookTitle = Utils.createElement('h2', {
      innerHTML: this.bookData.title
    });

    const description = Utils.createElement('p', {
      className: 'book-description',
      innerHTML: this.bookData.description
    });

    const meta = Utils.createElement('div', {
      className: 'book-meta'
    });

    const metaItems = [
      { label: 'Published', value: this.bookData.publicationYear },
      { label: 'Publisher', value: this.bookData.publisher },
      { label: 'Pages', value: this.bookData.pages }
    ];

    metaItems.forEach(item => {
      const metaItem = Utils.createElement('div', {
        className: 'book-meta-item',
        innerHTML: `<strong>${item.label}:</strong> ${item.value}`
      });
      meta.appendChild(metaItem);
    });

    const buyButton = Utils.createElement('a', {
      href: this.bookData.amazonLink,
      className: 'buy-button',
      target: '_blank',
      innerHTML: 'Buy Now on Amazon',
      onClick: (e) => {
        // Track the purchase click
        window.app.notificationSystem.show(
          'Redirecting to Amazon...',
          'info',
          'Purchase'
        );
      }
    });

    content.appendChild(subtitle);
    content.appendChild(bookTitle);
    content.appendChild(description);
    content.appendChild(meta);
    content.appendChild(buyButton);

    container.appendChild(imageContainer);
    container.appendChild(content);
    section.appendChild(container);

    return section;
  }

  async mount() {
    await this.fetchData();
    return super.mount();
  }

  bindEvents() {
    // Add animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    const elements = this.element.querySelectorAll('.latest-book-image, .latest-book-content');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.8s ease';
      observer.observe(el);
    });
  }
}

export { LatestBook };
