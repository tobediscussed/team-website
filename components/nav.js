// Shared nav component for Team Rollouts website
// Usage: <div id="team-nav" data-theme="dark|light"></div>
// Then: <script src="components/nav.js"></script>
// data-theme="dark"  = transparent glass on dark bg (homepage hero, ICP pages)
// data-theme="light" = solid white immediately (interior/content pages)
//
// LINK MANAGEMENT: All site links are in the `links` object below.
// Update links here and they propagate to every page using this component.
// NOTE: The homepage has its own inline nav — update homepage.html separately when links change.
//
// This component also injects its own CSS for:
//  - the mega (3-col) dropdowns
//  - the status dot
//  - the mobile burger + full-screen mobile menu
// Core nav styles live in components/nav.css and are auto-injected below
// (mirrors the footer.js → footer.css pattern). Existing pages still have
// inline copies of these rules; that's harmless redundancy — both resolve
// to the same values, so there's no conflict.

(function() {
  // ─── AUTO-INJECT NAV.CSS (idempotent) ───
  // Resolves the stylesheet path relative to nav.js itself, so external
  // hosts (Webflow, etc.) just need to include nav.js — the CSS comes
  // along automatically.
  if (!document.querySelector('link[data-team-nav-css]')) {
    var thisScript = document.currentScript
      || Array.from(document.scripts).reverse().find(function(s){ return /components\/nav\.js/.test(s.src); });
    var href = 'components/nav.css';
    if (thisScript && thisScript.src) {
      try { href = new URL('nav.css', thisScript.src).href; } catch (e) {}
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-team-nav-css', '');
    document.head.appendChild(link);
  }

  // ─── SINGLE SOURCE OF TRUTH FOR ALL SITE LINKS ───
  const links = {
    home: '/',
    // Product
    orchestration: '/orchestration',
    intelligence: '/intelligence',
    integrations: '/integrations',
    security: '/security',
    // Solutions (Enterprise moved in here as "For Enterprise")
    labels: '/for-labels',
    managers: '/for-managers',
    artists: '/for-artists',
    partners: '/for-partners',
    enterprise: '/enterprise',
    // Resources
    insights: '/insights',
    demo: '/demo',
    contact: '/contact',
    about: '/about',
    changelog: '/changelog',
    // Right nav
    pricing: '/pricing',
    login: 'https://www.teamrollouts.com/sign-in',
    signup: '/onboarding',
    // Status (TODO: replace with real status page URL once provisioned)
    status: '#status',
  };

  // ─── INJECTED CSS (once per page) ───
  const CSS_ID = 'team-nav-injected-css';
  if (!document.getElementById(CSS_ID)) {
    const style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = `
/* ─── Mega dropdown (2 content cols + 1 promo col) ─── */
.nav__dropdown-panel{min-width:46rem !important;max-width:calc(100vw - 2rem) !important}
.nav__mega{display:flex;width:100%}
.nav__mega-cols{
  flex:1;padding:1.5rem;
  display:grid;grid-template-columns:1fr 1fr;
  column-gap:1.25rem;row-gap:0.25rem;
}
.nav__mega-col{display:flex;flex-direction:column;gap:0.125rem}
.nav__mega-col-label{
  font-size:0.6875rem;font-weight:700;
  text-transform:uppercase;letter-spacing:0.1em;
  color:rgba(0,0,0,0.35);
  padding:0 0.75rem;margin-bottom:0.5rem;
}
.nav__mega-link{
  display:block;padding:0.625rem 0.75rem;border-radius:0.5rem;
  transition:background 0.15s;
}
.nav__mega-link:hover{background:rgba(0,0,0,0.03)}
.nav__mega-link-title{
  font-size:0.875rem;font-weight:600;color:#191919;
  margin-bottom:0.125rem;
}
.nav__mega-link-desc{
  font-size:0.75rem;color:#555;
  line-height:1.4;
}
.nav__mega-promo{
  width:15rem;flex-shrink:0;
  background:#191919;
  padding:1.5rem;
  border-radius:0 0.75rem 0.75rem 0;
  display:flex;flex-direction:column;
  color:#fff;
}
.nav__mega-promo-label{
  font-size:0.625rem;font-weight:700;
  text-transform:uppercase;letter-spacing:0.12em;
  color:rgba(255,255,255,0.5);
  margin-bottom:0.75rem;
  display:flex;align-items:center;gap:0.5rem;
}
.nav__mega-promo-label::before{
  content:'';width:6px;height:6px;border-radius:50%;
  background:#D9FA87;
}
.nav__mega-promo h4{
  font-size:1rem;font-weight:500;color:#fff;
  line-height:1.3;letter-spacing:-0.01em;
  margin:0 0 0.5rem;
}
.nav__mega-promo p{
  font-size:0.8125rem;color:rgba(255,255,255,0.55);
  line-height:1.5;margin:0 0 1.25rem;
  flex:1;
}
.nav__mega-promo-btn{
  display:inline-flex;align-items:center;gap:0.375rem;
  font-size:0.8125rem;font-weight:600;color:#D9FA87;
  transition:gap 0.2s;
}
.nav__mega-promo-btn:hover{gap:0.625rem}

/* ─── Status dot (end of left pill) ─── */
.nav__status{
  display:inline-flex;align-items:center;gap:0.4rem;
  font-size:0.75rem;font-weight:500;
  padding:0.375rem 0.75rem;border-radius:100px;
  color:rgba(255,255,255,0.75);
  white-space:nowrap;
  transition:color 0.2s,background 0.2s;
}
.nav__status:hover{color:#fff;background:rgba(255,255,255,0.08)}
.nav--solid .nav__status{color:#454545}
.nav--solid .nav__status:hover{color:#111;background:rgba(0,0,0,0.04)}
.nav__status-dot{
  width:7px;height:7px;border-radius:50%;
  background:#22c55e;
  box-shadow:0 0 0 0 rgba(34,197,94,0.55);
  animation:navStatusPulse 2.6s ease-in-out infinite;
  flex-shrink:0;
}
@keyframes navStatusPulse{
  0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}
  50%{box-shadow:0 0 0 4px rgba(34,197,94,0)}
}
@media(max-width:1024px){.nav__status{display:none}}

/* ─── Burger (mobile only, inside right pill) ─── */
.nav__burger{
  display:none;
  flex-direction:column;justify-content:center;gap:4px;
  width:2.25rem;height:2.25rem;
  margin-left:0.25rem;
  background:transparent;border:none;cursor:pointer;padding:0;
  border-radius:100px;
  transition:background 0.2s;
}
.nav__burger:hover{background:rgba(255,255,255,0.08)}
.nav--solid .nav__burger:hover{background:rgba(0,0,0,0.04)}
.nav__burger span{
  display:block;width:18px;height:1.5px;border-radius:1px;
  background:#fff;margin:0 auto;
  transition:transform 0.3s,opacity 0.3s,background 0.3s;
}
.nav--solid .nav__burger span{background:#191919}
@media(max-width:768px){
  .nav__burger{display:flex}
  /* Right pill needs room for CTA + burger on mobile */
  .nav__pill--right{gap:0.25rem}
  /* Hide the left pill's dividers on mobile — dropdowns + status are hidden,
     so the dividers were left dangling as "| |" next to the logo. */
  .nav__pill--left .nav__divider{display:none}
  /* Unframe the logo on mobile (no bubble) and scale it up 1.5x */
  .nav__pill--left{
    background:transparent !important;
    border-color:transparent !important;
    backdrop-filter:none !important;
    -webkit-backdrop-filter:none !important;
    padding:0 !important;
    box-shadow:none !important;
  }
  .nav__pill--left .nav__logo{padding:0}
  .nav__pill--left .nav__logo img{height:1.6875rem !important}
}

/* ─── Full-screen mobile menu ─── */
.nav-mobile-overlay{
  position:fixed;inset:0;z-index:1100;
  background:rgba(0,0,0,0.35);
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
  opacity:0;visibility:hidden;
  transition:opacity 0.3s,visibility 0.3s;
}
.nav-mobile-overlay.is-open{opacity:1;visibility:visible}

.nav-mobile{
  position:fixed;inset:0;z-index:1101;
  background:#fff;
  display:flex;flex-direction:column;
  opacity:0;visibility:hidden;
  transition:opacity 0.3s,visibility 0.3s;
  overflow:hidden;
}
.nav-mobile.is-open{opacity:1;visibility:visible}
.nav-mobile__header{
  display:flex;align-items:center;justify-content:space-between;
  padding:1rem 1.25rem;flex-shrink:0;
  border-bottom:1px solid rgba(0,0,0,0.06);
}
.nav-mobile__logo{display:flex;align-items:center}
.nav-mobile__logo img{height:1.125rem;width:auto}
.nav-mobile__close{
  width:2.5rem;height:2.5rem;
  display:flex;align-items:center;justify-content:center;
  border-radius:0.5rem;cursor:pointer;
  color:#191919;background:transparent;border:none;
  transition:background 0.15s;
}
.nav-mobile__close:hover{background:rgba(0,0,0,0.04)}
.nav-mobile__panels{
  flex:1;position:relative;overflow:hidden;
}
.nav-mobile__panel{
  position:absolute;inset:0;
  display:flex;flex-direction:column;
  overflow-y:auto;
  transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.nav-mobile__panel--main{transform:translateX(0)}
.nav-mobile__panel--main.is-pushed{
  transform:translateX(-25%);
  pointer-events:none;
}
.nav-mobile__panel--sub{transform:translateX(100%);background:#fff}
.nav-mobile__panel--sub.is-active{transform:translateX(0)}

.nav-mobile__list{flex:1;padding:0.5rem 0;display:flex;flex-direction:column}
.nav-mobile__item{
  display:flex;align-items:center;justify-content:space-between;
  padding:1.125rem 1.25rem;
  font-size:1.125rem;font-weight:600;
  color:#191919;
  background:transparent;border:none;width:100%;text-align:left;
  cursor:pointer;text-decoration:none;
  transition:background 0.15s;
  font-family:inherit;
  letter-spacing:-0.01em;
}
.nav-mobile__item:hover{background:rgba(0,0,0,0.03)}
.nav-mobile__item svg{opacity:0.35;flex-shrink:0;width:18px;height:18px}

.nav-mobile__sub-header{
  display:flex;align-items:center;gap:0.75rem;
  padding:1.25rem 1.25rem 1rem;
  border-bottom:1px solid rgba(0,0,0,0.06);
  flex-shrink:0;
}
.nav-mobile__back{
  width:2.25rem;height:2.25rem;
  display:flex;align-items:center;justify-content:center;
  border-radius:0.5rem;cursor:pointer;
  background:transparent;border:none;
  color:#191919;
  transition:background 0.15s;
}
.nav-mobile__back:hover{background:rgba(0,0,0,0.04)}
.nav-mobile__sub-title{
  font-size:1rem;font-weight:700;
  color:#191919;
  letter-spacing:-0.01em;
}
.nav-mobile__sub-content{flex:1;padding:0.5rem 0 1.5rem}
.nav-mobile__section{padding:1rem 1.25rem 0.5rem}
.nav-mobile__section-label{
  font-size:0.6875rem;font-weight:700;
  text-transform:uppercase;letter-spacing:0.1em;
  color:rgba(0,0,0,0.35);
  margin-bottom:0.5rem;
}
.nav-mobile__section a{
  display:block;padding:0.625rem 0;
  font-size:1rem;font-weight:500;color:#191919;
  text-decoration:none;
}
.nav-mobile__link-desc{
  display:block;font-size:0.8125rem;font-weight:400;
  color:rgba(0,0,0,0.5);margin-top:0.125rem;line-height:1.45;
}
.nav-mobile__divider{
  height:1px;background:rgba(0,0,0,0.06);
  margin:0.25rem 1.25rem;
}
.nav-mobile__promo{
  margin:1.25rem;padding:1.5rem;
  border-radius:0.75rem;background:#191919;
  color:#fff;
}
.nav-mobile__promo-label{
  font-size:0.625rem;font-weight:700;
  text-transform:uppercase;letter-spacing:0.12em;
  color:rgba(255,255,255,0.5);margin-bottom:0.625rem;
  display:flex;align-items:center;gap:0.5rem;
}
.nav-mobile__promo-label::before{
  content:'';width:6px;height:6px;border-radius:50%;background:#D9FA87;
}
.nav-mobile__promo h4{
  font-size:1rem;font-weight:500;color:#fff;
  line-height:1.3;margin:0 0 0.5rem;
}
.nav-mobile__promo p{
  font-size:0.8125rem;color:rgba(255,255,255,0.6);
  margin:0 0 1rem;line-height:1.5;
}
.nav-mobile__promo-btn{
  display:inline-flex;align-items:center;gap:0.375rem;
  font-size:0.8125rem;font-weight:600;color:#D9FA87;
  text-decoration:none;
}

.nav-mobile__status{
  display:flex;align-items:center;gap:0.5rem;
  padding:1rem 1.25rem;
  font-size:0.8125rem;color:rgba(0,0,0,0.55);
  border-top:1px solid rgba(0,0,0,0.06);
}
.nav-mobile__footer{
  padding:1rem 1.25rem 1.5rem;
  display:flex;gap:0.75rem;
  flex-shrink:0;
  border-top:1px solid rgba(0,0,0,0.06);
  padding-bottom:max(1.5rem, env(safe-area-inset-bottom));
}
.nav-mobile__btn{
  flex:1;text-align:center;
  font-size:0.9375rem;font-weight:600;
  padding:0.875rem 1rem;border-radius:100px;
  text-decoration:none;
  transition:background 0.2s,color 0.2s;
}
.nav-mobile__btn--ghost{
  background:rgba(0,0,0,0.05);color:#191919;
}
.nav-mobile__btn--ghost:hover{background:rgba(0,0,0,0.1)}
.nav-mobile__btn--primary{
  background:#191919;color:#fff;
}
.nav-mobile__btn--primary:hover{background:#000}

/* Lock body when mobile menu is open */
body.nav-mobile-lock{overflow:hidden}
`;
    document.head.appendChild(style);
  }

  // ─── Mega dropdown markup builder ───
  function megaDropdown({ title, cols, promo }) {
    const colsHTML = cols.map(c => `
      <div class="nav__mega-col">
        <div class="nav__mega-col-label">${c.label}</div>
        ${c.items.map(i => `
          <a href="${i.href}" class="nav__mega-link">
            <div class="nav__mega-link-title">${i.title}</div>
            <div class="nav__mega-link-desc">${i.desc}</div>
          </a>
        `).join('')}
      </div>
    `).join('');

    return `
    <div class="nav__dropdown" data-dropdown>
      <a class="nav__link">${title} <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4.5L6 7.5L9 4.5"/></svg></a>
      <div class="nav__dropdown-panel">
        <div class="nav__mega">
          <div class="nav__mega-cols">${colsHTML}</div>
          <div class="nav__mega-promo">
            <div class="nav__mega-promo-label">${promo.kicker}</div>
            <h4>${promo.headline}</h4>
            <p>${promo.body}</p>
            <a href="${promo.href}" class="nav__mega-promo-btn">${promo.cta} →</a>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ─── Dropdown configs ───
  const productDropdown = megaDropdown({
    title: 'Product',
    cols: [
      {
        label: 'Platform',
        items: [
          { href: links.orchestration, title: 'Release Orchestration', desc: 'Plan, coordinate, and execute every release.' },
          { href: links.intelligence,  title: 'Release Intelligence',  desc: 'AI-powered insights across your release cycle.' },
        ],
      },
      {
        label: 'Extend',
        items: [
          { href: links.integrations, title: 'Integrations', desc: 'Connect Team to your existing tools.' },
          { href: links.security,     title: 'Security',     desc: 'Your data protected. Your music safe.' },
        ],
      },
    ],
    promo: {
      kicker: 'Get started',
      headline: 'See Team in action.',
      body: 'Watch a guided walkthrough with one of our specialists — tailored to your workflow.',
      cta: 'Book a demo',
      href: links.demo,
    },
  });

  const solutionsDropdown = megaDropdown({
    title: 'Solutions',
    cols: [
      {
        label: 'By role',
        items: [
          { href: links.labels,   title: 'For Labels',   desc: "Manage every release across your roster." },
          { href: links.managers, title: 'For Managers', desc: "One view of every artist's rollout." },
          { href: links.artists,  title: 'For Artists',  desc: 'Stay in the loop on your release.' },
        ],
      },
      {
        label: 'Ecosystem',
        items: [
          { href: links.partners,   title: 'For Partners',   desc: 'Marketing, distributors, and service providers.' },
          { href: links.enterprise, title: 'For Enterprise', desc: 'Custom deployments for major labels and large rosters.' },
        ],
      },
    ],
    promo: {
      kicker: 'Try it free',
      headline: 'Start free for 30 days.',
      body: 'No credit card required. Full access to Team on your first three releases.',
      cta: 'Start free',
      href: links.signup,
    },
  });

  const resourcesDropdown = megaDropdown({
    title: 'Resources',
    cols: [
      {
        label: 'Learn',
        items: [
          { href: links.insights,  title: 'Insights',    desc: 'Release strategy, playbooks, and deep dives.' },
          { href: links.changelog, title: 'Changelog',   desc: "What's new and shipping in Team." },
          { href: links.about,     title: 'About Team',  desc: 'Why we built the OS for music releases.' },
        ],
      },
      {
        label: 'Connect',
        items: [
          { href: links.demo,    title: 'Book a Demo', desc: 'Walk through Team with a specialist.' },
          { href: links.contact, title: 'Contact Us',  desc: 'Talk to sales, support, or partnerships.' },
        ],
      },
    ],
    promo: {
      kicker: 'Questions?',
      headline: 'Talk to the team.',
      body: "We reply to every message personally — usually within a few hours during business days.",
      cta: 'Get in touch',
      href: links.contact,
    },
  });

  // ─── Mobile sub-panel builder ───
  function mobileSubPanel({ id, title, cols, promo }) {
    const sections = cols.map((c, idx) => `
      ${idx > 0 ? '<div class="nav-mobile__divider"></div>' : ''}
      <div class="nav-mobile__section">
        <div class="nav-mobile__section-label">${c.label}</div>
        ${c.items.map(i => `
          <a href="${i.href}">
            ${i.title}
            <span class="nav-mobile__link-desc">${i.desc}</span>
          </a>
        `).join('')}
      </div>
    `).join('');

    return `
    <div class="nav-mobile__panel nav-mobile__panel--sub" id="navMobileSub-${id}">
      <div class="nav-mobile__sub-header">
        <button class="nav-mobile__back" data-mobile-back aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span class="nav-mobile__sub-title">${title}</span>
      </div>
      <div class="nav-mobile__sub-content">
        ${sections}
        <div class="nav-mobile__promo">
          <div class="nav-mobile__promo-label">${promo.kicker}</div>
          <h4>${promo.headline}</h4>
          <p>${promo.body}</p>
          <a href="${promo.href}" class="nav-mobile__promo-btn">${promo.cta} →</a>
        </div>
      </div>
    </div>`;
  }

  // Build mobile configs re-using the same data shapes (keeps desktop + mobile perfectly in sync)
  const productConfig = {
    id: 'product', title: 'Product',
    cols: [
      { label: 'Platform', items: [
        { href: links.orchestration, title: 'Release Orchestration', desc: 'Plan, coordinate, and execute every release.' },
        { href: links.intelligence,  title: 'Release Intelligence',  desc: 'AI-powered insights across your release cycle.' },
      ]},
      { label: 'Extend', items: [
        { href: links.integrations, title: 'Integrations', desc: 'Connect Team to your existing tools.' },
        { href: links.security,     title: 'Security',     desc: 'Your data protected. Your music safe.' },
      ]},
    ],
    promo: {
      kicker: 'Get started', headline: 'See Team in action.',
      body: 'Watch a guided walkthrough tailored to your workflow.',
      cta: 'Book a demo', href: links.demo,
    },
  };
  const solutionsConfig = {
    id: 'solutions', title: 'Solutions',
    cols: [
      { label: 'By role', items: [
        { href: links.labels,   title: 'For Labels',   desc: 'Manage every release across your roster.' },
        { href: links.managers, title: 'For Managers', desc: "One view of every artist's rollout." },
        { href: links.artists,  title: 'For Artists',  desc: 'Stay in the loop on your release.' },
      ]},
      { label: 'Ecosystem', items: [
        { href: links.partners,   title: 'For Partners',   desc: 'Marketing, distributors, and service providers.' },
        { href: links.enterprise, title: 'For Enterprise', desc: 'Custom deployments for major labels and large rosters.' },
      ]},
    ],
    promo: {
      kicker: 'Try it free', headline: 'Start free for 30 days.',
      body: 'No credit card required. Full access to Team on your first three releases.',
      cta: 'Start free', href: links.signup,
    },
  };
  const resourcesConfig = {
    id: 'resources', title: 'Resources',
    cols: [
      { label: 'Learn', items: [
        { href: links.insights,  title: 'Insights',   desc: 'Release strategy, playbooks, and deep dives.' },
        { href: links.changelog, title: 'Changelog',  desc: "What's new and shipping in Team." },
        { href: links.about,     title: 'About Team', desc: 'Why we built the OS for music releases.' },
      ]},
      { label: 'Connect', items: [
        { href: links.demo,    title: 'Book a Demo', desc: 'Walk through Team with a specialist.' },
        { href: links.contact, title: 'Contact Us',  desc: 'Talk to sales, support, or partnerships.' },
      ]},
    ],
    promo: {
      kicker: 'Questions?', headline: 'Talk to the team.',
      body: 'We reply to every message personally — usually within a few hours.',
      cta: 'Get in touch', href: links.contact,
    },
  };

  const TEAM_LOGO = 'https://www.teamrollouts.com/Team%20Logo%20Graident%2002%20+%20Black.svg';

  const navHTML = `
<nav class="nav" id="nav">
  <div class="nav__pill nav__pill--left">
    <a href="${links.home}" class="nav__logo" style="position:relative">
      <img class="logo-light" src="${TEAM_LOGO}" alt="Team" style="height:1.125rem;filter:brightness(0) invert(1)">
      <img class="logo-dark" src="${TEAM_LOGO}" alt="Team" style="height:1.125rem">
    </a>
    <div class="nav__divider"></div>
    ${productDropdown}
    ${solutionsDropdown}
    ${resourcesDropdown}
    <div class="nav__divider"></div>
    <a href="${links.status}" class="nav__status" aria-label="All systems operational">
      <span class="nav__status-dot"></span>
      <span>Operational</span>
    </a>
  </div>
  <div class="nav__pill nav__pill--right">
    <a href="${links.pricing}" class="nav__link">Pricing</a>
    <div class="nav__divider"></div>
    <a href="${links.login}" class="nav__login">Login</a>
    <a href="${links.signup}" class="nav__cta">Start free</a>
    <button class="nav__burger" id="navBurger" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="nav-blur-overlay" id="navBlurOverlay"></div>

<!-- Mobile menu -->
<div class="nav-mobile-overlay" id="navMobileOverlay"></div>
<div class="nav-mobile" id="navMobile" aria-hidden="true" role="dialog" aria-label="Site menu">
  <div class="nav-mobile__header">
    <a href="${links.home}" class="nav-mobile__logo">
      <img src="${TEAM_LOGO}" alt="Team">
    </a>
    <button class="nav-mobile__close" id="navMobileClose" aria-label="Close menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="nav-mobile__panels">
    <div class="nav-mobile__panel nav-mobile__panel--main" id="navMobileMain">
      <div class="nav-mobile__list">
        <button class="nav-mobile__item" data-mobile-open="product">
          Product
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button class="nav-mobile__item" data-mobile-open="solutions">
          Solutions
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button class="nav-mobile__item" data-mobile-open="resources">
          Resources
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <a href="${links.pricing}" class="nav-mobile__item">Pricing</a>
      </div>
      <a href="${links.status}" class="nav-mobile__status" style="text-decoration:none">
        <span class="nav__status-dot"></span>
        <span>All systems operational</span>
      </a>
    </div>
    ${mobileSubPanel(productConfig)}
    ${mobileSubPanel(solutionsConfig)}
    ${mobileSubPanel(resourcesConfig)}
  </div>
  <div class="nav-mobile__footer">
    <a href="${links.login}" class="nav-mobile__btn nav-mobile__btn--ghost">Login</a>
    <a href="${links.signup}" class="nav-mobile__btn nav-mobile__btn--primary">Start free</a>
  </div>
</div>
`;

  // ─── Inject nav ───
  const container = document.getElementById('team-nav');
  if (container) {
    container.innerHTML = navHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  }

  // If theme is "light", start with nav--solid — UNLESS the page has
  // (or will have) a #heroSection. Pages with a hero (e.g. the homepage)
  // want the nav to be transparent over the hero on first paint and only
  // flip to solid once the user has scrolled past it (handled by the
  // ScrollTrigger further down).
  //
  // Timing trap: nav.js runs from the Webflow Footer code BEFORE the
  // page body (which contains #heroSection) is fetched + injected by the
  // separate body-embed loader. A naive `document.getElementById(...)`
  // check at this point returns null on every page, so the guard would
  // never trigger and the homepage's dark hero kept showing a stark
  // white frosted bar on load. Earlier "fix" only worked once the body
  // had already been injected — i.e. never on initial paint.
  //
  // Real fix: apply theme-based solid optimistically, then watch the DOM
  // for #heroSection appearing (and strip the class when it does).
  // Observer disconnects on first hit or after 3s safety timeout.
  const theme = container ? container.getAttribute('data-theme') : null;
  const nav = document.getElementById('nav');
  if (theme === 'light' && nav) {
    nav.classList.add('nav--solid');

    function syncHeroState() {
      if (document.getElementById('heroSection')) {
        nav.classList.remove('nav--solid');
        return true;
      }
      return false;
    }

    if (!syncHeroState() && typeof MutationObserver !== 'undefined') {
      const heroObs = new MutationObserver(() => {
        if (syncHeroState()) heroObs.disconnect();
      });
      heroObs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => heroObs.disconnect(), 3000);
    }
  }

  // ─── Desktop dropdown hover open/close + background blur ───
  const overlay = document.getElementById('navBlurOverlay');
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  let closeTimer = null;

  // Measure the panel and clamp its horizontal position into the viewport.
  // Default CSS left:0 anchors the panel to the trigger; this shifts it by
  // whatever amount is needed to keep both edges inside the viewport.
  function positionPanel(dd) {
    const panel = dd.querySelector('.nav__dropdown-panel');
    if (!panel) return;
    panel.style.left = '0px';
    panel.style.right = 'auto';
    // Force layout then measure
    void panel.offsetWidth;
    const rect = panel.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const margin = 16;
    let shift = 0;
    // If overflowing the right edge, shift left by the overshoot
    if (rect.right > vw - margin) shift = (vw - margin) - rect.right;
    // If that would push it off the left edge, instead clamp to left margin
    if (rect.left + shift < margin) shift = margin - rect.left;
    if (shift !== 0) panel.style.left = shift + 'px';
  }

  function openDropdown(dd) {
    dropdowns.forEach(d => { if (d !== dd) d.classList.remove('is-open'); });
    positionPanel(dd);
    dd.classList.add('is-open');
    if (overlay) overlay.classList.add('is-active');
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  }

  function closeAllDropdowns() {
    closeTimer = setTimeout(() => {
      dropdowns.forEach(d => d.classList.remove('is-open'));
      if (overlay) overlay.classList.remove('is-active');
    }, 120);
  }

  dropdowns.forEach(dd => {
    dd.addEventListener('mouseenter', () => openDropdown(dd));
    dd.addEventListener('mouseleave', () => closeAllDropdowns());
    const panel = dd.querySelector('.nav__dropdown-panel');
    if (panel) {
      panel.addEventListener('mouseenter', () => {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      });
      panel.addEventListener('mouseleave', () => closeAllDropdowns());
    }
  });

  // ─── Hide/show nav on scroll ───
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    if (s > lastScroll && s > 100) nav.classList.add('nav--hidden');
    else nav.classList.remove('nav--hidden');
    lastScroll = s;
  });

  // ─── Re-clamp the open dropdown on resize ───
  window.addEventListener('resize', () => {
    const openDd = document.querySelector('[data-dropdown].is-open');
    if (openDd) positionPanel(openDd);
  });

  // ─── Mobile menu ───
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
    // Reset sub-panels after transition so menu reopens fresh
    setTimeout(() => {
      document.querySelectorAll('.nav-mobile__panel--sub.is-active').forEach(p => p.classList.remove('is-active'));
      if (mobileMain) mobileMain.classList.remove('is-pushed');
    }, 300);
  }

  if (burger) burger.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // Sub-panel navigation
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

  // Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });

  // Export links for other scripts to use
  window.TEAM_LINKS = links;
})();
