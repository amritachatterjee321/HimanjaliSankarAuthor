import Utils from './utils.js';
import CONFIG from './config.js';

// Base Component Class
class Component {
  constructor(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;
    this.element = null;
  }

  render() {
    throw new Error('render method must be implemented');
  }

  mount() {
    this.element = this.render();
    if (this.container && this.element) {
      this.container.appendChild(this.element);
    }
    this.bindEvents();
    return this.element;
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  bindEvents() {
    // Override in subclasses
  }
}

// Header Component
class Header extends Component {
  constructor(container, eventBus) {
    super(container, eventBus);
    this.isScrolled = false;
  }

  render() {
    const header = Utils.createElement('header', {
      className: 'header'
    });

    const headerContent = Utils.createElement('div', {
      className: 'header-content'
    });

    const logo = Utils.createElement('a', {
      href: '/',
      className: 'logo',
      innerHTML: CONFIG.author.name,
      onClick: (e) => {
        e.preventDefault();
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
          // If we're on the homepage, scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // If we're on another page, navigate to homepage
          window.location.href = '/';
        }
      }
    });

    const nav = Utils.createElement('nav');
    const navMenu = Utils.createElement('ul', {
      className: 'nav-menu'
    });

    CONFIG.navigation.forEach(item => {
      const navItem = Utils.createElement('li', {
        className: 'nav-item'
      });

      const navLink = Utils.createElement('a', {
        href: item.href,
        className: 'nav-link',
        innerHTML: item.name,
        onClick: (e) => {
          e.preventDefault();
          if (item.href === '#home') {
            // If we're on the homepage, scroll to top
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              // If we're on another page, navigate to homepage
              window.location.href = '/';
            }
          } else if (item.href === '/about') {
            // Navigate to the About page
            window.location.href = '/about';
          } else if (item.href === '/books') {
            // Navigate to the Books page
            window.location.href = '/books';
          } else if (item.href === '/media') {
            // Navigate to the Media page
            window.location.href = '/media';
          } else if (item.href === '/contact') {
            // Navigate to the Contact page
            window.location.href = '/contact';
          } else if (item.href === '/cms') {
            // Navigate to the Admin Dashboard
            window.location.href = '/cms';
          } else if (item.href.startsWith('#')) {
            // Handle other anchor links (like #contact)
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
              // If we're on the homepage, scroll to the section
              const target = document.querySelector(item.href);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            } else {
              // If we're on another page, navigate to homepage and then scroll
              window.location.href = `/${item.href}`;
            }
          } else {
            // For any other pages, navigate directly
            window.location.href = item.href;
          }
          this.setActiveLink(item.href);
        }
      });

      navItem.appendChild(navLink);
      navMenu.appendChild(navItem);
    });

    nav.appendChild(navMenu);
    headerContent.appendChild(logo);
    headerContent.appendChild(nav);
    header.appendChild(headerContent);

    return header;
  }

  bindEvents() {
    window.addEventListener('scroll', Utils.debounce(() => {
      this.handleScroll();
    }, 10));
  }

  handleScroll() {
    const scrolled = window.scrollY > 50;
    if (scrolled !== this.isScrolled) {
      this.isScrolled = scrolled;
      this.element.classList.toggle('scrolled', scrolled);
    }
  }

  setActiveLink(href) {
    const navLinks = this.element.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === href);
    });
  }
}

export { Component, Header };
