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

  // -------- Smooth scroll for anchor links --------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
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

  // -------- FAQ: ensure only one open at a time (optional) --------
  // Native <details> already toggles; we just animate.

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

    function validate(key, opts) {
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

      // Simulate submission
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
  function onScroll() {
    const y = window.pageYOffset;
    const show = y > 200;
    if (urgent) urgent.style.opacity = show ? '1' : '0';
    if (urgent) urgent.style.pointerEvents = show ? 'auto' : 'none';
    if (bottomCta) bottomCta.style.transform = show ? 'translateY(0)' : 'translateY(110%)';
  }
  if (urgent) urgent.style.transition = 'opacity .25s ease';
  if (bottomCta) {
    bottomCta.style.transition = 'transform .25s ease';
    bottomCta.style.transform = 'translateY(110%)';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
