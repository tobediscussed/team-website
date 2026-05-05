/* Team — sign-in scripts */
<script>
(function() {
  // Password show/hide toggle
  document.querySelectorAll('.password-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = document.getElementById(this.getAttribute('data-target'));
      if (target.type === 'password') {
        target.type = 'text';
        this.textContent = 'Hide';
      } else {
        target.type = 'password';
        this.textContent = 'Show';
      }
    });
  });

  // Form validation and submit
  var form = document.getElementById('signInForm');
  var submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    // Reset after 3s (placeholder until backend is wired)
    setTimeout(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    }, 3000);
  });
})();

