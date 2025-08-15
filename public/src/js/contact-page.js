import CONFIG from './config.js';
import ApiService from './api.js';
import Utils from './utils.js';
import { EventEmitter, NotificationSystem } from './services.js';
import { Header, Component } from './components.js';
import { Footer } from './app-components.js';

// Contact Page Component
class ContactPage extends Component {
  constructor(container, eventBus, apiService) {
    super(container, eventBus);
    this.apiService = apiService;
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: '',
      organization: '',
      inquiryType: ''
    };
  }

  render() {
    const section = Utils.createElement('section', {
      className: 'contact-page-section'
    });

    const container = Utils.createElement('div', {
      className: 'contact-page-container'
    });

    // Contact Content
    const contactContent = Utils.createElement('div', {
      className: 'contact-content'
    });

    // Contact Info
    const contactInfo = Utils.createElement('div', {
      className: 'contact-info'
    });

    const infoTitle = Utils.createElement('h2', {
      className: 'info-title',
      innerHTML: 'Get in Touch'
    });

    const infoDescription = Utils.createElement('p', {
      className: 'info-description',
      innerHTML: 'I\'d love to hear from you! Whether you have a question about my books, want to discuss a collaboration, or just want to say hello, feel free to reach out.'
    });

    const contactMethods = Utils.createElement('div', {
      className: 'contact-methods'
    });

    // Email Method
    const emailMethod = Utils.createElement('div', {
      className: 'contact-method'
    });

    const emailIcon = Utils.createElement('i', {
      className: 'fas fa-envelope contact-icon'
    });

    const emailInfo = Utils.createElement('div', {
      className: 'method-info'
    });

    const emailLabel = Utils.createElement('h3', {
      className: 'method-label',
      innerHTML: 'Email'
    });

    const emailAddress = Utils.createElement('p', {
      className: 'method-detail',
      innerHTML: 'himanjali@example.com'
    });

    emailInfo.appendChild(emailLabel);
    emailInfo.appendChild(emailAddress);
    emailMethod.appendChild(emailIcon);
    emailMethod.appendChild(emailInfo);

    // Location Method
    const locationMethod = Utils.createElement('div', {
      className: 'contact-method'
    });

    const locationIcon = Utils.createElement('i', {
      className: 'fas fa-map-marker-alt contact-icon'
    });

    const locationInfo = Utils.createElement('div', {
      className: 'method-info'
    });

    const locationLabel = Utils.createElement('h3', {
      className: 'method-label',
      innerHTML: 'Location'
    });

    const locationDetail = Utils.createElement('p', {
      className: 'method-detail',
      innerHTML: 'India'
    });

    locationInfo.appendChild(locationLabel);
    locationInfo.appendChild(locationDetail);
    locationMethod.appendChild(locationIcon);
    locationMethod.appendChild(locationInfo);

    contactMethods.appendChild(emailMethod);
    contactMethods.appendChild(locationMethod);

    contactInfo.appendChild(infoTitle);
    contactInfo.appendChild(infoDescription);
    contactInfo.appendChild(contactMethods);

    // Contact Form
    const contactForm = Utils.createElement('div', {
      className: 'contact-form-container'
    });

    const formTitle = Utils.createElement('h2', {
      className: 'form-title',
      innerHTML: 'Send a Message'
    });

    const form = Utils.createElement('form', {
      className: 'contact-form',
      id: 'contactForm'
    });

    // Name Field
    const nameGroup = Utils.createElement('div', {
      className: 'form-group'
    });

    const nameLabel = Utils.createElement('label', {
      htmlFor: 'name',
      className: 'form-label',
      innerHTML: 'Name *'
    });

    const nameInput = Utils.createElement('input', {
      type: 'text',
      id: 'name',
      name: 'name',
      className: 'form-input',
      required: true,
      placeholder: 'Your full name'
    });

    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);

    // Email Field
    const emailGroup = Utils.createElement('div', {
      className: 'form-group'
    });

    const emailLabelForm = Utils.createElement('label', {
      htmlFor: 'email',
      className: 'form-label',
      innerHTML: 'Email *'
    });

    const emailInput = Utils.createElement('input', {
      type: 'email',
      id: 'email',
      name: 'email',
      className: 'form-input',
      required: true,
      placeholder: 'your.email@example.com'
    });

    emailGroup.appendChild(emailLabelForm);
    emailGroup.appendChild(emailInput);

    // Subject Field
    const subjectGroup = Utils.createElement('div', {
      className: 'form-group'
    });

    const subjectLabel = Utils.createElement('label', {
      htmlFor: 'subject',
      className: 'form-label',
      innerHTML: 'Subject'
    });

    const subjectInput = Utils.createElement('input', {
      type: 'text',
      id: 'subject',
      name: 'subject',
      className: 'form-input',
      placeholder: 'What is this about?'
    });

    subjectGroup.appendChild(subjectLabel);
    subjectGroup.appendChild(subjectInput);

    // Organization Field
    const organizationGroup = Utils.createElement('div', {
      className: 'form-group'
    });

    const organizationLabel = Utils.createElement('label', {
      htmlFor: 'organization',
      className: 'form-label',
      innerHTML: 'Organization'
    });

    const organizationInput = Utils.createElement('input', {
      type: 'text',
      id: 'organization',
      name: 'organization',
      className: 'form-input',
      placeholder: 'Your organization (optional)'
    });

    organizationGroup.appendChild(organizationLabel);
    organizationGroup.appendChild(organizationInput);

    // Inquiry Type Field
    const inquiryGroup = Utils.createElement('div', {
      className: 'form-group'
    });

    const inquiryLabel = Utils.createElement('label', {
      htmlFor: 'inquiryType',
      className: 'form-label',
      innerHTML: 'Inquiry Type'
    });

    const inquirySelect = Utils.createElement('select', {
      id: 'inquiryType',
      name: 'inquiryType',
      className: 'form-select'
    });

    const defaultOption = Utils.createElement('option', {
      value: '',
      innerHTML: 'Select an inquiry type'
    });

    const mediaOption = Utils.createElement('option', {
      value: 'media',
      innerHTML: 'Media Inquiry'
    });

    const eventOption = Utils.createElement('option', {
      value: 'event',
      innerHTML: 'Event Request'
    });

    const readerOption = Utils.createElement('option', {
      value: 'reader',
      innerHTML: 'Reader Question'
    });

    const businessOption = Utils.createElement('option', {
      value: 'business',
      innerHTML: 'Business Inquiry'
    });

    const otherOption = Utils.createElement('option', {
      value: 'other',
      innerHTML: 'Other'
    });

    inquirySelect.appendChild(defaultOption);
    inquirySelect.appendChild(mediaOption);
    inquirySelect.appendChild(eventOption);
    inquirySelect.appendChild(readerOption);
    inquirySelect.appendChild(businessOption);
    inquirySelect.appendChild(otherOption);

    inquiryGroup.appendChild(inquiryLabel);
    inquiryGroup.appendChild(inquirySelect);

    // Message Field
    const messageGroup = Utils.createElement('div', {
      className: 'form-group'
    });

    const messageLabel = Utils.createElement('label', {
      htmlFor: 'message',
      className: 'form-label',
      innerHTML: 'Message *'
    });

    const messageTextarea = Utils.createElement('textarea', {
      id: 'message',
      name: 'message',
      className: 'form-textarea',
      required: true,
      placeholder: 'Your message...',
      rows: 6
    });

    messageGroup.appendChild(messageLabel);
    messageGroup.appendChild(messageTextarea);

    // Submit Button
    const submitGroup = Utils.createElement('div', {
      className: 'form-group'
    });

    const submitButton = Utils.createElement('button', {
      type: 'submit',
      className: 'submit-button',
      innerHTML: 'Send Message'
    });

    submitGroup.appendChild(submitButton);

    // Assemble form
    form.appendChild(nameGroup);
    form.appendChild(emailGroup);
    form.appendChild(subjectGroup);
    form.appendChild(organizationGroup);
    form.appendChild(inquiryGroup);
    form.appendChild(messageGroup);
    form.appendChild(submitGroup);

    contactForm.appendChild(formTitle);
    contactForm.appendChild(form);

    // Assemble content
    contactContent.appendChild(contactInfo);
    contactContent.appendChild(contactForm);

    container.appendChild(contactContent);
    section.appendChild(container);

    return section;
  }

  async mount() {
    try {
      const element = this.render();
      this.container.appendChild(element);
      this.bindEvents();
    } catch (error) {
      console.error('Error mounting ContactPage:', error);
    }
  }

  bindEvents() {
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }

  async handleSubmit() {
    try {
      const form = document.getElementById('contactForm');
      const formData = new FormData(form);
      
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        organization: formData.get('organization'),
        inquiryType: formData.get('inquiryType')
      };

      // Show loading state
      const submitButton = form.querySelector('.submit-button');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = 'Sending...';
      submitButton.disabled = true;

      // Submit the form
      const response = await this.apiService.submitContactForm(data);

      if (response.success) {
        this.notificationSystem.show(
          response.message || 'Message sent successfully!',
          'success',
          'Success'
        );
        form.reset();
      } else {
        throw new Error(response.message || 'Failed to send message');
      }

    } catch (error) {
      console.error('Contact form error:', error);
      this.notificationSystem.show(
        error.message || 'Failed to send message. Please try again.',
        'error',
        'Error'
      );
    } finally {
      // Reset button state
      const submitButton = form.querySelector('.submit-button');
      submitButton.innerHTML = 'Send Message';
      submitButton.disabled = false;
    }
  }
}

// Main Contact Page Application
class ContactPageApp {
  constructor() {
    this.eventBus = new EventEmitter();
    this.notificationSystem = new NotificationSystem();
    this.apiService = new ApiService(CONFIG.api.baseUrl);
    this.init();
  }

  async init() {
    try {
      // Hide loading screen
      this.hideLoadingScreen();

      // Initialize app container
      const app = document.getElementById('app');
      app.innerHTML = '';

      // Create main structure
      const header = document.createElement('header');
      const main = document.createElement('main');
      const footer = document.createElement('footer');

      main.className = 'main-content';

      app.appendChild(header);
      app.appendChild(main);
      app.appendChild(footer);

      // Initialize components
      const headerComponent = new Header(header, this.eventBus);
      const contactPageComponent = new ContactPage(main, this.eventBus, this.apiService);
      const footerComponent = new Footer(footer, this.eventBus);

      // Mount components
      await headerComponent.mount();
      await contactPageComponent.mount();
      await footerComponent.mount();

      console.log('✅ Contact page components mounted successfully');

    } catch (error) {
      console.error('Error initializing contact page:', error);
      this.hideLoadingScreen();
      this.notificationSystem.show(
        'Error loading contact page. Please refresh the page.',
        'error',
        'Loading Error'
      );
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    // Ensure main content is visible
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
      mainContent.style.visibility = 'visible';
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global app instance
  window.contactPageApp = new ContactPageApp();
  
  // Development helpers
  if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.Utils = Utils;
    console.log('🚀 Contact Page initialized in development mode');
  }
});

// Export for module systems
export default ContactPageApp; 