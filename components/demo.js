/* Team — Demo scripts */
(function() {
  var form = document.getElementById('demoForm');
  var submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var firstName = document.getElementById('firstName').value.trim();
    var lastName = document.getElementById('lastName').value.trim();
    var email = document.getElementById('email').value.trim();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecting to calendar...';

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
