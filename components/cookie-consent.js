// Shared cookie consent component for Team Rollouts website
// Usage: <script src="components/cookie-consent.js"></script>
// (drop-in — no mount div needed; it injects itself into <body>)
//
// WHAT THIS DOES
// - GDPR/PECR-compliant consent for UK/EU visitors
// - Blocks analytics / marketing scripts until consent is granted
// - Stores consent in a first-party cookie (cc_cookie) — no 3rd-party data transfer
// - Exposes window.teamCookies.show() so any footer link can re-open preferences
//
// HOW TO ADD A NEW TRACKING SCRIPT
// Mark the script tag with type="text/plain" and data-category="analytics" | "marketing":
//   <script type="text/plain" data-category="analytics"
//           src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
// The library will activate it only after the matching category is accepted.
//
// Library: vanilla-cookieconsent v3 by Orestbida (MIT) — https://cookieconsent.orestbida.com

(function() {
  // ─── LINKS ─── update when privacy/cookie pages are live
  const links = {
    privacy: '/privacy',
    cookies: '/cookie-policy',
  };

  // ─── INJECT LIBRARY CSS + JS FROM CDN ───
  const CDN_CSS = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.1/dist/cookieconsent.css';
  const CDN_JS  = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.1/dist/cookieconsent.umd.js';

  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = CDN_CSS;
  document.head.appendChild(cssLink);

  // ─── TEAM BRAND OVERRIDES ───
  const brandCSS = `
    :root {
      --cc-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --cc-bg: #ffffff;
      --cc-primary-color: #111110;
      --cc-secondary-color: #454545;
      --cc-border-radius: 16px;
      --cc-btn-border-radius: 100px;
      --cc-btn-primary-bg: #111110;
      --cc-btn-primary-color: #ffffff;
      --cc-btn-primary-hover-bg: #D9FA87;
      --cc-btn-primary-hover-color: #111110;
      --cc-btn-secondary-bg: #FAFAFA;
      --cc-btn-secondary-color: #111110;
      --cc-btn-secondary-border: 1px solid #E0E0E0;
      --cc-btn-secondary-hover-bg: #f0f0ea;
      --cc-btn-secondary-hover-color: #111110;
      --cc-btn-secondary-hover-border: 1px solid #111110;
      --cc-toggle-on-bg: #111110;
      --cc-toggle-off-bg: #E0E0E0;
      --cc-toggle-readonly-bg: #E0E0E0;
      --cc-cookie-category-block-bg: #FAFAFA;
      --cc-cookie-category-block-border: #E0E0E0;
      --cc-cookie-category-block-bg-hover: #f0f0ea;
      --cc-section-border: #E0E0E0;
      --cc-overlay-bg: rgba(17, 17, 16, 0.5);
    }
    /* Bottom-left pill consent card matching nav aesthetic */
    #cc-main .cm--box {
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(17,17,16,0.12), 0 2px 8px rgba(17,17,16,0.06);
      border: 1px solid rgba(17,17,16,0.08);
      max-width: 420px;
    }
    #cc-main .cm__btn {
      font-weight: 600;
      font-size: 0.8125rem;
      letter-spacing: -0.005em;
      transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    #cc-main .cm__btn--primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(217,250,135,0.5);
    }
    #cc-main .pm--box {
      border-radius: 20px;
    }
    #cc-main .pm__btn {
      font-weight: 600;
      letter-spacing: -0.005em;
    }
    /* Soften the category blocks in Manage preferences — library defaults
       to a near-pill radius which looks too massive next to the rest of the UI.
       Force every candidate inner class flat + clip children to the container. */
    #cc-main .pm__section,
    #cc-main .pm__section-title,
    #cc-main .pm__section-title-wrapper,
    #cc-main .pm__section-desc,
    #cc-main .pm__section-desc-wrapper,
    #cc-main .pm__section-body,
    #cc-main .pm__section-toggle,
    #cc-main .pm__section-expand,
    #cc-main .pm__section--expandable,
    #cc-main .pm__section--toggle,
    #cc-main .pm__badge,
    #cc-main .pm__section-arrow,
    #cc-main .pm__section > * {
      border-radius: 12px !important;
    }
    /* Clip children to the container so any lingering inner radius can't
       bleed out past the 12px outer shape. */
    #cc-main .pm__section {
      overflow: hidden !important;
    }
    /* Inner expanded description sits flush under the title row */
    #cc-main .pm__section .pm__section-desc,
    #cc-main .pm__section .pm__section-desc-wrapper,
    #cc-main .pm__section .pm__section-body {
      border-top-left-radius: 0 !important;
      border-top-right-radius: 0 !important;
    }
    #cc-main a { color: #F56002; }
    #cc-main a:hover { color: #111110; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = brandCSS;
  document.head.appendChild(styleEl);

  // ─── LOAD LIBRARY AND INITIALISE ───
  const script = document.createElement('script');
  script.src = CDN_JS;
  script.defer = true;
  script.onload = init;
  document.head.appendChild(script);

  function init() {
    if (!window.CookieConsent) return;

    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom left',
          equalWeightButtons: false,
          flipButtons: false
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: false,
          flipButtons: false
        }
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true
        },
        analytics: {
          enabled: false,
          autoClear: {
            cookies: [
              { name: /^_ga/ },
              { name: '_gid' },
              { name: /^_hj/ }
            ]
          }
        },
        marketing: {
          enabled: false,
          autoClear: {
            cookies: [
              { name: '_fbp' },
              { name: /^fr/ },
              { name: /^__hstc$/ },
              { name: '__hssc' },
              { name: '__hssrc' },
              { name: 'hubspotutk' },
              { name: /^li_/ }
            ]
          }
        }
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description: 'We use cookies to run the site, understand how it\'s used, and (with your permission) improve how we reach artists, managers, and labels. You\'re in control.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage preferences',
              footer: `<a href="${links.privacy}">Privacy Policy</a> · <a href="${links.cookies}">Cookie Policy</a>`
            },
            preferencesModal: {
              title: 'Cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              serviceCounterLabel: 'Service|Services',
              sections: [
                {
                  title: 'Your privacy matters',
                  description: 'Team processes the minimum data needed to operate the site. Everything below is optional — you can change your mind any time from the Cookie preferences link in the footer.'
                },
                {
                  title: 'Strictly necessary',
                  description: 'Required for core site functionality — serving pages, remembering your consent choice, and protecting against abuse. These cannot be disabled.',
                  linkedCategory: 'necessary'
                },
                {
                  title: 'Analytics',
                  description: 'Helps us understand which pages resonate, what breaks, and where we can improve. Aggregate only — never tied to an individual.',
                  linkedCategory: 'analytics'
                },
                {
                  title: 'Marketing',
                  description: 'Used to show relevant Team content on other platforms and measure whether our ads actually help people discover us. Disable this and we\'ll stop all retargeting immediately.',
                  linkedCategory: 'marketing'
                },
                {
                  title: 'More information',
                  description: `Full detail lives in our <a href="${links.cookies}">Cookie Policy</a> and <a href="${links.privacy}">Privacy Policy</a>. Questions? Email <a href="mailto:privacy@teamrollouts.com">privacy@teamrollouts.com</a>.`
                }
              ]
            }
          }
        }
      }
    });

    // Expose a friendly handle for footer / help links
    window.teamCookies = {
      show: function() { CookieConsent.showPreferences(); },
      reset: function() { CookieConsent.reset(true); location.reload(); }
    };

    // Wire any element with [data-cookie-preferences] to open the modal
    document.addEventListener('click', function(e) {
      const trigger = e.target.closest('[data-cookie-preferences]');
      if (trigger) {
        e.preventDefault();
        CookieConsent.showPreferences();
      }
    });
  }
})();
