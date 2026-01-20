(function() {
  'use strict';

  if (window.__appInit) return;
  window.__appInit = true;

  const debounce = (fn, delay) => {
    let timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, arguments), delay);
    };
  };

  const initBurgerMenu = () => {
    const toggle = document.querySelector('.navbar-toggler');
    const collapse = document.querySelector('.navbar-collapse');
    const nav = document.querySelector('.l-header');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!toggle || !collapse) return;

    const close = () => {
      collapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    };

    const open = () => {
      collapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      collapse.classList.contains('show') ? close() : open();
    });

    navLinks.forEach(link => {
      link.addEventListener('click', close);
    });

    document.addEventListener('click', (e) => {
      if (collapse.classList.contains('show') && nav && !nav.contains(e.target)) {
        close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && collapse.classList.contains('show')) {
        close();
      }
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024) close();
    }, 200));
  };

  const initSmoothScroll = () => {
    document.addEventListener('click', (e) => {
      let target = e.target.closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const id = href.substring(1);
      const el = document.getElementById(id);
      if (!el) return;

      e.preventDefault();
      const header = document.querySelector('.l-header');
      const offset = header ? header.offsetHeight : 80;
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  const initScrollSpy = () => {
    const sections = document.querySelectorAll('[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${entry.target.id}`) {
              navLinks.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }, { rootMargin: '-100px 0px -66%' });

    sections.forEach(section => observer.observe(section));
  };

  const initActiveMenu = () => {
    const path = window.location.pathname.replace(//$/, '') || '/';
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPath = href.split('#')[0].replace(//$/, '') || '/';

      if (linkPath === path || (path === '/' && (href === '/' || href === '/index.html'))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  };

  const initForms = () => {
    const form = document.getElementById('appointmentForm');
    if (!form) return;

    const patterns = {
      email: /^[^s@]+@[^s@]+.[^s@]+$/,
      phone: /^[ds+-()]{10,20}$/,
      name: /^[a-zA-ZÀ-ÿs-']{2,50}$/
    };

    const validateField = (field) => {
      const value = field.value.trim();
      const type = field.type;
      const id = field.id;
      let isValid = true;
      let message = '';

      if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'Dieses Feld ist erforderlich.';
      } else if (value) {
        if (type === 'email' && !patterns.email.test(value)) {
          isValid = false;
          message = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        } else if (type === 'tel' && !patterns.phone.test(value)) {
          isValid = false;
          message = 'Bitte geben Sie eine gültige Telefonnummer ein.';
        } else if ((id === 'firstName' || id === 'lastName') && !patterns.name.test(value)) {
          isValid = false;
          message = 'Bitte verwenden Sie nur Buchstaben.';
        } else if (id === 'message' && value.length < 10) {
          isValid = false;
          message = 'Die Nachricht muss mindestens 10 Zeichen enthalten.';
        }
      }

      const parent = field.closest('.mb-3, .mb-4, .form-check');
      let errorEl = parent ? parent.querySelector('.invalid-feedback') : null;

      if (!errorEl && parent) {
        errorEl = document.createElement('div');
        errorEl.className = 'invalid-feedback';
        parent.appendChild(errorEl);
      }

      if (isValid) {
        field.classList.remove('is-invalid');
        if (errorEl) errorEl.classList.remove('d-block');
      } else {
        field.classList.add('is-invalid');
        if (errorEl) {
          errorEl.textContent = message;
          errorEl.classList.add('d-block');
        }
      }

      return isValid;
    };

    const validateCheckbox = (checkbox) => {
      const isValid = checkbox.checked;
      const parent = checkbox.closest('.form-check');
      let errorEl = parent ? parent.querySelector('.invalid-feedback') : null;

      if (!errorEl && parent) {
        errorEl = document.createElement('div');
        errorEl.className = 'invalid-feedback';
        parent.appendChild(errorEl);
      }

      if (!isValid) {
        checkbox.classList.add('is-invalid');
        if (errorEl) {
          errorEl.textContent = 'Sie müssen der Datenschutzerklärung zustimmen.';
          errorEl.classList.add('d-block');
        }
      } else {
        checkbox.classList.remove('is-invalid');
        if (errorEl) errorEl.classList.remove('d-block');
      }

      return isValid;
    };

    const fields = form.querySelectorAll('input:not([type="checkbox"]), select, textarea');
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
    });

    const checkbox = form.querySelector('#privacyConsent');
    if (checkbox) {
      checkbox.addEventListener('change', () => validateCheckbox(checkbox));
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      fields.forEach(field => {
        if (!validateField(field)) isValid = false;
      });

      if (checkbox && !validateCheckbox(checkbox)) isValid = false;

      if (!isValid) return;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.innerHTML : '';

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Wird gesendet...';
      }

      setTimeout(() => {
        window.location.href = 'thank_you.html';
      }, 800);
    });
  };

  const initAccordion = () => {
    const buttons = document.querySelectorAll('.accordion-button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-bs-target');
        const collapse = document.querySelector(target);
        if (!collapse) return;

        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          collapse.classList.remove('show');
          btn.classList.add('collapsed');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          collapse.classList.add('show');
          btn.classList.remove('collapsed');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  };

  const init = () => {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initForms();
    initAccordion();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
