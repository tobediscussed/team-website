/* Team — security scripts */
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
})();

(function() {
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.pillar-card').forEach(function(c) { observer.observe(c); });
    // Also observe the AI privacy panel
    var isoPanel = document.getElementById('isoPanel');
    if (isoPanel) observer.observe(isoPanel);
  }
})();

(function() {
  var panel = document.getElementById('isoPanel');
  if (!panel) return;
  var svg = document.getElementById('isoLinesSvg');
  var center = panel.querySelector('.iso-center');
  var conns = panel.querySelectorAll('.iso-connected');
  var pulses = [
    [document.getElementById('isoPulse1'), document.getElementById('isoPulse1r')],
    [document.getElementById('isoPulse2'), document.getElementById('isoPulse2r')],
    [document.getElementById('isoPulse3'), document.getElementById('isoPulse3r')],
  ];

  // Get center of an element relative to the panel
  function getCenter(el) {
    var pr = panel.getBoundingClientRect();
    var er = el.getBoundingClientRect();
    return { x: er.left - pr.left + er.width / 2, y: er.top - pr.top + er.height / 2 };
  }

  // Draw SVG lines connecting green tiles to center tile
  function drawLines() {
    var pw = panel.offsetWidth;
    var ph = panel.offsetHeight;
    svg.setAttribute('width', pw);
    svg.setAttribute('height', ph);
    svg.setAttribute('viewBox', '0 0 ' + pw + ' ' + ph);
    svg.innerHTML = '';
    var c = getCenter(center);
    conns.forEach(function(conn) {
      var t = getCenter(conn);
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', t.x);
      line.setAttribute('y1', t.y);
      line.setAttribute('x2', c.x);
      line.setAttribute('y2', c.y);
      line.setAttribute('stroke', '#191919');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    });
  }

  // Animate pulses along lines — only after lines have faded in (1.5s after panel visible)
  var startTimes = [0, 1500, 500, 2000, 1000, 700];
  var durations = [3000, 3500, 4000, 3000, 3500, 4000];
  var visibleSince = 0;

  // Track when panel becomes visible
  var panelObserver = new MutationObserver(function() {
    if (panel.classList.contains('is-visible') && !visibleSince) {
      visibleSince = performance.now();
    } else if (!panel.classList.contains('is-visible')) {
      visibleSince = 0;
    }
  });
  panelObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });

  function animatePulses(timestamp) {
    var c = getCenter(center);
    var isVisible = panel.classList.contains('is-visible');
    // Pulses appear 1.5s after panel visible (after lines fade in at 0.8s + 0.6s transition)
    var pulsesReady = isVisible && visibleSince && (timestamp - visibleSince > 1500);

    conns.forEach(function(conn, i) {
      var t = getCenter(conn);
      var fwd = pulses[i][0];
      var rev = pulses[i][1];
      if (!fwd || !rev) return;

      var elapsed = (timestamp + startTimes[i * 2]) % durations[i * 2];
      var p = elapsed / durations[i * 2];
      var ep = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var fx = t.x + (c.x - t.x) * ep;
      var fy = t.y + (c.y - t.y) * ep;
      var fo = p < 0.1 ? p / 0.1 : p > 0.9 ? (1 - p) / 0.1 : 1;
      fwd.style.left = (fx - 5) + 'px';
      fwd.style.top = (fy - 5) + 'px';
      fwd.style.opacity = pulsesReady ? fo : 0;

      // Reverse
      var elapsed2 = (timestamp + startTimes[i * 2 + 1]) % durations[i * 2 + 1];
      var p2 = elapsed2 / durations[i * 2 + 1];
      var ep2 = p2 < 0.5 ? 2 * p2 * p2 : 1 - Math.pow(-2 * p2 + 2, 2) / 2;
      var rx = c.x + (t.x - c.x) * ep2;
      var ry = c.y + (t.y - c.y) * ep2;
      var ro = p2 < 0.1 ? p2 / 0.1 : p2 > 0.9 ? (1 - p2) / 0.1 : 1;
      rev.style.left = (rx - 5) + 'px';
      rev.style.top = (ry - 5) + 'px';
      rev.style.opacity = pulsesReady ? ro : 0;
    });
    drawLines();
    requestAnimationFrame(animatePulses);
  }

  drawLines();
  requestAnimationFrame(animatePulses);
})();

(function() {
  var section = document.getElementById('complianceSection');
  if (!section) return;
  var scrollContainer = section.querySelector('.compliance-scroll');
  var cards = section.querySelectorAll('.compliance-card');
  var dots = section.querySelectorAll('.compliance-dots__dot');
  var numCards = cards.length;

  // First card starts visible and centered
  cards[0].style.opacity = '1';
  cards[0].style.transform = 'translateY(0)';

  function update() {
    var rect = scrollContainer.getBoundingClientRect();
    var scrollH = scrollContainer.offsetHeight;
    var viewH = window.innerHeight;

    var scrolled = -rect.top;
    var totalScroll = scrollH - viewH;
    if (totalScroll <= 0) return;
    var progress = Math.max(0, Math.min(1, scrolled / totalScroll));

    // First 10% = hold first card, then carousel transitions
    var holdEnd = 0.1;

    cards.forEach(function(card, i) {
      if (progress <= holdEnd) {
        // Hold phase — first card stays, others hidden
        if (i === 0) {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(80px)';
        }
      } else {
        // Carousel phase
        var carouselP = (progress - holdEnd) / (1 - holdEnd); // 0 to 1
        var slice = 1 / numCards;
        var cardStart = i * slice;
        var cardEnd = (i + 1) * slice;
        var cardHoldIn = cardStart + slice * 0.3;
        var cardHoldOut = cardStart + slice * 0.7;

        if (carouselP < cardStart) {
          card.style.transform = 'translateY(80px)';
          card.style.opacity = '0';
        } else if (carouselP < cardHoldIn) {
          // Entering — skip for first card (already visible from hold phase)
          if (i === 0) {
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
          } else {
            var p = (carouselP - cardStart) / (cardHoldIn - cardStart);
            card.style.transform = 'translateY(' + (80 * (1 - p)) + 'px)';
            card.style.opacity = String(Math.min(1, p * 1.5));
          }
        } else if (carouselP < cardHoldOut) {
          // Holding
          card.style.transform = 'translateY(0)';
          card.style.opacity = '1';
        } else if (carouselP < cardEnd && i < numCards - 1) {
          // Exiting (not last card)
          var p = (carouselP - cardHoldOut) / (cardEnd - cardHoldOut);
          card.style.transform = 'translateY(' + (-80 * p) + 'px)';
          card.style.opacity = String(Math.max(0, 1 - p));
        } else if (i === numCards - 1) {
          // Last card stays
          card.style.transform = 'translateY(0)';
          card.style.opacity = '1';
        } else {
          card.style.transform = 'translateY(-80px)';
          card.style.opacity = '0';
        }
      }
    });

    // Update dots
    var activeIdx = Math.min(numCards - 1, Math.floor(progress * numCards));
    dots.forEach(function(dot, i) {
      dot.classList.toggle('is-active', i === activeIdx);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

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

