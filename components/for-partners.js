/* Team — For-partners scripts */
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

(function() {
  var tabs = document.querySelectorAll('.partner-tab');
  var panels = document.querySelectorAll('.partner-panel');

  // Tab switching
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.getAttribute('data-tab');
      tabs.forEach(function(t) { t.classList.remove('is-active'); });
      panels.forEach(function(p) { p.classList.remove('is-active'); });
      tab.classList.add('is-active');
      document.querySelector('.partner-panel[data-tab="' + target + '"]').classList.add('is-active');
    });
  });

  // Feature-to-preview switching within each tab panel
  document.querySelectorAll('.partner-panel__feature[data-preview]').forEach(function(feature) {
    feature.addEventListener('mouseenter', function() {
      var panel = feature.closest('.partner-panel');
      var previewId = feature.getAttribute('data-preview');
      // Deactivate all features in this panel
      panel.querySelectorAll('.partner-panel__feature').forEach(function(f) { f.classList.remove('is-active'); });
      feature.classList.add('is-active');
      // Switch preview
      panel.querySelectorAll('.partner-preview-item').forEach(function(p) { p.classList.remove('is-active'); });
      var target = panel.querySelector('.partner-preview-item[data-preview="' + previewId + '"]');
      if (target) {
        target.classList.add('is-active');
      }
    });
    feature.addEventListener('click', function() {
      feature.dispatchEvent(new Event('mouseenter'));
    });
  });

  // Generate hearts
  var heartsEl = document.getElementById('heartsContainer');
  if (heartsEl) {
    var heartSVG = '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    for (var i = 0; i < 42; i++) {
      var h = document.createElement('div');
      h.className = 'analytics-hearts__heart anim-scale';
      h.innerHTML = heartSVG;
      if (i > 30) h.style.opacity = Math.max(0.08, 1 - (i - 30) * 0.08);
      heartsEl.appendChild(h);
    }
  }

  // Animate preview panel elements when they become active
  function animatePreview(previewItem) {
    if (!previewItem) return;

    // Reset all animatable elements first
    previewItem.querySelectorAll('.is-animated').forEach(function(el) { el.classList.remove('is-animated'); });

    // Bars (vertical — analytics bar chart)
    previewItem.querySelectorAll('.analytics-bars__bar').forEach(function(bar, i) {
      var h = bar.style.height;
      bar.style.setProperty('--h', h);
      bar.classList.add('anim-bar');
      bar.classList.remove('is-animated');
      setTimeout(function() { bar.classList.add('is-animated'); }, 50 + i * 30);
    });

    // Hearts
    previewItem.querySelectorAll('.analytics-hearts__heart').forEach(function(heart, i) {
      heart.classList.remove('is-animated');
      setTimeout(function() { heart.classList.add('is-animated'); }, 30 + i * 20);
    });

    // Tags
    previewItem.querySelectorAll('.analytics-tags__tag').forEach(function(tag, i) {
      tag.classList.add('anim-scale');
      tag.classList.remove('is-animated');
      setTimeout(function() { tag.classList.add('is-animated'); }, 80 + i * 60);
    });

    // Dashboard cards
    previewItem.querySelectorAll('.mock-dashboard__card').forEach(function(card, i) {
      card.classList.add('anim-fade');
      card.classList.remove('is-animated');
      setTimeout(function() { card.classList.add('is-animated'); }, 60 + i * 80);
    });

    // Timeline/gantt bars (horizontal)
    previewItem.querySelectorAll('.fp-timeline__bar, .mock-gantt__bar').forEach(function(bar, i) {
      bar.classList.add('anim-bar-h');
      bar.classList.remove('is-animated');
      setTimeout(function() { bar.classList.add('is-animated'); }, 100 + i * 80);
    });

    // Timeline rows
    previewItem.querySelectorAll('.fp-timeline__row, .mock-gantt__row').forEach(function(row, i) {
      row.classList.add('anim-slide');
      row.classList.remove('is-animated');
      setTimeout(function() { row.classList.add('is-animated'); }, 50 + i * 60);
    });

    // Task rows
    previewItem.querySelectorAll('.fp-tasks__row').forEach(function(row, i) {
      row.classList.add('anim-fade');
      row.classList.remove('is-animated');
      setTimeout(function() { row.classList.add('is-animated'); }, 60 + i * 80);
    });

    // Task checkmarks
    previewItem.querySelectorAll('.fp-tasks__check--done').forEach(function(check, i) {
      check.classList.add('anim-check');
      check.classList.remove('is-animated');
      setTimeout(function() { check.classList.add('is-animated'); }, 200 + i * 100);
    });

    // Collab rows
    previewItem.querySelectorAll('.mock-collab__row').forEach(function(row, i) {
      row.classList.add('anim-slide');
      row.classList.remove('is-animated');
      setTimeout(function() { row.classList.add('is-animated'); }, 60 + i * 100);
    });

    // Chat bubbles
    previewItem.querySelectorAll('.fp-chat__row').forEach(function(row, i) {
      row.classList.add('anim-fade');
      row.classList.remove('is-animated');
      setTimeout(function() { row.classList.add('is-animated'); }, 100 + i * 300);
    });

    // Chat input
    var chatInput = previewItem.querySelector('.fp-chat__input');
    if (chatInput) {
      chatInput.classList.add('anim-fade');
      chatInput.classList.remove('is-animated');
      setTimeout(function() { chatInput.classList.add('is-animated'); }, 700);
    }

    // Budget bar fills
    previewItem.querySelectorAll('.fp-budget__bar-fill').forEach(function(bar, i) {
      bar.classList.add('anim-bar-h');
      bar.classList.remove('is-animated');
      setTimeout(function() { bar.classList.add('is-animated'); }, 100 + i * 120);
    });

    // Budget total
    var budgetTotal = previewItem.querySelector('.fp-budget__total');
    if (budgetTotal) {
      budgetTotal.classList.add('anim-fade');
      budgetTotal.classList.remove('is-animated');
      setTimeout(function() { budgetTotal.classList.add('is-animated'); }, 500);
    }

    // Command center cards
    previewItem.querySelectorAll('.fp-command__card').forEach(function(card, i) {
      card.classList.add('anim-fade');
      card.classList.remove('is-animated');
      setTimeout(function() { card.classList.add('is-animated'); }, 40 + i * 60);
    });

    // Count-up
    var countEl = previewItem.querySelector('[data-countup]');
    if (countEl) animateCountUp(countEl);

    // Reach pill
    var reachPill = previewItem.querySelector('.analytics-tile .mock-dashboard__pill');
    if (reachPill) {
      reachPill.classList.add('anim-fade');
      reachPill.classList.remove('is-animated');
      setTimeout(function() { reachPill.classList.add('is-animated'); }, 1000);
    }
  }

  // Hook animations into the feature switching
  var origFeatureHandlers = document.querySelectorAll('.partner-panel__feature[data-preview]');
  origFeatureHandlers.forEach(function(feature) {
    feature.addEventListener('mouseenter', function() {
      var panel = feature.closest('.partner-panel');
      var previewId = feature.getAttribute('data-preview');
      var target = panel.querySelector('.partner-preview-item[data-preview="' + previewId + '"]');
      setTimeout(function() { animatePreview(target); }, 50);
    });
  });

  // Animate the initially active preview in each tab
  document.querySelectorAll('.partner-panel.is-active .partner-preview-item.is-active').forEach(function(item) {
    setTimeout(function() { animatePreview(item); }, 300);
  });

  // Also animate when switching tabs
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      setTimeout(function() {
        var activePanel = document.querySelector('.partner-panel.is-active');
        if (activePanel) {
          var activePreview = activePanel.querySelector('.partner-preview-item.is-active');
          animatePreview(activePreview);
        }
      }, 100);
    });
  });

  // Count-up animation
  function animateCountUp(el) {
    var end = parseInt(el.getAttribute('data-countup'));
    var duration = 1200;
    var start = 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * end);
      if (current >= 1000) {
        el.textContent = (current / 1000).toFixed(current >= 100000 ? 0 : 1) + 'k';
      } else {
        el.textContent = current;
      }
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = '890k';
    }
    requestAnimationFrame(step);
  }
})();
