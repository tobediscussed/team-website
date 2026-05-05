/* Team — Contact scripts */
(function() {
  // Parse URL params to pre-select interest checkboxes
  var params = new URLSearchParams(window.location.search);
  var interest = params.get('interest');
  if (interest) {
    // Support comma-separated values or single value
    var interests = interest.split(',');
    interests.forEach(function(val) {
      var checkbox = document.querySelector('input[name="interest"][value="' + val.trim() + '"]');
      if (checkbox) checkbox.checked = true;
    });
  }

  // Form submit
  var form = document.getElementById('contactForm');
  var submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // TODO: POST to HubSpot
    // For now, placeholder reset
    setTimeout(function() {
      submitBtn.textContent = 'Message sent!';
      setTimeout(function() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
        form.reset();
      }, 2000);
    }, 1500);
  });
})();
