/* ==========================================================================
   RankForImpact — progressive enhancement
   Nothing here is required for the page to be readable; it only adds polish.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     Sticky header background
     ---------------------------------------------------------------------- */
  var header = document.querySelector('.header');

  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
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
  Array.prototype.forEach.call(document.querySelectorAll('.brand__mark--art'), function (art) {
    var brand = art.closest ? art.closest('.brand') : art.parentNode;
    if (!brand) return;

    var adopt = function () {
      if (art.naturalWidth > 0) brand.classList.add('has-logo');
    };

    if (art.complete) adopt();
    else art.addEventListener('load', adopt);
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
     Scroll reveal
     ---------------------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) {
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

    Array.prototype.forEach.call(revealables, function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
