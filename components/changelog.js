/* Team — changelog scripts */
(function() {
  var filters = document.querySelectorAll('.cl-filter');
  var dates = document.querySelectorAll('.cl-date');
  var entries = document.querySelectorAll('.cl-entry');
  var searchInput = document.getElementById('clSearch');
  var empty = document.getElementById('clEmpty');
  var activeFilter = 'all';

  function filterAll() {
    var query = searchInput.value.toLowerCase().trim();
    var totalVisible = 0;

    dates.forEach(function(dateGroup) {
      var groupEntries = dateGroup.querySelectorAll('.cl-entry');
      var groupVisible = 0;

      groupEntries.forEach(function(entry) {
        var type = entry.getAttribute('data-type');
        var title = entry.querySelector('.cl-entry__title');
        var desc = entry.querySelector('.cl-entry__desc');
        var text = (title ? title.textContent : '') + ' ' + (desc ? desc.textContent : '');
        var matchesFilter = (activeFilter === 'all' || type === activeFilter);
        var matchesSearch = (!query || text.toLowerCase().indexOf(query) !== -1);
        var show = matchesFilter && matchesSearch;
        entry.style.display = show ? '' : 'none';
        if (show) groupVisible++;
      });

      // Hide entire date group if no entries visible
      dateGroup.style.display = groupVisible > 0 ? '' : 'none';
      totalVisible += groupVisible;
    });

    empty.classList.toggle('is-visible', totalVisible === 0);
  }

  filters.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filters.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      activeFilter = btn.getAttribute('data-filter');
      filterAll();
    });
  });

  searchInput.addEventListener('input', filterAll);
})();

