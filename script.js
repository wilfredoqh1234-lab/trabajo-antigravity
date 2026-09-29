/* ═══════════════════════════════════════════════
   PLURIVERSIDAD — script.js
   Navigation, mobile menu, contact form, scroll
   ═══════════════════════════════════════════════ */

'use strict';

// ── MOBILE MENU ───────────────────────────────
const menuToggle   = document.getElementById('menuToggle');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileBackdrop = document.getElementById('mobileBackdrop');

function openMobileMenu() {
  mobileMenu.classList.add('is-open');
  mobileBackdrop.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('is-open');
  mobileBackdrop.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMobileMenu() : openMobileMenu();
});

mobileBackdrop?.addEventListener('click', closeMobileMenu);

// Close mobile menu on nav link click
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Escape key closes menu
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

// ── STICKY HEADER ─────────────────────────────
const siteHeader = document.querySelector('.site-header');

function handleHeaderScroll() {
  if (window.scrollY > 20) {
    siteHeader?.classList.add('scrolled');
  } else {
    siteHeader?.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll(); // run on load

// ── ACTIVE NAV LINK (intersection observer) ───
const sections = document.querySelectorAll('section[id], main[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.dataset.section === id);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(section => sectionObserver.observe(section));

// ── SCROLL REVEAL ─────────────────────────────
const revealEls = document.querySelectorAll(
  '.culture-card, .contact-block, .director-photo-wrap, .director-info'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealEls.forEach(el => revealObserver.observe(el));

// Stagger delays for grids
document.querySelectorAll('.value-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 60}ms`;
});

// ── CONTACT FORM ──────────────────────────────
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');

contactForm?.addEventListener('submit', e => {
  e.preventDefault();

  const name    = document.getElementById('contactName')?.value.trim();
  const email   = document.getElementById('contactEmail')?.value.trim();
  const subject = document.getElementById('contactSubject')?.value;
  const message = document.getElementById('contactMessage')?.value.trim();
  const btn     = document.getElementById('submitContact');

  // Simple validation
  if (!name || !email || !subject || !message) {
    formStatus.textContent = 'Por favor completa todos los campos.';
    formStatus.className = 'form-note error';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formStatus.textContent = 'Por favor ingresa un correo electrónico válido.';
    formStatus.className = 'form-note error';
    return;
  }

  // Simulate sending
  btn.disabled = true;
  btn.textContent = 'Enviando…';
  formStatus.textContent = '';
  formStatus.className = 'form-note';

  setTimeout(() => {
    formStatus.textContent = '✓ Mensaje enviado. Te responderemos a la brevedad.';
    formStatus.className = 'form-note success';
    contactForm.reset();
    btn.disabled = false;
    btn.innerHTML = 'Enviar mensaje <img src="assets/arrow.svg" alt="" aria-hidden="true">';
  }, 1200);
});

// ── SMOOTH SCROLL FOR ANCHOR LINKS ────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = siteHeader ? siteHeader.offsetHeight : 70;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// ── HERO SCROLL EFFECTS ────────────────────────
// Only the hero copy fades and blurs. All later sections remain untouched.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroBgEl = document.getElementById('heroBg');
const heroEl = document.querySelector('.hero');

if (heroEl && !prefersReducedMotion) {
  let heroTicking = false;

  function applyHeroEffects() {
    const heroTop = heroEl.offsetTop;
    const heroHeight = Math.max(heroEl.offsetHeight, 1);
    const distance = Math.min(Math.max(window.scrollY - heroTop, 0), heroHeight);
    const progress = Math.min(distance / (heroHeight * 0.72), 1);
    const eased = progress * progress * (3 - 2 * progress);

    heroEl.style.setProperty('--hero-copy-opacity', String(1 - eased));
    heroEl.style.setProperty('--hero-copy-blur', String((eased * 9).toFixed(2)));
    heroEl.style.setProperty('--hero-copy-shift', String((-eased * 24).toFixed(2)));

    if (heroBgEl && window.innerWidth > 700) {
      heroBgEl.style.setProperty('--hero-parallax', String((-distance * 0.18).toFixed(2)));
    }
    heroTicking = false;
  }

  function requestHeroEffects() {
    if (heroTicking) return;
    heroTicking = true;
    requestAnimationFrame(applyHeroEffects);
  }

  window.addEventListener('scroll', requestHeroEffects, { passive: true });
  window.addEventListener('resize', requestHeroEffects, { passive: true });
  applyHeroEffects();
}

