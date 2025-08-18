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
    this.isMobileMenuOpen = false;
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

    // Mobile hamburger menu button
    const mobileMenuButton = Utils.createElement('button', {
      className: 'mobile-menu-button',
      'aria-label': 'Toggle navigation menu',
      innerHTML: '<span></span><span></span><span></span>'
    });

    const nav = Utils.createElement('nav', {
      className: 'nav'
    });
    
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
    headerContent.appendChild(mobileMenuButton);
    headerContent.appendChild(nav);
    header.appendChild(headerContent);

    // Mobile Navigation Overlay
    const mobileNav = Utils.createElement('div', {
      className: 'mobile-nav'
    });

    const mobileNavContainer = Utils.createElement('div', {
      className: 'mobile-nav-container'
    });

    const mobileNavHeader = Utils.createElement('div', {
      className: 'mobile-nav-header'
    });

    const mobileNavClose = Utils.createElement('button', {
      className: 'mobile-nav-close',
      'aria-label': 'Close navigation menu',
      innerHTML: '×'
    });

    const mobileNavLinks = Utils.createElement('div', {
      className: 'mobile-nav-links'
    });

    // Add navigation pages to mobile menu
    CONFIG.navigation.forEach(item => {
      const mobileNavLink = Utils.createElement('a', {
        href: item.href,
        className: 'mobile-nav-link',
        innerHTML: item.name
      });

      mobileNavLinks.appendChild(mobileNavLink);
    });

    // Add social links to mobile menu
    const mobileNavSocial = Utils.createElement('div', {
      className: 'mobile-nav-social'
    });

    if (CONFIG.social) {
      Object.entries(CONFIG.social).forEach(([platform, url]) => {
        if (url && url !== '#') {
          const socialLink = Utils.createElement('a', {
            href: url,
            className: 'mobile-nav-social-link',
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': `${platform} profile`,
            innerHTML: `<i class="fab fa-${platform.toLowerCase()}"></i>`
          });

          mobileNavSocial.appendChild(socialLink);
        }
      });
    }

    mobileNavHeader.appendChild(mobileNavClose);
    mobileNavContainer.appendChild(mobileNavHeader);
    mobileNavContainer.appendChild(mobileNavLinks);
    mobileNavContainer.appendChild(mobileNavSocial);
    mobileNav.appendChild(mobileNavContainer);

    // Append mobile nav to body for proper overlay positioning
    document.body.appendChild(mobileNav);

    return header;
  }

  bindEvents() {
    window.addEventListener('scroll', Utils.debounce(() => {
      this.handleScroll();
    }, 10));

    // Mobile menu toggle
    const mobileMenuButton = this.element.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Mobile navigation close button
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Close mobile menu when clicking on navigation links
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target) && !e.target.closest('.mobile-nav')) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu when window resizes to desktop
    window.addEventListener('resize', Utils.debounce(() => {
      if (window.innerWidth > 768) {
        this.closeMobileMenu();
      }
    }, 100));

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.element.classList.toggle('mobile-menu-open', this.isMobileMenuOpen);
    
    // Toggle mobile navigation overlay
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
      if (this.isMobileMenuOpen) {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      } else {
        mobileNav.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    }
    
    // Toggle aria-expanded for accessibility
    const mobileMenuButton = this.element.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.setAttribute('aria-expanded', this.isMobileMenuOpen);
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.element.classList.remove('mobile-menu-open');
    
    // Hide mobile navigation overlay
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
      mobileNav.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    }
    
    const mobileMenuButton = this.element.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.setAttribute('aria-expanded', 'false');
    }
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
      const linkHref = link.getAttribute('href');
      const isActive = (href === linkHref) || 
                      (href === '/' && linkHref === '/') ||
                      (href.startsWith('/') && linkHref === href);
      link.classList.toggle('active', isActive);
    });
  }
}

export { Component, Header };
