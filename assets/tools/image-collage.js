/* Infinity by GroupChatOn — image-collage. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Photo collage maker: 2–12 photos in a grid, a row, a column or one big photo with smaller ones; square, portrait, story or landscape; gaps, rounded corners, background. */
GCOTools.register('image-collage', function (spot, T) {
  var h = T.h, status = T.status(), results = (function (r) { var s = r.set; r.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; r.set = function (l, z) { s(l, z); var g = r.el.querySelector('.tresults-grid'); if (g) g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }; return r; })(T.results());
  var SIZES = { square: [1080, 1080, 'Square 1080 × 1080 (Instagram post)'], portrait: [1080, 1350, 'Portrait 1080 × 1350'], story: [1080, 1920, 'Story / status 1080 × 1920'], wide: [1920, 1080, 'Landscape 1920 × 1080'], a4: [2480, 3508, 'A4 print (300 DPI)'] };
  function layout(kind, n) {   // rectangles in 0..1
    var out = [], i;
    if (n < 1) return out;
    if (kind === 'row') { for (i = 0; i < n; i++) out.push([i / n, 0, 1 / n, 1]); return out; }
    if (kind === 'column') { for (i = 0; i < n; i++) out.push([0, i / n, 1, 1 / n]); return out; }
    if ((kind === 'feature' || kind === 'top') && n > 1) {
      var m = n - 1; out.push(kind === 'feature' ? [0, 0, 2 / 3, 1] : [0, 0, 1, 2 / 3]);
      for (i = 0; i < m; i++) out.push(kind === 'feature' ? [2 / 3, i / m, 1 / 3, 1 / m] : [i / m, 2 / 3, 1 / m, 1 / 3]);
      return out;
    }
    var cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols);
    for (i = 0; i < n; i++) { var r = Math.floor(i / cols), inRow = r === rows - 1 ? n - cols * (rows - 1) : cols, c = i - r * cols; out.push([c / inRow, r / rows, 1 / inRow, 1 / rows]); }
    return out;
  }
  function cell(rc, W, H, gap) { var uw = W - gap, uh = H - gap; return { x: Math.round(gap + rc[0] * uw), y: Math.round(gap + rc[1] * uh), w: Math.round(rc[2] * uw - gap), h: Math.round(rc[3] * uh - gap) }; }
  function cover(iw, ih, cw, ch) { var s = Math.max(cw / iw, ch / ih), sw = cw / s, sh = ch / s; return { sx: (iw - sw) / 2, sy: (ih - sh) / 2, sw: sw, sh: sh }; }
  function rr(g, x, y, w, hh, r) { r = Math.min(r, w / 2, hh / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function render(imgs, o) {
    var c = h('canvas'); c.width = o.W; c.height = o.H; var g = c.getContext('2d');
    g.fillStyle = o.bg; g.fillRect(0, 0, o.W, o.H);
    layout(o.kind, imgs.length).forEach(function (rc, i) {
      var b = cell(rc, o.W, o.H, o.gap), im = imgs[i], iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
      if (b.w < 2 || b.h < 2) return;
      g.save(); rr(g, b.x, b.y, b.w, b.h, o.radius); g.clip();
      if (o.fit === 'contain') { var s = Math.min(b.w / iw, b.h / ih); g.drawImage(im, b.x + (b.w - iw * s) / 2, b.y + (b.h - ih * s) / 2, iw * s, ih * s); }
      else { var cv2 = cover(iw, ih, b.w, b.h); g.drawImage(im, cv2.sx, cv2.sy, cv2.sw, cv2.sh, b.x, b.y, b.w, b.h); }
      g.restore();
    });
    return c;
  }
  var imgs = [], list = T.fileList(function (files) { loadAll(files); });
  var kind = T.seg([['grid', 'Grid'], ['feature', 'Big + side'], ['top', 'Big + below'], ['row', 'Row'], ['column', 'Column']], 'grid', draw);
  var size = T.select(Object.keys(SIZES).map(function (k) { return [k, SIZES[k][2]]; }), 'square'), gap = h('input', { type: 'range', min: '0', max: '80', value: '16', 'aria-label': 'Gap' }), rad = h('input', { type: 'range', min: '0', max: '80', value: '12', 'aria-label': 'Corners' });
  var bg = h('input', { type: 'color', value: '#ffffff', 'aria-label': 'Background colour' }), fit = T.seg([['cover', 'Fill (crop)'], ['contain', 'Whole photo']], 'cover', draw), fmt = T.select([['image/jpeg', 'JPG'], ['image/png', 'PNG']], 'image/jpeg');
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Collage preview' }), prev = h('div', { 'class': 'tfit-prev' }, [cv]), seq = 0;
  [size, gap, rad, bg].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  function opts(scale) { var s = SIZES[size.value]; scale = scale || 1; return { W: Math.round(s[0] * scale), H: Math.round(s[1] * scale), gap: Math.round(+gap.value * s[0] / 1080 * scale), radius: Math.round(+rad.value * s[0] / 1080 * scale), bg: bg.value, kind: kind.value(), fit: fit.value() }; }
  function loadAll(files) {
    var tok = ++seq; results.clear();
    if (files.length > 12) status.error('Up to 12 photos fit nicely; only the first 12 are used.');
    Promise.all(files.slice(0, 12).map(function (f) { return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = URL.createObjectURL(f.file || f); }); }))
      .then(function (l) { if (tok !== seq) return; imgs = l.filter(Boolean); go.disabled = imgs.length < 1; draw(); });
  }
  function draw() {
    if (!imgs.length) { cv.width = 1; cv.height = 1; return; }
    var s = SIZES[size.value], k = Math.min(1, 900 / Math.max(s[0], s[1])), c = render(imgs, opts(k));
    cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0);
    status.info(imgs.length + ' photo' + (imgs.length > 1 ? 's' : '') + ' · ' + s[0] + ' × ' + s[1] + ' px. Use ↑ ↓ in the list to change the order.');
  }
  function save() {
    var c = render(imgs, opts(1)), t = fmt.value;
    return T.canvasBlob(c, t, 0.92).then(function (b) { results.set([{ name: 'collage-' + size.value + (t === 'image/png' ? '.png' : '.jpg'), blob: b, preview: URL.createObjectURL(b), note: c.width + ' × ' + c.height }]); status.ok('Your collage is ready.'); });
  }
  var go = T.button('Make collage', { primary: true, disabled: true, onclick: save });
  function sample() {
    var cols = [['#f97316', '#fde68a'], ['#0ea5e9', '#a7f3d0'], ['#a855f7', '#fbcfe8'], ['#22c55e', '#fef9c3']], made = [];
    cols.forEach(function (p, i) { var c = h('canvas'); c.width = i % 2 ? 600 : 800; c.height = i % 2 ? 800 : 600; var x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, c.width, c.height); gr.addColorStop(0, p[0]); gr.addColorStop(1, p[1]); x.fillStyle = gr; x.fillRect(0, 0, c.width, c.height); x.fillStyle = 'rgba(255,255,255,.85)'; x.font = 'bold 120px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(i + 1), c.width / 2, c.height / 2); made.push(c); });
    imgs = made; go.disabled = false; draw(); save();
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', multiple: true, paste: true, icon: '🧩', label: 'Choose 2 to 12 photos', hint: 'JPG, PNG, WebP · nothing is uploaded', filter: function (f) { return /^image\//.test(f.type); }, onFiles: list.add }), list.el,
    T.field('Layout', kind), prev, h('div', { 'class': 'tgrid2' }, [T.field('Size', size), T.field('Photos', fit), T.field('Gap', gap), T.field('Rounded corners', rad), T.field('Background', bg), T.field('Save as', fmt)]),
    T.row([go, T.button('Try a sample', { small: true, onclick: sample })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['image-collage'] = function () {
    var f = [];
    if (JSON.stringify(layout('grid', 4)) !== '[[0,0,0.5,0.5],[0.5,0,0.5,0.5],[0,0.5,0.5,0.5],[0.5,0.5,0.5,0.5]]') f.push('grid 4');
    var g3 = layout('grid', 3); if (g3[2][0] !== 0 || g3[2][2] !== 1) f.push('grid 3 last row spans');
    var b = cell([0.5, 0, 0.5, 1], 1000, 500, 10); if (b.x !== 505 || b.w !== 485 || b.y !== 10 || b.h !== 480) f.push('cell gap ' + JSON.stringify(b));
    var c = cover(4000, 3000, 500, 500); if (c.sw !== 3000 || c.sx !== 500 || c.sy !== 0) f.push('cover');
    if (layout('feature', 3).length !== 3 || layout('feature', 3)[1][0] !== 2 / 3) f.push('feature');
    var red = h('canvas'), blue = h('canvas'); red.width = blue.width = 50; red.height = blue.height = 50; red.getContext('2d').fillStyle = '#f00'; red.getContext('2d').fillRect(0, 0, 50, 50); blue.getContext('2d').fillStyle = '#00f'; blue.getContext('2d').fillRect(0, 0, 50, 50);
    var out = render([red, blue], { W: 200, H: 100, gap: 0, radius: 0, bg: '#fff', kind: 'row', fit: 'cover' }), x = out.getContext('2d');
    if (x.getImageData(50, 50, 1, 1).data[0] !== 255 || x.getImageData(150, 50, 1, 1).data[2] !== 255) f.push('render row');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
