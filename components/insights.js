/* Team — insights scripts */
(function() {
  var filters = document.querySelectorAll('.insights-filter');
  var posts = document.querySelectorAll('.post-item');
  var empty = document.getElementById('postsEmpty');
  var searchInput = document.getElementById('insightsSearch');
  var activeFilter = 'all';

  function filterPosts() {
    var query = searchInput.value.toLowerCase().trim();
    var count = 0;

    posts.forEach(function(post) {
      var postCat = post.getAttribute('data-category');
      var title = post.querySelector('.post-card__title');
      var titleText = title ? title.textContent.toLowerCase() : '';
      var matchesCat = (activeFilter === 'all' || postCat === activeFilter);
      var matchesSearch = (!query || titleText.indexOf(query) !== -1);
      var show = matchesCat && matchesSearch;
      post.style.display = show ? '' : 'none';
      if (show) count++;
    });

    empty.classList.toggle('is-visible', count === 0);
  }

  filters.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filters.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      activeFilter = btn.getAttribute('data-filter');
      filterPosts();
    });
  });

  searchInput.addEventListener('input', filterPosts);
})();

