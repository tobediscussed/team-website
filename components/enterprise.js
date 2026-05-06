/* Team — Enterprise scripts */
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
  // Shared panel animation function
  window._animatePanel = function(panel) {
    if (!panel) return;
    panel.querySelectorAll('.mock-dashboard__card').forEach(function(card, i) {
      card.style.opacity = '0'; card.style.transform = 'translateY(12px)';
      card.style.transition = 'opacity 0.4s ease ' + (0.06 + i * 0.08) + 's, transform 0.4s ease ' + (0.06 + i * 0.08) + 's';
      setTimeout(function() { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 20);
    });
    panel.querySelectorAll('.mock-audit__row').forEach(function(row, i) {
      row.style.opacity = '0'; row.style.transform = 'translateX(-12px)';
      row.style.transition = 'opacity 0.35s ease ' + (0.05 + i * 0.1) + 's, transform 0.35s ease ' + (0.05 + i * 0.1) + 's';
      setTimeout(function() { row.style.opacity = '1'; row.style.transform = 'translateX(0)'; }, 20);
    });
    panel.querySelectorAll('.mock-templates__card').forEach(function(card, i) {
      card.style.opacity = '0'; card.style.transform = 'translateY(8px)';
      card.style.transition = 'opacity 0.35s ease ' + (0.05 + i * 0.1) + 's, transform 0.35s ease ' + (0.05 + i * 0.1) + 's';
      setTimeout(function() { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 20);
    });
  };

  // Observe panels
  if ('IntersectionObserver' in window) {
    var animObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) window._animatePanel(e.target);
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.pain-row__panel').forEach(function(p) { animObserver.observe(p); });

    // Feature blocks scroll reveal
    var featureObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.feature-block').forEach(function(b) { featureObs.observe(b); });
  }
})();
