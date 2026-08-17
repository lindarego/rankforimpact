/* ==========================================================================
   RankForImpact — progressive enhancement
   Nothing here is required for the page to be readable; it only adds polish.
   ========================================================================== */
(function () {
  'use strict';

  /* Marks the document as script-enabled. Every motion rule in the stylesheet
     is gated behind this, so the page renders fully visible without JS. */
  document.documentElement.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     Sticky header state + reading progress
     ---------------------------------------------------------------------- */
  var header = document.querySelector('.header');
  var progress = document.querySelector('.scroll-progress span');

  if (header || progress) {
    var syncHeader = function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-stuck', y > 12);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }
    };

    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          syncHeader();
          ticking = false;
        });
      },
      { passive: true }
    );
    syncHeader();
  }

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  if (toggle && nav) {
    var setNav = function (open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', function () {
      setNav(!document.body.classList.contains('nav-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setNav(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) setNav(false);
    });
  }

  /* ----------------------------------------------------------------------
     Monogram
     The header and footer show a typographic lockup by default and upgrade
     to the real artwork once assets/img/logo.svg loads. Adding the file is
     the only step — no markup change required.
     ---------------------------------------------------------------------- */
  var artwork = document.querySelectorAll('.brand__mark--art, .brand__full');

  Array.prototype.forEach.call(artwork, function (art) {
    var brand = art.closest ? art.closest('.brand') : art.parentNode;
    if (!brand) return;

    var adopt = function () {
      brand.classList.add('has-logo');
    };

    /* A fired load event is the reliable signal that the artwork decoded;
       naturalWidth alone is unsafe here because a srcset `w` descriptor
       scales it by the computed density. */
    art.addEventListener('load', adopt);
    art.addEventListener('error', function () {
      brand.classList.remove('has-logo');
    });

    if (art.complete && art.naturalWidth > 0) adopt();
  });

  /* ----------------------------------------------------------------------
     Photography placeholders
     A .frame falls back to its art-direction placeholder whenever the
     photograph is missing. Drop the real file in assets/img/ and it takes
     over automatically — no markup change needed.
     ---------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.frame'), function (frame) {
    var img = frame.querySelector('img');

    if (!img || !img.getAttribute('src')) {
      frame.classList.add('is-empty');
      return;
    }

    var markEmpty = function () {
      frame.classList.add('is-empty');
    };
    var markFilled = function () {
      frame.classList.remove('is-empty');
    };

    if (img.complete) {
      if (img.naturalWidth > 0) markFilled();
      else markEmpty();
      return;
    }

    img.addEventListener('error', markEmpty);
    img.addEventListener('load', markFilled);
  });

  /* ----------------------------------------------------------------------
     Headings become masked lines
     One mask line per heading, so it rides up as a block from behind its own
     clip. Applied site-wide from this list rather than tagged per heading in
     the markup. A heading whose lines are split by hand (the homepage hero)
     already contains .mask-line and is skipped.
     ---------------------------------------------------------------------- */
  var MASK_TARGETS = [
    '[data-mask-auto]',
    '.hero__copy .display',
    '.hero__copy .h1',
    '.wrap > .h1',
    '.wrap > .h2',
    '.pillars-head .h2',
    '.duo__copy .h2',
    '.mission__inner .h2',
    '.cta__copy .h2',
    '.quote blockquote'
  ].join(',');

  Array.prototype.forEach.call(
    document.querySelectorAll(MASK_TARGETS),
    function (h) {
      if (h.querySelector('.mask-line')) return;
      var line = document.createElement('span');
      line.className = 'mask-line';
      var inner = document.createElement('span');
      while (h.firstChild) inner.appendChild(h.firstChild);
      line.appendChild(inner);
      h.appendChild(line);
      h.setAttribute('data-mask', '');
    }
  );

  /* ----------------------------------------------------------------------
     Scroll reveal, staggered per group
     ---------------------------------------------------------------------- */
  [
    ['.hero__copy > .eyebrow, .hero__copy .prose > *, .hero__copy .btn-row', 90],
    ['.cards .card', 120],
    ['.pillars .pillar', 90],
    ['.mission__inner > *', 80],
    ['.collage .tile', 120],
    ['.cta__copy, .cta__actions', 130],
    ['.footer__grid > *', 90],
    ['.rows > .row', 60],
    ['.posts .post', 100]
  ].forEach(function (group) {
    Array.prototype.forEach.call(
      document.querySelectorAll(group[0]),
      function (el, i) {
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--d', i * group[1] + 'ms');
      }
    );
  });

  var animated = document.querySelectorAll('.reveal, [data-reveal], [data-mask]');

  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(animated, function (el) {
      el.classList.add('is-in');
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    );

    Array.prototype.forEach.call(animated, function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     Active nav link follows the visible section (in-page anchors only)
     ---------------------------------------------------------------------- */
  var spyLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__link[href^="#"]')
  );
  var spyTargets = spyLinks
    .map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spyTargets.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          spyLinks.forEach(function (a) {
            a.classList.toggle(
              'is-active',
              a.getAttribute('href') === '#' + entry.target.id
            );
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    spyTargets.forEach(function (t) {
      spy.observe(t);
    });
  }

  /* ----------------------------------------------------------------------
     Hero video
     The loop is decoration, so a reduced-motion preference freezes it on its
     first frame rather than removing the picture.
     ---------------------------------------------------------------------- */
  if (reduce) {
    Array.prototype.forEach.call(
      document.querySelectorAll('.hero__video video'),
      function (video) {
        video.removeAttribute('autoplay');
        video.autoplay = false;
        video.pause();
      }
    );
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
