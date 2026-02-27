/* =============================================
   Stackly – Shared JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- PRELOADER: hide after 1.5 seconds ---- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 1500);
  }

  /* ---- Navbar: scroll state ---- */
  const navbar    = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');

  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('nav-white');
    } else {
      navbar.classList.remove('scrolled');
      if (navbar.dataset.transparent === 'true') {
        navbar.classList.add('nav-white');
      }
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ---- Navbar: mobile toggle → shows #mobileMenu ---- */
  const mobileMenu      = document.getElementById('mobileMenu');
  const mobileHomeToggle = document.getElementById('mobileHomeToggle');
  const mobileHomeSubmenu = document.getElementById('mobileHomeSubmenu');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      mobileMenu && mobileMenu.classList.toggle('open');
    });
  }

  /* Close mobile menu when a non-submenu link is clicked */
  document.querySelectorAll('.mobile-nav-link, .mobile-sub-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle    && navToggle.classList.remove('open');
      mobileMenu   && mobileMenu.classList.remove('open');
    });
  });

  /* Mobile accordion – Home submenu */
  if (mobileHomeToggle && mobileHomeSubmenu) {
    mobileHomeToggle.addEventListener('click', () => {
      const isOpen = mobileHomeSubmenu.classList.toggle('open');
      mobileHomeToggle.classList.toggle('open', isOpen);
    });
  }

  /* Desktop dropdown: JS click fallback (touch devices don't have :hover) */
  const homeDropdown = document.getElementById('homeDropdown');
  if (homeDropdown) {
    homeDropdown.querySelector('.dropdown-trigger').addEventListener('click', (e) => {
      // Only intercept on touch / small screens — let href work on desktop hover
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        homeDropdown.classList.toggle('open');
      }
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!homeDropdown.contains(e.target)) {
        homeDropdown.classList.remove('open');
      }
    });
  }

  /* Close mobile menu on desktop resize */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navToggle  && navToggle.classList.remove('open');
      mobileMenu && mobileMenu.classList.remove('open');
    }
  });


  /* ---- Active nav link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Scroll-reveal (IntersectionObserver) ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ---- Counter animation ---- */
  function animateCounter(el) {
    const target   = +el.dataset.target;
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('[data-target]');
  if (counterEls.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* ---- Smooth scrolling for anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- Tabs (services page) ---- */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.tabs');
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      group.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = group.querySelector(`#${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ---- Toast helper ---- */
  window.showToast = function(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.innerHTML = `<span>${type === 'success' ? '✓' : '!'}</span> ${msg}`;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '32px', right: '32px',
      background: type === 'success' ? '#00c4b4' : '#dc3545',
      color: '#fff', padding: '14px 24px', borderRadius: '12px',
      fontSize: '0.95rem', fontWeight: '600', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 30px rgba(0,0,0,.2)',
      animation: 'fadeUp 0.4s both',
      maxWidth: '340px'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  /* ---- CONTACT FORM: validate then redirect to 404 ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const firstName = contactForm.querySelector('#firstName').value.trim();
      const email     = contactForm.querySelector('#email').value.trim();
      const message   = contactForm.querySelector('#message').value.trim();

      if (!firstName || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const btn = contactForm.querySelector('[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      /* After 1.2s redirect to 404 (simulates submission) */
      setTimeout(() => {
        window.location.href = '404.html';
      }, 1200);
    });
  }

  /* ---- Password toggle (login page) ---- */
  const togglePwd = document.getElementById('togglePwd');
  const pwdInput  = document.getElementById('password');
  if (togglePwd && pwdInput) {
    togglePwd.addEventListener('click', () => {
      const isText = pwdInput.type === 'text';
      pwdInput.type    = isText ? 'password' : 'text';
      togglePwd.textContent = isText ? '👁' : '🙈';
    });
  }

});
