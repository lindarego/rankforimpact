/* ==========================================================================
   Cal.com inline booking embed — contact page only
   ==========================================================================

   CAL_LINK is the live booking event — whatever follows cal.com/ in the URL.
   This one resolves to https://cal.com/rankforimpact/15min.

   If the event ever changes, update the fallback <a href> in contact.html to
   match: that link is what visitors get when the widget cannot mount.
*/
var CAL_LINK = 'rankforimpact/15min';

/* --------------------------------------------------------------------------
   Nothing below needs editing.

   The loader is Cal's documented snippet. It injects app.cal.com/embed/embed.js
   and queues calls until that arrives — the only third-party request the site
   makes, and only on this page.

   If the script never loads, no iframe is created and the .booker__fallback
   link stays visible (see the :has() rule in site.css), so the page still
   offers a way to book.
   -------------------------------------------------------------------------- */
(function (C, A, L) {
  var p = function (a, ar) { a.q.push(ar); };
  var d = C.document;
  C.Cal = C.Cal || function () {
    var cal = C.Cal;
    var ar = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      d.head.appendChild(d.createElement('script')).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      var api = function () { p(api, arguments); };
      var namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === 'string') {
        cal.ns[namespace] = api;
        p(api, ar);
      } else {
        p(cal, ar);
      }
      return;
    }
    p(cal, ar);
  };
})(window, 'https://app.cal.com/embed/embed.js', 'init');

Cal('init', { origin: 'https://cal.com' });

Cal('inline', {
  elementOrSelector: '#cal-booking',
  calLink: CAL_LINK,
  layout: 'month_view'
});

/* Brand the widget into the site's palette: cream surfaces, deep green for the
   primary action and the selected day, gold on the emphasis states.

   These are Cal's own design tokens, so the whole widget follows rather than
   just the button colour. `theme: 'light'` is pinned deliberately — only the
   light set is defined below, so letting it follow the visitor's OS would leave
   a dark widget with cream tokens.

   Green carries the primary action rather than gold: white on #c19a63 measures
   about 2.6:1, which is too weak for a button label. Gold does the emphasis and
   hover work instead, where it is decoration rather than something to read.
   To flip them, swap cal-brand and cal-bg-emphasis. */
Cal('ui', {
  theme: 'light',
  layout: 'month_view',
  hideEventTypeDetails: false,
  cssVarsPerTheme: {
    light: {
      /* Primary action, selected day */
      'cal-brand': '#123328',
      'cal-brand-emphasis': '#0d2620',
      'cal-brand-text': '#ffffff',

      /* Surfaces, lightest to deepest */
      'cal-bg': '#faf8f3',
      'cal-bg-subtle': '#f4f0e8',
      'cal-bg-muted': '#ece5d7',
      'cal-bg-emphasis': '#c19a63',
      'cal-bg-inverted': '#123328',

      /* Type */
      'cal-text-emphasis': '#123328',
      'cal-text': '#1c1c1a',
      'cal-text-subtle': '#5b5b55',
      'cal-text-muted': '#6f6f67',
      'cal-text-inverted': '#ffffff',

      /* Rules */
      'cal-border-emphasis': '#c19a63',
      'cal-border': '#ddd7cb',
      'cal-border-subtle': '#e7e2d6',
      'cal-border-muted': '#ece5d7',
      'cal-border-booker': '#ddd7cb'
    }
  }
});
