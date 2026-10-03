/* Renders the rail, process timeline and studio archive from data. */
(function () {
  var D = window.ERTH, esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  document.getElementById('rail').innerHTML = D.collections.map(function (c, i) {
    var p = c.pieces[0];
    return '<button type="button" class="poster" data-open="' + c.id + '" style="--c:' + c.glow + '" aria-label="Open ' + esc(c.tag) + ' collection">' +
      '<img src="' + p.img + '" alt="' + esc(p.alt) + '" loading="lazy" width="' + (c.id === 'ouar' ? 1024 : 600) + '" height="' + (c.id === 'ouar' ? 683 : 800) + '" style="object-position:' + c.pos + '">' +
      '<span class="sweep"></span><span class="pn">' + c.n + ' / 04</span>' +
      '<span class="pt"><span class="pc">' + esc(c.city) + '</span><span class="ph">' + esc(c.tag.replace(/^The /, '')) + '</span><span class="po">ONE OF ONE</span></span></button>';
  }).join('');
  document.getElementById('tl').innerHTML = D.process.map(function (s, i) {
    return '<article class="st"><figure><img src="' + s.img + '" alt="' + esc(s.alt) + '" loading="lazy" width="400" height="500"></figure>' +
      '<div class="tx"><div class="n" aria-hidden="true">' + s.n + '</div><h3>' + esc(s.t) + '</h3><p>' + esc(s.d) + '</p></div></article>';
  }).join('');
  document.getElementById('arc').innerHTML = D.archive.map(function (a) {
    return '<article class="arc rv"><div class="ov"><img src="' + a.img + '" alt="' + esc(a.alt) + '" loading="lazy" width="400" height="533"></div><h3>' + esc(a.t) + '</h3><p>' + esc(a.d) + '</p></article>';
  }).join('');
})();
