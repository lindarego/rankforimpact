/* ==========================================================================
   Cal.com element-click booking embed
   ==========================================================================

   Every "Book 15-min call" button on the site opens the booker in a modal.
   A button becomes a trigger by carrying three attributes, which the page
   generator adds for us:

     data-cal-link="rankforimpact/15min"
     data-cal-namespace="15min"
     data-cal-config='{"layout":"month_view", ...}'

   Those buttons also keep a real href, so without JavaScript the click still
   goes somewhere useful instead of doing nothing.

   If the event or namespace changes, update CAL_LINK / CAL_NS below and the
   matching values in gen.py, which stamps them onto the buttons.
   -------------------------------------------------------------------------- */
var CAL_LINK = 'rankforimpact/15min';
var CAL_NS = '15min';

/* The contact page mounts the calendar in the page instead of behind a click.
   Every other page only has the modal triggers. */
var CAL_INLINE_TARGET = '#my-cal-inline-15min';

/* Cal's own loader. Queues calls until app.cal.com/embed/embed.js arrives —
   the only third-party request the site makes. */
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
        cal.ns[namespace] = cal.ns[namespace] || api;
        p(cal.ns[namespace], ar);
        p(cal, ['initNamespace', namespace]);
      } else {
        p(cal, ar);
      }
      return;
    }
    p(cal, ar);
  };
})(window, 'https://app.cal.com/embed/embed.js', 'init');

Cal('init', CAL_NS, { origin: 'https://app.cal.com' });

Cal.config = Cal.config || {};
Cal.config.forwardQueryParams = true;

/* --------------------------------------------------------------------------
   Brand the modal into the site's palette: cream surfaces, deep green for the
   primary action and the selected day, gold on the emphasis and border states.

   These are Cal's own design tokens, so the whole widget follows rather than
   just the button colour.

   theme is pinned to light rather than the snippet's "auto": only the light set
   is defined here, and the site itself pins color-scheme: light, so following
   the visitor's OS would leave a dark modal wearing cream tokens.

   Green carries the primary action rather than gold — white on #c19a63 measures
   about 2.6:1, too weak for a button label. Gold does the emphasis work, where
   it is decoration rather than something to read. To flip them, swap cal-brand
   and cal-bg-emphasis.
   -------------------------------------------------------------------------- */
Cal.ns[CAL_NS]('ui', {
  hideEventTypeDetails: false,
  layout: 'month_view',
  theme: 'light',
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

/* --------------------------------------------------------------------------
   Inline booker — the contact page only

   Mounts the calendar into the page rather than waiting for a click. Guarded on
   the container being present because this file loads on every page: asking Cal
   to mount into a selector that matches nothing leaves it holding a booker with
   nowhere to go.

   No second `ui` call goes with this. Cal keeps one UI config per namespace, so
   repeating it here — as the embed snippet Cal hands out does — would replace
   the themed one above and take the cream and green palette with it. The inline
   embed and the modal triggers share that one config, which is what keeps them
   looking like the same product.
   -------------------------------------------------------------------------- */
if (document.querySelector(CAL_INLINE_TARGET)) {
  Cal.ns[CAL_NS]('inline', {
    elementOrSelector: CAL_INLINE_TARGET,
    calLink: CAL_LINK,
    config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true' }
  });
}
