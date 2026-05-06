/* Team — Contact scripts */
(function() {
  // Cutover swap: change to https://app.teamrollouts.com/... when DNS flips
  var WEBHOOK_URL = 'https://teamrollouts.com/api/webhooks/webflow/contact';

  // Parse URL params to pre-select interest checkboxes
  var params = new URLSearchParams(window.location.search);
  var interestParam = params.get('interest');
  if (interestParam) {
    var interests = interestParam.split(',');
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

    var firstName = document.getElementById('firstName').value.trim();
    var lastName = document.getElementById('lastName').value.trim();
    var email = document.getElementById('email').value.trim();
    var organization = document.getElementById('orgName').value.trim();
    var message = document.getElementById('message').value.trim();
    var checkedInterests = [];
    document.querySelectorAll('input[name="interest"]:checked').forEach(function(cb) {
      checkedInterests.push(cb.value);
    });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        organization: organization,
        interest: checkedInterests,
        message: message
      })
    }).then(function(res) {
      if (res.ok) {
        submitBtn.textContent = 'Message sent!';
        setTimeout(function() {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
          form.reset();
        }, 2500);
      } else {
        return res.json().then(function(data) {
          throw new Error((data && data.error) || 'Submission failed');
        });
      }
    }).catch(function(err) {
      console.error('Contact form error:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Try again — error sending';
      setTimeout(function() {
        submitBtn.textContent = 'Send message';
      }, 4000);
    });
  });
})();
