/* Ambient effects: particles, reveals, parallax, nav, rail, process line. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = matchMedia('(max-width: 700px)').matches;
  window.ERTH_FX = { reduce: reduce, small: small };

  /* particle field. modes: dust (slow warm motes), ember (rising), wind (horizontal streaks) */
  window.startParticles = function (canvas, mode, color, count) {
    var ctx = canvas.getContext('2d'), W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), ps = [], raf = 0, alive = true, last = 0;
    function size() { var r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function mk(initial) {
      var p = { x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .4, a: Math.random() * .6 + .15, v: Math.random() * .4 + .1, ph: Math.random() * 6.28 };
      if (mode === 'ember') { p.y = initial ? Math.random() * H : H + 10; p.v = Math.random() * 1.1 + .4; p.r = Math.random() * 2 + .6; }
      if (mode === 'wind') { p.v = Math.random() * 2 + 1; p.len = Math.random() * 80 + 30; p.r = .7; p.a *= .45; }
      return p;
    }
    size(); var n = Math.round((count || 60) * (window.ERTH_FX.small ? .55 : 1)); for (var i = 0; i < n; i++) ps.push(mk(true));
    function draw(t) {
      if (!alive) return; raf = requestAnimationFrame(draw);
      if (t - last < 33) return; last = t;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = color; ctx.strokeStyle = color;
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i]; p.ph += .02;
        if (mode === 'ember') { p.y -= p.v; p.x += Math.sin(p.ph) * .6; if (p.y < -10) ps[i] = mk(false); ctx.globalAlpha = p.a * (.6 + .4 * Math.sin(p.ph * 3)) * Math.min(1, p.y / (H * .6)); }
        else if (mode === 'wind') { p.x += p.v; if (p.x > W + 100) { p.x = -100; p.y = Math.random() * H; } ctx.globalAlpha = p.a; ctx.lineWidth = p.r; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.len, p.y - 4); ctx.stroke(); continue; }
        else { p.x += Math.sin(p.ph) * .25 + p.v * .3; p.y -= p.v * .15; if (p.x > W + 5) p.x = -5; if (p.y < -5) p.y = H + 5; ctx.globalAlpha = p.a * (.5 + .5 * Math.sin(p.ph)); }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (window.ERTH_FX.reduce) { draw(100); alive = false; cancelAnimationFrame(raf); } else raf = requestAnimationFrame(draw);
    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null; if (ro) ro.observe(canvas);
    return { stop: function () { alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); }, pause: function () { alive = false; cancelAnimationFrame(raf); }, play: function () { if (!alive && !window.ERTH_FX.reduce) { alive = true; raf = requestAnimationFrame(draw); } } };
  };

  var dust = startParticles(document.getElementById('dust'), 'dust', '#e8c88a', 70);
  var heroEl = document.getElementById('map');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { e[0].isIntersecting ? dust.play() : dust.pause(); }).observe(heroEl);

  /* reveal on scroll */
  var rvs = document.querySelectorAll('.rv,.line');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add('in'); });
  document.querySelectorAll('.st').forEach(function (el) { new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { el.classList.add('in'); o.disconnect(); } }, { threshold: .35 }).observe(el); });

  /* scroll: nav state, parallax, process line */
  var nav = document.getElementById('nav'), tl = document.querySelector('.tl'), px = document.querySelectorAll('[data-px]'), tick = false;
  function onScroll() {
    tick = false;
    nav.classList.toggle('solid', scrollY > 40);
    var vh = innerHeight;
    if (!reduce && !small) px.forEach(function (el) { var r = el.parentElement.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * parseFloat(el.dataset.px)).toFixed(1) + 'px,0)'; });
    if (tl) { var r2 = tl.getBoundingClientRect(); tl.style.setProperty('--p', Math.max(0, Math.min(1, (vh * .6 - r2.top) / r2.height)).toFixed(3)); }
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll); onScroll();

  /* collections rail */
  var rail = document.getElementById('rail');
  document.querySelectorAll('[data-rail]').forEach(function (b) { b.addEventListener('click', function () { var c = rail.querySelector('.poster'); rail.scrollBy({ left: (c.offsetWidth + 24) * parseInt(b.dataset.rail, 10), behavior: reduce ? 'auto' : 'smooth' }); }); });

  /* mobile menu */
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  window.closeMenu = function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); };
  burger.addEventListener('click', function () { var o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); });
})();
