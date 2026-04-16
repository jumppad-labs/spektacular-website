/* Spektacular — minimal JS */

// ── Copy to clipboard ──────────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var text = btn.getAttribute('data-copy');
    if (!text) return;

    navigator.clipboard.writeText(text).then(function() {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function() {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(function() {
      // Fallback for older browsers
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function() {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    });
  });
});

// ── Smooth scroll for anchor links ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── Tab switching ─────────────────────────────────────────
var tabsEl = document.getElementById('install-tabs');
if (tabsEl) {
  tabsEl.addEventListener('click', function(e) {
    var btn = e.target.closest('.tab-btn');
    if (!btn) return;
    var target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(function(b) {
      b.classList.remove('tab-btn--active');
    });
    document.querySelectorAll('.tab-panel').forEach(function(p) {
      p.classList.remove('tab-panel--active');
    });
    btn.classList.add('tab-btn--active');
    document.getElementById(target).classList.add('tab-panel--active');
  });
  // activate first tab on load
  var firstBtn = tabsEl.querySelector('.tab-btn');
  if (firstBtn) firstBtn.click();
}
