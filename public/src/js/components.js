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
      innerHTML: CONFIG.author.name
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
        innerHTML: item.name
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

  // Navigation methods removed - let browser handle navigation naturally

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
                      (href === '/' && linkHref === '/') ||
                      (href.startsWith('/') && linkHref === href);
      link.classList.toggle('active', isActive);
    });
  }
}

export { Component, Header };
