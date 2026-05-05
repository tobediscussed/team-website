/* Team — Homepage scripts
   Hosted on GH Pages, loaded after homepage-body.html injection. */

/* =============================================
   INIT — Register plugins, smooth scroll
   ============================================= */
gsap.registerPlugin(ScrollTrigger, Flip, Observer, Draggable, CustomEase);
CustomEase.create("assistantEase", "0.34, 1.56, 0.64, 1");

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 768;

// Lenis smooth scroll
const lenis = new Lenis({
  lerp: 0.1,
  smoothWheel: true,
  touchMultiplier: 2,
  syncTouch: true,
});
// Expose globally so other modules can programmatic-scroll via Lenis
window.lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);


/* =============================================
   VIDEO MODAL — Open from any [data-video-trigger]
   Closes via background click, X button, or Escape.
   Pauses + resets video on close.
   ============================================= */
(function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const video = document.getElementById('modalVideo');
  if (!modal || !video) return;

  const triggers = document.querySelectorAll('[data-video-trigger]');
  const closers = modal.querySelectorAll('[data-modal-close]');

  function open(e) {
    if (e) e.preventDefault();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(() => {});
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    video.pause();
    video.currentTime = 0;
  }

  triggers.forEach(t => t.addEventListener('click', open));
  closers.forEach(c => c.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();


/* =============================================
   FLOATING CTA — show after hero, hide near footer
   ============================================= */
(function initFloatingCta() {
  const cta = document.getElementById('floatingCta');
  const bar = document.getElementById('floatingBar');
  const hero = document.getElementById('heroSection');
  const footer = document.querySelector('.footer');
  if (!cta || !hero) return;

  function update() {
    const scrollY = window.scrollY || window.pageYOffset;
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const footerTop = footer ? footer.offsetTop : Infinity;
    const viewportBottom = scrollY + window.innerHeight;

    // Visible when past the hero and before the footer enters view
    const shouldShow = scrollY > heroBottom * 0.6 && viewportBottom < footerTop + 60;
    cta.classList.toggle('is-visible', shouldShow);
    if (bar) bar.classList.toggle('is-visible', shouldShow);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();


/* =============================================
   NAV — Hide on scroll down, show on scroll up
   ============================================= */
(function initNav() {
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  ScrollTrigger.create({
    onUpdate: (self) => {
      const s = self.scroll();
      if (s > lastScroll && s > 100) nav.classList.add('nav--hidden');
      else nav.classList.remove('nav--hidden');
      lastScroll = s;
    }
  });

  // Nav goes solid once we've scrolled past the hero
  ScrollTrigger.create({
    trigger: document.getElementById('heroSection'),
    start: 'bottom 60px',
    onEnter: () => nav.classList.add('nav--solid'),
    onLeaveBack: () => nav.classList.remove('nav--solid'),
  });

  // Dropdown hover open/close + background blur
  const overlay = document.getElementById('navBlurOverlay');
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  let closeTimer = null;

  // Measure the panel and clamp its position so it never overflows the viewport
  function positionPanel(dd) {
    const panel = dd.querySelector('.nav__dropdown-panel');
    if (!panel) return;
    panel.style.left = '0px';
    panel.style.right = 'auto';
    void panel.offsetWidth;
    const rect = panel.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const margin = 16;
    let shift = 0;
    if (rect.right > vw - margin) shift = (vw - margin) - rect.right;
    if (rect.left + shift < margin) shift = margin - rect.left;
    if (shift !== 0) panel.style.left = shift + 'px';
  }

  function openDropdown(dd) {
    // Close any other open dropdowns
    dropdowns.forEach(d => { if (d !== dd) d.classList.remove('is-open'); });
    positionPanel(dd);
    dd.classList.add('is-open');
    overlay.classList.add('is-active');
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  }

  function closeAllDropdowns() {
    closeTimer = setTimeout(() => {
      dropdowns.forEach(d => d.classList.remove('is-open'));
      overlay.classList.remove('is-active');
    }, 120);
  }

  dropdowns.forEach(dd => {
    dd.addEventListener('mouseenter', () => openDropdown(dd));
    dd.addEventListener('mouseleave', () => closeAllDropdowns());

    // Keep open when hovering the panel
    const panel = dd.querySelector('.nav__dropdown-panel');
    if (panel) {
      panel.addEventListener('mouseenter', () => {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      });
      panel.addEventListener('mouseleave', () => closeAllDropdowns());
    }
  });

  // Re-clamp the open dropdown on resize
  window.addEventListener('resize', () => {
    const openDd = document.querySelector('[data-dropdown].is-open');
    if (openDd) positionPanel(openDd);
  });

  /* ─── Mobile menu (burger → full-screen push-panel) ─── */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('navMobile');
  const mobileOverlay = document.getElementById('navMobileOverlay');
  const mobileClose = document.getElementById('navMobileClose');
  const mobileMain = document.getElementById('navMobileMain');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    mobileOverlay.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-mobile-lock');
  }
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    mobileOverlay.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-mobile-lock');
    setTimeout(() => {
      document.querySelectorAll('.nav-mobile__panel--sub.is-active').forEach(p => p.classList.remove('is-active'));
      if (mobileMain) mobileMain.classList.remove('is-pushed');
    }, 300);
  }
  if (burger) burger.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('[data-mobile-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-mobile-open');
      const sub = document.getElementById('navMobileSub-' + id);
      if (!sub || !mobileMain) return;
      mobileMain.classList.add('is-pushed');
      sub.classList.add('is-active');
      sub.scrollTop = 0;
    });
  });
  document.querySelectorAll('[data-mobile-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-mobile__panel--sub.is-active').forEach(p => p.classList.remove('is-active'));
      if (mobileMain) mobileMain.classList.remove('is-pushed');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) closeMobileMenu();
  });
})();


/* =============================================
   HERO — Scroll-driven --progress
   Maps scroll position to 0→1 on the hero section.
   CSS uses --progress to drive:
   - clip-path: inset(progress*2% round progress*1rem) on .hero-img-w
   - transform: scale(1 + progress*0.2) on .hero-img (counter-scale)
   - background-color: rgba(0,0,0, 0.1 + progress*0.5) on .cover-w::after
   This is the Frontify "frame pulling inward" effect.
   ============================================= */

/* =============================================
   HERO TYPER — Cycles through phrases in the headline
   Types in → holds → erases → types next.
   ============================================= */
(function initHeroTyper() {
  const el = document.getElementById('heroTyper');
  if (!el) return;
  if (prefersReduced) { el.textContent = 'Command Center'; return; }

  const phrases = ['Command Center', 'Operating System', 'Single Platform'];
  const TYPE_MS = 70;     // ms per character typed
  const ERASE_MS = 40;    // ms per character erased (faster on the way out)
  const HOLD_MS = 1500;   // pause when fully typed
  const GAP_MS = 350;     // small gap before typing next

  let phraseIdx = 0;
  let charIdx = phrases[0].length;  // start fully typed
  let mode = 'hold';                 // 'type' | 'hold' | 'erase' | 'gap'
  let timer = null;

  function tick() {
    const phrase = phrases[phraseIdx];
    if (mode === 'type') {
      charIdx++;
      el.textContent = phrase.substring(0, charIdx);
      if (charIdx >= phrase.length) {
        mode = 'hold';
        timer = setTimeout(tick, HOLD_MS);
      } else {
        timer = setTimeout(tick, TYPE_MS);
      }
    } else if (mode === 'hold') {
      mode = 'erase';
      timer = setTimeout(tick, ERASE_MS);
    } else if (mode === 'erase') {
      charIdx--;
      el.textContent = phrase.substring(0, charIdx);
      if (charIdx <= 0) {
        mode = 'gap';
        phraseIdx = (phraseIdx + 1) % phrases.length;
        timer = setTimeout(tick, GAP_MS);
      } else {
        timer = setTimeout(tick, ERASE_MS);
      }
    } else if (mode === 'gap') {
      mode = 'type';
      timer = setTimeout(tick, TYPE_MS);
    }
  }

  // Kick off after the initial hold
  timer = setTimeout(tick, HOLD_MS);
})();


(function initHero() {
  if (prefersReduced) return;

  const section = document.getElementById('heroSection');
  const imgW = document.getElementById('heroImgW');
  const coverW = document.getElementById('coverW');

  const coverIntro = document.getElementById('coverIntro');

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const p = parseFloat(self.progress.toFixed(4));
      // Set --progress on image wrapper and cover overlay (for clip-path etc)
      imgW.style.setProperty('--progress', p);
      coverW.style.setProperty('--progress', p);

      // Push hero content up + fade out (JS-driven, no CSS calc issues)
      // Full opacity until 30% progress, then fades to 0 by 70%
      const fadeP = Math.max(0, (p - 0.3) / 0.4); // 0 at p<=0.3, 1 at p>=0.7
      const opacity = Math.max(0, 1 - fadeP);
      const yShift = p * -100;
      coverIntro.style.transform = `translateY(${yShift}px)`;
      coverIntro.style.opacity = opacity;
    }
  });
})();


/* =============================================
   HERO EXCERPT — Cutout from the hero background

   1) On load: capture the excerpt's position within the hero
      and set background-image/size/position to match exactly.
      Visually it's a seamless part of the hero.

   2) On scroll: the excerpt is NOT re-synced. The captured
      background is "frozen" — so as the hero scrolls away,
      the excerpt carries its captured frame with it.

   3) Flip.fit() transforms the excerpt to a SQUARE target
      in the upload section. scrub:true (no lag).
      The frozen background stays locked to the rectangle
      throughout the flight — no jumps, no transitions.
   ============================================= */
(function initExcerptFlight() {
  if (prefersReduced) return;

  const heroSection = document.getElementById('heroSection');
  const heroImg = heroSection.querySelector('.hero-img');
  const wrapper = document.getElementById('heroExcerpts');
  const center = document.getElementById('heroExcerpt');
  const left = document.getElementById('heroExcerptLeft');
  const right = document.getElementById('heroExcerptRight');
  const landing = document.querySelector('.excerpt-landing');
  if (!wrapper || !center || !left || !right || !heroImg || !landing) return;

  // Image shown inside the excerpt rectangle (separate from hero BG).
  const imgSrc = 'https://siteamrollouts.github.io/team-website/assets/hero-bg-option-1.jpeg';

  // ── Compute hero-aligned + cover-equivalent pixel values ──
  // Uses a FIXED reference aspect ratio so swapping hero images doesn't
  // break the animation. The excerpt always behaves as if the image is 3:2.
  const REF_ASPECT = 3 / 2; // fixed reference — image-independent

  function computeBgStates() {
    const hr = heroSection.getBoundingClientRect();
    const wr = wrapper.getBoundingClientRect();
    const bgW = hr.width, bgH = hr.height;
    const offX = wr.left - hr.left, offY = wr.top - hr.top;

    // Hero-aligned: image sized to hero, offset to align rectangle
    const aligned = { sizeW: bgW, sizeH: bgH, posX: -offX, posY: -offY };

    // Cover-equivalent for the final SQUARE shape (width = elW, height = elW)
    const targetW = wrapper.offsetWidth;
    const targetH = targetW; // square
    const targetAspect = targetW / targetH;
    let coverW, coverH, coverX, coverY;
    if (REF_ASPECT > targetAspect) {
      coverH = targetH;
      coverW = REF_ASPECT * targetH;
      coverX = -(coverW - targetW) / 2;
      coverY = 0;
    } else {
      coverW = targetW;
      coverH = targetW / REF_ASPECT;
      coverX = 0;
      coverY = -(coverH - targetH) / 2;
    }
    const cover = { sizeW: coverW, sizeH: coverH, posX: coverX, posY: coverY };

    return { aligned, cover };
  }

  // ── Flanking tiles: force hidden, set BG to cover ──
  gsap.set(left, { x: 0, rotation: 0, opacity: 0 });
  gsap.set(right, { x: 0, rotation: 0, opacity: 0 });
  left.style.backgroundImage = 'url(assets/hero-bg-option-4.jpeg)';
  left.style.backgroundSize = 'cover';
  left.style.backgroundPosition = 'center';
  right.style.backgroundImage = 'url(assets/hero-bg-option-3.jpeg)';
  right.style.backgroundSize = 'cover';
  right.style.backgroundPosition = 'center';

  // ── Dimensions for rectangle→square morph ──
  const elW = wrapper.offsetWidth;
  const rectH = Math.round(elW * 3 / 4); // 4:3 = landscape rectangle
  const sqH = elW;                         // 1:1 = square
  wrapper.style.aspectRatio = 'auto';
  wrapper.style.height = rectH + 'px';

  const fanDist = elW * 0.55;

  // ── Load image to get natural dimensions, then set up timeline ──
  // Image lives on the inner .hero-excerpt__img layer so we can fade it
  // in independently from the border/shadow/shape animations.
  const centerImg = document.getElementById('heroExcerptImg');
  centerImg.style.backgroundImage = `url(${imgSrc})`;
  // Lock the whole centre tile hidden at load (CSS backs this up).
  gsap.set(center, { opacity: 0 });
  const img = new Image();
  img.src = imgSrc;

  function setupTimeline() {
    const { aligned, cover } = computeBgStates();

    // Initial state: hero-aligned (so when opacity rises, it comes in seamless)
    centerImg.style.backgroundSize = `${aligned.sizeW}px ${aligned.sizeH}px`;
    centerImg.style.backgroundPosition = `${aligned.posX}px ${aligned.posY}px`;
    // Re-assert initial state
    gsap.set(center, { opacity: 0 });

    // State objects GSAP can tween
    const bgState = {
      sizeW: aligned.sizeW, sizeH: aligned.sizeH,
      posX: aligned.posX, posY: aligned.posY,
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'center center',
        end: '+=90%',
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const o = Math.min(1, self.progress / 0.15);
          center.style.opacity = o;
          center.style.visibility = o > 0 ? 'visible' : 'hidden';
        },
        onLeaveBack: () => { center.style.opacity = 0; center.style.visibility = 'hidden'; },
      }
    });

    // Rectangle → Square (reverses via scrub)
    tl.fromTo(wrapper,
      { height: rectH },
      { height: sqH, duration: 0.6, ease: 'power2.inOut' },
    0);

    // BG hero-aligned → cover — pixel-based lerp so scrub reverses cleanly
    tl.to(bgState, {
      sizeW: cover.sizeW, sizeH: cover.sizeH,
      posX: cover.posX, posY: cover.posY,
      duration: 0.6, ease: 'power2.inOut',
      onUpdate: () => {
        centerImg.style.backgroundSize = `${bgState.sizeW}px ${bgState.sizeH}px`;
        centerImg.style.backgroundPosition = `${bgState.posX}px ${bgState.posY}px`;
      }
    }, 0);

    // Center border/shadow
    tl.to(center, {
      borderColor: 'rgba(0,0,0,0.08)',
      borderStyle: 'solid',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      duration: 0.6, ease: 'power2.inOut',
    }, 0);

    // Flanks get matching border/shadow treatment
    tl.to([left, right], {
      borderColor: 'rgba(0,0,0,0.08)',
      borderStyle: 'solid',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      duration: 0.6, ease: 'power2.inOut',
    }, 0);

    // Flanking tiles fan out (autoAlpha handles both opacity + visibility)
    tl.to(left, {
      x: -fanDist, rotation: -5, autoAlpha: 1,
      duration: 0.4, ease: 'power2.out'
    }, 0.3);

    tl.to(right, {
      x: fanDist, rotation: 5, autoAlpha: 1,
      duration: 0.4, ease: 'power2.out'
    }, 0.3);

    // Labels animate in AFTER the tiles have settled.
    const labelLeft = document.getElementById('tileLabelLeft');
    const labelCenter = document.getElementById('tileLabelCenter');
    const labelRight = document.getElementById('tileLabelRight');
    if (labelLeft && labelCenter && labelRight) {
      gsap.set(labelCenter, { xPercent: -50 });
      gsap.set(labelLeft, { xPercent: -50, x: -fanDist });
      gsap.set(labelRight, { xPercent: -50, x: fanDist });

      tl.fromTo([labelLeft, labelCenter, labelRight],
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' },
        0.75);
    }

    // Hold
    tl.to({}, { duration: 0.5 });
  }

  if (img.complete && img.naturalWidth) {
    requestAnimationFrame(setupTimeline);
  } else {
    img.onload = () => requestAnimationFrame(setupTimeline);
    // Fallback: if image fails, still set up with assumed dimensions
    img.onerror = () => requestAnimationFrame(setupTimeline);
  }
})();



/* =============================================
   ENGINE — Search bar typewriter + button click
   The search bar sits below the heading copy and scrolls
   naturally with the page. When it reaches the vertical
   centre of the viewport it pins, then:
   1) Grows wider while the typewriter types the prompt
   2) Once text is complete, the button animates a "click"
      with frosted glass + a click sound effect
   ============================================= */
(function initEngine() {
  if (prefersReduced) return;

  const searchBar = document.getElementById('searchBar');
  const searchInput = document.getElementById('searchInput');
  const searchDialog = document.getElementById('searchDialog');
  const submitBtn = searchBar.querySelector('.search-submit');
  const pondering = document.getElementById('pondering');
  const typeText = 'Plan a comprehensive pre-release strategy focused on fan engagement';

  gsap.set(searchDialog, { autoAlpha: 0 });
  gsap.set(pondering, { autoAlpha: 0, y: 10 });

  // Generate mechanical click sound via Web Audio API.
  // Uses a short white-noise burst through a bandpass filter — produces
  // a sharp, percussive "click" like a mouse button or keyboard key.
  function playClickSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const duration = 0.04; // very short = click, not boop

      // Short noise buffer
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Bandpass filter focused high — gives it that "tick" character
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3000;
      filter.Q.value = 1.2;

      // Sharp attack, fast decay envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  let clickPlayed = false;
  let ponderingShown = false;
  let fadedOut = false;
  let autoScrollTimer = null;
  let autoScrollTriggered = false;
  let lastUserScrollAt = 0;

  // ── Gradient backdrop + mouse interactivity ──
  const gradientEl = document.getElementById('engineGradient');
  const blobLeft = document.getElementById('engineBlobLeft');
  const blob1 = document.getElementById('engineBlob1');
  const blob2 = document.getElementById('engineBlob2');
  const blobTertiary = document.getElementById('engineBlobTertiary');
  const engineSection = document.getElementById('engineSection');

  if (gradientEl && blob1 && engineSection) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    function onMove(e) {
      const rect = engineSection.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    (function tick() {
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      // Each blob drifts at a different strength/direction for organic parallax
      if (blob1) blob1.style.transform = `translate(${currentX * 50}px, ${currentY * 35}px)`;
      if (blob2) blob2.style.transform = `translate(${currentX * -30}px, ${currentY * 20}px)`;
      if (blobTertiary) blobTertiary.style.transform = `translate(${currentX * 25}px, ${currentY * -30}px)`;
      if (blobLeft) blobLeft.style.transform = `translate(${currentX * -45}px, ${currentY * -20}px)`;
      requestAnimationFrame(tick);
    })();
    window.addEventListener('mousemove', onMove, { passive: true });
  }

  // ── Auto-scroll after pondering dwell ──
  function cancelAutoScroll() {
    if (autoScrollTimer) { clearTimeout(autoScrollTimer); autoScrollTimer = null; }
  }
  let ponderingShownAt = 0;
  function scheduleAutoScroll() {
    if (autoScrollTriggered) return;
    cancelAutoScroll();
    ponderingShownAt = Date.now();
    autoScrollTimer = setTimeout(() => {
      if (autoScrollTriggered) return;
      // Only auto-scroll if user hasn't scrolled SINCE pondering appeared
      if (lastUserScrollAt > ponderingShownAt) return;
      autoScrollTriggered = true;
      // Scroll further so pin releases and next section lands in view
      const targetY = window.scrollY + window.innerHeight * 1.2;
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(targetY, { duration: 1.4 });
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }, 1500);
  }
  window.addEventListener('wheel', () => { lastUserScrollAt = Date.now(); cancelAutoScroll(); }, { passive: true });
  window.addEventListener('touchmove', () => { lastUserScrollAt = Date.now(); cancelAutoScroll(); }, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Space','Home','End'].includes(e.code)) {
      lastUserScrollAt = Date.now();
      cancelAutoScroll();
    }
  });

  // Button click animation timeline (paused)
  // Press → morph into a circle → reveal spinner
  const submitLabel = submitBtn.querySelector('.search-submit__label');
  const submitSpinner = submitBtn.querySelector('.search-submit__spinner');

  // Capture original button dimensions so reverse always lands cleanly
  const origBtnW = submitBtn.offsetWidth;
  const origBtnH = submitBtn.offsetHeight;
  const origBtnPadX = parseFloat(getComputedStyle(submitBtn).paddingLeft);

  const clickTl = gsap.timeline({
    paused: true,
    onStart: () => submitBtn.classList.add('is-loading'),
    onReverseComplete: () => {
      submitBtn.classList.remove('is-loading');
      // Wipe all inline styles GSAP added so the button returns to pure CSS state
      gsap.set(submitBtn, { clearProps: 'scale,width,height,paddingLeft,paddingRight,borderRadius' });
      gsap.set(submitLabel, { clearProps: 'opacity,visibility,scale' });
      gsap.set(submitSpinner, { clearProps: 'opacity,visibility' });
    },
  });
  clickTl
    // Quick press (fromTo so reverse always returns to scale 1)
    .fromTo(submitBtn,
      { scale: 1 },
      { scale: 0.9, duration: 0.08, ease: 'power2.in' })
    // Label fades out
    .fromTo(submitLabel,
      { autoAlpha: 1, scale: 1 },
      { autoAlpha: 0, scale: 0.85, duration: 0.18, ease: 'power2.in' },
    '<')
    // Morph to circle (fromTo with explicit pixel start values)
    .fromTo(submitBtn,
      { scale: 0.9, width: origBtnW, height: origBtnH, paddingLeft: origBtnPadX, paddingRight: origBtnPadX, borderRadius: '2rem' },
      { scale: 1, width: 36, height: 36, paddingLeft: 0, paddingRight: 0, borderRadius: '50%',
        background: '#111', color: '#fff',
        duration: 0.35, ease: 'back.out(1.8)' })
    // Reveal spinner
    .fromTo(submitSpinner,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2, ease: 'power2.out' },
    '-=0.15');

  // Pondering reveal timeline (paused)
  const ponderTl = gsap.timeline({ paused: true });
  ponderTl.to(pondering, {
    autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out'
  });

  // Fade-out timeline (paused) — bar + pondering fade up and blur out
  const pinWrap = document.getElementById('searchPinWrap');
  const fadeOutTl = gsap.timeline({ paused: true });
  fadeOutTl.to([searchBar, pondering], {
    autoAlpha: 0, y: -30, filter: 'blur(8px)',
    duration: 0.5, ease: 'power2.in', stagger: 0.05
  });

  // Pin the wrapper (bar + pondering) when bar hits viewport centre
  gsap.timeline({
    scrollTrigger: {
      trigger: pinWrap,
      start: 'center center',
      end: '+=300%',
      scrub: true,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;

        // Gradient backdrop: fade in once search bar is engaged, fade out as pin ends
        if (gradientEl) {
          const showGradient = p > 0.02 && p < 0.92;
          gradientEl.classList.toggle('is-visible', showGradient);
        }

        // Phase 1 (0–0.4): Typewriter + bar grows
        const typeProgress = Math.min(p / 0.4, 1);
        const chars = Math.floor(typeProgress * typeText.length);
        searchInput.value = typeText.substring(0, chars);

        // Grow bar from 28rem → 44rem
        const barWidth = 28 + (typeProgress * 16);
        gsap.set(searchBar, { width: Math.min(barWidth, 44) + 'rem' });

        // Phase 2 (0.45+): Button click
        if (p >= 0.45 && !clickPlayed) {
          clickPlayed = true;
          playClickSound();
          clickTl.restart();
        } else if (p < 0.4 && clickPlayed) {
          clickPlayed = false;
          clickTl.reverse();
        }

        // Phase 3 (0.52+): Show pondering — after 1.5s if user stops scrolling, auto-advance
        if (p >= 0.52 && !ponderingShown) {
          ponderingShown = true;
          ponderTl.play();
          scheduleAutoScroll();
        } else if (p < 0.5 && ponderingShown) {
          ponderingShown = false;
          ponderTl.reverse();
          cancelAutoScroll();
          autoScrollTriggered = false;
        }

        // Phase 4 (0.90+): Fade everything out — right at end of pin
        if (p >= 0.90 && !fadedOut) {
          fadedOut = true;
          fadeOutTl.play();
        } else if (p < 0.87 && fadedOut) {
          fadedOut = false;
          fadeOutTl.reverse();
        }
      },
      onLeaveBack: () => {
        searchInput.value = '';
        gsap.set(searchBar, { width: '28rem' });
        clickPlayed = false;
        ponderingShown = false;
        fadedOut = false;
        autoScrollTriggered = false;
        cancelAutoScroll();
        if (gradientEl) gradientEl.classList.remove('is-visible');
        clickTl.pause(0);
        ponderTl.pause(0);
        fadeOutTl.pause(0);
        submitBtn.classList.remove('is-loading');
        gsap.set(submitBtn, {
          clearProps: 'background,backdropFilter,webkitBackdropFilter,color,borderColor,width,height,paddingLeft,paddingRight,borderRadius,scale'
        });
        gsap.set(submitLabel, { clearProps: 'opacity,visibility,scale' });
        gsap.set(submitSpinner, { clearProps: 'opacity,visibility' });
        gsap.set([searchBar, pondering], { clearProps: 'opacity,visibility,y,filter' });
        gsap.set(pondering, { autoAlpha: 0, y: 10 });
      }
    }
  });
})();


/* =============================================
   GUIDELINES + SHOWCASE — Dashboard → Loading → Timeline
   After the search bar fades out, the app UI rises in.
   Then on scroll: release grid fades, loader plays,
   timeline view appears in the content area.
   ============================================= */
(function initAssistant() {
  if (prefersReduced) return;

  const section = document.getElementById('guidelinesSection');
  const guidelinesWrap = document.getElementById('guidelinesWrap');
  const grid = document.getElementById('releasesGridWrap');
  const loading = document.getElementById('showcaseLoading');
  const fill = document.getElementById('showcaseLoadingFill');
  const loadingLabel = document.getElementById('showcaseLoadingLabel');
  const timeline = document.getElementById('showcaseTimeline');

  // Start the UI slightly below and hidden
  gsap.set(guidelinesWrap, { y: 40, autoAlpha: 0, filter: 'blur(4px)' });

  const revealTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=300%',
      scrub: true,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
    }
  });

  // Phase 1: UI slides up into view
  revealTl.to(guidelinesWrap, {
    y: 0, autoAlpha: 1, filter: 'blur(0px)',
    duration: 0.8, ease: 'power2.out'
  });

  // Phase 2: Hold on dashboard for a beat
  revealTl.to({}, { duration: 0.8 });

  // Phase 3: Release grid fades out
  revealTl.to(grid, {
    opacity: 0, scale: 0.96, filter: 'blur(6px)',
    duration: 0.5, ease: 'power2.inOut'
  });

  // Phase 4: Loading overlay fades in
  revealTl.to(loading, {
    opacity: 1, duration: 0.3, ease: 'power2.inOut'
  }, '<0.2');

  // Phase 5: Progress bar fills
  revealTl.fromTo(fill,
    { width: '0%' },
    { width: '100%', duration: 0.8, ease: 'none',
      onUpdate: function() {
        const p = Math.round(this.progress() * 100);
        if (loadingLabel) {
          loadingLabel.textContent = p < 100 ? `Release loading... ${p}%` : 'Release loaded.';
        }
      }
    });

  // Phase 6: Loading fades out
  revealTl.to(loading, {
    opacity: 0, duration: 0.3, ease: 'power2.in'
  });

  // Phase 7: Timeline fades in with staggered day columns
  revealTl.fromTo(timeline,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });

  // Stagger the 5 day columns in the timeline grid (3rd child)
  revealTl.fromTo('#showcaseTimeline > div:nth-child(3) > div',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' },
    '<');

  // Phase 8: TeamMate chat panel slides in (sidebar)
  const chat = document.getElementById('teammateChat');
  if (chat) {
    revealTl.fromTo(chat,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '<0.2');
    // User message bubble first
    revealTl.fromTo('#chatUserMsg',
      { opacity: 0, x: 12 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
      '>');
    // TeamMate reply slightly delayed
    revealTl.fromTo('#chatAiMsg',
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
      '>0.25');
  }

  // Phase 9: Hold
  revealTl.to({}, { duration: 0.8 });
})();


/* =============================================
   ROLES — Tab switcher for the "who Team serves" section
   ============================================= */
(function initRoles() {
  const section = document.getElementById('rolesSection');
  if (!section) return;
  const tabs = section.querySelectorAll('.roles-tab');
  const panels = section.querySelectorAll('.roles-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const role = tab.dataset.role;
      tabs.forEach(t => t.classList.toggle('is-active', t === tab));
      panels.forEach(p => p.classList.toggle('is-active', p.dataset.role === role));
    });
  });
})();


/* =============================================
   FEATURES — Interactive spotlight switcher
   Click/hover a feature to switch the preview panel.
   Auto-advances every 5s until user interacts.
   On mobile, each card has its own inline preview (accordion).
   ============================================= */
(function initFeatures() {
  const section = document.getElementById('featuresSection');
  if (!section) return;
  const cards = section.querySelectorAll('.feature-card');
  const desktopPreview = section.querySelector('.features-spotlight > .features-preview');
  const panels = desktopPreview
    ? desktopPreview.querySelectorAll(':scope > .features-preview__panel')
    : [];

  let currentIdx = 0;
  let autoTimer = null;
  let userInteracted = false;
  const isTouchDevice = !window.matchMedia('(hover: hover)').matches;

  // ── Per-panel entrance animations ──
  // Each feature type gets its own animation that replays when it activates.
  function animatePanel(panel) {
    const feature = panel.getAttribute('data-feature');
    const ease = 'power2.out';

    if (feature === 'timeline') {
      const bars = panel.querySelectorAll('.ph-timeline__bar');
      const rows = panel.querySelectorAll('.ph-timeline__row');
      gsap.fromTo(rows,
        { autoAlpha: 0, x: -20 },
        { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.08, ease });
      gsap.fromTo(bars,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
    }

    else if (feature === 'ai') {
      const userRow = panel.querySelector('.ph-chat__user-row');
      const aiRow = panel.querySelector('.ph-chat__ai-row');
      const input = panel.querySelector('.ph-chat__input');
      gsap.fromTo(userRow,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease });
      gsap.fromTo(aiRow,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease, delay: 0.45 });
      gsap.fromTo(input,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease, delay: 0.9 });
    }

    else if (feature === 'intel') {
      const stats = panel.querySelectorAll('.ph-intel__stat');
      const chart = panel.querySelector('.ph-intel__chart');
      const chartPath = panel.querySelector('.ph-intel__chart svg path:first-of-type');
      gsap.fromTo(stats,
        { autoAlpha: 0, y: 16, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.1, ease });

      // Count-up on stat values
      panel.querySelectorAll('.ph-intel__stat-value').forEach((el, i) => {
        const text = el.textContent;
        const match = text.match(/^(\d+(?:\.\d+)?)(.*)$/);
        if (!match) return;
        const endValue = parseFloat(match[1]);
        const suffix = match[2];
        const isDecimal = text.includes('.');
        const obj = { v: 0 };
        gsap.to(obj, {
          v: endValue, duration: 1, ease: 'power2.out', delay: 0.2 + i * 0.1,
          onUpdate: () => {
            el.textContent = (isDecimal ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix;
          }
        });
      });

      gsap.fromTo(chart,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease, delay: 0.4 });

      // Draw chart line
      if (chartPath && chartPath.getTotalLength) {
        const len = chartPath.getTotalLength();
        gsap.fromTo(chartPath,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out', delay: 0.55 });
      }
    }

    else if (feature === 'rollout') {
      const rows = panel.querySelectorAll('.ph-rollout__row');
      gsap.fromTo(rows,
        { autoAlpha: 0, x: -16 },
        { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.08, ease });
      // Pop the checks that are done
      const doneChecks = panel.querySelectorAll('.ph-rollout__check.is-done');
      gsap.fromTo(doneChecks,
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.08, delay: 0.2 });
    }

    else if (feature === 'budget') {
      const donut = panel.querySelector('.ph-budget__donut');
      const legendRows = panel.querySelectorAll('.ph-budget__legend-row');
      gsap.fromTo(donut,
        { rotation: -90, scale: 0.7, autoAlpha: 0, transformOrigin: 'center center' },
        { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.4)' });
      gsap.fromTo(legendRows,
        { autoAlpha: 0, x: 10 },
        { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.08, ease, delay: 0.3 });
    }

    else if (feature === 'collab') {
      const rows = panel.querySelectorAll('.ph-collab__row');
      gsap.fromTo(rows,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.1, ease });
    }
  }

  function activate(idx) {
    cards.forEach((c, i) => {
      c.classList.toggle('is-active', i === idx);
      c.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
    currentIdx = idx;

    // Play the entrance animation for the newly active desktop panel
    if (panels[idx]) animatePanel(panels[idx]);

    // On mobile, also animate the inline preview inside the active card
    const mobilePanel = cards[idx] && cards[idx].querySelector('.feature-card__preview-mobile .features-preview__panel');
    if (mobilePanel) animatePanel(mobilePanel);
  }

  let isHovering = false;

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      // Pause auto-advance while user is hovering or has clicked
      if (!userInteracted && !isHovering) activate((currentIdx + 1) % cards.length);
    }, 5000);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      userInteracted = true;
      stopAuto();
      activate(i);
    });
    if (!isTouchDevice) {
      card.addEventListener('mouseenter', () => {
        isHovering = true;
        activate(i);
      });
      card.addEventListener('mouseleave', () => {
        isHovering = false;
      });
    }
  });

  // Start auto-advance when section enters viewport
  if ('IntersectionObserver' in window) {
    let hasPlayedFirst = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate the initially active panel the first time we enter view
          if (!hasPlayedFirst) {
            hasPlayedFirst = true;
            if (panels[currentIdx]) animatePanel(panels[currentIdx]);
          }
          if (!userInteracted) startAuto();
        } else {
          stopAuto();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }
})();


/* =============================================
   BRAIN VIDEO — Scroll-driven expand/shrink
   Expands from contained (72rem, rounded) → full-width (no radius)
   → holds → shrinks back to contained.
   ============================================= */
(function initBrainVideo() {
  if (prefersReduced) return;
  var wrap = document.getElementById('brainVideoWrap');
  if (!wrap) return;

  // Use the nomorechaos approach: scroll-position-based, no GSAP timeline.
  // This is what worked originally.
  var maxRadius = 20;
  var section = document.getElementById('brainSection');

  function updateBrainExpand() {
    var frameRect = wrap.getBoundingClientRect();
    var vh = window.innerHeight;
    var frameCenter = frameRect.top + frameRect.height / 2;
    var vpCenter = vh / 2;

    // Progress with dead zone — stays at 1.0 when near centre
    // Use asymmetric range: longer exit so shrink-back is slower
    var dist = frameCenter - vpCenter; // positive = below center, negative = above
    var deadZone = vh * 0.35;
    var absDist = Math.abs(dist);
    var exitRange = dist < 0 ? vh * 1.2 : vh * 0.7; // above center (scrolled past) = longer range
    var adjustedDist = Math.max(0, absDist - deadZone);
    var adjustedRange = exitRange - deadZone;
    var progress = Math.max(0, Math.min(1, 1 - (adjustedDist / adjustedRange)));

    // Ease for smoother feel
    var t = progress * progress;

    // Interpolate
    var radius = maxRadius * (1 - t);
    var maxW = 72 * 16; // 72rem in px
    var fullW = window.innerWidth;
    var currentW = maxW + (fullW - maxW) * t;

    wrap.style.maxWidth = Math.round(currentW) + 'px';
    wrap.style.borderRadius = radius.toFixed(1) + 'px';
    wrap.style.boxShadow = t > 0.5 ? 'none' : '';
  }

  window.addEventListener('scroll', updateBrainExpand, { passive: true });
  window.addEventListener('resize', updateBrainExpand, { passive: true });
  updateBrainExpand();
})();


/* =============================================
   INTEGRATIONS — Scroll-driven tech rows
   Row 1 moves right as you scroll down (left as you scroll up).
   Row 2 moves left as you scroll down (right as you scroll up).
   Both rows start offset so there's content on both sides,
   and both have duplicated content for continuous coverage.
   ============================================= */
(function initIntegrations() {
  if (prefersReduced) return;

  const section = document.getElementById('integrationsMarquees');
  const row1 = document.getElementById('techRow1');
  const row2 = document.getElementById('techRow2');
  if (!section || !row1 || !row2) return;

  // Start each row partially offset so you see content on both sides
  // Half the row width = the width of one duplicated set
  function getOffsets() {
    return {
      row1: row1.scrollWidth / 2,
      row2: row2.scrollWidth / 2,
    };
  }

  // Set initial positions — both rows use the SAME transform base so the
  // 50% content-order offset (row 2 HTML starts at index 11 of 21) is what
  // actually separates the logos visually between rows.
  function applyInitial() {
    const o = getOffsets();
    gsap.set(row1, { x: -o.row1 * 0.25 });
    gsap.set(row2, { x: -o.row2 * 0.25 });
  }

  window.addEventListener('load', applyInitial);
  requestAnimationFrame(applyInitial);

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.8,
    invalidateOnRefresh: true,
    onRefresh: applyInitial,
    onUpdate: (self) => {
      const o = getOffsets();
      const p = self.progress;
      // Row 1 drifts right as you scroll down; row 2 drifts left.
      // Both share the same base (-0.25) so the ~50% content offset on row 2
      // is preserved across the entire scroll range.
      const r1x = -o.row1 * 0.25 + (p * o.row1 * 0.125);
      const r2x = -o.row2 * 0.25 - (p * o.row2 * 0.125);
      row1.style.transform = `translateX(${r1x}px)`;
      row2.style.transform = `translateX(${r2x}px)`;
    }
  });
})();


/* =============================================
   STORIES CAROUSEL — Infinite loop, free scroll, drag
   ============================================= */
(function initStories() {
  new Swiper('#storiesSwiper', {
    slidesPerView: 1.3,
    spaceBetween: 16,
    centeredSlides: false,
    loop: true,                   // infinite scroll
    loopAdditionalSlides: 4,
    freeMode: {                    // smooth free-flow scrolling
      enabled: true,
      momentum: true,
      momentumRatio: 0.5,
      momentumVelocityRatio: 0.5,
    },
    grabCursor: true,
    speed: 600,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    breakpoints: {
      640: { slidesPerView: 2.3 },
      1024: { slidesPerView: 3.4 },
      1400: { slidesPerView: 4.2 },
    }
  });
})();


/* =============================================
   SIDE NAV — Show after hero, track active section,
   detect light/dark backgrounds
   ============================================= */
(function initSideNav() {
  const nav = document.getElementById('sideNav');
  if (!nav || isMobile) return;
  const dots = nav.querySelectorAll('.side-nav__dot');
  const hero = document.getElementById('heroSection');

  // Sections that the dots point to
  const sections = [];
  dots.forEach(dot => {
    const el = document.getElementById(dot.dataset.target);
    if (el) sections.push({ dot, el });
  });

  // Show after hero, hide at footer
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 80%',
    onEnter: () => nav.classList.add('is-visible'),
    onLeaveBack: () => nav.classList.remove('is-visible'),
  });

  var footer = document.querySelector('footer');
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 90%',
      onEnter: () => nav.classList.remove('is-visible'),
      onLeaveBack: () => nav.classList.add('is-visible'),
    });
  }

  // Track active section — use ScrollTrigger instead of IntersectionObserver
  // so it works correctly with pinned sections (IO gets confused by pin transforms)
  sections.forEach(({ dot, el }) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        dots.forEach(d => d.classList.remove('is-active'));
        dot.classList.add('is-active');
      },
      onEnterBack: () => {
        dots.forEach(d => d.classList.remove('is-active'));
        dot.classList.add('is-active');
      },
    });
  });

  // Click to scroll — use native scrollIntoView to avoid Lenis overshoot
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (!target) return;
      // Stop any current Lenis scroll, then use native smooth scroll
      lenis.stop();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Restart Lenis after the scroll completes
      setTimeout(() => lenis.start(), 1200);
    });
  });
})();


/* =============================================
   NEWSLETTER FORM — Show confirmation on submit
   ============================================= */
(function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  const btn = document.getElementById('newsletterBtn');
  const msg = document.getElementById('newsletterMsg');
  const input = document.getElementById('newsletterEmail');
  if (!form || !btn || !msg || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input.value.trim() || !input.checkValidity()) return;
    btn.textContent = 'Sent!';
    btn.disabled = true;
    msg.style.opacity = '1';
  });
})();


/* =============================================
   FAQ ACCORDION — One open at a time
   ============================================= */
(function initFaq() {
  const list = document.getElementById('faqList');
  if (!list) return;
  const items = list.querySelectorAll('.faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq-item__trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      // Close all
      items.forEach(i => {
        i.classList.remove('is-open');
        i.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
      });
      // Open this one if it wasn't already open
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


(function(){
  // Only run on homepage
  if(window.location.pathname !== '/' && !window.location.pathname.endsWith('homepage.html')) return;
  // Only once per session
  if(sessionStorage.getItem('teamrun_dismissed')) return;

  const IDLE_MS = 120000;
  let idleTimer = null;
  const overlay = document.getElementById('teamrun-overlay');
  const frame = document.getElementById('teamrun-frame');
  const exitBtn = document.getElementById('teamrun-exit');
  let gameActive = false;
  let dismissed = false;

  function resetTimer(){
    if(gameActive || dismissed) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(showGame, IDLE_MS);
  }

  function showGame(){
    if(gameActive) return;
    gameActive = true;
    frame.src = 'game/index.html';
    overlay.style.display = 'block';
    // Trigger fade in on next frame
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      overlay.style.opacity = '1';
    }); });
    setTimeout(function(){ frame.focus(); }, 1300);
  }

  function hideGame(){
    gameActive = false;
    dismissed = true;
    sessionStorage.setItem('teamrun_dismissed','1');
    overlay.style.opacity = '0';
    setTimeout(function(){
      overlay.style.display = 'none';
      frame.src = '';
    }, 1200);
  }

  exitBtn.addEventListener('click', hideGame);

  // Any interaction resets the idle timer
  ['mousemove','mousedown','keydown','scroll','touchstart','click'].forEach(function(evt){
    document.addEventListener(evt, resetTimer, {passive:true});
  });

  resetTimer();
})();
