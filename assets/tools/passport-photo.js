/* Infinity by GroupChatOn — passport-photo. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Passport and visa photo maker: country sizes (35 × 45 mm, 2 × 2 in and more), a head-size guide, a 300 DPI photo and a print sheet (4 × 6 in or A4) with cut lines. */
GCOTools.register('passport-photo', function (spot, T) {
  var h = T.h, status = T.status(), results = (function (r) { var s = r.set; r.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; r.set = function (l, z) { s(l, z); var g = r.el.querySelector('.tresults-grid'); if (g) g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }; return r; })(T.results());
  var PRESETS = [['in', 'India passport · 35 × 45 mm', 35, 45], ['in-visa', 'India visa / OCI · 2 × 2 in', 50.8, 50.8], ['us', 'USA passport and visa · 2 × 2 in', 50.8, 50.8], ['uk', 'United Kingdom · 35 × 45 mm', 35, 45],
    ['eu', 'Schengen / EU countries · 35 × 45 mm', 35, 45], ['ca', 'Canada passport · 50 × 70 mm', 50, 70], ['au', 'Australia · 35 × 45 mm', 35, 45], ['nz', 'New Zealand · 35 × 45 mm', 35, 45],
    ['cn', 'China visa · 33 × 48 mm', 33, 48], ['jp', 'Japan · 35 × 45 mm', 35, 45], ['pk', 'Pakistan · 35 × 45 mm', 35, 45], ['bd', 'Bangladesh · 35 × 45 mm', 35, 45], ['ae', 'UAE visa · 43 × 55 mm', 43, 55],
    ['sa', 'Saudi Arabia · 40 × 60 mm', 40, 60], ['my', 'Malaysia passport · 35 × 50 mm', 35, 50], ['sg', 'Singapore · 35 × 45 mm', 35, 45], ['ph', 'Philippines · 35 × 45 mm', 35, 45], ['ng', 'Nigeria · 35 × 45 mm', 35, 45],
    ['stamp', 'Stamp size · 20 × 25 mm', 20, 25], ['custom', 'Custom size (mm)', 35, 45]];
  var SHEETS = { '4x6': ['4 × 6 in (10 × 15 cm) photo paper', 101.6, 152.4, 0], a4: ['A4 paper', 210, 297, 5], letter: ['US Letter paper', 215.9, 279.4, 5] };
  function mm2px(mm, dpi) { return Math.round(mm / 25.4 * dpi); }
  function fit(W, H, w, hh, m) { var cols = Math.floor((W - 2 * m) / w + 1e-6), rows = Math.floor((H - 2 * m) / hh + 1e-6); return { cols: Math.max(0, cols), rows: Math.max(0, rows), n: Math.max(0, cols) * Math.max(0, rows) }; }
  function layout(sheet, w, hh) { var s = SHEETS[sheet], p = fit(s[1], s[2], w, hh, s[3]), l = fit(s[2], s[1], w, hh, s[3]); return l.n > p.n ? { W: s[2], H: s[1], cols: l.cols, rows: l.rows, n: l.n } : { W: s[1], H: s[2], cols: p.cols, rows: p.rows, n: p.n }; }
  var pick = T.select(PRESETS.map(function (p) { return [p[0], p[1]]; }), T.store.get('pp-preset', 'in')), cw = h('input', { type: 'number', min: '10', max: '200', value: '35' }), ch = h('input', { type: 'number', min: '10', max: '200', value: '45' });
  var custom = h('div', { 'class': 'tgrid2', hidden: true }, [T.field('Width (mm)', cw), T.field('Height (mm)', ch)]), zoom = h('input', { type: 'range', min: '20', max: '100', value: '70', 'aria-label': 'Zoom' });
  var sheet = T.select(Object.keys(SHEETS).map(function (k) { return [k, SHEETS[k][0]]; }), '4x6'), bright = h('input', { type: 'range', min: '80', max: '130', value: '100', 'aria-label': 'Brightness' });
  var cv = h('canvas', { 'class': 'tfit-canvas', style: 'touch-action:none;cursor:move', 'aria-label': 'Drag to place the face inside the guide' }), prev = h('div', { 'class': 'tfit-prev' }, [cv]);
  var img = null, name = 'photo', cx = 0.5, cy = 0.42, drag = null, sc = 1;
  function size() { var p = PRESETS.filter(function (x) { return x[0] === pick.value; })[0]; return p[0] === 'custom' ? [Math.max(10, +cw.value || 35), Math.max(10, +ch.value || 45)] : [p[2], p[3]]; }
  function box() {   // crop box in image pixels, keeping the photo's shape
    var s = size(), r = s[0] / s[1], iw = img.naturalWidth, ih = img.naturalHeight, bh = Math.min(ih, iw / r) * (+zoom.value / 100), bw = bh * r;
    var x = Math.max(0, Math.min(iw - bw, cx * iw - bw / 2)), y = Math.max(0, Math.min(ih - bh, cy * ih - bh / 2)); return { x: x, y: y, w: bw, h: bh };
  }
  function crop(dpi) {
    var s = size(), b = box(), c = h('canvas'); c.width = mm2px(s[0], dpi); c.height = mm2px(s[1], dpi); var g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); if (+bright.value !== 100 && 'filter' in g) g.filter = 'brightness(' + bright.value + '%)';
    g.imageSmoothingQuality = 'high'; g.drawImage(img, b.x, b.y, b.w, b.h, 0, 0, c.width, c.height); return c;
  }
  function paint() {
    if (!img) return;
    var b = box(), g = cv.getContext('2d'); sc = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
    cv.width = Math.round(img.naturalWidth * sc); cv.height = Math.round(img.naturalHeight * sc);
    g.drawImage(img, 0, 0, cv.width, cv.height);
    g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.rect(0, 0, cv.width, cv.height); g.rect(b.x * sc, b.y * sc, b.w * sc, b.h * sc); g.fill('evenodd');
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(b.x * sc, b.y * sc, b.w * sc, b.h * sc);
    var square = Math.abs(b.w - b.h) < 1, headH = b.h * (square ? 0.6 : 0.74), top = b.y + b.h * (square ? 0.14 : 0.09);   // typical head size: chin to crown
    g.setLineDash([6, 5]); g.strokeStyle = '#22c55e'; g.beginPath(); g.ellipse((b.x + b.w / 2) * sc, (top + headH / 2) * sc, headH * 0.36 * sc, headH / 2 * sc, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    var s = size(), L = layout(sheet.value, s[0], s[1]);
    status.info('Place the face inside the green oval: top of the head near its top, chin at its bottom. Photo ' + s[0] + ' × ' + s[1] + ' mm = ' + mm2px(s[0], 300) + ' × ' + mm2px(s[1], 300) + ' px at 300 DPI · ' + L.n + ' copies fit on the sheet.');
  }
  function load(file) {
    var im = new Image();
    im.onload = function () { img = im; name = T.baseName(file.name); cx = 0.5; cy = 0.42; results.clear(); go.disabled = false; paint(); };
    im.onerror = function () { status.error(file.name + ' could not be opened. Try a JPG or PNG.'); };
    im.src = URL.createObjectURL(file);
  }
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; }
  cv.addEventListener('pointerdown', function (e) { if (!img) return; cv.setPointerCapture(e.pointerId); var p = pt(e); drag = { px: p.x, py: p.y, cx: cx, cy: cy }; });
  cv.addEventListener('pointermove', function (e) { if (!drag) return; var p = pt(e); cx = Math.max(0, Math.min(1, drag.cx + p.x - drag.px)); cy = Math.max(0, Math.min(1, drag.cy + p.y - drag.py)); paint(); });
  cv.addEventListener('pointerup', function () { drag = null; });
  [zoom, bright, cw, ch].forEach(function (x) { x.addEventListener('input', paint); });
  pick.addEventListener('change', function () { custom.hidden = pick.value !== 'custom'; T.store.set('pp-preset', pick.value); paint(); }); sheet.addEventListener('change', paint);
  function make() {
    if (!img) return;
    var s = size(), photo = crop(300), L = layout(sheet.value, s[0], s[1]);
    if (!L.n) return status.error('This photo size is bigger than the sheet.');
    var sh = h('canvas'); sh.width = mm2px(L.W, 300); sh.height = mm2px(L.H, 300); var g = sh.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, sh.width, sh.height);
    var pw = mm2px(s[0], 300), ph = mm2px(s[1], 300), ox = Math.round((sh.width - L.cols * pw) / 2), oy = Math.round((sh.height - L.rows * ph) / 2);
    for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) g.drawImage(photo, ox + c * pw, oy + r * ph);
    g.strokeStyle = '#9ca3af'; g.lineWidth = 2; g.beginPath();
    for (c = 0; c <= L.cols; c++) { g.moveTo(ox + c * pw, oy - 30); g.lineTo(ox + c * pw, oy + L.rows * ph + 30); }
    for (r = 0; r <= L.rows; r++) { g.moveTo(ox - 30, oy + r * ph); g.lineTo(ox + L.cols * pw + 30, oy + r * ph); }
    g.stroke();
    return Promise.all([T.canvasBlob(photo, 'image/jpeg', 0.95), T.canvasBlob(sh, 'image/jpeg', 0.95)]).then(function (b) {
      results.set([{ name: name + '-passport-' + s[0] + 'x' + s[1] + 'mm.jpg', blob: b[0], preview: URL.createObjectURL(b[0]), note: pw + ' × ' + ph + ' px · 300 DPI' },
        { name: name + '-print-sheet-' + sheet.value + '.jpg', blob: b[1], preview: URL.createObjectURL(b[1]), note: L.n + ' copies · print at 100% / actual size' }], 'passport-photos');
      status.ok('Ready! Print the sheet at “actual size” (100%, no fit-to-page) on ' + SHEETS[sheet.value][0] + ', then cut along the grey lines.');
    });
  }
  var go = T.button('Make photo and print sheet', { primary: true, disabled: true, onclick: make });
  function sample() {
    var c = h('canvas'); c.width = 900; c.height = 1200; var g = c.getContext('2d');
    g.fillStyle = '#eef2f7'; g.fillRect(0, 0, 900, 1200); g.fillStyle = '#334155'; g.beginPath(); g.ellipse(450, 1200, 360, 300, 0, 0, 7); g.fill();
    g.fillStyle = '#e0b48c'; g.fillRect(400, 760, 100, 140); g.beginPath(); g.ellipse(450, 560, 150, 200, 0, 0, 7); g.fill();
    g.fillStyle = '#1f2937'; g.beginPath(); g.ellipse(450, 410, 160, 90, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(395, 550, 12, 0, 7); g.arc(505, 550, 12, 0, 7); g.fill(); g.strokeStyle = '#9a3412'; g.lineWidth = 6; g.beginPath(); g.arc(450, 640, 40, 0.2, Math.PI - 0.2); g.stroke();
    T.canvasBlob(c, 'image/jpeg', 0.92).then(function (b) {
      var im = new Image(); im.onload = function () { img = im; name = 'sample'; cx = 0.5; cy = 0.47; zoom.value = 72; go.disabled = false; paint(); make(); }; im.src = URL.createObjectURL(b);
    });
  }
  spot.appendChild(T.card([T.field('Country / document', pick), custom, T.dropzone({ accept: 'image/*', paste: true, icon: '🪪', label: 'Choose a face photo', hint: 'Plain light background, face the camera · nothing is uploaded', onFiles: function (f) { load(f[0]); } }),
    prev, h('div', { 'class': 'tgrid2' }, [T.field('Zoom (face size)', zoom), T.field('Brightness', bright), T.field('Print sheet', sheet)]), T.row([go, T.button('Try a sample', { small: true, onclick: sample })]), status.el, results.el,
    h('p', { 'class': 'tnote', text: 'Rules change and differ by country (head size, background colour, glasses, expression). Always check the official website of the passport office or embassy before you print.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  custom.hidden = pick.value !== 'custom';
  T.tests['passport-photo'] = function () {
    var f = [];
    if (mm2px(35, 300) !== 413 || mm2px(45, 300) !== 531 || mm2px(50.8, 300) !== 600) f.push('mm to px');
    var a = layout('4x6', 35, 45); if (a.n !== 8 || a.W !== 152.4) f.push('35×45 on 4×6: ' + a.n);
    if (layout('4x6', 50.8, 50.8).n !== 6) f.push('2×2 in on 4×6: ' + layout('4x6', 50.8, 50.8).n);
    if (layout('a4', 35, 45).n !== 32) f.push('35×45 on A4: ' + layout('a4', 35, 45).n);
    if (layout('4x6', 200, 200).n !== 0) f.push('too big');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
