/* Team — Demo scripts */
(function() {
  // Cutover swap: change to https://app.teamrollouts.com/... when DNS flips
  var WEBHOOK_URL = 'https://teamrollouts.com/api/webhooks/webflow/demo';

  var form = document.getElementById('demoForm');
  var submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var firstName = document.getElementById('firstName').value.trim();
    var lastName = document.getElementById('lastName').value.trim();
    var email = document.getElementById('email').value.trim();
    var organization = document.getElementById('orgName').value.trim();
    var role = document.getElementById('role').value;
    var artistCount = document.getElementById('artistCount').value;
    var interest = document.getElementById('interest').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecting to calendar...';

    // Fire-and-forget POST to platform (DB record + admin email + HubSpot sync).
    // Non-blocking so a webhook failure never blocks Calendly booking.
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        organization: organization,
        role: role,
        artistCount: artistCount,
        interest: interest
      })
    }).catch(function(err) {
      console.warn('Demo webhook POST failed (continuing to Calendly):', err);
    });

    // Build Calendly URL with pre-filled params
    var baseUrl = 'https://calendly.com/teamrollouts-demo/30min';
    var params = new URLSearchParams();
    params.set('name', firstName + ' ' + lastName);
    params.set('email', email);
    params.set('back', '1');
    params.set('hide_landing_page_details', '1');
    params.set('hide_gdpr_banner', '1');
    params.set('background_color', 'ffffff');
    params.set('text_color', '191919');
    params.set('primary_color', '5679b5');

    var calendlyUrl = baseUrl + '?' + params.toString();

    // Brief delay for UX, then redirect
    setTimeout(function() {
      window.location.href = calendlyUrl;
    }, 500);
  });
})();
