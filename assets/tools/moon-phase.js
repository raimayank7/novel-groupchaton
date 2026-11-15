/* Infinity by GroupChatOn — moon-phase. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Moon phase for any date: shape, illumination, age, next new / full / quarter moons (Meeus formulas, accurate to minutes) and a month of moon phases. */
GCOTools.register('moon-phase', function (spot, T) {
  var h = T.h, R = Math.PI / 180, SYN = 29.530588861;
  function phaseJDE(k) {
    var t = k / 1236.85, t2 = t * t, t3 = t2 * t, t4 = t3 * t, s = Math.sin, co = Math.cos, q = Math.round((k - Math.floor(k)) * 4) % 4;
    var jde = 2451550.09766 + SYN * k + 0.00015437 * t2 - 0.00000015 * t3 + 0.00000000073 * t4, E = 1 - 0.002516 * t - 0.0000074 * t2;
    var M = (2.5534 + 29.1053567 * k - 0.0000014 * t2 - 0.00000011 * t3) * R, Mp = (201.5643 + 385.81693528 * k + 0.0107582 * t2 + 0.00001238 * t3 - 0.000000058 * t4) * R;
    var F = (160.7108 + 390.67050284 * k - 0.0016118 * t2 - 0.00000227 * t3 + 0.000000011 * t4) * R, O = (124.7746 - 1.56375588 * k + 0.0020672 * t2 + 0.00000215 * t3) * R, c;
    if (q === 0 || q === 2) {
      var a = q === 0 ? [-0.4072, 0.17241, 0.01608, 0.01039, 0.00739, -0.00514, 0.00208] : [-0.40614, 0.17302, 0.01614, 0.01043, 0.00734, -0.00515, 0.00209];
      c = a[0] * s(Mp) + a[1] * E * s(M) + a[2] * s(2 * Mp) + a[3] * s(2 * F) + a[4] * E * s(Mp - M) + a[5] * E * s(Mp + M) + a[6] * E * E * s(2 * M) - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
        - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F) - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(O) - 0.00007 * s(Mp + 2 * M) + 0.00004 * s(2 * Mp - 2 * F) + 0.00004 * s(3 * M)
        + 0.00003 * s(Mp + M - 2 * F) + 0.00003 * s(2 * Mp + 2 * F) - 0.00003 * s(Mp + M + 2 * F) + 0.00003 * s(Mp - M + 2 * F) - 0.00002 * s(Mp - M - 2 * F) - 0.00002 * s(3 * Mp + M) + 0.00002 * s(4 * Mp);
    } else {
      c = -0.62801 * s(Mp) + 0.17172 * E * s(M) - 0.01183 * E * s(Mp + M) + 0.00862 * s(2 * Mp) + 0.00804 * s(2 * F) + 0.00454 * E * s(Mp - M) + 0.00204 * E * E * s(2 * M) - 0.0018 * s(Mp - 2 * F) - 0.0007 * s(Mp + 2 * F)
        - 0.0004 * s(3 * Mp) - 0.00034 * E * s(2 * Mp - M) + 0.00032 * E * s(M + 2 * F) + 0.00032 * E * s(M - 2 * F) - 0.00028 * E * E * s(Mp + 2 * M) + 0.00027 * E * s(2 * Mp + M) - 0.00017 * s(O)
        - 0.00005 * s(Mp - M - 2 * F) + 0.00004 * s(2 * Mp + 2 * F) - 0.00004 * s(Mp + M + 2 * F) + 0.00004 * s(Mp - 2 * M) + 0.00003 * s(Mp + M - 2 * F) + 0.00003 * s(3 * M) + 0.00002 * s(2 * Mp - 2 * F) + 0.00002 * s(Mp - M + 2 * F) - 0.00002 * s(3 * Mp + M);
      var W = 0.00306 - 0.00038 * E * co(M) + 0.00026 * co(Mp) - 0.00002 * co(Mp - M) + 0.00002 * co(Mp + M) + 0.00002 * co(2 * F);
      c += q === 1 ? W : -W;
    }
    var A = [299.77 + 0.107408 * k - 0.009173 * t2, 251.88 + 0.016321 * k, 251.83 + 26.651886 * k, 349.42 + 36.412478 * k, 84.66 + 18.206239 * k, 141.74 + 53.303771 * k, 207.14 + 2.453732 * k,
      154.84 + 7.30686 * k, 34.52 + 27.261239 * k, 207.19 + 0.121824 * k, 291.34 + 1.844379 * k, 161.72 + 24.198154 * k, 239.56 + 25.513099 * k, 331.55 + 3.592518 * k];
    [0.000325, 0.000165, 0.000164, 0.000126, 0.00011, 0.000062, 0.00006, 0.000056, 0.000047, 0.000042, 0.00004, 0.000037, 0.000035, 0.000023].forEach(function (x, i) { c += x * s(A[i] * R); });
    return jde + c;
  }
  function toDate(jde) { return new Date((jde - 2440587.5) * 864e5 - 69000); }   // TT → UT (ΔT ≈ 69 s)
  function toJD(d) { return d.getTime() / 864e5 + 2440587.5; }
  function phases(d) {   // every phase from a little before d to a few weeks after, in order
    var k0 = Math.floor((toJD(d) - 2451550.09766) / SYN) - 1, out = [];
    for (var k = k0; k < k0 + 4; k++) for (var q = 0; q < 4; q++) out.push({ q: q, d: toDate(phaseJDE(k + q / 4)) });
    return out.sort(function (a, b) { return a.d - b.d; });
  }
  function illum(d) {
    var t = (toJD(d) - 2451545) / 36525, D = 297.8501921 + 445267.1114034 * t, M = 357.5291092 + 35999.0502909 * t, Mp = 134.9633964 + 477198.8675055 * t;
    var i = 180 - D - 6.289 * Math.sin(Mp * R) + 2.1 * Math.sin(M * R) - 1.274 * Math.sin((2 * D - Mp) * R) - 0.658 * Math.sin(2 * D * R) - 0.214 * Math.sin(2 * Mp * R) - 0.11 * Math.sin(D * R);
    return { k: (1 + Math.cos(i * R)) / 2, waxing: ((D % 360) + 360) % 360 < 180 };
  }
  var NAMES = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'], ICON = ['🌑', '🌓', '🌕', '🌗'], EMO = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  function info(d) {
    var ph = phases(d), prev = ph.filter(function (p) { return p.q === 0 && p.d <= d; }).pop(), il = illum(d), age = (d - prev.d) / 864e5, name;
    if (il.k < 0.03) name = 'New Moon'; else if (il.k > 0.97) name = 'Full Moon';
    else if (Math.abs(il.k - 0.5) < 0.04) name = il.waxing ? 'First Quarter' : 'Last Quarter';
    else name = (il.waxing ? 'Waxing ' : 'Waning ') + (il.k < 0.5 ? 'Crescent' : 'Gibbous');
    return { k: il.k, waxing: il.waxing, age: age, name: name, next: ph.filter(function (p) { return p.d > d; }).slice(0, 4), emoji: EMO[Math.round(age / SYN * 8) % 8] };
  }
  var cv = h('canvas', { width: '260', height: '260', style: 'width:min(220px,70%);display:block;margin:0 auto', role: 'img', 'aria-label': 'Moon shape' });
  function drawMoon(k, waxing, south) {
    var g = cv.getContext('2d'), c = 130, r = 118; g.clearRect(0, 0, 260, 260);
    g.fillStyle = '#1f2937'; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
    g.save(); if (waxing === !!south) { g.translate(260, 0); g.scale(-1, 1); }   // lit side: right when waxing (north), left when waning
    g.fillStyle = '#f8f4d8'; g.beginPath(); g.arc(c, c, r, -Math.PI / 2, Math.PI / 2, false);
    var rx = r * Math.abs(2 * k - 1);
    if (k > 0.5) g.ellipse(c, c, rx, r, 0, Math.PI / 2, Math.PI * 1.5, false); else g.ellipse(c, c, rx, r, 0, Math.PI / 2, -Math.PI / 2, true);
    g.fill(); g.restore();
  }
  var date = h('input', { type: 'date' }), time = h('input', { type: 'time' }), south = h('input', { type: 'checkbox', checked: T.store.get('moon-south', false) ? true : null });
  var big = h('div', { 'data-out': '', style: 'text-align:center;font:800 26px/1.3 var(--ui)' }), stats = h('div', { 'class': 'tstats' }), next = h('div', { 'class': 'tstats' }), month = h('div', { style: 'display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;text-align:center' });
  function when() { if (!date.value) return new Date(); var p = date.value.split('-'), t = (time.value || '12:00').split(':'); return new Date(+p[0], p[1] - 1, +p[2], +t[0], +t[1]); }
  function fmt(d) { return d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function draw() {
    T.store.set('moon-south', south.checked);
    var d = when(), m = info(d);
    drawMoon(m.k, m.waxing, south.checked);
    big.textContent = m.emoji + ' ' + m.name;
    stats.innerHTML = ''; next.innerHTML = '';
    [[Math.round(m.k * 100) + '%', 'Lit (illumination)'], [m.age.toFixed(1) + ' days', 'Moon age (since new moon)'], [m.waxing ? 'Growing ↑' : 'Shrinking ↓', m.waxing ? 'Waxing' : 'Waning']].forEach(function (r) { stats.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: r[0] }), h('span', { text: r[1] })])); });
    m.next.forEach(function (p) { next.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: ICON[p.q] + ' ' + NAMES[p.q], style: 'font-size:17px' }), h('span', { text: fmt(p.d) })])); });
    month.innerHTML = '';
    var y = d.getFullYear(), mo = d.getMonth(), n = new Date(y, mo + 1, 0).getDate(), first = new Date(y, mo, 1).getDay();
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (w) { month.appendChild(h('small', { text: w, style: 'color:var(--muted)' })); });
    for (var i = 0; i < first; i++) month.appendChild(h('span'));
    for (var dd = 1; dd <= n; dd++) { var x = info(new Date(y, mo, dd, 21)); month.appendChild(h('span', { title: x.name, style: 'padding:4px 0;border-radius:8px;' + (dd === d.getDate() ? 'background:var(--accent-soft)' : '') }, [h('span', { text: x.emoji, style: 'display:block;font-size:20px' }), h('small', { text: String(dd) })])); }
  }
  [date, time, south].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  var now = new Date(); date.value = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2); time.value = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Date', date), T.field('Time', time)]), h('label', { 'class': 'tcheck' }, [south, ' I am in the southern hemisphere (mirror the moon)']),
    cv, big, stats, h('h3', { text: 'Next phases (your time)' }), next, h('h3', { text: 'This month (at 9 pm)' }), month]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['moon-phase'] = function () {
    var f = [];
    function near(q, iso, label) {
      var want = new Date(iso), got = phases(want).filter(function (p) { return p.q === q; }).reduce(function (a, b) { return Math.abs(b.d - want) < Math.abs(a.d - want) ? b : a; });
      if (Math.abs(got.d - want) > 15 * 60000) f.push(label + ' off by ' + Math.round((got.d - want) / 60000) + ' min');
    }
    near(0, '2024-04-08T18:21:00Z', 'new moon Apr 2024'); near(2, '2024-04-23T23:49:00Z', 'full moon Apr 2024'); near(1, '2024-01-18T03:53:00Z', 'first quarter Jan 2024'); near(2, '2025-01-13T22:27:00Z', 'full moon Jan 2025');
    var full = info(new Date('2024-04-23T23:49:00Z')); if (full.k < 0.98 || full.name !== 'Full Moon') f.push('full illumination ' + full.k);
    var nw = info(new Date('2024-04-08T20:00:00Z')); if (nw.k > 0.02 || nw.age > 0.2) f.push('new moon age ' + nw.age);
    var wx = info(new Date('2024-04-12T12:00:00Z')); if (!wx.waxing || wx.name !== 'Waxing Crescent') f.push('waxing crescent ' + wx.name);
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
