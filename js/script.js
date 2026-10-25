/* ==========================================================================
   Jonel T. Lenteria — site behaviour
   Vanilla, no dependencies. Everything degrades gracefully without JS.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  /* ---------- Header state + scroll progress ---------- */

  (function scrollUi() {
    var header = $('[data-header]');
    var bar = $('[data-progress]');
    var toTop = $('[data-to-top]');
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (header) header.classList.toggle('is-stuck', y > 12);
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if (toTop) toTop.classList.toggle('is-visible', y > 700);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
    }
  }());

  /* ---------- Mobile navigation ---------- */

  (function nav() {
    var toggle = $('[data-nav-toggle]');
    var scrim = $('[data-nav-scrim]');
    var panel = $('#primary-nav');
    if (!toggle || !panel) return;

    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

      if (open) {
        requestAnimationFrame(function () {
          var first = $('a', panel);
          if (first && window.matchMedia('(max-width: 900px)').matches) first.focus({ preventScroll: true });
        });
      } else if (window.matchMedia('(max-width: 900px)').matches) {
        toggle.focus({ preventScroll: true });
      }
    }

    var isOpen = function () { return document.body.classList.contains('nav-open'); };

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a') && isOpen()) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) setOpen(false);
    });

    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches && isOpen()) setOpen(false);
    });
  }());

  /* ---------- Scrollspy ---------- */

  (function scrollspy() {
    var links = $$('[data-nav-link]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      sections.push(section);
    });

    var visible = new Set();

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      var current = sections.filter(function (s) { return visible.has(s.id); })[0];
      if (!current) return;

      links.forEach(function (l) {
        l.classList.remove('is-active');
        l.removeAttribute('aria-current');
      });
      if (map[current.id]) {
        map[current.id].classList.add('is-active');
        map[current.id].setAttribute('aria-current', 'true');
      }
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }());

  /* ---------- Reveal on scroll ---------- */

  (function reveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Stagger siblings so groups cascade instead of popping in together.
    var seen = new Map();
    items.forEach(function (el) {
      var parent = el.parentElement;
      var i = seen.get(parent) || 0;
      seen.set(parent, i + 1);
      el.style.setProperty('--reveal-delay', Math.min(i, 5) * 70 + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

    items.forEach(function (el) { io.observe(el); });
  }());

  /* ---------- Cursor spotlight on cards ---------- */

  (function spotlight() {
    if (reduced || !window.matchMedia('(hover: hover)').matches) return;

    var pending = null;
    var ticking = false;

    function flush() {
      ticking = false;
      if (!pending) return;
      var r = pending.card.getBoundingClientRect();
      pending.card.style.setProperty('--mx', (pending.x - r.left) + 'px');
      pending.card.style.setProperty('--my', (pending.y - r.top) + 'px');
      pending = null;
    }

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var card = e.target.closest && e.target.closest('[data-spotlight]');
      if (!card) return;

      pending = { card: card, x: e.clientX, y: e.clientY };
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(flush);
    }, { passive: true });
  }());

  /* ---------- Count-up stats ---------- */

  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;

    if (reduced || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        io.unobserve(el);

        var target = parseInt(el.dataset.count, 10) || 0;
        var suffix = el.dataset.suffix || '';
        var start = performance.now();
        var duration = 1200;

        (function step(now) {
          var t = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.6 });

    nodes.forEach(function (el) { io.observe(el); });
  }());

  /* ---------- Contact form ---------- */

  (function contact() {
    var form = $('[data-contact-form]');
    if (!form || !window.fetch) return;

    var btn = $('button[type="submit"]', form);
    var label = $('[data-contact-label]', form);
    var status = $('[data-contact-status]', form);
    var idle = label ? label.textContent : 'Send message';

    function setStatus(text, isError) {
      status.textContent = text;
      status.classList.toggle('is-error', !!isError);
    }

    // The server redirects back here without JS; surface that result.
    var sent = new URLSearchParams(window.location.search).get('sent');
    if (sent === '1') setStatus("Thanks! Your message is on its way — I'll get back to you soon.");
    else if (sent === '0') setStatus('Sorry, your message could not be sent. Please email me directly.', true);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });

      btn.disabled = true;
      if (label) label.textContent = 'Sending…';
      setStatus('');

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok || !body.ok) throw new Error(body.error || 'Something went wrong. Please try again.');
          });
        })
        .then(function () {
          form.reset();
          setStatus("Thanks! Your message is on its way — I'll get back to you soon.");
        })
        .catch(function (err) {
          setStatus(err && err.message && err.message !== 'Failed to fetch'
            ? err.message
            : 'Network error. Please try again, or email me directly.', true);
        })
        .then(function () {
          btn.disabled = false;
          if (label) label.textContent = idle;
        });
    });
  }());

  /* ---------- Theme toggle ---------- */

  (function theme() {
    var root = document.documentElement;
    var btn = $('[data-theme-toggle]');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!btn) return;

    function paint(theme) {
      root.dataset.theme = theme;
      var dark = theme !== 'light';
      var label = dark ? 'Switch to light theme' : 'Switch to dark theme';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      if (meta) meta.setAttribute('content', dark ? '#0b0d12' : '#f7f5f1');
    }

    paint(root.dataset.theme === 'light' ? 'light' : 'dark');

    btn.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      if (reduced || !document.startViewTransition) { paint(next); return; }
      document.startViewTransition(function () { paint(next); });
    });
  }());

  /* ---------- Footer year ---------- */

  (function year() {
    var el = $('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }());

})();
