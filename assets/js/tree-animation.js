/* ==========================================================================
   Tree animation
   Three cross-faded hero lines, then a tree grows, branches into the research
   fields, and a moth lifts off — all scrubbed by the scrollbar.
   ========================================================================== */

gsap.registerPlugin(Observer, SplitText, DrawSVGPlugin, MotionPathPlugin, ScrollTrigger, CustomEase);

CustomEase.create('yButterfly', '.17,.17,.43,1');
CustomEase.create('butterflyShow', '.17,.17,.46,1');
CustomEase.create('butterflyDown', '.53,0,.49,1');
CustomEase.create('butterflyUp', '.73,0,.41,1');
CustomEase.create('yButterflyDown', '.68,0,.43,1');
CustomEase.create('butterflyHide', '.68,0,0,1');
CustomEase.create('clip', '.57,0,.43,1');

/* --------------------------------------------------------------------------
   1. The hero tree, grown procedurally
   Green canopy, trunk shading from dark bark at the root to pale beige twigs.
   -------------------------------------------------------------------------- */
const HERO_TREE = {
  seed: 42,
  /* The frame the grown tree is fitted into — short enough to clear the
     headline above it. */
  width: 1900,
  height: 660,
  padding: 24,
  maxDepth: 9,
  rootLength: 175,
  lengthDecay: 0.75,
  rootWidth: 48,
  widthDecay: 0.72,
  spread: 24,
  jitter: 11,
  /* Root → twig, in three stops. */
  bark: [
    [0x5a, 0x3a, 0x21],
    [0x8f, 0x6a, 0x45],
    [0xc8, 0xad, 0x84],
  ],
  greens: ['#1c4a33', '#255c3e', '#2f6f4a', '#3f8a51', '#4b8b4f', '#6ea55f', '#8ab866'],
};

/* A seeded PRNG, so the tree is the same shape on every reload. */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function growHeroTree(svg) {
  if (!svg) return;

  const cfg = HERO_TREE;
  const rnd = mulberry32(cfg.seed);
  const round = (n) => Math.round(n * 10) / 10;

  const branches = [];
  const leaves = [];
  const canopy = [];
  const box = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };

  function note(x, y, pad) {
    box.minX = Math.min(box.minX, x - pad);
    box.maxX = Math.max(box.maxX, x + pad);
    box.minY = Math.min(box.minY, y - pad);
    box.maxY = Math.max(box.maxY, y + pad);
  }

  function barkAt(t) {
    const stops = cfg.bark;
    const pos = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
    const i = Math.min(Math.floor(pos), stops.length - 2);
    const f = pos - i;
    const mix = stops[i].map((c, k) => Math.round(c + (stops[i + 1][k] - c) * f));
    return `rgb(${mix[0]},${mix[1]},${mix[2]})`;
  }

  function leafCluster(x, y, angle, count) {
    for (let i = 0; i < count; i++) {
      const spin = angle + (rnd() - 0.5) * 90;
      const dist = rnd() * 26;
      const rad = (angle + (rnd() - 0.5) * 140) * (Math.PI / 180);
      const rx = 16 + rnd() * 20;
      const cx = round(x + Math.cos(rad) * dist);
      const cy = round(y + Math.sin(rad) * dist);
      note(cx, cy, rx);
      leaves.push(
        `<ellipse cx="${cx}" cy="${cy}" rx="${round(rx)}" ry="${round(rx * (0.45 + rnd() * 0.2))}"` +
          ` transform="rotate(${round(spin)} ${cx} ${cy})"` +
          ` fill="${cfg.greens[Math.floor(rnd() * cfg.greens.length)]}"` +
          ` fill-opacity="${round(0.68 + rnd() * 0.3)}"/>`
      );
    }
  }

  function grow(x, y, angle, len, width, depth) {
    const rad = angle * (Math.PI / 180);
    const x2 = x + Math.cos(rad) * len;
    const y2 = y + Math.sin(rad) * len;

    /* Bow each limb a little so nothing reads as a straight line. */
    const bend = (rnd() - 0.5) * len * 0.32;
    const mx = (x + x2) / 2 + Math.cos(rad + Math.PI / 2) * bend;
    const my = (y + y2) / 2 + Math.sin(rad + Math.PI / 2) * bend;

    note(x2, y2, width / 2);

    branches.push(
      `<path d="M${round(x)} ${round(y)}Q${round(mx)} ${round(my)} ${round(x2)} ${round(y2)}"` +
        ` stroke="${barkAt(depth / cfg.maxDepth)}" stroke-width="${round(width)}" stroke-linecap="round"/>`
    );

    if (depth >= cfg.maxDepth) {
      leafCluster(x2, y2, angle, 5);
      if (rnd() < 0.3) canopy.push([x2, y2]);
      return;
    }
    /* Leaves start well inside the crown so the canopy reads as a mass
       rather than a rim. */
    if (depth >= cfg.maxDepth - 4) leafCluster(x2, y2, angle, 3);

    /* A third, central limb on the lowest forks keeps the crown from
       hollowing out into a horseshoe. */
    const kids = depth === 0 ? 1 : depth <= 2 ? 3 : rnd() < 0.25 ? 3 : 2;
    const spread = cfg.spread - depth * 1.1;

    for (let i = 0; i < kids; i++) {
      const offset = kids === 1 ? (rnd() - 0.5) * 0.4 : (i / (kids - 1) - 0.5) * 2;
      grow(
        x2,
        y2,
        angle + offset * spread + (rnd() - 0.5) * cfg.jitter,
        len * (cfg.lengthDecay + rnd() * 0.1),
        width * cfg.widthDecay,
        depth + 1
      );
    }
  }

  const rootX = cfg.width / 2;
  const rootY = cfg.height;
  note(rootX, rootY, cfg.rootWidth / 2);
  grow(rootX, rootY, -90, cfg.rootLength, cfg.rootWidth, 0);

  /* A soft wash of ellipses behind the twigs gives the canopy mass. */
  const wash = canopy
    .map(([x, y]) => {
      const rx = 70 + rnd() * 70;
      return (
        `<ellipse cx="${round(x)}" cy="${round(y)}" rx="${round(rx)}" ry="${round(rx * 0.78)}"` +
        ` fill="${cfg.greens[Math.floor(rnd() * cfg.greens.length)]}" fill-opacity="${round(0.06 + rnd() * 0.06)}"/>`
      );
    })
    .join('');

  /* Fit whatever grew into the frame: centred on the root, standing on the
     bottom edge, so the silhouette fills the same box every time. */
  const pad = cfg.padding;
  const scale = Math.min(
    (cfg.width - pad * 2) / (box.maxX - box.minX),
    (cfg.height - pad) / (box.maxY - box.minY)
  );
  const tx = cfg.width / 2 - rootX * scale;
  const ty = cfg.height - rootY * scale;
  const fit = `translate(${round(tx)} ${round(ty)}) scale(${Math.round(scale * 1000) / 1000})`;

  svg.setAttribute('viewBox', `0 0 ${cfg.width} ${cfg.height}`);
  svg.innerHTML =
    `<ellipse cx="${cfg.width / 2}" cy="${cfg.height - 4}" rx="${round(180 * scale)}" ry="14" fill="#5a3a21" fill-opacity=".13"/>` +
    `<g transform="${fit}">` +
    `<g>${wash}</g>` +
    `<g fill="none">${branches.join('')}</g>` +
    `<g>${leaves.join('')}</g>` +
    `</g>`;
}

/* --------------------------------------------------------------------------
   2. Timeline
   -------------------------------------------------------------------------- */
window.addEventListener('load', function () {
  let hoverActive = false;

  growHeroTree(document.querySelector('#hero-tree'));

  /* Split each hero line into masked rows so they can slide independently. */
  function initSplitText(selector) {
    const textWrappers = document.querySelectorAll(selector);
    if (!textWrappers.length) return false;

    if (typeof SplitText !== 'undefined') {
      new SplitText(selector, { type: 'lines', linesClass: 'fade-overflow' });
    } else {
      /* Without SplitText each block simply animates as one row. */
      textWrappers.forEach((wrapper) => {
        wrapper.innerHTML = `<div class="fade-overflow">${wrapper.innerHTML}</div>`;
      });
    }

    textWrappers.forEach((textWrapper) => {
      textWrapper.querySelectorAll('.fade-overflow').forEach((lineWrapp) => {
        const line = lineWrapp.innerHTML;
        lineWrapp.innerText = '';
        lineWrapp.innerHTML = `<div class='fade-el'>${line}</div>`;
      });
    });
  }

  initSplitText('.split');

  const sections = gsap.utils.toArray('.banner-slide');
  const wrap = gsap.utils.wrap(0, sections.length);
  const tree = document.querySelector('.banner-tree');
  const wings = document.querySelector('.wings');

  let currentIndex = 0;

  /* Every open hover, so they can be closed when the diagram scrolls away. */
  const hoverTimelines = [];

  const tlAnimation = gsap.timeline({
    defaults: { duration: 1.2 },
    scrollTrigger: {
      trigger: 'main',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      /* The branches only answer to the pointer while the diagram is on
         screen — between the two labels planted in the timeline below.
         Reading the playhead beats a one-shot callback here: scrubbing can
         jump straight past a single point in time, and this stays right
         when the user scrolls back up. */
      onUpdate: () => {
        const at = tlAnimation.time();
        const on = tlAnimation.labels['hover-on'];
        const off = tlAnimation.labels['hover-off'];
        const live = on !== undefined && at >= on && at <= off;

        if (live === hoverActive) return;
        hoverActive = live;
        if (!live) hoverTimelines.forEach((tl) => tl.reverse());
      },
      onLeave: () => {
        window.scrollTo(0, 0);
      },
    },
  });

  function gotoSection(index) {
    index = wrap(index);

    const currentSection = sections[currentIndex];
    const textCurrent = currentSection.querySelectorAll('.fade-overflow');
    const nextSection = sections[index];
    const textNext = nextSection.querySelectorAll('.fade-overflow');

    tlAnimation
      .to(currentSection, {
        scale: 0.7,
        alpha: 0,
        ease: 'power0.easeIn',
      })
      .to(
        textCurrent,
        {
          y: -350,
          stagger: { each: 0.02, from: 'start' },
          ease: 'power0.easeIn',
        },
        '<'
      )
      .to(
        tree,
        {
          scale: index > 0 ? 2.4 : 1,
          yPercent: index > 0 ? 165 : 0,
          duration: 0.8,
        },
        '<'
      )
      .to(wings, { alpha: 0, duration: 0.8 }, '<')
      .fromTo(
        textNext,
        { y: 400 },
        {
          y: 0,
          stagger: { each: 0.02, from: 'start' },
          ease: 'power1.easeOut',
        },
        '<0.4'
      )
      .fromTo(
        [nextSection],
        { scale: 0.7, alpha: 0 },
        { scale: 1, alpha: 1, ease: 'power1.easeOut' },
        '<'
      );

    currentIndex = index;
  }

  function treeAnimation() {
    tlAnimation
      .to('.banner-text', { y: '150%', alpha: 0, duration: 0.8 })
      .to(tree, { scale: 1, yPercent: 0, duration: 0.8 }, '<')
      .to(tree, { alpha: 0, duration: 0.4 }, '>-=0.15')
      .set('.tree svg', { display: 'block' }, '<-=0.1')

      /* The trunk pushes up first, thick, then the limbs unfold. */
      .fromTo(
        '.tree-svg__bottom',
        { drawSVG: '0%', strokeWidth: 33 },
        { drawSVG: '100%', strokeWidth: 33, duration: 0.5 },
        '<'
      )
      .fromTo(
        '.tree-svg__top',
        { drawSVG: '0%', strokeWidth: 33 },
        { drawSVG: '100%', strokeWidth: 33, duration: 0.5 }
      )
      .fromTo(
        '.tree-svg__left',
        { drawSVG: '0%', strokeWidth: 33, rotate: '25deg', transformOrigin: 'bottom right' },
        { drawSVG: '75%', strokeWidth: 33, rotate: '25deg', transformOrigin: 'bottom right', duration: 0.5 },
        '<'
      )
      .fromTo(
        '.tree-svg__right',
        { drawSVG: '0%', strokeWidth: 33, rotate: '-25deg', transformOrigin: 'bottom left' },
        { drawSVG: '75%', strokeWidth: 33, rotate: '-25deg', transformOrigin: 'bottom left', duration: 0.5 },
        '<'
      )
      .fromTo(
        '.tree-svg__right-top',
        { drawSVG: '0%', strokeWidth: 33, rotate: '-13deg', transformOrigin: 'bottom left' },
        { drawSVG: '85%', strokeWidth: 33, rotate: '-13deg', transformOrigin: 'bottom left', duration: 0.5 },
        '<'
      )
      .fromTo(
        '.tree-svg__left-top',
        { drawSVG: '0%', strokeWidth: 33, rotate: '13deg', transformOrigin: 'bottom right' },
        { drawSVG: '85%', strokeWidth: 33, rotate: '13deg', transformOrigin: 'bottom right', duration: 0.5 },
        '<'
      )
      .to('.tree-svg__branches', { drawSVG: '100%', strokeWidth: 3, rotate: '0', duration: 0.5 })
      .to('.tree-svg__bottom', { strokeWidth: 3, duration: 0.5 }, '<')

      .to('.tree-circle', { scale: 0.65, duration: 0.5 }, '<')
      .set('.tree-circle__big', { boxShadow: '0 0 0 200px var(--ring)' }, '<')
      .to('.tree-circle__big', { boxShadow: '0 0 0 1px var(--ring)', ease: 'power1.easeIn', duration: 0.5 }, '<')
      .set('.tree-circle__small', { boxShadow: '0 0 0 200px var(--ring)' }, '<')
      .to('.tree-circle__small', { boxShadow: '0 0 0 3px var(--ring)', ease: 'power1.easeIn', duration: 0.5 }, '<')
      .to('.tree-circle__big', { scale: 1, duration: 0.4 })

      .fromTo('.tree-name', { y: '-100%', opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '<')
      .fromTo('.tree-title span', { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 })
      .to('.tree-ball', { alpha: 1, scale: 1, duration: 0.4 }, '<')
      .addLabel('hover-on')

      /* The moth rises off the trunk and beats its wings. */
      .to('.tree-wings', { y: '-100%', alpha: 1, ease: 'yButterfly', duration: 0.8 }, '<-=1.5')
      .set('.tree-wings__top-left', { rotate: '-15deg' }, '<0.1')
      .to('.tree-wings__top-left', { rotate: '10deg', ease: 'butterflyShow', duration: 0.7 }, '<')
      .set('.tree-wings__top-right', { rotate: '15deg' }, '<')
      .to('.tree-wings__top-right', { rotate: '-10deg', ease: 'butterflyShow', duration: 0.7 }, '<')
      .set('.tree-wings__bottom-left', { rotate: '-20deg' }, '<')
      .to('.tree-wings__bottom-left', { rotate: '15deg', ease: 'butterflyShow', duration: 0.7 }, '<')
      .set('.tree-wings__bottom-right', { rotate: '20deg' }, '<')
      .to('.tree-wings__bottom-right', { rotate: '-15deg', ease: 'butterflyShow', duration: 0.7 }, '<')
      .to('.tree-wings__top-left', { rotate: 0, ease: 'butterflyDown', duration: 0.74 }, '>')
      .to('.tree-wings__top-right', { rotate: 0, ease: 'butterflyDown', duration: 0.74 }, '<')
      .to('.tree-wings__bottom-left', { rotate: 0, ease: 'butterflyDown', duration: 0.56 }, '<')
      .to('.tree-wings__bottom-right', { rotate: 0, ease: 'butterflyDown', duration: 0.56 }, '<')

      /* The diagram holds here — long enough to read the fields and hover
         them — before the downstroke that carries the moth away. */
      .to({}, { duration: 1.6 })
      .addLabel('hover-off')
      .to('.tree-wings__top-left', { rotate: '28deg', ease: 'butterflyUp', duration: 0.55 })
      .to('.tree-wings__top-right', { rotate: '-28deg', ease: 'butterflyUp', duration: 0.55 }, '<')
      .to('.tree-wings', { y: '-90%', alpha: 1, duration: 0.54 }, '<0.03')
      .to('.tree-wings__bottom-left', { rotate: '33deg', ease: 'yButterflyDown', duration: 0.54 }, '<')
      .to('.tree-wings__bottom-right', { rotate: '-33deg', ease: 'yButterflyDown', duration: 0.54 }, '<')

      .to('.tree-name', { y: '-100%', opacity: 0, duration: 0.4 })
      .to('.tree-wings', { y: '-180%', alpha: 1, ease: 'butterflyUp', duration: 0.8 }, '<')
      .to('.tree-wings__top-left', { rotate: '-30deg', ease: 'butterflyHide', duration: 0.8 }, '<')
      .to('.tree-wings__top-right', { rotate: '30deg', ease: 'butterflyHide', duration: 0.8 }, '<')
      .to('.tree-wings__bottom-left', { rotate: '-21deg', ease: 'butterflyHide', duration: 0.8 }, '<')
      .to('.tree-wings__bottom-right', { rotate: '21deg', ease: 'butterflyHide', duration: 0.8 }, '<')

      /* Wipe back to the hero so the scroll loops cleanly. */
      .set('.banner', { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' }, '<0.1')
      .to('.banner', { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', ease: 'clip', duration: 0.8 }, '<')
      .set('.tree', { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }, '<')
      .to('.tree', { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)', ease: 'clip', duration: 0.8 }, '<')
      .set('.wings', { opacity: 1, clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' }, '<')
      .to('.wings', { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', ease: 'clip', duration: 0.8 }, '<')
      .set('.banner-title .fade-overflow', { y: '150%', opacity: 0 }, '<')
      .to('.banner-title .fade-overflow', { y: '0%', opacity: 1, duration: 1 }, '<')
      .to(
        '.banner-title',
        { opacity: 1, scale: 1, stagger: { each: 0.1, from: 'start' }, duration: 1 },
        '<'
      )
      .set('.banner-tree', { scale: 1.3 }, '<')
      .to('.banner-tree', { scale: 1, opacity: 1, duration: 1 }, '<');
  }

  sections.forEach((element, index) => {
    if (index != sections.length - 1) {
      gotoSection(index + 1);
    }
  });

  treeAnimation();

  document.querySelector('.header-logo').addEventListener('click', (e) => {
    e.preventDefault();
    location.reload();
  });

  /* --------------------------------------------------------------------------
     3. Hover: the ring thickens and two seeds run out along the branch
     -------------------------------------------------------------------------- */
  const tlCircles = gsap
    .timeline({ paused: true })
    .fromTo(
      '.tree-circle__big',
      { boxShadow: '0 0 0 1px rgb(47 111 74)' },
      { duration: 0.4, ease: 'power1.outIn', boxShadow: '0 0 0 3px rgb(47 111 74)' }
    )
    .fromTo(
      '.tree-circle__small',
      { boxShadow: '0 0 0 3px rgb(47 111 74)' },
      { duration: 0.4, ease: 'power1.outIn', boxShadow: '0 0 0 1px rgb(47 111 74)' },
      '<'
    );

  document.querySelectorAll('.tree-title').forEach((element) => {
    const elementPosition = element.getAttribute('data-position');

    const timelineHover = gsap.timeline({ paused: true });
    hoverTimelines.push(timelineHover);

    let endSmallPos = 0.125,
      endBigPos = 0.535;

    if (elementPosition.includes('-top')) {
      endSmallPos = 0.155;
      endBigPos = 0.58;
    } else if (elementPosition.includes('top')) {
      endSmallPos = 0.175;
      endBigPos = 0.597;
    }

    timelineHover
      .to(`.tree-title[data-position="${elementPosition}"]`, {
        duration: 0.4,
        ease: 'power1.inOut',
        scale: 1.33,
        y: '-=30%',
      })
      .to(
        `.tree-ball[data-position="${elementPosition}"] .tree-ball__1`,
        { duration: 0.4, ease: 'power1.inOut', scale: 2.25 },
        '<'
      )
      .to(
        `.tree-svg__branches[data-position="${elementPosition}"]`,
        { duration: 0.4, ease: 'power1.inOut', strokeWidth: 9 },
        '<'
      )
      .set(`.tree-ball[data-position="${elementPosition}"] .tree-ball__2`, { opacity: 1 })
      .set(`.tree-ball[data-position="${elementPosition}"] .tree-ball__3`, { opacity: 1 })
      .to(`.tree-title[data-position="${elementPosition}"] .tree-title__decor.left`, {
        duration: 0.4,
        ease: 'power1.inOut',
        alpha: 1,
        x: '-100%',
      })
      .to(
        `.tree-title[data-position="${elementPosition}"] .tree-title__decor.right`,
        { duration: 0.4, ease: 'power1.inOut', alpha: 1, x: '100%' },
        '<'
      )
      .to(
        `.tree-ball[data-position="${elementPosition}"] .tree-ball__2`,
        {
          duration: 0.7,
          ease: 'power1.inOut',
          motionPath: {
            path: `.tree-svg__branches[data-position="${elementPosition}"]`,
            align: `.tree-svg__branches[data-position="${elementPosition}"]`,
            autoRotate: true,
            alignOrigin: [1, 0.5],
            start: 1,
            end: endSmallPos,
          },
        },
        '<'
      )
      .to(
        `.tree-ball[data-position="${elementPosition}"] .tree-ball__3`,
        {
          duration: 0.4,
          ease: 'power1.inOut',
          motionPath: {
            path: `.tree-svg__branches[data-position="${elementPosition}"]`,
            align: `.tree-svg__branches[data-position="${elementPosition}"]`,
            autoRotate: true,
            alignOrigin: [1, 0.5],
            start: 1,
            end: endBigPos,
          },
        },
        '<0.3'
      );

    element.addEventListener('mouseover', () => {
      if (hoverActive) {
        timelineHover.play();
        tlCircles.play();
      }
    });

    element.addEventListener('mouseout', () => {
      timelineHover.reverse();
      tlCircles.reverse();
    });

    const ball = document.querySelector(`.tree-ball[data-position="${elementPosition}"]`);

    ball.addEventListener('mouseover', () => {
      if (hoverActive) timelineHover.play();
    });

    ball.addEventListener('mouseout', () => {
      timelineHover.reverse();
    });
  });

  /* --------------------------------------------------------------------------
     4. Ambient sound toggle
     -------------------------------------------------------------------------- */
  const tlSound = gsap
    .timeline({ paused: true, yoyo: true, repeat: -1 })
    .to('.sound-item:nth-child(even)', { height: '0.27rem', duration: 0.5 });

  const tlSound2 = gsap
    .timeline({ paused: true, yoyo: true, repeat: -1 })
    .to('.sound-item:nth-child(odd)', { height: '0.17rem', duration: 0.45 });

  const audio = document.querySelector('#audio');

  document.querySelector('.sound').addEventListener('click', function () {
    if (this.classList.contains('active')) {
      tlSound.pause();
      tlSound2.pause();
      this.classList.remove('active');
      audio.pause();
    } else {
      tlSound.resume();
      tlSound2.resume();
      this.classList.add('active');
      /* The bars keep moving even if the audio file cannot be reached. */
      const played = audio.play();
      if (played && typeof played.catch === 'function') played.catch(() => {});
    }
  });
});
