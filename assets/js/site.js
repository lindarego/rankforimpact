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
  var artwork = document.querySelectorAll('.brand__mark--art');

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
    '.duo__copy .h2',
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
    ['.cta__copy, .cta__actions', 130],
    ['.footer__inner > *', 90],
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
     Ripple diagram — one business, the effects that follow
     Draws the curves between the branch labels, then answers the pointer with
     gold ripples: rings off the origin while the diagram is hovered, and a
     travelling pulse along whichever branch is under the cursor or focus.

     None of it carries meaning: every branch, step and label is real text in
     the markup, which the stylesheet lays out as a plain list below 900px, in
     print, and any time this code does not run.
     ---------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-ripple]'), function (root) {
    var canvas = root.querySelector('[data-ripple-canvas]');
    var branchEls = Array.prototype.slice.call(root.querySelectorAll('[data-ripple-branch]'));
    var originEl = root.querySelector('.ripple__origin');
    var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

    /* Bailing out leaves the stacked list in place: the diagram layout waits on
       the .ripple--on class set below, not on scripting being available. */
    if (!ctx || !branchEls.length) return;

    /* Colours come off the brand tokens rather than being restated here, so a
       palette change in the stylesheet carries into the drawing. Alpha rides
       on globalAlpha instead of being baked into colour strings. */
    var tokens = window.getComputedStyle(document.documentElement);
    var token = function (name, fallback) {
      return tokens.getPropertyValue(name).trim() || fallback;
    };
    var GOLD = token('--gold', '#c19a63');
    var GREEN = token('--green', '#123328');
    var INK = token('--ink', '#1c1c1a');

    /* Where the fan starts, per orientation: in from the left edge when it
       spreads to the right, down from the top when it spreads downward. */
    var ORIGINS = {
      landscape: [0.08, 0.5],
      portrait: [0.5, 0.08]
    };
    /* The stretch of curve the effects are spread over, per orientation. Wide,
       it starts clear of the origin — where all six branches are still bunched
       together — and stops short of the tip, which the branch's own name hangs
       over. Narrow, the name sits below the tip and the effects sit beside the
       curve instead, so they can run almost its whole length: they need that
       room, because three labels stacked down a branch take far more of it than
       three strung along one. */
    var SPANS = {
      landscape: [0.34, 0.62],
      portrait: [0.22, 0.86]
    };
    var GROW = 1.25; /* seconds for one curve to draw itself in */
    var STAGGER = 0.16;

    /* How hard each branch bows out of the fan. Uniform bows made six curves
       read as one mechanism repeated; varying them per branch keeps the spray
       irregular, which is what the endpoints in the markup are going for too. */
    var BOWS = [1, 0.72, 1.24, 0.86, 1.16, 0.94];

    /* Endpoints are read back from the same custom properties the stylesheet
       uses to place the label — --x/--y wide, --mx/--my narrow — so a curve can
       never end up pointing somewhere else. */
    var branches = [];
    branchEls.forEach(function (el) {
      var style = window.getComputedStyle(el);
      var read = function (prop, fallback) {
        var v = parseFloat(style.getPropertyValue(prop));
        return isNaN(v) ? fallback : v / 100;
      };
      var x = read('--x', NaN);
      var y = read('--y', NaN);
      if (isNaN(x) || isNaN(y)) return;
      branches.push({
        el: el,
        ends: {
          landscape: [x, y],
          portrait: [read('--mx', x), read('--my', y)]
        },
        bow: BOWS[branches.length % BOWS.length],
        nameEl: el.querySelector('.ripple__name'),
        /* One element per effect, in the order they sit along the curve. */
        stops: Array.prototype.slice.call(el.querySelectorAll('.ripple__step')),
        heat: 0
      });
    });

    if (!branches.length) return;

    /* From here the drawing is real, so the stylesheet may switch layouts.
       Set before first paint, so nothing reflows under the reader. */
    root.classList.add('ripple--on');

    /* The pinned labels fade in once the section arrives; is-live is what
       releases them. */
    var live = function () {
      root.classList.add('is-live');
    };

    var w = 0;
    var h = 0;
    var visible = false;
    var started = 0; /* rAF timestamp of the first frame, so growth is relative */
    var hover = 0; /* eased 0 → 1 while the pointer is over the diagram */
    var hoverTarget = 0;
    var hot = -1; /* index of the branch under the pointer or focus */
    var pulses = []; /* taps and clicks, drawn as a gold ring from the point */
    var raf = 0;
    var last = 0;

    /* The stylesheet owns the breakpoint and states the result as --orient, so
       the two never disagree about which way the fan is pointing. */
    var orient = 'landscape';
    var origin = ORIGINS.landscape;

    var endOf = function (b) {
      return b.ends[orient] || b.ends.landscape;
    };

    var measure = function () {
      var rect = canvas.getBoundingClientRect();
      /* Zero while the stacked layout is showing — the canvas is display:none
         there, and there is nothing to draw. */
      if (!rect.width || !rect.height) {
        w = h = 0;
        return false;
      }
      /* Capped at 2, past which the extra pixels cost more than they show. */
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      orient = window.getComputedStyle(root).getPropertyValue('--orient').trim() === 'portrait'
        ? 'portrait'
        : 'landscape';
      origin = ORIGINS[orient];
      layoutLabels();
      return true;
    };

    var clamp01 = function (v) {
      return v < 0 ? 0 : v > 1 ? 1 : v;
    };

    /* Where the nth of a branch's effects sits along its curve. */
    var stopAt = function (k, count) {
      var span = SPANS[orient] || SPANS.landscape;
      if (count < 2) return (span[0] + span[1]) / 2;
      return span[0] + (k / (count - 1)) * (span[1] - span[0]);
    };

    /* Control points for a branch. It leaves the origin almost square to the
       way the fan spreads, then bows off that line before settling on its
       label. The bow scales with how far the branch reaches, so a short one
       does not overshoot its own endpoint and hook back, and with the branch's
       own factor, so no two curves have quite the same shape.

       The two orientations are the same curve with the axes swapped: wide, the
       fan reaches along x and bows in y; narrow, it reaches along y and bows in
       x. Writing it once this way keeps both from drifting. */
    var curveOf = function (b) {
      var end = endOf(b);
      var ox = origin[0] * w;
      var oy = origin[1] * h;
      var tx = end[0] * w;
      var ty = end[1] * h;
      var dx = tx - ox;
      var dy = ty - oy;
      var down = orient === 'portrait';
      var reach = down ? dy / h : dx / w;
      var bow = (16 + 30 * Math.abs(reach)) * b.bow;

      if (down) {
        return [
          ox, oy,
          ox + dx * 0.1, oy + dy * 0.42,
          tx + (tx < ox ? -bow : bow), oy + dy * 0.74,
          tx, ty
        ];
      }
      return [
        ox, oy,
        ox + dx * 0.42, oy + dy * 0.1,
        ox + dx * 0.74, ty + (ty < oy ? -bow : bow),
        tx, ty
      ];
    };

    var pointOn = function (c, t) {
      var u = 1 - t;
      var a = u * u * u;
      var b = 3 * u * u * t;
      var d = 3 * u * t * t;
      var e = t * t * t;
      return [
        a * c[0] + b * c[2] + d * c[4] + e * c[6],
        a * c[1] + b * c[3] + d * c[5] + e * c[7]
      ];
    };

    /* Hands each effect the point on the curve it names, as an offset from the
       branch's node — which is the branch element's own position, so the
       stylesheet needs nothing but the two numbers. Positions only change with
       the box, so this runs on measure rather than on hover. */
    /* ---- Label placement -------------------------------------------------
       Nothing here is positioned by rule. Each label is offered a ring of
       places around the point it names and takes the cheapest one that clears
       the labels already down, the drawn curves, and the band's own edges — so
       a name never lands on a line and have its plate chop it, and no two
       labels sit on each other at any width or in either orientation.

       Effects are placed per branch against the six names, not against each
       other's branches: only one branch is ever traced, so two branches may
       reuse the same patch of air. */
    var RING = 16; /* directions tried around the anchor */
    var GAPS = [8, 14, 22, 32]; /* and how far out, in turn */

    var overlaps = function (a, b) {
      return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
    };

    /* Every curve, sampled densely enough that a label-sized box cannot slip
       between two points of a line that crosses it. */
    var curveInk = function () {
      var pts = [];
      branches.forEach(function (b) {
        var c = curveOf(b);
        for (var s = 0; s <= 72; s++) pts.push(pointOn(c, s / 72));
      });
      return pts;
    };

    var unit = function (dx, dy) {
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      return [dx / len, dy / len];
    };

    /* Places one label and returns the box it took, so later labels can avoid
       it. `wants` is the direction or directions it would rather sit in. */
    var place = function (el, ax, ay, wants, blockers, ink, relTo) {
      var lw = el.offsetWidth;
      var lh = el.offsetHeight;
      if (!lw || !lh) return null;
      var best = null;

      for (var d = 0; d < RING; d++) {
        var angle = (d / RING) * Math.PI * 2;
        var ux = Math.cos(angle);
        var uy = Math.sin(angle);
        /* How far the label's own box reaches this way, so the gap left around
           the point it names is the same in every direction. */
        var reach = (Math.abs(ux) * lw + Math.abs(uy) * lh) / 2;
        var aim = 0;
        for (var k = 0; k < wants.length; k++) {
          aim = Math.max(aim, ux * wants[k][0] + uy * wants[k][1]);
        }

        for (var g = 0; g < GAPS.length; g++) {
          var out = GAPS[g] + reach;
          var cx = ax + ux * out;
          var cy = ay + uy * out;
          var box = { l: cx - lw / 2, t: cy - lh / 2, r: cx + lw / 2, b: cy + lh / 2 };
          var cost = 0;

          if (box.l < 4 || box.t < 4 || box.r > w - 4 || box.b > h - 4) cost += 900;
          for (var i = 0; i < blockers.length; i++) {
            if (overlaps(box, blockers[i])) cost += 300;
          }
          for (var p = 0; p < ink.length; p++) {
            if (ink[p][0] > box.l && ink[p][0] < box.r && ink[p][1] > box.t && ink[p][1] < box.b) {
              cost += 5;
            }
          }
          /* Then the preferences, weighted so a label would rather graze a line
             than drift away from the node it names — a word floating in open air
             belongs to nothing, which is worse than a line passing behind it. */
          cost += (1 - aim) * 45 + g * 22;

          if (!best || cost < best.cost) {
            best = { cost: cost, x: cx - ax, y: cy - ay, box: box };
          }
        }
      }

      if (!best) return null;
      var rx = relTo ? relTo[0] : ax;
      var ry = relTo ? relTo[1] : ay;
      el.style.setProperty('--lx', Math.round(ax + best.x - rx) + 'px');
      el.style.setProperty('--ly', Math.round(ay + best.y - ry) + 'px');
      return best.box;
    };

    var layoutLabels = function () {
      var ink = curveInk();
      var ox = origin[0] * w;
      var oy = origin[1] * h;
      var taken = [];

      /* The origin label goes first, facing back the way the fan came from. */
      if (originEl) {
        originEl.style.setProperty('--ox', Math.round(ox) + 'px');
        originEl.style.setProperty('--oy', Math.round(oy) + 'px');
        var away = [0, 0];
        branches.forEach(function (b) {
          var end = endOf(b);
          away[0] += ox - end[0] * w;
          away[1] += oy - end[1] * h;
        });
        var box = place(originEl, ox, oy, [unit(away[0], away[1])], [], ink);
        if (box) taken.push(box);
      }

      /* Then the names, each carrying on the way its own branch was heading. */
      var names = [];
      branches.forEach(function (b) {
        var c = curveOf(b);
        var tip = pointOn(c, 1);
        var back = pointOn(c, 0.94);
        var nameBox = place(
          b.nameEl,
          tip[0], tip[1],
          [unit(tip[0] - back[0], tip[1] - back[1])],
          taken,
          ink
        );
        if (nameBox) {
          taken.push(nameBox);
          names.push(nameBox);
        }
      });

      /* Then each branch's effects, which would rather sit off to the side of
         the curve than along it — either side, whichever is clear. */
      branches.forEach(function (b) {
        var c = curveOf(b);
        var end = endOf(b);
        var nx = end[0] * w;
        var ny = end[1] * h;
        var siblings = [];

        b.stops.forEach(function (stopEl, k) {
          var t = stopAt(k, b.stops.length);
          var at = pointOn(c, t);
          var ahead = pointOn(c, Math.min(1, t + 0.04));
          var behind = pointOn(c, Math.max(0, t - 0.04));
          var along = unit(ahead[0] - behind[0], ahead[1] - behind[1]);
          var side = [[-along[1], along[0]], [along[1], -along[0]]];
          /* Positioned against the branch's node, not the point it names, so the
             offset is written relative to that. */
          var box = place(stopEl, at[0], at[1], side, taken.concat(siblings), ink, [nx, ny]);
          if (box) siblings.push(box);
        });
      });
    };

    var line = function (c, upto, color, alpha, width) {
      if (upto <= 0 || alpha <= 0.004) return;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (var s = 0; s <= 48; s++) {
        var p = pointOn(c, (s / 48) * upto);
        if (s === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    var dot = function (x, y, r, color, alpha) {
      if (alpha <= 0.004) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    var ring = function (x, y, r, color, alpha) {
      if (alpha <= 0.004 || r <= 0) return;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    var render = function (el) {
      ctx.clearRect(0, 0, w, h);
      var ox = origin[0] * w;
      var oy = origin[1] * h;

      branches.forEach(function (b, i) {
        /* A reduced-motion reader gets the finished diagram, not the drawing
           of it — the curves are already in place on the first frame. */
        var t = reduce ? 1 : clamp01((el - i * STAGGER) / GROW);
        if (t <= 0) return;
        var grown = t * t * (3 - 2 * t); /* smoothstep, so the line eases in */
        var c = curveOf(b);

        line(c, grown, GREEN, 0.32, 1);
        line(c, grown, GOLD, b.heat * 0.9, 1.4);

        for (var k = 0; k < b.stops.length; k++) {
          var at = stopAt(k, b.stops.length);
          if (at > grown) break;
          var stop = pointOn(c, at);
          dot(stop[0], stop[1], 1.8, INK, 0.34 * (1 - b.heat));
          dot(stop[0], stop[1], 2.1, GOLD, b.heat);
          /* Each step sends out its own ring, a beat behind the one before it,
             so the eye travels the branch in the order the words are listed. */
          if (!reduce && b.heat > 0.01) {
            var s = (el * 0.5 + k * 0.33) % 1;
            ring(stop[0], stop[1], 5 + s * 26, GOLD, b.heat * 0.5 * (1 - s));
          }
        }

        if (grown < 0.999) return;
        var tip = pointOn(c, 1);
        dot(tip[0], tip[1], 3.2, GREEN, 0.85 * (1 - b.heat));
        dot(tip[0], tip[1], 3.2 + b.heat * 1.4, GOLD, b.heat);

        if (reduce) return;
        if (b.heat > 0.01) {
          var out = (el * 0.45) % 1;
          ring(tip[0], tip[1], 6 + out * 40, GOLD, b.heat * 0.45 * (1 - out));
        }
        /* One gold pulse runs each branch while the diagram is hovered, and
           runs brighter on the branch actually being read. */
        if (hover > 0.01) {
          var travel = (el * 0.24 + i * 0.16) % 1;
          var q = pointOn(c, travel);
          dot(q[0], q[1], 2.4, GOLD, hover * (0.28 + b.heat * 0.55));
        }
      });

      dot(ox, oy, 5, GREEN, 1);
      /* Rings off the origin are the hover state itself: at rest the diagram
         is a still drawing, which is also why the loop can stop. They reach as
         far as the nearest edge allows — turned upright the origin sits near the
         top of the band, and a ring cut off by the hairline reads as a mistake
         rather than a ripple. */
      if (!reduce && hover > 0.01) {
        var reach = Math.min(83, Math.min(ox, oy, w - ox, h - oy) * 0.95);
        for (var r = 0; r < 3; r++) {
          var spread = (el * 0.28 + r / 3) % 1;
          ring(ox, oy, 9 + spread * (reach - 9), GOLD, hover * 0.38 * (1 - spread));
        }
      }

      for (var p = 0; p < pulses.length; p++) {
        ring(pulses[p].x, pulses[p].y, 6 + pulses[p].t * 90, GOLD, 0.5 * (1 - pulses[p].t));
      }
    };

    var settling = function () {
      if (hover !== hoverTarget || pulses.length) return true;
      for (var i = 0; i < branches.length; i++) {
        if (branches[i].heat !== (i === hot ? 1 : 0)) return true;
      }
      return false;
    };

    var needsFrame = function () {
      if (!visible || !w) return false;
      /* Still drawing itself in? */
      if ((last - started) / 1000 < branches.length * STAGGER + GROW) return true;
      return hover > 0 || settling();
    };

    var frame = function (now) {
      raf = 0;
      if (!started) started = now;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;

      /* Eased towards their targets and snapped on arrival, so the values
         settle exactly and the loop has a frame it can stop on. */
      hover += (hoverTarget - hover) * Math.min(1, dt * 7);
      if (Math.abs(hoverTarget - hover) < 0.01) hover = hoverTarget;
      branches.forEach(function (b, i) {
        var target = i === hot ? 1 : 0;
        b.heat += (target - b.heat) * Math.min(1, dt * 9);
        if (Math.abs(target - b.heat) < 0.01) b.heat = target;
      });
      pulses = pulses.filter(function (pulse) {
        pulse.t += dt * 0.9;
        return pulse.t < 1;
      });

      render((now - started) / 1000);
      if (needsFrame()) raf = requestAnimationFrame(frame);
    };

    /* With motion reduced there is no loop at all: the finished diagram is
       painted once, and again whenever the hover state or the size changes. */
    var paint = function () {
      if (!w) return;
      hover = hoverTarget;
      branches.forEach(function (b, i) {
        b.heat = i === hot ? 1 : 0;
      });
      pulses = [];
      render(0);
    };

    var run = function () {
      if (!w) return;
      if (reduce) {
        paint();
        return;
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };

    var setHot = function (i) {
      if (hot === i) return;
      hot = i;
      /* While one branch is being read the rest of the fan steps back, which is
         also what keeps a pinned effect off a neighbour's name. */
      root.classList.toggle('is-tracing', i > -1);
      run();
    };

    root.addEventListener('pointerenter', function () {
      hoverTarget = 1;
      run();
    });

    /* pointerenter fires once on the way in, so a pointer that was already
       resting over the section when it scrolled back into view would find the
       ripples switched off. The first move re-arms them. */
    root.addEventListener(
      'pointermove',
      function () {
        if (hoverTarget === 1) return;
        hoverTarget = 1;
        run();
      },
      { passive: true }
    );

    root.addEventListener('pointerleave', function () {
      hoverTarget = 0;
      setHot(-1);
      run();
    });

    /* A tap or click drops a ring where it landed — the one piece of the
       effect a touch reader would otherwise never see. */
    root.addEventListener('pointerdown', function (event) {
      if (!w || reduce) return;
      var rect = canvas.getBoundingClientRect();
      pulses.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        t: 0
      });
      if (pulses.length > 6) pulses.shift();
      hoverTarget = 1;
      run();
    });

    branches.forEach(function (b, i) {
      b.el.addEventListener('pointerenter', function () {
        setHot(i);
      });
      b.el.addEventListener('pointerleave', function () {
        if (hot === i) setHot(-1);
      });
      /* Keyboard readers get the same branch lit as they tab through it. */
      b.el.addEventListener('focus', function () {
        hoverTarget = 1;
        setHot(i);
      });
      b.el.addEventListener('blur', function () {
        if (hot !== i) return;
        hoverTarget = 0;
        setHot(-1);
      });
    });

    var resizing = false;
    window.addEventListener(
      'resize',
      function () {
        if (resizing) return;
        resizing = true;
        requestAnimationFrame(function () {
          resizing = false;
          if (measure()) run();
        });
      },
      { passive: true }
    );

    measure();

    /* Placement is measured off the labels themselves, so it is worth redoing
       once the brand faces have replaced the fallback metrics. */
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(function () {
        if (measure()) {
          if (reduce) paint();
          else run();
        }
      });
    }

    if (reduce || !('IntersectionObserver' in window)) {
      visible = true;
      live();
      paint();
    } else {
      /* The curves draw themselves in when the section arrives, and the loop
         idles whenever it is off screen. */
      var rippleObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting;
            if (!visible) {
              /* Nothing can be hovering a section that is off screen, and a
                 hover left switched on would keep the loop awake. */
              hoverTarget = 0;
              setHot(-1);
              return;
            }
            live();
            if (!w) measure();
            run();
          });
        },
        { threshold: 0.15 }
      );
      rippleObserver.observe(root);
    }
  });

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
