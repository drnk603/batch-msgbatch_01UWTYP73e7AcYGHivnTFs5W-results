(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var inner = header.querySelector('.dr-header-inner');
  if (!toggle || !inner) return;

  toggle.addEventListener('click', function () {
    var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    if (isExpanded) {
      inner.classList.remove('dr-is-open');
    } else {
      inner.classList.add('dr-is-open');
    }
  });
})();
