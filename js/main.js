/* 東京都 水道手続き窓口 LP - main.js */
(function () {
  'use strict';

  // -------- Hamburger menu --------
  const hamburger = document.querySelector('.hamburger');
  const menu = document.getElementById('main-menu');
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -------- Smooth scroll for in-page anchor links --------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      // Don't intercept modal close-anchors
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // -------- Modals --------
  const openTriggers = document.querySelectorAll('[data-modal]');
  let lastFocus = null;
  function openModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const panel = modal.querySelector('.modal__panel');
    if (panel) panel.scrollTop = 0;
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  openTriggers.forEach((el) => {
    el.addEventListener('click', (e) => {
      const id = el.getAttribute('data-modal');
      if (!id) return;
      e.preventDefault();
      openModal(id);
    });
  });
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]') || e.target.closest('[data-close]')) {
        // For CTA links that have data-close + href, allow navigation after close
        const closer = e.target.closest('[data-close]');
        if (closer && closer.tagName === 'A' && closer.getAttribute('href') && closer.getAttribute('href') !== '#') {
          // close then navigate
          closeModal(modal);
          // smooth scroll handled by anchor listener
          return;
        }
        e.preventDefault();
        closeModal(modal);
      }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal:not([hidden])').forEach((m) => closeModal(m));
    }
  });

  // -------- Form validation --------
  const form = document.getElementById('app-form');
  if (form) {
    const fields = {
      date:  form.querySelector('[name="start_date"]'),
      name:  form.querySelector('[name="full_name"]'),
      phone: form.querySelector('[name="phone"]'),
      email: form.querySelector('[name="email"]'),
    };
    const errors = {
      date:  form.querySelector('#err-date'),
      name:  form.querySelector('#err-name'),
      phone: form.querySelector('#err-phone'),
      email: form.querySelector('#err-email'),
    };
    const phoneRe = /^0\d{9,10}$/;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(key, msg) {
      const wrap = fields[key].closest('.field');
      if (msg) {
        wrap.classList.add('has-error');
        if (errors[key]) errors[key].textContent = msg;
      } else {
        wrap.classList.remove('has-error');
        if (errors[key]) errors[key].textContent = '';
      }
    }

    function validate(key) {
      const val = (fields[key].value || '').trim();
      switch (key) {
        case 'date':
          if (!val) return '使用開始希望日を入力してください';
          return '';
        case 'name':
          if (!val) return 'お名前を入力してください';
          return '';
        case 'phone':
          if (!val) return '電話番号を入力してください';
          if (!phoneRe.test(val)) return 'ハイフンなしの半角数字10〜11桁で入力してください';
          return '';
        case 'email':
          if (!val) return '';
          if (!emailRe.test(val)) return '正しいメールアドレスを入力してください';
          return '';
      }
      return '';
    }

    Object.keys(fields).forEach((k) => {
      if (!fields[k]) return;
      fields[k].addEventListener('input', () => {
        if (fields[k].closest('.field').classList.contains('has-error')) {
          setError(k, validate(k));
        }
      });
      fields[k].addEventListener('blur', () => {
        setError(k, validate(k));
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstError = null;
      Object.keys(fields).forEach((k) => {
        const msg = validate(k);
        setError(k, msg);
        if (msg && !firstError) firstError = fields[k];
      });
      if (firstError) {
        firstError.focus({ preventScroll: false });
        const r = firstError.getBoundingClientRect();
        window.scrollTo({ top: r.top + window.pageYOffset - 80, behavior: 'smooth' });
        return;
      }

      const btn = form.querySelector('.form-submit');
      btn.classList.add('loading');
      btn.disabled = true;

      setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'form_submit' });
        }
        const ok = document.getElementById('form-success');
        if (ok) {
          ok.classList.add('show');
          const r = ok.getBoundingClientRect();
          window.scrollTo({ top: r.top + window.pageYOffset - 100, behavior: 'smooth' });
        }
        form.reset();
      }, 900);
    });
  }

  // -------- Urgent bubble & sticky footer reveal on scroll --------
  const urgent = document.querySelector('.urgent');
  const bottomCta = document.querySelector('.bottom-cta');

  // JST 10:00 - 19:00 check
  function isUrgentHours() {
    const now = new Date();
    // Convert current time to JST regardless of viewer timezone
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const jst = new Date(utcMs + 9 * 60 * 60000);
    const h = jst.getHours();
    return h >= 10 && h < 19;
  }
  const inHours = isUrgentHours();
  if (urgent && !inHours) {
    urgent.style.display = 'none';
  }

  let urgentReady = false;
  // Reveal urgent only after a delay AND after the user scrolls a bit
  if (urgent && inHours) {
    setTimeout(() => { urgentReady = true; updateFloaters(); }, 2200);
  }

  function updateFloaters() {
    const y = window.pageYOffset;
    const showFooter = y > 200;
    if (bottomCta) bottomCta.style.transform = showFooter ? 'translateY(0)' : 'translateY(110%)';
    if (urgent && urgentReady && inHours) {
      const showUrgent = y > 240;
      urgent.classList.toggle('is-shown', showUrgent);
    }
  }
  if (bottomCta) {
    bottomCta.style.transition = 'transform .25s ease';
    bottomCta.style.transform = 'translateY(110%)';
  }
  window.addEventListener('scroll', updateFloaters, { passive: true });
  updateFloaters();

  // -------- Reveal-on-scroll --------
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '-10% 0px' });
  revealEls.forEach((el) => io.observe(el));
})();
