(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var progress = document.querySelector('.scroll-progress');
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('primary-nav');

  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (progress) {
      var max = root.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (nav.classList.contains('is-open') && !header.contains(event.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (event) {
      if (event.matches) setOpen(false);
    });
  }

  var revealItems = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealItems.forEach(function (el) { revealer.observe(el); });
  }

  if (nav && 'IntersectionObserver' in window) {
    var here = location.pathname.replace(/index\.html$/, '');
    var spyLinks = {};
    nav.querySelectorAll('a[href*="#"]').forEach(function (link) {
      var url = new URL(link.href, location.href);
      if (url.pathname.replace(/index\.html$/, '') === here && url.hash.length > 1) {
        spyLinks[url.hash.slice(1)] = link;
      }
    });
    var ids = Object.keys(spyLinks);
    if (ids.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          ids.forEach(function (id) { spyLinks[id].classList.toggle('is-active', id === entry.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ids.forEach(function (id) {
        var section = document.getElementById(id);
        if (section) spy.observe(section);
      });
      var top = document.getElementById('top');
      if (top) {
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) ids.forEach(function (id) { spyLinks[id].classList.remove('is-active'); });
        }, { rootMargin: '-45% 0px -50% 0px' }).observe(top);
      }
    }
  }
})();
