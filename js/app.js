/* Door transition + collection rooms. */
(function () {
  var D = window.ERTH, C = D.collections, FX = window.ERTH_FX;
  var cv = document.getElementById('cv'), scroller = document.getElementById('cvScroll'), portal = document.getElementById('portal'),
    hero = document.getElementById('map'), page = document.getElementById('page'), warp = portal.querySelector('.warp');
  var current = null, busy = false, lastFocus = null, atmo = null, pieceIdx = 0;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var byId = function (id) { return C.filter(function (c) { return c.id === id; })[0]; };

  for (var i = 0; i < 26; i++) { var w = document.createElement('i'); w.style.cssText = '--i:' + i + ';--a:' + (i * 360 / 26 + Math.random() * 8).toFixed(1) + 'deg;--r:' + (380 + Math.random() * 520).toFixed(0) + 'px'; warp.appendChild(w); }

  function renderPiece(c, idx) {
    pieceIdx = idx; var p = c.pieces[idx], img = scroller.querySelector('.cv-img img'), cap = scroller.querySelector('.cv-img .cap');
    if (img.getAttribute('src') !== p.img) {
      var n = img.cloneNode(); n.src = p.img; n.alt = p.alt; n.className = 'out'; img.parentNode.insertBefore(n, img.nextSibling);
      requestAnimationFrame(function () { requestAnimationFrame(function () { n.className = ''; img.className = 'out'; setTimeout(function () { img.remove(); }, 950); }); });
    }
    cap.textContent = p.name;
    scroller.querySelector('.cv-story').textContent = p.story;
    scroller.querySelector('.d-mat').textContent = p.material;
    scroller.querySelector('.d-craft').textContent = p.craft;
    scroller.querySelectorAll('.pieces button').forEach(function (b, k) { b.setAttribute('aria-pressed', k === idx); });
    var q = scroller.querySelector('.inq'); if (q) q.hidden = true;
    scroller.querySelector('.inq-btn').setAttribute('aria-expanded', 'false');
  }

  function render(c) {
    var p = c.pieces[0], k = C.indexOf(c), nx = C[(k + 1) % C.length], pv = C[(k + C.length - 1) % C.length];
    var title = c.title.map(function (t, i) { return '<span class="line"><span style="--d:' + (0.25 + i * 0.18) + 's">' + esc(t) + '</span></span>'; }).join('');
    var pieces = c.pieces.length > 1 ? '<div class="pieces" role="group" aria-label="Pieces in this collection">' + c.pieces.map(function (q, i) { return '<button type="button" data-piece="' + i + '" aria-pressed="' + (i === 0) + '">' + esc(q.name) + '</button>'; }).join('') + '</div>' : '';
    var gal = c.gallery.map(function (g) { return '<figure><img src="' + g.img + '" alt="' + esc(g.alt) + '" loading="lazy"><figcaption>' + esc(g.cap) + '</figcaption></figure>'; }).join('');
    scroller.className = 'cv-scroll t-' + c.id;
    cv.className = cv.className.replace(/\bt-\w+/g, '') + ' t-' + c.id;
    scroller.innerHTML =
      '<div class="cv-main"><figure class="cv-img"><img src="' + p.img + '" alt="' + esc(p.alt) + '" style="--pos:' + c.pos + '"><figcaption class="cap"></figcaption></figure>' +
      '<div class="cv-info"><p class="idx"><b>' + c.n + '</b><span>' + esc(c.kicker) + '</span></p>' +
      '<h2 class="cv-title" id="cvTitle">' + title + '</h2>' + (c.sub ? '<p class="cv-sub">/ ' + esc(c.sub) + '</p>' : '') +
      '<p class="lede">' + esc(c.lede) + '</p>' +
      '<ul class="tags"><li>ONE OF ONE</li><li>HANDCRAFTED IN MOROCCO</li></ul>' + pieces +
      '<p class="cv-story"></p>' +
      '<dl class="detail"><div><dt>Material</dt><dd class="d-mat"></dd></div><div><dt>Craftsmanship</dt><dd class="d-craft"></dd></div><div><dt>Price</dt><dd class="price">On request</dd></div></dl>' +
      '<button type="button" class="inq-btn" aria-expanded="false">Inquire about this piece</button>' +
      '<div class="inq" hidden><p>Write to the studio and name the piece. Each one is made once.</p><div class="row"><code>' + D.contact.email + '</code><button type="button" class="mini" data-copy="email">Copy email</button></div>' +
      '<div class="row"><code>' + D.contact.phone + '</code><span>·</span><code>' + D.contact.handle + '</code></div>' +
      '<div class="row"><button type="button" class="mini" data-copy="msg">Copy message</button><a href="mailto:' + D.contact.email + '">Open in mail app</a><span class="ok" role="status"></span></div></div>' +
      '</div></div>' +
      '<section class="cv-gal" aria-label="More images"><h3>From the same world</h3><div class="gal">' + gal + '</div></section>' +
      '<nav class="cv-next" aria-label="Other collections"><button type="button" data-open="' + pv.id + '"><small>← Previous</small><span>' + esc(pv.tag.replace(/^The /, '')) + '</span></button><button type="button" data-open="' + nx.id + '"><small>Next →</small><span>' + esc(nx.tag.replace(/^The /, '')) + '</span></button></nav>' +
      '<canvas id="atmo" aria-hidden="true"></canvas>';
    renderPiece(c, 0);
    scroller.scrollTop = 0;
    var cvs = scroller.querySelector('#atmo');
    if (atmo) atmo.stop();
    var mode = { casa: null, ouar: ['dust', '#f0c27a', 70], essa: ['wind', '#bfeee8', 22], fire: ['ember', '#ff8a3d', 70] }[c.id];
    atmo = mode ? startParticles(cvs, mode[0], mode[1], mode[2]) : null;
    if (!mode) cvs.remove();
  }

  scroller.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.piece != null) renderPiece(current, +t.dataset.piece);
    else if (t.classList.contains('inq-btn')) { var q = scroller.querySelector('.inq'); q.hidden = !q.hidden; t.setAttribute('aria-expanded', !q.hidden); }
    else if (t.dataset.copy) {
      var txt = t.dataset.copy === 'email' ? D.contact.email : 'Hello ERTH & ART, I would like to inquire about "' + current.pieces[pieceIdx].name + '" (one of one). Is it available?';
      var ok = scroller.querySelector('.ok'), done = function () { ok.textContent = 'Copied'; setTimeout(function () { ok.textContent = ''; }, 1800); };
      try { navigator.clipboard.writeText(txt).then(done, function () { ok.textContent = 'Select the text above to copy'; }); } catch (err) { ok.textContent = 'Select the text above to copy'; }
    }
    else if (t.dataset.open) swap(t.dataset.open);
  });

  function show(c) { current = c; render(c); cv.classList.add('open'); cv.setAttribute('aria-hidden', 'false'); document.body.classList.add('locked'); page.inert = true; setTimeout(function () { scroller.querySelectorAll('.cv-title .line').forEach(function (l) { l.classList.add('in'); }); }, 120); }
  function swap(id) { var c = byId(id); cv.classList.remove('open'); setTimeout(function () { show(c); cv.querySelector('.cv-btn').focus({ preventScroll: true }); }, 450); }

  function openDoor(id, el) {
    if (busy) return; busy = true; lastFocus = el; var c = byId(id);
    if (FX.reduce) { show(c); cv.querySelector('.cv-btn').focus(); busy = false; return; }
    var r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    var clone = el.cloneNode(true); clone.className = 'door door-clone d-' + id; clone.removeAttribute('aria-label'); clone.setAttribute('aria-hidden', 'true'); clone.tabIndex = -1;
    clone.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;transform:none;--glow:' + c.glow + ';transition:transform 1.3s cubic-bezier(.62,0,.2,1)';
    portal.querySelectorAll('.door-clone').forEach(function (n) { n.remove(); });
    portal.style.setProperty('--wg', c.glow); portal.appendChild(clone); portal.classList.remove('clear'); portal.classList.add('on');
    el.style.visibility = 'hidden'; hero.classList.add('dive');
    var s = Math.max(vw / (r.width * .76), vh / (r.height * .9)) * 1.18;
    var dx = vw / 2 - (r.left + r.width / 2), dy = vh / 2 - (r.top + r.height * .55);
    void clone.offsetWidth;
    clone.classList.add('go');
    clone.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
    setTimeout(function () { show(c); }, 950);
    setTimeout(function () { portal.classList.add('clear'); cv.querySelector('.cv-btn').focus({ preventScroll: true }); }, 1150);
    setTimeout(function () { portal.classList.remove('on', 'clear'); clone.remove(); hero.classList.remove('dive'); el.style.visibility = ''; busy = false; }, 1900);
  }

  function closeView(restore) {
    if (!cv.classList.contains('open')) return;
    cv.classList.remove('open'); cv.setAttribute('aria-hidden', 'true'); document.body.classList.remove('locked'); page.inert = false;
    if (atmo) { atmo.stop(); atmo = null; }
    if (restore !== false && lastFocus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { } }
  }

  document.getElementById('stage').addEventListener('click', function (e) { var d = e.target.closest('.door'); if (d) openDoor(d.dataset.id, d); });
  document.getElementById('rail').addEventListener('click', function (e) {
    var b = e.target.closest('.poster'); if (!b) return; lastFocus = b; var c = byId(b.dataset.open);
    cv.classList.remove('open'); show(c); cv.querySelector('.cv-btn').focus({ preventScroll: true });
  });
  cv.querySelector('[data-close]').addEventListener('click', function () { closeView(); });
  cv.querySelector('[data-map]').addEventListener('click', function () { go('story'); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeView(); if (window.closeMenu) closeMenu(); } });

  function go(id) {
    closeView(false); if (window.closeMenu) closeMenu();
    var el = document.getElementById(id); if (!el) return;
    setTimeout(function () { el.scrollIntoView({ behavior: FX.reduce ? 'auto' : 'smooth', block: 'start' }); }, 30);
  }
  document.querySelectorAll('[data-go]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); go(a.dataset.go); }); });
})();
