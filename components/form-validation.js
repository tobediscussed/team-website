/* ────────────────────────────────────────────────────────────
   Team — Form validation
   Replaces browser-native validation tooltips with brand-styled
   inline pill errors. Auto-attaches to every form with a
   [required] field, idempotent, and re-runs as new forms get
   injected (homepage / pricing / etc. all fetch their body
   content async after page load).
   ──────────────────────────────────────────────────────────── */
(function(){
  // Auto-inject sibling CSS once
  if (!document.querySelector('link[data-team-form-css]')) {
    var thisScript = document.currentScript
      || Array.from(document.scripts).reverse().find(function(s){ return /form-validation\.js/.test(s.src); });
    var href = 'form-validation.css';
    if (thisScript && thisScript.src) {
      try { href = new URL('form-validation.css', thisScript.src).href; } catch (e) {}
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-team-form-css', '');
    document.head.appendChild(link);
  }

  function labelText(field){
    if (field.labels && field.labels[0]) return field.labels[0].textContent.replace(/\*$/,'').trim();
    if (field.placeholder) return field.placeholder;
    return null;
  }

  function messageFor(field){
    var data = field.getAttribute('data-error');
    if (data) return data;
    if (field.type === 'checkbox' || field.type === 'radio') {
      if (!field.checked) return 'Tick the box to continue';
    }
    var empty = !field.value || (typeof field.value === 'string' && !field.value.trim());
    if (empty) return 'Oops, you missed this one';
    if (field.type === 'email') return "That email doesn't look right";
    if (field.type === 'url')   return "That URL doesn't look right";
    if (field.type === 'tel')   return "That number doesn't look right";
    if (field.validity && field.validity.tooShort) return 'A bit too short';
    if (field.validity && field.validity.tooLong)  return 'A bit too long';
    if (field.validity && field.validity.patternMismatch) return 'Hmm, please check the format';
    return field.validationMessage || 'Please check this field';
  }

  function clearError(field){
    field.classList.remove('team-form-field--invalid');
    var sibling = field.parentNode && field.parentNode.querySelector(':scope > .team-form-error');
    if (sibling) sibling.remove();
  }

  function showError(field, msg){
    clearError(field);
    field.classList.add('team-form-field--invalid');
    var pill = document.createElement('div');
    pill.className = 'team-form-error';
    pill.setAttribute('role', 'alert');
    pill.innerHTML = '<span class="team-form-error__icon" aria-hidden="true">!</span><span>' + msg + '</span>';
    if (field.parentNode) field.parentNode.appendChild(pill);
  }

  function attach(form){
    if (form.hasAttribute('data-team-validated')) return;
    if (!form.querySelector('[required]')) return;
    form.setAttribute('data-team-validated', '');
    form.setAttribute('novalidate', '');

    form.addEventListener('submit', function(e){
      var firstInvalid = null;
      form.querySelectorAll('[required]').forEach(function(field){
        // Skip disabled / hidden fields
        if (field.disabled || field.type === 'hidden') return;
        if (!field.checkValidity()) {
          showError(field, messageFor(field));
          if (!firstInvalid) firstInvalid = field;
        } else {
          clearError(field);
        }
      });
      if (firstInvalid) {
        e.preventDefault();
        e.stopImmediatePropagation();
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, true); // capture phase so we beat any other submit handler

    // Clear the error as the user types / changes selection
    form.querySelectorAll('[required]').forEach(function(field){
      field.addEventListener('input', function(){ clearError(field); });
      field.addEventListener('change', function(){ clearError(field); });
    });
  }

  function scan(root){
    (root || document).querySelectorAll('form:not([data-team-validated])').forEach(attach);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ scan(); });
  } else {
    scan();
  }

  // Watch for forms added later (page-body fetch+inject pattern)
  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(function(muts){
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) { scan(); break; }
      }
    });
    if (document.body) {
      mo.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function(){
        mo.observe(document.body, { childList: true, subtree: true });
      });
    }
  }
})();
