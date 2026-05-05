/* Team — Pricing scripts */

(function initBillingToggle() {
  const toggle = document.getElementById('billingSwitch');
  if (!toggle) return;
  const labels = document.querySelectorAll('.billing-toggle__label');
  const saveTag = document.querySelector('.billing-toggle__save');
  let isYearly = true;

  function update() {
    // Toggle UI
    toggle.classList.toggle('is-monthly', !isYearly);
    labels.forEach(l => {
      l.classList.toggle('is-active', l.getAttribute('data-period') === (isYearly ? 'yearly' : 'monthly'));
    });
    if (saveTag) saveTag.style.opacity = isYearly ? '1' : '0.3';

    const period = isYearly ? 'yearly' : 'monthly';

    // Update each pricing card
    document.querySelectorAll('.pricing-card[data-plan]').forEach(card => {
      const plan = card.getAttribute('data-plan');
      if (plan === 'free') {
        // Update CTA link period param
        const cta = card.querySelector('[data-cta]');
        if (cta) cta.href = 'onboarding.html?plan=free&period=' + period;
        return;
      }

      const price = card.getAttribute('data-' + period);
      const unit = card.getAttribute('data-unit');
      const thenEl = card.querySelector('[data-then]');
      const billingEl = card.querySelector('[data-billing]');
      const cta = card.querySelector('[data-cta]');

      if (thenEl) {
        if (unit === 'seat') {
          thenEl.textContent = 'Then $' + price + '/month per seat';
        } else {
          thenEl.textContent = 'Then $' + price + '/' + unit;
        }
      }
      if (billingEl) billingEl.textContent = 'billed ' + period;
      if (cta) cta.href = 'onboarding.html?plan=' + plan + '&period=' + period;
    });
  }

  toggle.addEventListener('click', () => { isYearly = !isYearly; update(); });
  toggle.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); isYearly = !isYearly; update(); }
  });
  labels.forEach(l => {
    l.addEventListener('click', () => {
      isYearly = l.getAttribute('data-period') === 'yearly';
      update();
    });
  });

  update();
})();

(function() {
  var section = document.getElementById('compare');
  if (!section) return;
  var table = section.querySelector('.comparison-table');
  var thead = table.querySelector('thead');
  if (!thead) return;

  // Clone the thead into a fixed bar
  var sticky = document.createElement('div');
  sticky.className = 'comparison-sticky';
  var stickyTable = document.createElement('table');
  stickyTable.style.tableLayout = 'fixed';
  var clonedHead = thead.cloneNode(true);
  stickyTable.appendChild(clonedHead);
  sticky.appendChild(stickyTable);
  document.body.appendChild(sticky);

  function sync() {
    // Match column widths from the real table
    var realThs = thead.querySelectorAll('th');
    var cloneThs = clonedHead.querySelectorAll('th');
    var tableRect = table.getBoundingClientRect();
    stickyTable.style.width = tableRect.width + 'px';
    stickyTable.style.marginLeft = tableRect.left + 'px';
    stickyTable.style.marginRight = 'auto';
    for (var i = 0; i < realThs.length; i++) {
      if (cloneThs[i]) cloneThs[i].style.width = realThs[i].offsetWidth + 'px';
    }

    var theadRect = thead.getBoundingClientRect();
    var sectionRect = section.getBoundingClientRect();
    var lastRow = table.querySelector('tbody tr:last-child');
    var lastRowBottom = lastRow ? lastRow.getBoundingClientRect().bottom : sectionRect.bottom;

    // Show sticky when original thead scrolls above viewport AND table is still visible
    if (theadRect.bottom < 0 && lastRowBottom > 60) {
      sticky.classList.add('is-visible');
    } else {
      sticky.classList.remove('is-visible');
    }

    // Sync top-offset with nav visibility so the two don't overlap when user
    // scrolls back up. Nav shown → slide sticky below it. Nav hidden → dock to 0.
    var nav = document.getElementById('nav');
    var navHidden = nav && nav.classList.contains('nav--hidden');
    sticky.classList.toggle('is-below-nav', !navHidden);
  }

  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);

  // Also re-sync whenever the nav class changes (e.g. the moment it hides/shows)
  var navEl = document.getElementById('nav');
  if (navEl && 'MutationObserver' in window) {
    var mo = new MutationObserver(sync);
    mo.observe(navEl, { attributes: true, attributeFilter: ['class'] });
  }

  sync();
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
