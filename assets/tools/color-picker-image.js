/* Infinity by GroupChatOn — color-picker-image. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Pick colours from an image: tap any pixel for HEX, RGB, HSL and CMYK with a magnifier, plus the main colour palette of the picture (k-means). */
GCOTools.register('color-picker-image', function (spot, T) {
  var h = T.h, status = T.status();
  function hex(r, g, b) { return '#' + [r, g, b].map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
  function hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255; var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, hh = 0, s = 0;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh = Math.round(hh * 60); if (hh < 0) hh += 360; }
    return 'hsl(' + hh + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%)';
  }
  function cmyk(r, g, b) { var k = 1 - Math.max(r, g, b) / 255; if (k >= 1) return 'cmyk(0%, 0%, 0%, 100%)'; return 'cmyk(' + [r, g, b].map(function (v) { return Math.round((1 - v / 255 - k) / (1 - k) * 100) + '%'; }).join(', ') + ', ' + Math.round(k * 100) + '%)'; }
  function palette(data, k) {   // k-means on up to ~12k pixels → [{c:[r,g,b], n}] biggest first
    var px = [], step = Math.max(1, Math.floor(data.length / 4 / 12000)), i, j;
    for (i = 0; i < data.length; i += 4 * step) if (data[i + 3] > 127) px.push([data[i], data[i + 1], data[i + 2]]);
    if (!px.length) return [];
    var sorted = px.slice().sort(function (a, b) { return (a[0] * 3 + a[1] * 6 + a[2]) - (b[0] * 3 + b[1] * 6 + b[2]); }), cs = [];
    for (i = 0; i < k; i++) cs.push(sorted[Math.floor((i + 0.5) * sorted.length / k)].slice());
    var lab = new Array(px.length);
    for (var it = 0; it < 10; it++) {
      var sum = cs.map(function () { return [0, 0, 0, 0]; });
      for (i = 0; i < px.length; i++) { var best = 0, bd = 1e9; for (j = 0; j < cs.length; j++) { var dr = px[i][0] - cs[j][0], dg = px[i][1] - cs[j][1], db = px[i][2] - cs[j][2], d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; best = j; } } lab[i] = best; var s = sum[best]; s[0] += px[i][0]; s[1] += px[i][1]; s[2] += px[i][2]; s[3]++; }
      cs = cs.map(function (c, j2) { var s = sum[j2]; return s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : c; });
    }
    var out = cs.map(function (c, j2) { return { c: c.map(Math.round), n: lab.filter(function (l) { return l === j2; }).length }; }).filter(function (x) { return x.n; }).sort(function (a, b) { return b.n - a.n; });
    var merged = [];
    out.forEach(function (x) { var m = merged.filter(function (y) { return Math.abs(y.c[0] - x.c[0]) + Math.abs(y.c[1] - x.c[1]) + Math.abs(y.c[2] - x.c[2]) < 24; })[0]; if (m) m.n += x.n; else merged.push(x); });
    var total = px.length; merged.forEach(function (x) { x.p = Math.round(x.n / total * 100); });
    return merged;
  }
  var cv = h('canvas', { 'class': 'tfit-canvas', style: 'touch-action:none;cursor:crosshair', 'aria-label': 'Tap the picture to pick a colour' }), prev = h('div', { 'class': 'tfit-prev', style: 'position:relative' }, [cv]);
  var loupe = h('canvas', { width: '110', height: '110', hidden: true, style: 'position:absolute;pointer-events:none;width:110px;height:110px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.4);image-rendering:pixelated' });
  prev.appendChild(loupe);
  var sw = h('div', { style: 'width:72px;height:72px;border-radius:16px;border:1px solid var(--line);flex:none' }), codes = h('div', { 'class': 'tkv', 'data-out': '', style: 'flex:1;min-width:0' });
  var hist = h('div', { 'class': 'trow', style: 'gap:6px' }), pal = h('div', { 'class': 'tstats' }), picks = [], g = cv.getContext('2d', { willReadFrequently: true });
  function show(r, gg, b) {
    sw.style.background = hex(r, gg, b); codes.innerHTML = '';
    [['HEX', hex(r, gg, b).toUpperCase()], ['RGB', 'rgb(' + r + ', ' + gg + ', ' + b + ')'], ['HSL', hsl(r, gg, b)], ['CMYK', cmyk(r, gg, b)]].forEach(function (x) {
      var c = T.button('Copy', { small: true, onclick: function () { T.copy(x[1], c); } }); codes.appendChild(h('div', {}, [h('span', { text: x[0] }), h('code', { text: x[1] }), c]));
    });
  }
  function at(e) { var r = cv.getBoundingClientRect(); return [Math.max(0, Math.min(cv.width - 1, Math.floor((e.clientX - r.left) * cv.width / r.width))), Math.max(0, Math.min(cv.height - 1, Math.floor((e.clientY - r.top) * cv.height / r.height))), e.clientX - r.left, e.clientY - r.top]; }
  function pick(p) {
    var d = g.getImageData(p[0], p[1], 1, 1).data; show(d[0], d[1], d[2]);
    var x = hex(d[0], d[1], d[2]); picks = [x].concat(picks.filter(function (y) { return y !== x; })).slice(0, 12);
    hist.innerHTML = ''; picks.forEach(function (c) { var b = h('button', { type: 'button', title: c + ' (tap to copy)', style: 'width:34px;height:34px;border-radius:9px;border:1px solid var(--line);cursor:pointer;background:' + c, onclick: function () { T.copy(c); status.ok(c + ' copied.'); } }); hist.appendChild(b); });
  }
  function magnify(p) {
    var lg = loupe.getContext('2d'); lg.imageSmoothingEnabled = false; lg.clearRect(0, 0, 110, 110); lg.drawImage(cv, p[0] - 5, p[1] - 5, 11, 11, 0, 0, 110, 110);
    lg.strokeStyle = '#fff'; lg.lineWidth = 2; lg.strokeRect(50, 50, 10, 10); lg.strokeStyle = '#000'; lg.strokeRect(48, 48, 14, 14);
    loupe.hidden = false; loupe.style.left = (cv.offsetLeft + p[2] - 55) + 'px'; loupe.style.top = (cv.offsetTop + p[3] - 130) + 'px';
  }
  cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); var p = at(e); magnify(p); pick(p); });
  cv.addEventListener('pointermove', function (e) { var p = at(e); if (e.buttons || e.pointerType === 'mouse') magnify(p); if (e.buttons) pick(p); });
  cv.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') loupe.hidden = true; });
  cv.addEventListener('pointerleave', function () { loupe.hidden = true; });
  function drawPal() {
    var d = g.getImageData(0, 0, cv.width, cv.height).data, p = palette(d, 8); pal.innerHTML = '';
    p.forEach(function (x) { var c = hex(x.c[0], x.c[1], x.c[2]); pal.appendChild(h('button', { type: 'button', 'class': 'tstat', style: 'cursor:pointer;text-align:left;border-left:28px solid ' + c, onclick: function () { show(x.c[0], x.c[1], x.c[2]); } }, [h('b', { text: c.toUpperCase(), style: 'font-size:17px' }), h('span', { text: x.p + '% of the picture' })])); });
    copyPal.hidden = !p.length; copyPal.onclick = function () { T.copy(p.map(function (x) { return hex(x.c[0], x.c[1], x.c[2]); }).join('\n'), copyPal); };
  }
  function open(src) {
    var im = new Image();
    im.onload = function () { var k = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight)); cv.width = Math.max(1, Math.round(im.naturalWidth * k)); cv.height = Math.max(1, Math.round(im.naturalHeight * k)); g.drawImage(im, 0, 0, cv.width, cv.height); drawPal(); pick([Math.floor(cv.width / 2), Math.floor(cv.height / 2)]); status.info('Tap or drag on the picture to pick colours.'); };
    im.onerror = function () { status.error('This image could not be opened. Try a JPG, PNG or WebP.'); };
    im.src = src;
  }
  var copyPal = T.button('Copy palette', { small: true }); copyPal.hidden = true;
  var eye = window.EyeDropper ? T.button('🎯 Pick from anywhere on screen', { small: true, onclick: function () { new window.EyeDropper().open().then(function (r) { var m = r.sRGBHex.match(/[\da-f]{2}/gi); if (m && m.length >= 3) show(parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)); }).catch(function () {}); } }) : null;
  function sample() {
    var c = h('canvas'); c.width = 800; c.height = 500; var x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 340);
    gr.addColorStop(0, '#1e3a8a'); gr.addColorStop(0.6, '#f97316'); gr.addColorStop(1, '#fde68a'); x.fillStyle = gr; x.fillRect(0, 0, 800, 340);
    x.fillStyle = '#fef3c7'; x.beginPath(); x.arc(560, 300, 70, 0, 7); x.fill(); x.fillStyle = '#0f766e'; x.fillRect(0, 340, 800, 160); x.fillStyle = '#134e4a'; x.beginPath(); x.moveTo(0, 340); x.lineTo(220, 200); x.lineTo(430, 340); x.fill();
    open(c.toDataURL('image/png'));
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', paste: true, icon: '🎨', label: 'Choose a picture', hint: 'Or paste a screenshot · nothing is uploaded', onFiles: function (f) { open(URL.createObjectURL(f[0])); } }), prev,
    h('div', { style: 'display:flex;gap:14px;align-items:flex-start' }, [sw, codes]), T.row([eye, T.button('Try a sample', { small: true, onclick: sample })]), status.el,
    h('span', { 'class': 'tfield-label', text: 'Recent picks (tap to copy)' }), hist, h('h3', { text: 'Main colours in this picture' }), pal, T.row([copyPal])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['color-picker-image'] = function () {
    var f = [];
    if (hex(18, 52, 86) !== '#123456' || hex(255, 0, 0) !== '#ff0000') f.push('hex');
    if (hsl(255, 0, 0) !== 'hsl(0, 100%, 50%)' || hsl(0, 128, 0) !== 'hsl(120, 100%, 25%)' || hsl(128, 128, 128) !== 'hsl(0, 0%, 50%)') f.push('hsl ' + hsl(0, 128, 0));
    if (cmyk(255, 0, 0) !== 'cmyk(0%, 100%, 100%, 0%)' || cmyk(0, 0, 0) !== 'cmyk(0%, 0%, 0%, 100%)') f.push('cmyk');
    var c = h('canvas'); c.width = 40; c.height = 20; var x = c.getContext('2d'); x.fillStyle = '#ff0000'; x.fillRect(0, 0, 30, 20); x.fillStyle = '#0000ff'; x.fillRect(30, 0, 10, 20);
    var p = palette(x.getImageData(0, 0, 40, 20).data, 8).map(function (q) { return hex(q.c[0], q.c[1], q.c[2]) + ':' + q.p; });
    if (p.join(',') !== '#ff0000:75,#0000ff:25') f.push('palette ' + p.join(','));
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
