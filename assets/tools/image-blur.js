/* Infinity by GroupChatOn — image-blur. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Blur or pixelate parts of a photo (faces, number plates, addresses): drag boxes or ovals, choose blur, pixels or a black bar; saved at full size, nothing uploaded. */
GCOTools.register('image-blur', function (spot, T) {
  var h = T.h, status = T.status(), results = (function (r) { var s = r.set; r.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; r.set = function (l, z) { s(l, z); var g = r.el.querySelector('.tresults-grid'); if (g) g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }; return r; })(T.results());
  function canvasOf(w, hh) { var c = h('canvas'); c.width = w; c.height = hh; return c; }
  function apply(src, boxes, effect, strength, shape) {
    var out = canvasOf(src.width, src.height), g = out.getContext('2d'); g.drawImage(src, 0, 0);
    boxes.forEach(function (b) {
      var x = Math.max(0, Math.round(b.x)), y = Math.max(0, Math.round(b.y)), w = Math.min(src.width - x, Math.round(b.w)), hh = Math.min(src.height - y, Math.round(b.h));
      if (w < 2 || hh < 2) return;
      var r = canvasOf(w, hh), rg = r.getContext('2d');
      if (effect === 'black') { rg.fillStyle = '#000'; rg.fillRect(0, 0, w, hh); }
      else {
        rg.drawImage(src, x, y, w, hh, 0, 0, w, hh);
        var k = effect === 'pixel' ? Math.max(3, Math.round(Math.max(w, hh) * strength / 60)) : 3 + strength * 3;
        var tw = Math.max(1, Math.round(w / k)), th = Math.max(1, Math.round(hh / k)), t = canvasOf(tw, th), tg = t.getContext('2d');
        for (var pass = 0; pass < (effect === 'pixel' ? 1 : 2); pass++) {
          tg.imageSmoothingEnabled = true; tg.imageSmoothingQuality = 'high'; tg.clearRect(0, 0, tw, th); tg.drawImage(r, 0, 0, tw, th);
          rg.imageSmoothingEnabled = effect !== 'pixel'; rg.imageSmoothingQuality = 'high'; rg.clearRect(0, 0, w, hh); rg.drawImage(t, 0, 0, w, hh);
        }
      }
      g.save(); g.beginPath();
      if (shape === 'oval') g.ellipse(x + w / 2, y + hh / 2, w / 2, hh / 2, 0, 0, Math.PI * 2); else g.rect(x, y, w, hh);
      g.clip(); g.drawImage(r, x, y); g.restore();
    });
    return out;
  }
  var src = null, small = null, k = 1, name = 'photo', type = 'image/jpeg', boxes = [], drag = null;
  var cv = h('canvas', { 'class': 'tfit-canvas', style: 'touch-action:none;cursor:crosshair', 'aria-label': 'Drag on the photo to mark what to hide' }), prev = h('div', { 'class': 'tfit-prev' }, [cv]);
  var effect = T.seg([['blur', 'Blur'], ['pixel', 'Pixelate'], ['black', 'Black bar']], 'blur', paint), shape = T.seg([['rect', '▭ Box'], ['oval', '◯ Oval (faces)']], 'rect'), strength = h('input', { type: 'range', min: '1', max: '10', value: '6', 'aria-label': 'Strength' });
  strength.addEventListener('input', paint);
  function paint() {
    if (!small) return;
    var g = cv.getContext('2d'), b = boxes.map(function (x) { return { x: x.x * k, y: x.y * k, w: x.w * k, h: x.h * k, shape: x.shape }; });
    g.drawImage(small, 0, 0);
    b.forEach(function (x) { g.drawImage(apply(small, [x], effect.value(), +strength.value, x.shape), x.x, x.y, x.w, x.h, x.x, x.y, x.w, x.h); });
    if (drag && drag.cur) { var d = drag.cur; g.setLineDash([6, 4]); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(d.x * k, d.y * k, d.w * k, d.h * k); g.strokeStyle = '#000'; g.lineDashOffset = 5; g.strokeRect(d.x * k, d.y * k, d.w * k, d.h * k); g.setLineDash([]); }
    status.info(boxes.length ? boxes.length + ' area' + (boxes.length > 1 ? 's' : '') + ' hidden. Drag again to add more.' : 'Drag across a face, number plate or text to hide it.');
  }
  function load(file) {
    return new Promise(function (ok, no) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { no(new Error(file.name + ' could not be opened. Try a JPG, PNG or WebP.')); }; im.src = URL.createObjectURL(file); });
  }
  function open(file) {
    return load(file).then(function (im) {
      name = T.baseName(file.name); type = /png|webp/.test(file.type) ? file.type : 'image/jpeg'; boxes = []; results.clear();
      src = canvasOf(im.naturalWidth, im.naturalHeight); src.getContext('2d').drawImage(im, 0, 0);
      k = Math.min(1, 1200 / Math.max(src.width, src.height)); small = canvasOf(Math.round(src.width * k), Math.round(src.height * k)); small.getContext('2d').drawImage(src, 0, 0, small.width, small.height);
      cv.width = small.width; cv.height = small.height; go.disabled = false; paint();
    }, function (e) { status.error(e); });
  }
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width / k, y: (e.clientY - r.top) * cv.height / r.height / k }; }
  cv.addEventListener('pointerdown', function (e) { if (!src) return; cv.setPointerCapture(e.pointerId); drag = { s: pt(e) }; });
  cv.addEventListener('pointermove', function (e) { if (!drag) return; var p = pt(e), s = drag.s; drag.cur = { x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) }; paint(); });
  cv.addEventListener('pointerup', function () { if (drag && drag.cur && drag.cur.w * k > 6 && drag.cur.h * k > 6) { drag.cur.shape = shape.value(); boxes.push(drag.cur); } drag = null; paint(); });
  function save() {
    var out = src, ext = { 'image/png': 'png', 'image/webp': 'webp' }[type] || 'jpg';
    boxes.forEach(function (b) { out = apply(out, [b], effect.value(), +strength.value, b.shape); });
    return T.canvasBlob(out, type, 0.92).then(function (b) { results.set([{ name: name + '-hidden.' + ext, blob: b, preview: URL.createObjectURL(b), note: out.width + ' × ' + out.height }]); status.ok('Done! Check the preview, then download.'); });
  }
  var go = T.button('Save photo', { primary: true, disabled: true, onclick: save });
  function sample() {
    var c = canvasOf(1200, 800), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 800); gr.addColorStop(0, '#93c5fd'); gr.addColorStop(1, '#e5e7eb'); g.fillStyle = gr; g.fillRect(0, 0, 1200, 800);
    g.fillStyle = '#dc2626'; g.beginPath(); g.roundRect ? g.roundRect(200, 380, 800, 260, 60) : g.rect(200, 380, 800, 260); g.fill(); g.fillStyle = '#1e3a8a'; g.fillRect(320, 300, 520, 120);
    g.fillStyle = '#111'; g.beginPath(); g.arc(360, 650, 70, 0, 7); g.arc(860, 650, 70, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.fillRect(470, 540, 260, 70); g.fillStyle = '#111'; g.font = 'bold 48px monospace'; g.textAlign = 'center'; g.fillText('AB12 CDE', 600, 592);
    g.fillStyle = '#f2c6a0'; g.beginPath(); g.ellipse(1080, 200, 70, 90, 0, 0, 7); g.fill();
    return T.canvasBlob(c, 'image/jpeg', 0.9).then(function (b) { return open(new File([b], 'sample-car.jpg', { type: 'image/jpeg' })); }).then(function () {
      boxes = [{ x: 460, y: 530, w: 280, h: 90, shape: 'rect' }, { x: 1000, y: 100, w: 160, h: 200, shape: 'oval' }]; paint(); return save();
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', paste: true, icon: '🫥', label: 'Choose a photo', hint: 'JPG, PNG, WebP · nothing is uploaded', onFiles: function (f) { open(f[0]); } }), prev,
    T.field('Effect', effect), T.field('Shape for the next area', shape), T.field('Strength', strength),
    T.row([T.button('Undo last', { small: true, onclick: function () { boxes.pop(); paint(); } }), T.button('Clear all', { small: true, onclick: function () { boxes = []; paint(); } }),
      T.button('Whole photo', { small: true, onclick: function () { if (src) { boxes.push({ x: 0, y: 0, w: src.width, h: src.height, shape: 'rect' }); paint(); } } })]),
    T.row([go, T.button('Try a sample', { small: true, onclick: sample })]), status.el, results.el,
    h('p', { 'class': 'tnote', text: 'For real privacy use a strong blur, pixelate or a black bar: light blur on large text can sometimes still be read. The original photo is not changed.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['image-blur'] = function () {
    var f = [], c = canvasOf(100, 100), g = c.getContext('2d'), d = g.createImageData(100, 100);
    for (var i = 0; i < 100 * 100; i++) { var v = ((i % 100) + Math.floor(i / 100)) % 2 ? 255 : 0; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    g.putImageData(d, 0, 0);
    function px(cc, x, y) { return cc.getContext('2d').getImageData(x, y, 1, 1).data; }
    var bl = apply(c, [{ x: 0, y: 0, w: 100, h: 50 }], 'black', 5, 'rect'); if (px(bl, 10, 10)[0] !== 0 || px(bl, 11, 10)[0] !== 0 || px(bl, 11, 80)[0] !== px(c, 11, 80)[0]) f.push('black bar');
    var bu = apply(c, [{ x: 0, y: 0, w: 100, h: 50 }], 'blur', 5, 'rect'), a = px(bu, 40, 20)[0]; if (a < 80 || a > 175 || Math.abs(px(bu, 41, 20)[0] - a) > 30) f.push('blur ' + a);
    var pi = apply(c, [{ x: 0, y: 0, w: 100, h: 50 }], 'pixel', 6, 'rect'), p1 = px(pi, 21, 21)[0]; if (p1 < 60 || p1 > 195 || px(pi, 22, 21)[0] !== p1) f.push('pixelate ' + p1);
    var ov = apply(c, [{ x: 0, y: 0, w: 100, h: 100 }], 'black', 5, 'oval'); if (px(ov, 1, 0)[0] !== px(c, 1, 0)[0] || px(ov, 50, 50)[0] !== 0) f.push('oval clip');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
