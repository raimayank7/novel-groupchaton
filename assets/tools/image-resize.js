/* Infinity by GroupChatOn — image-resize. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Image resizer: exact pixels, a percentage, or a print size (cm / mm / inch at a DPI), for one photo or many, in JPG, PNG or WebP. */
GCOTools.register('image-resize', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  function load(file) { return new Promise(function (ok, fail) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { fail(new Error(file.name + ' could not be opened. Try a JPG, PNG or WebP.')); }; im.src = URL.createObjectURL(file); }); }
  function sample() {
    var c = h('canvas'); c.width = 1600; c.height = 1067; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1067);
    gr.addColorStop(0, '#7dd3fc'); gr.addColorStop(0.6, '#fde68a'); gr.addColorStop(1, '#86efac'); g.fillStyle = gr; g.fillRect(0, 0, 1600, 1067);
    g.fillStyle = '#f59e0b'; g.beginPath(); g.arc(1200, 280, 140, 0, 7); g.fill(); g.fillStyle = '#166534'; g.beginPath(); g.moveTo(0, 1067); g.lineTo(500, 500); g.lineTo(1000, 1067); g.fill();
    return T.canvasBlob(c, 'image/jpeg', 0.9).then(function (b) { return new File([b], 'sample-photo.jpg', { type: 'image/jpeg' }); });
  }
  function size(w0, h0, o) {
    var r = Math.round;
    if (o.mode === 'pct') { var k = (o.pct || 100) / 100; return [Math.max(1, r(w0 * k)), Math.max(1, r(h0 * k))]; }
    var W = o.w || 0, H = o.h || 0;
    if (o.mode === 'print') { var f = o.unit === 'cm' ? o.dpi / 2.54 : o.unit === 'mm' ? o.dpi / 25.4 : o.dpi; W = (o.pw || 0) * f; H = (o.ph || 0) * f; }
    if (!W && !H) return [w0, h0];
    if (W && H && !o.lock) return [Math.max(1, r(W)), Math.max(1, r(H))];
    if (W && H) { var s = Math.min(W / w0, H / h0); return [Math.max(1, r(w0 * s)), Math.max(1, r(h0 * s))]; }
    return W ? [r(W), Math.max(1, r(h0 * W / w0))] : [Math.max(1, r(w0 * H / h0)), r(H)];
  }
  function draw(src, w, hh, type) {   // halve in steps for big reductions: sharper than one jump
    var cur = src, cw = src.naturalWidth || src.width, ch = src.naturalHeight || src.height;
    while (cw / 2 >= w && ch / 2 >= hh) { var s = h('canvas'); s.width = Math.round(cw / 2); s.height = Math.round(ch / 2); var sg = s.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(cur, 0, 0, s.width, s.height); cur = s; cw = s.width; ch = s.height; }
    var c = h('canvas'); c.width = w; c.height = hh; var g = c.getContext('2d');
    if (type === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, w, hh); }
    g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, w, hh);
    return c;
  }
  var mode = T.seg([['px', 'Pixels'], ['pct', 'Percent'], ['print', 'Print size']], 'px', function () { show(); });
  var w = h('input', { type: 'number', min: '1', placeholder: 'auto', value: '1280' }), hh = h('input', { type: 'number', min: '1', placeholder: 'auto' }), lock = h('input', { type: 'checkbox', checked: true });
  var pct = h('input', { type: 'number', min: '1', max: '1000', value: '50' }), pw = h('input', { type: 'number', min: '0', step: 'any', value: '10' }), ph = h('input', { type: 'number', min: '0', step: 'any', value: '15' });
  var unit = T.select([['cm', 'cm'], ['mm', 'mm'], ['in', 'inch']], 'cm'), dpi = T.select([[72, '72 DPI (screen)'], [150, '150 DPI (draft print)'], [300, '300 DPI (photo print)'], [600, '600 DPI']], 300);
  var fmt = T.select([['same', 'Same as original'], ['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']], 'same'), q = h('input', { type: 'range', min: '50', max: '100', value: '90' });
  var pxBox = h('div', { 'class': 'tgrid2' }, [T.field('Width (px)', w), T.field('Height (px)', hh), h('label', { 'class': 'tcheck' }, [lock, ' Keep proportions (fit inside)'])]);
  var pctBox = h('div', { 'class': 'tgrid2' }, [T.field('Percent of original size', pct)]), printBox = h('div', { 'class': 'tgrid2' }, [T.field('Print width', pw), T.field('Print height', ph), T.field('Unit', unit), T.field('Quality', dpi)]);
  var go = T.button('Resize', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = !f.length; results.clear(); show(); });
  function opts() { return { mode: mode.value(), w: +w.value, h: +hh.value, lock: lock.checked, pct: +pct.value, pw: +pw.value, ph: +ph.value, unit: unit.value, dpi: +dpi.value }; }
  function show() {
    var m = mode.value(); pxBox.hidden = m !== 'px'; pctBox.hidden = m !== 'pct'; printBox.hidden = m !== 'print';
    var f = list.files()[0];
    if (f) load(f).then(function (im) { var s = size(im.naturalWidth, im.naturalHeight, opts()); status.info(f.name + ': ' + im.naturalWidth + ' × ' + im.naturalHeight + ' → ' + s[0] + ' × ' + s[1] + ' px'); URL.revokeObjectURL(im.src); }, status.error);
  }
  [w, hh, lock, pct, pw, ph, unit, dpi].forEach(function (x) { x.addEventListener('input', show); x.addEventListener('change', show); });
  function run() {
    var files = list.files(), out = [], i = 0;
    go.disabled = true;
    (function next() {
      if (i >= files.length) { results.set(out, 'resized-images'); status.ok('Done! ' + out.length + ' image' + (out.length > 1 ? 's' : '') + ' resized.'); go.disabled = false; return; }
      var f = files[i++], type = fmt.value === 'same' ? (/^image\/(png|webp|jpeg)$/.test(f.type) ? f.type : 'image/jpeg') : fmt.value;
      status.progress(i / files.length, 'Resizing ' + f.name + '…');
      load(f).then(function (im) {
        var s = size(im.naturalWidth, im.naturalHeight, opts()), c = draw(im, s[0], s[1], type);
        URL.revokeObjectURL(im.src);
        return T.canvasBlob(c, type, q.value / 100).then(function (b) {
          var ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type];
          out.push({ name: T.baseName(f.name) + '-' + s[0] + 'x' + s[1] + '.' + ext, blob: b, preview: URL.createObjectURL(b), note: s[0] + ' × ' + s[1] + (opts().mode === 'print' ? ' · ' + dpi.value + ' DPI' : '') });
          next();
        });
      }).catch(function (e) { status.error(e); go.disabled = false; });
    })();
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', multiple: true, paste: true, icon: '📐', label: 'Choose photos', hint: 'JPG, PNG, WebP, GIF · nothing is uploaded', filter: function (f) { return /^image\//.test(f.type); }, onFiles: list.add }),
    list.el, T.field('Resize by', mode), pxBox, pctBox, printBox, h('div', { 'class': 'tgrid2' }, [T.field('Save as', fmt), T.field('JPG / WebP quality', q)]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { list.clear(); list.add([f]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';   // long menu options and big previews must not push the card wider than a phone
  show();
  T.tests['image-resize'] = function () {
    var f = [], c = function (o, want) { var s = size(4000, 3000, o).join('x'); if (s !== want) f.push(JSON.stringify(o) + ' → ' + s); };
    c({ mode: 'px', w: 1000, lock: true }, '1000x750'); c({ mode: 'px', h: 600, lock: true }, '800x600'); c({ mode: 'px', w: 1000, h: 1000, lock: true }, '1000x750');
    c({ mode: 'px', w: 1000, h: 1000, lock: false }, '1000x1000'); c({ mode: 'pct', pct: 50 }, '2000x1500'); c({ mode: 'print', pw: 10, ph: 15, unit: 'cm', dpi: 300, lock: false }, '1181x1772');
    c({ mode: 'print', pw: 4, unit: 'in', dpi: 150, lock: true }, '600x450');
    var src = h('canvas'); src.width = 400; src.height = 300; src.getContext('2d').fillStyle = '#f00'; src.getContext('2d').fillRect(0, 0, 400, 300);
    var out = draw(src, 100, 75, 'image/png'), px = out.getContext('2d').getImageData(50, 37, 1, 1).data;
    if (out.width !== 100 || out.height !== 75 || px[0] < 250 || px[1] > 5) f.push('canvas resize');
    return Promise.resolve({ ok: !f.length, n: 8, fails: f });
  };
});
