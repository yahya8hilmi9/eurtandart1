/* Draws Morocco as an architectural plate and stands the four doors on it. */
(function () {
  var VW = 940, VH = 1040, S = 62, X0 = -17.6, Y0 = 36.1, KX = 0.87, OX = 24, OY = 90;
  function P(lon, lat) { return [(lon - X0) * KX * S + OX, (Y0 - lat) * S + OY]; }
  function f(n) { return Math.round(n * 10) / 10; }
  function smooth(pts) { // Catmull-Rom -> cubic bezier
    var d = '';
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
        f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
    }
    return d;
  }
  var med = [[-5.92, 35.78], [-5.3, 35.88], [-4.6, 35.3], [-3.9, 35.2], [-3.0, 35.4], [-2.2, 35.1]].map(function (a) { return P(a[0], a[1]); });
  var border = [[-1.75, 34.6], [-1.65, 33.5], [-1.2, 32.1], [-2.9, 31.8], [-3.8, 31.0], [-5.0, 30.1], [-6.7, 29.6], [-8.67, 28.7], [-8.67, 27.67], [-8.67, 26.0], [-12.0, 26.0], [-12.0, 23.45], [-13.1, 21.35], [-17.05, 21.35]].map(function (a) { return P(a[0], a[1]); });
  var coast = [[-17.05, 21.35], [-16.3, 22.0], [-15.95, 23.7], [-15.0, 25.0], [-14.5, 26.12], [-13.2, 27.1], [-12.95, 27.95], [-11.1, 28.45], [-10.17, 29.38], [-9.6, 30.4], [-9.77, 31.5], [-9.24, 32.3], [-8.5, 33.25], [-7.62, 33.6], [-6.85, 34.03], [-6.15, 35.2], [-5.92, 35.78]].map(function (a) { return P(a[0], a[1]); });
  var d = 'M' + f(med[0][0]) + ' ' + f(med[0][1]) + smooth(med);
  border.forEach(function (p) { d += 'L' + f(p[0]) + ' ' + f(p[1]); });
  d += smooth(coast) + 'Z';

  var atlas = [[-9.4, 30.7], [-8.0, 31.2], [-6.4, 31.6], [-5.0, 32.3], [-4.0, 33.1], [-3.0, 33.8]].map(function (a) { return P(a[0], a[1]); });
  var rif = [[-5.4, 35.2], [-4.4, 34.9], [-3.4, 35.0]].map(function (a) { return P(a[0], a[1]); });
  function pl(a) { return 'M' + a.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L'); }

  var grat = '';
  [-15, -10, -5].forEach(function (lo) { var a = P(lo, 36), b = P(lo, 21); grat += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/><text class="map-note" x="' + (a[0] + 6) + '" y="' + (a[1] - 8) + '">' + Math.abs(lo) + '°W</text>'; });
  [35, 30, 25].forEach(function (la) { var a = P(-17.6, la), b = P(-1, la); grat += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/><text class="map-note" x="' + (a[0] + 4) + '" y="' + (a[1] - 6) + '">' + la + '°N</text>'; });

  var cities = [['Tanger', -5.8, 35.76], ['Fès', -5.0, 34.03], ['Rabat', -6.85, 34.03], ['Marrakech', -8.0, 31.63], ['Agadir', -9.6, 30.42], ['Oujda', -1.9, 34.68], ['Laâyoune', -13.2, 27.15], ['Dakhla', -15.93, 23.7]];
  var cs = '';
  cities.forEach(function (c) { var p = P(c[1], c[2]); cs += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="2.2" fill="#B59A67" opacity=".7"/><text class="map-city" x="' + f(p[0] + 7) + '" y="' + f(p[1] + 4) + '">' + c[0] + '</text>'; });

  var C = window.ERTH.collections, leaders = '', dots = '', doors = '';
  C.forEach(function (c) {
    var p = P(c.lon, c.lat), fx = p[0] / VW + c.dx, fy = p[1] / VH + c.dy;
    dots += '<g class="glow"><circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="9" fill="' + c.glow + '" opacity=".22"/></g><circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="3.4" fill="' + c.glow + '"/>';
    leaders += '<line class="leader" x1="' + f(p[0]) + '" y1="' + f(p[1]) + '" x2="' + f(fx * VW) + '" y2="' + f(fy * VH) + '"/>';
    var sparks = '';
    for (var i = 0; i < 7; i++) sparks += '<i style="--x:' + (10 + i * 13) + '%;--t:' + (i * 0.5).toFixed(1) + 's;--dx:' + (i % 2 ? 14 : -14) + 'px"></i>';
    var label = 'Open the ' + c.tag + ' collection, ' + c.city + '. One of one.';
    doors += '<button type="button" class="door d-' + c.id + '" data-id="' + c.id + '" aria-label="' + label + '" style="left:' + (fx * 100).toFixed(2) + '%;top:' + (fy * 100).toFixed(2) + '%;--glow:' + c.glow + ';--di:' + c.di + '">' +
      '<span class="d-sur"></span><span class="d-op"><span class="d-void"></span><span class="d-panel l"></span><span class="d-panel r"></span></span>' +
      '<span class="d-spark">' + sparks + '</span>' +
      '<span class="d-card ' + c.side + '"><b>' + c.city.toUpperCase() + '</b><em>' + c.tag + '</em><small>ONE OF ONE</small></span>' +
      '<span class="d-tag">' + c.city + '</span></button>';
  });

  var compass = P(-3.2, 23.4);
  var svg = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" aria-hidden="true" focusable="false"><defs>' +
    '<linearGradient id="landg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34291b"/><stop offset=".55" stop-color="#211a12"/><stop offset="1" stop-color="#17130e"/></linearGradient>' +
    '<clipPath id="landc"><path d="' + d + '"/></clipPath>' +
    '<filter id="topo" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".007 .011" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="85"/></filter>' +
    '<filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>' +
    '<filter id="halo" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="22"/></filter>' +
    '<pattern id="lines" width="24" height="15" patternUnits="userSpaceOnUse"><path d="M0 7.5H24" stroke="#B59A67" stroke-width=".7" fill="none"/></pattern>' +
    '<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 .95  0 0 0 0 .9  0 0 0 0 .8  0 0 0 .5 0"/></filter></defs>' +
    '<g stroke="rgba(181,154,103,.14)" stroke-dasharray="2 7" stroke-width="1">' + grat + '</g>' +
    '<g class="landg"><path d="' + d + '" fill="#B59A67" opacity=".16" filter="url(#halo)"/>' +
    '<path id="land" d="' + d + '" fill="url(#landg)"/>' +
    '<g clip-path="url(#landc)"><use href="#land" fill="none" stroke="#B59A67" stroke-width="64" opacity=".05"/><use href="#land" fill="none" stroke="#B59A67" stroke-width="34" opacity=".08"/><use href="#land" fill="none" stroke="#B59A67" stroke-width="14" opacity=".14"/>' +
    '<g filter="url(#topo)" opacity=".34"><rect x="-60" y="-60" width="' + (VW + 120) + '" height="' + (VH + 120) + '" fill="url(#lines)"/></g>' +
    '<path d="' + pl(atlas) + '" stroke="#E7DFD0" stroke-width="34" stroke-linecap="round" fill="none" opacity=".16" filter="url(#blur)"/><path d="' + pl(atlas) + '" stroke="#B59A67" stroke-width="1" stroke-dasharray="1 6" fill="none" opacity=".8"/>' +
    '<path d="' + pl(rif) + '" stroke="#E7DFD0" stroke-width="22" stroke-linecap="round" fill="none" opacity=".12" filter="url(#blur)"/>' +
    '<rect width="' + VW + '" height="' + VH + '" filter="url(#paper)" opacity=".16" style="mix-blend-mode:overlay"/></g>' +
    '<path d="' + d + '" fill="none" stroke="#B59A67" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="' + d + '" fill="none" stroke="#B59A67" stroke-width=".6" transform="translate(-5 -5)" opacity=".4"/></g>' +
    cs +
    '<text class="map-note" x="' + (OX + 6) + '" y="42">Al-Maghrib · Plate I</text>' +
    '<text x="' + (VW - 24) + '" y="62" text-anchor="end" font-family="serif" font-size="30" fill="#B59A67" opacity=".6" lang="ar">المغرب</text>' +
    '<g transform="translate(' + f(compass[0]) + ' ' + f(compass[1]) + ')" stroke="#B59A67" fill="none" opacity=".6"><circle r="26" stroke-dasharray="2 4"/><path d="M0 -38L5 0L0 38L-5 0Z" fill="rgba(181,154,103,.25)"/><path d="M-38 0H38"/><text class="map-note" y="-44" text-anchor="middle" fill="#B59A67" stroke="none">N</text></g>' +
    leaders + dots + '</svg>';

  var stage = document.getElementById('stage');
  stage.insertAdjacentHTML('afterbegin', svg);
  stage.insertAdjacentHTML('beforeend', doors);
})();
