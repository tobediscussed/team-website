/* Team — intelligence scripts */
(function() {
  var nav = document.getElementById('nav');
  var hero = document.getElementById('heroSection');
  var heroInner = hero ? hero.querySelector('.icp-hero__inner') : null;
  if (!nav || !hero) return;

  function check() {
    var heroBottom = hero.getBoundingClientRect().bottom;
    var heroH = hero.offsetHeight;
    var scrolled = window.scrollY;

    if (heroBottom < 60) nav.classList.add('nav--solid');
    else nav.classList.remove('nav--solid');

    if (heroInner) {
      var progress = Math.min(1, scrolled / (heroH * 0.5));
      heroInner.style.opacity = 1 - progress;
      heroInner.style.transform = 'translateY(' + (progress * 40) + 'px)';
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

(function() {
  var section = document.getElementById('problemSection');
  if (!section) return;
  var scroll = section.querySelector('.problem-scroll');
  var paras = section.querySelectorAll('.problem-para');
  var numParas = paras.length;

  // Split each paragraph into word spans
  paras.forEach(function(p) {
    var text = p.textContent.trim();
    var words = text.split(/\s+/);
    p.innerHTML = '';
    words.forEach(function(w) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      p.appendChild(span);
    });
  });

  function update() {
    var rect = scroll.getBoundingClientRect();
    var scrollH = scroll.offsetHeight;
    var viewH = window.innerHeight;
    var scrolled = -rect.top;
    var totalRange = scrollH - viewH;
    if (totalRange <= 0) return;
    var progress = Math.max(0, Math.min(1, scrolled / totalRange));

    // Divide progress into segments
    var segSize = 1 / numParas;

    paras.forEach(function(p, i) {
      var segStart = i * segSize;
      var segEnd = segStart + segSize;
      var words = p.querySelectorAll('.word');

      if (progress >= segStart && progress < segEnd) {
        // Active paragraph
        p.style.opacity = '1';
        p.style.position = 'relative';
        var subProgress = (progress - segStart) / segSize;
        var totalWords = words.length;
        var wordsToShow = Math.floor(subProgress * totalWords);
        words.forEach(function(w, wi) {
          if (wi <= wordsToShow) {
            w.classList.add('is-visible');
          } else {
            w.classList.remove('is-visible');
          }
        });
      } else if (progress >= segEnd) {
        // Completed paragraph — show all words
        p.style.opacity = '1';
        p.style.position = 'relative';
        words.forEach(function(w) { w.classList.add('is-visible'); });
        // But hide if a later paragraph is active
        if (i < numParas - 1) {
          // Find which para is active
          var activeIdx = Math.min(numParas - 1, Math.floor(progress / segSize));
          if (i < activeIdx) {
            p.style.opacity = '0';
            p.style.position = 'absolute';
          }
        }
      } else {
        // Not yet reached
        p.style.opacity = '0';
        p.style.position = 'absolute';
        words.forEach(function(w) { w.classList.remove('is-visible'); });
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

(function() {
  // Gradient visibility — fade in/out based on scroll position in problem section
  var problemSection = document.getElementById('problemSection');
  var gradient = document.getElementById('problemGradient');
  if (problemSection && gradient) {
    var blob1 = document.getElementById('problemBlob1');
    var blob2 = document.getElementById('problemBlob2');
    var blob3 = document.getElementById('problemBlob3');

    // Show/hide gradient based on section visibility
    if ('IntersectionObserver' in window) {
      var gradObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          gradient.classList.toggle('is-visible', e.isIntersecting);
        });
      }, { threshold: 0.05 });
      gradObs.observe(problemSection);
    }

    // Mouse-follow for blobs
    var tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function(e) {
      var rect = problemSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }
    }, { passive: true });
    (function tick() {
      cx += (tx - cx) * 0.03;
      cy += (ty - cy) * 0.03;
      if (blob1) blob1.style.transform = 'translate(' + (cx * 40) + 'px,' + (cy * 30) + 'px)';
      if (blob2) blob2.style.transform = 'translate(' + (cx * -35) + 'px,' + (cy * 25) + 'px)';
      if (blob3) blob3.style.transform = 'translate(' + (cx * 20) + 'px,' + (cy * -25) + 'px)';
      requestAnimationFrame(tick);
    })();
  }

  // Shared panel animation function — reusable for lifecycle + tabs
  window._animatePanel = function(panel) {
    if (!panel) return;
    panel.querySelectorAll('.fp-timeline__bar, .mock-gantt__bar').forEach(function(bar, i) {
      bar.style.transform = 'scaleX(0)';
      bar.style.transformOrigin = 'left';
      bar.style.transition = 'transform 0.7s var(--ease) ' + (0.1 + i * 0.08) + 's';
      setTimeout(function() { bar.style.transform = 'scaleX(1)'; }, 20);
    });
    panel.querySelectorAll('.fp-tasks__row').forEach(function(row, i) {
      row.style.opacity = '0'; row.style.transform = 'translateY(8px)';
      row.style.transition = 'opacity 0.35s ease ' + (0.05 + i * 0.08) + 's, transform 0.35s ease ' + (0.05 + i * 0.08) + 's';
      setTimeout(function() { row.style.opacity = '1'; row.style.transform = 'translateY(0)'; }, 20);
    });
    panel.querySelectorAll('.mock-dashboard__card, .fp-command__card').forEach(function(card, i) {
      card.style.opacity = '0'; card.style.transform = 'translateY(12px)';
      card.style.transition = 'opacity 0.4s ease ' + (0.06 + i * 0.08) + 's, transform 0.4s ease ' + (0.06 + i * 0.08) + 's';
      setTimeout(function() { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 20);
    });
    panel.querySelectorAll('.fp-budget__bar-fill').forEach(function(bar, i) {
      bar.style.transform = 'scaleX(0)'; bar.style.transformOrigin = 'left';
      bar.style.transition = 'transform 0.7s var(--ease) ' + (0.1 + i * 0.1) + 's';
      setTimeout(function() { bar.style.transform = 'scaleX(1)'; }, 20);
    });
    panel.querySelectorAll('.fp-report__line').forEach(function(line, i) {
      line.style.transform = 'scaleX(0)'; line.style.transformOrigin = 'left';
      line.style.transition = 'transform 0.5s ease ' + (0.1 + i * 0.06) + 's';
      setTimeout(function() { line.style.transform = 'scaleX(1)'; }, 20);
    });
    panel.querySelectorAll('.fp-report__stat').forEach(function(stat, i) {
      stat.style.opacity = '0'; stat.style.transform = 'scale(0.9)';
      stat.style.transition = 'opacity 0.35s ease ' + (0.2 + i * 0.08) + 's, transform 0.35s ease ' + (0.2 + i * 0.08) + 's';
      setTimeout(function() { stat.style.opacity = '1'; stat.style.transform = 'scale(1)'; }, 20);
    });
    panel.querySelectorAll('.mock-collab__row').forEach(function(row, i) {
      row.style.opacity = '0'; row.style.transform = 'translateX(-12px)';
      row.style.transition = 'opacity 0.35s ease ' + (0.05 + i * 0.1) + 's, transform 0.35s ease ' + (0.05 + i * 0.1) + 's';
      setTimeout(function() { row.style.opacity = '1'; row.style.transform = 'translateX(0)'; }, 20);
    });
    panel.querySelectorAll('.fp-chat__row').forEach(function(row, i) {
      row.style.opacity = '0'; row.style.transform = 'translateY(8px)';
      row.style.transition = 'opacity 0.35s ease ' + (0.1 + i * 0.3) + 's, transform 0.35s ease ' + (0.1 + i * 0.3) + 's';
      setTimeout(function() { row.style.opacity = '1'; row.style.transform = 'translateY(0)'; }, 20);
    });
    var chatInput = panel.querySelector('.fp-chat__input');
    if (chatInput) {
      chatInput.style.opacity = '0'; chatInput.style.transform = 'translateY(6px)';
      chatInput.style.transition = 'opacity 0.3s ease 0.7s, transform 0.3s ease 0.7s';
      setTimeout(function() { chatInput.style.opacity = '1'; chatInput.style.transform = 'translateY(0)'; }, 20);
    }
    panel.querySelectorAll('.fp-alert').forEach(function(alert, i) {
      alert.style.opacity = '0'; alert.style.transform = 'translateY(8px)';
      alert.style.transition = 'opacity 0.35s ease ' + (0.05 + i * 0.1) + 's, transform 0.35s ease ' + (0.05 + i * 0.1) + 's';
      setTimeout(function() { alert.style.opacity = '1'; alert.style.transform = 'translateY(0)'; }, 20);
    });
    panel.querySelectorAll('.fp-checklist__row').forEach(function(row, i) {
      row.style.opacity = '0'; row.style.transform = 'translateY(8px)';
      row.style.transition = 'opacity 0.35s ease ' + (0.05 + i * 0.08) + 's, transform 0.35s ease ' + (0.05 + i * 0.08) + 's';
      setTimeout(function() { row.style.opacity = '1'; row.style.transform = 'translateY(0)'; }, 20);
    });
  };

  // Observe alternating 2-col panels
  if ('IntersectionObserver' in window) {
    var animObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) window._animatePanel(e.target);
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.pain-row__panel').forEach(function(p) { animObserver.observe(p); });
  }
})();

(function() {
  var tabs = document.querySelectorAll('.partner-tab');
  var panels = document.querySelectorAll('.partner-panel');

  // Tab switching
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.getAttribute('data-tab');
      tabs.forEach(function(t) { t.classList.remove('is-active'); });
      panels.forEach(function(p) { p.classList.remove('is-active'); });
      tab.classList.add('is-active');
      var activePanel = document.querySelector('.partner-panel[data-tab="' + target + '"]');
      activePanel.classList.add('is-active');
      // Animate the active preview panel
      var activePreview = activePanel.querySelector('.partner-preview-item.is-active');
      if (activePreview && window._animatePanel) {
        setTimeout(function() { window._animatePanel(activePreview); }, 50);
      }
    });
  });

  // Feature-to-preview switching within each tab panel
  document.querySelectorAll('.partner-panel__feature[data-preview]').forEach(function(feature) {
    function switchPreview() {
      var panel = feature.closest('.partner-panel');
      var previewId = feature.getAttribute('data-preview');
      // Deactivate all features in this panel
      panel.querySelectorAll('.partner-panel__feature').forEach(function(f) { f.classList.remove('is-active'); });
      feature.classList.add('is-active');
      // Switch preview
      panel.querySelectorAll('.partner-preview-item').forEach(function(p) { p.classList.remove('is-active'); });
      var target = panel.querySelector('.partner-preview-item[data-preview="' + previewId + '"]');
      if (target) {
        target.classList.add('is-active');
        // Animate the newly active preview
        if (window._animatePanel) {
          setTimeout(function() { window._animatePanel(target); }, 50);
        }
      }
    }
    feature.addEventListener('mouseenter', switchPreview);
    feature.addEventListener('click', switchPreview);
  });
})();

