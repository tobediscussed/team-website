/* Team — onboarding scripts */
(function() {
  // Plan config — prices mirror pricing.html
  // Every paid plan is $0 for the 30-day trial, then the regular rate.
  const PLANS = {
    free: {
      name: 'Free',
      hasPeriod: false,
      cta: 'Start my first release',
      note: 'Free forever. No credit card, no billing.',
      // mainPrice / sub: shown on the plan bubble itself
      main: () => ({ price: '$0', unit: 'forever' }),
      sub: () => 'No credit card required',
    },
    pro: {
      name: 'Pro',
      price: { yearly: 19.99, monthly: 24.99 },
      hasPeriod: true,
      cta: 'Start my first release',
      main: () => ({ price: '$0', unit: 'for 30 days' }),
      sub: (term) => `Then $${PLANS.pro.price[term].toFixed(2)}/mo, billed ${term}`,
    },
    enterprise: {
      name: 'Enterprise',
      hasPeriod: false,
      cta: 'Request Enterprise access',
      note: "Enterprise pricing is tailored to your roster and workflow. Submit your details and our team will reach out.",
      main: () => ({ price: 'Custom', unit: '' }),
      sub: () => 'Tailored to your roster',
    },
  };

  // State
  let currentPlan = 'pro';
  let currentTerm = 'yearly';

  // Elements
  const planOptions = document.querySelectorAll('.plan-option');
  const termOptions = document.querySelectorAll('.term-option');
  const termSelector = document.getElementById('termSelector');
  const planNote = document.getElementById('planNote');
  const submitBtn = document.getElementById('submitBtn');
  const hiddenPlan = document.getElementById('hiddenPlan');
  const hiddenPeriod = document.getElementById('hiddenPeriod');
  const orgLabel = document.getElementById('orgLabel');
  const orgInput = document.getElementById('orgName');

  function renderPrices() {
    planOptions.forEach(opt => {
      const key = opt.getAttribute('data-plan');
      const plan = PLANS[key];
      const priceEl = opt.querySelector('[data-price]');
      const subEl = opt.querySelector('[data-sub]');
      if (!priceEl || !subEl) return;
      const { price, unit } = plan.main(currentTerm);
      priceEl.innerHTML = unit
        ? `${price} <small>${unit}</small>`
        : price;
      subEl.textContent = plan.sub(currentTerm);
    });
  }

  function renderPlanState() {
    planOptions.forEach(opt => {
      const active = opt.getAttribute('data-plan') === currentPlan;
      opt.classList.toggle('plan-option--active', active);
      opt.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    const plan = PLANS[currentPlan];
    if (plan.hasPeriod) {
      termSelector.hidden = false;
      planNote.hidden = true;
    } else {
      termSelector.hidden = true;
      if (plan.note) {
        planNote.textContent = plan.note;
        planNote.hidden = false;
      } else {
        planNote.hidden = true;
      }
    }

    submitBtn.textContent = plan.cta;
    hiddenPlan.value = currentPlan;
    hiddenPeriod.value = currentTerm;

    // Free plan re-labels Organization → Artist name
    if (currentPlan === 'free') {
      orgLabel.textContent = 'Artist name';
      orgInput.placeholder = 'Your artist or stage name';
      orgInput.name = 'artist_name';
    } else {
      orgLabel.textContent = 'Organization name';
      orgInput.placeholder = 'Your label, company, or team name';
      orgInput.name = 'organization';
    }
  }

  function renderTermState() {
    termOptions.forEach(opt => {
      const active = opt.getAttribute('data-term') === currentTerm;
      opt.classList.toggle('term-option--active', active);
      opt.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    hiddenPeriod.value = currentTerm;
  }

  // Click handlers
  planOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const newPlan = opt.getAttribute('data-plan');
      if (newPlan === currentPlan) return;
      currentPlan = newPlan;
      renderPlanState();
      renderPrices();
    });
  });
  termOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const newTerm = opt.getAttribute('data-term');
      if (newTerm === currentTerm) return;
      currentTerm = newTerm;
      renderTermState();
      renderPrices();
    });
  });

  // Keyboard: arrow keys between plan bubbles for accessibility
  function wireArrowKeys(nodeList, values, onChange) {
    nodeList.forEach((node, i) => {
      node.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault();
        const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
        const next = (i + (forward ? 1 : -1) + nodeList.length) % nodeList.length;
        nodeList[next].focus();
        onChange(values[next]);
      });
    });
  }
  wireArrowKeys(planOptions, Array.from(planOptions).map(o => o.getAttribute('data-plan')), (p) => {
    currentPlan = p; renderPlanState(); renderPrices();
  });
  wireArrowKeys(termOptions, Array.from(termOptions).map(o => o.getAttribute('data-term')), (t) => {
    currentTerm = t; renderTermState(); renderPrices();
  });

  // Initialize from URL params (?plan=pro&period=yearly)
  const params = new URLSearchParams(window.location.search);
  const urlPlan = (params.get('plan') || 'pro').toLowerCase();
  const urlPeriod = (params.get('period') || 'yearly').toLowerCase();
  if (PLANS[urlPlan]) currentPlan = urlPlan;
  if (urlPeriod === 'monthly' || urlPeriod === 'yearly') currentTerm = urlPeriod;

  renderPlanState();
  renderTermState();
  renderPrices();

  // Promo code toggle (unchanged behavior)
  const promoToggle = document.getElementById('promoToggle');
  const promoField = document.getElementById('promoField');
  if (promoToggle) {
    promoToggle.addEventListener('click', function(e) {
      e.preventDefault();
      promoField.style.display = 'block';
      promoToggle.parentElement.style.display = 'none';
      document.getElementById('promoCode').focus();
    });
  }

  // Ambient gradient — endless drift (no scroll dependency).
  // Each blob follows its own sine-wave path at a unique phase/frequency so
  // the combined motion never repeats the same frame. Mouse parallax layered
  // on top for a bit of liveliness on desktop.
  (function initGradientLoop() {
    const b1 = document.getElementById('onbBlob1');
    const b2 = document.getElementById('onbBlob2');
    const bT = document.getElementById('onbBlobT');
    const bL = document.getElementById('onbBlobLeft');
    if (!b1) return;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    window.addEventListener('mousemove', (e) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    const start = performance.now();
    function tick(now) {
      const t = (now - start) * 0.00015;
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      if (b1) b1.style.transform = `translate(${Math.sin(t * 0.9) * 40 + mx * 30}px, ${Math.cos(t * 0.7) * 30 + my * 25}px)`;
      if (b2) b2.style.transform = `translate(${Math.sin(t * 1.2 + 1.5) * 35 + mx * -22}px, ${Math.cos(t * 0.5 + 0.8) * 28 + my * 16}px)`;
      if (bT) bT.style.transform = `translate(${Math.sin(t * 0.6 + 2.2) * 30 + mx * 18}px, ${Math.cos(t * 1.1 + 3.1) * 35 + my * -22}px)`;
      if (bL) bL.style.transform = `translate(${Math.sin(t * 0.5 + 4.0) * 45 + mx * -30}px, ${Math.cos(t * 0.8 + 2.5) * 25 + my * -15}px)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  // Form submit
  const form = document.getElementById('onboardingForm');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!document.getElementById('agreeTerms').checked) return;
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = currentPlan === 'enterprise' ? 'Sending request…' : 'Setting up your workspace…';
    // TODO: POST to Team platform API + HubSpot.
    // Enterprise should route to a separate lead workflow on the backend.
    setTimeout(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }, 3000);
  });
})();

