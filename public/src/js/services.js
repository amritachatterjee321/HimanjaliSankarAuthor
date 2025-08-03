import Utils from './utils.js';

// Event Emitter for component communication
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// Notification System
class NotificationSystem {
  constructor() {
    this.container = document.getElementById('notification-container');
    this.notifications = new Map();
  }

  show(message, type = 'info', title = '', duration = 5000) {
    const id = Date.now() + Math.random();
    
    const notification = Utils.createElement('div', {
      className: `notification ${type}`,
      id: `notification-${id}`
    });

    const closeBtn = Utils.createElement('button', {
      className: 'notification-close',
      innerHTML: '×',
      onClick: () => this.remove(id)
    });

    const content = Utils.createElement('div', {
      className: 'notification-content'
    });

    if (title) {
      const titleEl = Utils.createElement('div', {
        className: 'notification-title',
        innerHTML: title
      });
      content.appendChild(titleEl);
    }

    const messageEl = Utils.createElement('div', {
      className: 'notification-message',
      innerHTML: message
    });

    content.appendChild(messageEl);
    notification.appendChild(content);
    notification.appendChild(closeBtn);

    this.container.appendChild(notification);
    this.notifications.set(id, notification);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  remove(id) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.notifications.delete(id);
      }, 300);
    }
  }

  clear() {
    this.notifications.forEach((notification, id) => {
      this.remove(id);
    });
  }
}

// Form Validator
class FormValidator {
  static rules = {
    required: (value) => value.trim() !== '',
    email: (value) => Utils.validateEmail(value),
    minLength: (value, min) => value.length >= min,
    maxLength: (value, max) => value.length <= max
  };

  static validate(formData, rules) {
    const errors = {};

    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = formData.get ? formData.get(field) || '' : formData[field] || '';

      fieldRules.forEach(rule => {
        if (typeof rule === 'string') {
          if (!this.rules[rule](value)) {
            errors[field] = this.getErrorMessage(field, rule);
          }
        } else if (typeof rule === 'object') {
          const [ruleName, param] = Object.entries(rule)[0];
          if (!this.rules[ruleName](value, param)) {
            errors[field] = this.getErrorMessage(field, ruleName, param);
          }
        }
      });
    });

    return errors;
  }

  static getErrorMessage(field, rule, param) {
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
    
    const messages = {
      required: `${fieldName} is required`,
      email: 'Please enter a valid email address',
      minLength: `${fieldName} must be at least ${param} characters`,
      maxLength: `${fieldName} must be no more than ${param} characters`
    };

    return messages[rule] || 'Invalid input';
  }

  static showErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.form-group.error').forEach(group => {
      group.classList.remove('error');
      const errorMsg = group.querySelector('.error-message');
      if (errorMsg) errorMsg.remove();
    });

    // Show new errors
    Object.entries(errors).forEach(([field, message]) => {
      const input = document.querySelector(`[name="${field}"]`);
      if (input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        
        const errorEl = Utils.createElement('div', {
          className: 'error-message',
          innerHTML: message
        });
        formGroup.appendChild(errorEl);
      }
    });
  }

  static clearErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => {
      group.classList.remove('error');
      const errorMsg = group.querySelector('.error-message');
      if (errorMsg) errorMsg.remove();
    });
  }
}

export { EventEmitter, NotificationSystem, FormValidator };
