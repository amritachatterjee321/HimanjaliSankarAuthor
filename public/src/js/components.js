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
        this.navigateTo('/');
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
          this.handleNavigation(item.href);
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

  handleNavigation(href) {
    if (href === '#home') {
      // If we're on the homepage, scroll to top
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // If we're on another page, navigate to homepage
        this.navigateTo('/');
      }
    } else if (href.startsWith('/')) {
      // Handle page navigation
      this.navigateTo(href);
    } else if (href.startsWith('#')) {
      // Handle anchor links
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // If we're on the homepage, scroll to the section
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // If we're on another page, navigate to homepage and then scroll
        this.navigateTo(`/${href}`);
      }
    }
    
    this.setActiveLink(href);
  }

  navigateTo(url) {
    // Simple navigation - let the browser handle it naturally
    window.location.href = url;
  }

  bindEvents() {
    window.addEventListener('scroll', Utils.debounce(() => {
      this.handleScroll();
    }, 10));

    // Simple navigation - no complex routing events
  }

  // Route change handling removed - simple navigation only

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
      const linkHref = link.getAttribute('href');
      const isActive = (href === linkHref) || 
                      (href === '/' && linkHref === '#home') ||
                      (href.startsWith('/') && linkHref === href);
      link.classList.toggle('active', isActive);
    });
  }
}

export { Component, Header };
