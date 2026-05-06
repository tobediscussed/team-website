/* Team — For-managers scripts */
(function() {
  const nav = document.getElementById('nav');
  const hero = document.getElementById('heroSection');
  const heroInner = hero ? hero.querySelector('.icp-hero__inner') : null;
  if (!nav || !hero) return;

  function check() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const heroH = hero.offsetHeight;
    const scrolled = window.scrollY;

    // Nav solid transition
    if (heroBottom < 60) nav.classList.add('nav--solid');
    else nav.classList.remove('nav--solid');

    // Hero content fade on scroll
    if (heroInner) {
      const progress = Math.min(1, scrolled / (heroH * 0.5));
      heroInner.style.opacity = 1 - progress;
      heroInner.style.transform = 'translateY(' + (progress * 40) + 'px)';
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  check();

  // Steps scroll reveal
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.step').forEach(function(s) { observer.observe(s); });
  }
})();

(function initFeatures() {
  var section = document.getElementById('featuresSection');
  if (!section) return;
  var cards = section.querySelectorAll('.feature-card');
  var desktopPreview = section.querySelector('.features-spotlight > .features-preview');
  var panels = desktopPreview
    ? desktopPreview.querySelectorAll(':scope > .features-preview__panel')
    : [];

  var currentIdx = 0;
  var autoTimer = null;
  var userInteracted = false;
  var isTouchDevice = !window.matchMedia('(hover: hover)').matches;
  var isHovering = false;

  function activate(idx) {
    cards.forEach(function(c, i) {
      c.classList.toggle('is-active', i === idx);
      c.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    panels.forEach(function(p, i) {
      p.classList.toggle('is-active', i === idx);
    });
    currentIdx = idx;
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function() {
      if (!userInteracted && !isHovering) {
        activate((currentIdx + 1) % cards.length);
      }
    }, 5000);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  cards.forEach(function(card, i) {
    card.addEventListener('click', function() {
      userInteracted = true;
      stopAuto();
      activate(i);
    });
    if (!isTouchDevice) {
      card.addEventListener('mouseenter', function() {
        isHovering = true;
        activate(i);
      });
      card.addEventListener('mouseleave', function() {
        isHovering = false;
      });
    }
  });

  // Start auto-advance when section enters viewport
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          if (!userInteracted) startAuto();
        } else {
          stopAuto();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  } else {
    startAuto();
  }
})();
