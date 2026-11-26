(function () {
  var $ = function (q, c) { return (c || document).querySelector(q); };
  var $$ = function (q, c) { return Array.prototype.slice.call((c || document).querySelectorAll(q)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // mobile menu
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // IST clock + year
  var clock = $('#clock');
  function tick() {
    try { clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (e) {}
  }
  tick(); setInterval(tick, 1000);
  $('#yr').textContent = new Date().getFullYear();

  // scroll progress + nav hide/show
  var bar = $('#progress'), nav = $('.nav'), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (!menu.classList.contains('open')) nav.classList.toggle('hide', y > lastY && y > 240);
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // reveal setup
  var els = $$('.sec > *, .hero > .term, .cards, .facts');
  els.forEach(function (el) { el.classList.add('rv'); });
  $$('.grid3, .work, .facts, .cards').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--k', i); });
  });
  $$('.tl').forEach(function (g) { $$('li', g).forEach(function (c, i) { c.style.setProperty('--k', i); }); });
  $$('.sec > .rv').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i % 4, 3) * 0.06 + 's'); });

  // count-up
  function countUp(el) {
    var to = +el.dataset.to, suf = el.dataset.suf || '', t0 = null, dur = 1400;
    if (reduce) { el.textContent = to.toLocaleString('en-US') + suf; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString('en-US') + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.classList.contains('facts')) $$('b[data-to]', e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });

    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); so.unobserve(e.target); } });
    }, { threshold: 0.05 });
    $$('.sec').forEach(function (s) { so.observe(s); });

    // active nav link
    var links = {}; $$('.nav-links a').forEach(function (a) { links[a.getAttribute('href')] = a; });
    var ao = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          var a = links['#' + e.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('.sec[id]').forEach(function (s) { ao.observe(s); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
    $$('.sec').forEach(function (s) { s.classList.add('seen'); });
    $$('.facts b[data-to]').forEach(countUp);
  }
})();
