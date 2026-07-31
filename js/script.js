/* ==========================================================================
   Jonel T. Lenteria — site behaviour
   Vanilla, no dependencies. Everything degrades gracefully without JS.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Theme toggle ---------- */

  (function theme() {
    var btn = $('[data-theme-toggle]');
    if (!btn) return;

    function label() {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    }
    label();

    function apply() {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      label();
    }

    btn.addEventListener('click', function () {
      // Circular wipe where supported; a plain swap everywhere else.
      if (reduced || !document.startViewTransition) { apply(); return; }
      document.startViewTransition(apply);
    });
  }());

  /* ---------- Header state + scroll progress ---------- */

  (function scrollUi() {
    var header = $('[data-header]');
    var bar = $('[data-progress]');
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;

      if (header) header.classList.toggle('is-stuck', y > 8);

      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
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
      document.body.style.overflow = open ? 'hidden' : '';

      if (open) {
        // The panel is visibility:hidden until the class lands, and hidden
        // elements can't take focus — so wait for the style recalc.
        requestAnimationFrame(function () {
          var first = $('a', panel);
          if (first) first.focus();
        });
      } else {
        toggle.focus();
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

    // Reset if the viewport grows past the mobile breakpoint while open.
    window.matchMedia('(min-width: 821px)').addEventListener('change', function (e) {
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

      // Highest section currently in the spy band wins.
      var current = sections.filter(function (s) { return visible.has(s.id); })[0];
      if (!current) return;

      links.forEach(function (l) { l.classList.remove('is-active'); });
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
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
      el.style.setProperty('--reveal-delay', Math.min(i, 7) * 80 + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

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

  /* ---------- Role rotator ---------- */

  (function rotator() {
    var el = $('[data-rotator]');
    if (!el) return;

    var words = (el.dataset.words || '').split(',').map(function (w) { return w.trim(); }).filter(Boolean);
    if (words.length < 2) return;

    if (reduced) {
      // No typing effect — just swap the text on a slow timer.
      var n = 0;
      setInterval(function () {
        n = (n + 1) % words.length;
        el.textContent = words[n];
      }, 3500);
      return;
    }

    var i = 0, pos = words[0].length, deleting = false;

    function tick() {
      var word = words[i];
      pos += deleting ? -1 : 1;
      el.textContent = word.slice(0, pos);

      var wait = deleting ? 40 : 75;

      if (!deleting && pos === word.length) {
        deleting = true;
        wait = 1900;
      } else if (deleting && pos === 0) {
        deleting = false;
        i = (i + 1) % words.length;
        wait = 320;
      }

      setTimeout(tick, wait);
    }

    setTimeout(tick, 2200);
  }());

  /* ---------- Count-up stats ---------- */

  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length || reduced || !('IntersectionObserver' in window)) return;

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
    }, { threshold: 0.5 });

    nodes.forEach(function (el) {
      el.textContent = '0' + (el.dataset.suffix || '');
      io.observe(el);
    });
  }());

  /* ---------- Footer year ---------- */

  (function year() {
    var el = $('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }());

})();
