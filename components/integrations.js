/* Team — integrations scripts */
(function() {
  var nav = document.getElementById('nav');
  var hero = document.getElementById('heroSection');
  var heroInner = hero ? hero.querySelector('.icp-hero__inner') : null;
  if (!nav || !hero) return;
  function check() {
    var heroBottom = hero.getBoundingClientRect().bottom;
    var heroH = hero.offsetHeight;
    var scrolled = window.scrollY;
    if (heroBottom < 60) nav.classList.add('nav--solid');
    else nav.classList.remove('nav--solid');
    if (heroInner) {
      var progress = Math.min(1, scrolled / (heroH * 0.5));
      heroInner.style.opacity = 1 - progress;
      heroInner.style.transform = 'translateY(' + (progress * 40) + 'px)';
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

(function() {
  var cards = document.querySelectorAll('.int-card');
  var filters = document.querySelectorAll('.int-filter');
  var searchInput = document.getElementById('intSearch');
  var emptyState = document.getElementById('intEmpty');
  var activeFilter = 'all';

  function filterAndSearch() {
    var query = searchInput.value.toLowerCase().trim();
    var visibleCount = 0;

    cards.forEach(function(card) {
      var cat = card.getAttribute('data-category');
      var name = card.getAttribute('data-name').toLowerCase();
      var matchesFilter = (activeFilter === 'all' || cat === activeFilter);
      var matchesSearch = (!query || name.indexOf(query) !== -1);
      var show = matchesFilter && matchesSearch;

      card.style.display = show ? '' : 'none';
      if (show) {
        visibleCount++;
        // Trigger reveal animation
        if (!card.classList.contains('is-visible')) {
          card.classList.add('is-visible');
        }
      }
    });

    // Empty state
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  // Filter clicks
  filters.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filters.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      activeFilter = btn.getAttribute('data-filter');
      filterAndSearch();
    });
  });

  // Search input
  searchInput.addEventListener('input', filterAndSearch);

  // Add category labels to cards
  var catLabels = {
    'distribution': 'Distribution',
    'social': 'Social & Marketing',
    'analytics': 'Analytics',
    'productivity': 'Productivity',
    'coming-soon': 'Coming Soon'
  };
  cards.forEach(function(card) {
    var cat = card.getAttribute('data-category');
    if (cat && catLabels[cat] && !card.querySelector('.int-card__badge')) {
      var info = card.querySelector('.int-card__info');
      if (info) {
        var badge = document.createElement('span');
        badge.className = 'int-card__badge';
        badge.textContent = catLabels[cat];
        info.appendChild(badge);
      }
    }
  });

  // Initial scroll reveal
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      });
    }, { threshold: 0.1 });
    cards.forEach(function(card, i) {
      card.style.transitionDelay = (i % 4) * 0.06 + 's';
      observer.observe(card);
    });
  } else {
    cards.forEach(function(card) { card.classList.add('is-visible'); });
  }
})();

