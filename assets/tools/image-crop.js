/* Infinity by GroupChatOn — image-crop. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Image cropper: drag a crop box on the photo, or lock it to square, 16:9, 9:16, 4:5, passport and more; exact pixel boxes too. */
GCOTools.register('image-crop', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  function fitRect(iw, ih, r) {
    if (!r) return { x: 0, y: 0, w: iw, h: ih };
    if (iw / ih > r) { var w = Math.round(ih * r); return { x: Math.round((iw - w) / 2), y: 0, w: w, h: ih }; }
    var hh = Math.round(iw / r); return { x: 0, y: Math.round((ih - hh) / 2), w: iw, h: hh };
  }
  function clamp(c, iw, ih) {
    c.w = Math.max(8, Math.min(Math.round(c.w), iw)); c.h = Math.max(8, Math.min(Math.round(c.h), ih));
    c.x = Math.max(0, Math.min(Math.round(c.x), iw - c.w)); c.y = Math.max(0, Math.min(Math.round(c.y), ih - c.h)); return c;
  }
  var RATIOS = [['0', 'Free'], ['1', 'Square 1:1 (profile, Instagram)'], ['1.7778', '16:9 (YouTube, screen)'], ['0.5625', '9:16 (status, reels, stories)'], ['0.8', '4:5 (Instagram portrait)'],
    ['1.3333', '4:3'], ['1.5', '3:2 (photo print)'], ['0.7778', 'Passport 35 × 45 mm'], ['1.91', '1.91:1 (link preview)'], ['3', '3:1 (cover banner)']];
  var img = null, name = 'image', ftype = 'image/jpeg', crop = null, scale = 1;
  var cv = h('canvas', { 'class': 'tfit-canvas', style: 'touch-action:none;cursor:crosshair', 'aria-label': 'Drag on the photo to choose the crop area' }), prev = h('div', { 'class': 'tfit-prev' }, [cv]);
  var ratio = T.select(RATIOS, '0'), nums = {}, fmt = T.select([['same', 'Same as original'], ['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']], 'same'), outW = h('input', { type: 'number', min: '16', placeholder: 'original' });
  ['x', 'y', 'w', 'h'].forEach(function (k) { nums[k] = h('input', { type: 'number', min: '0' }); nums[k].addEventListener('input', function () { if (!crop) return; crop[k] = +nums[k].value || 0; if (+ratio.value && (k === 'w' || k === 'h')) { if (k === 'w') crop.h = crop.w / +ratio.value; else crop.w = crop.h * +ratio.value; } clamp(crop, img.naturalWidth, img.naturalHeight); paint(false); }); });
  function paint(sync) {
    if (!img) return;
    var g = cv.getContext('2d'), c = crop;
    g.drawImage(img, 0, 0, cv.width, cv.height);
    g.fillStyle = 'rgba(0,0,0,.55)';
    g.beginPath(); g.rect(0, 0, cv.width, cv.height); g.rect(c.x * scale, c.y * scale, c.w * scale, c.h * scale); g.fill('evenodd');
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(c.x * scale, c.y * scale, c.w * scale, c.h * scale);
    g.setLineDash([4, 4]); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1;
    for (var i = 1; i < 3; i++) { g.beginPath(); g.moveTo((c.x + c.w * i / 3) * scale, c.y * scale); g.lineTo((c.x + c.w * i / 3) * scale, (c.y + c.h) * scale); g.moveTo(c.x * scale, (c.y + c.h * i / 3) * scale); g.lineTo((c.x + c.w) * scale, (c.y + c.h * i / 3) * scale); g.stroke(); }
    g.setLineDash([]); g.fillStyle = '#fff'; g.fillRect((c.x + c.w) * scale - 9, (c.y + c.h) * scale - 9, 18, 18);
    if (sync !== false) Object.keys(nums).forEach(function (k) { nums[k].value = c[k]; });
    status.info('Crop: ' + c.w + ' × ' + c.h + ' px from ' + img.naturalWidth + ' × ' + img.naturalHeight + '. Drag inside to move, drag the corner square to resize.');
  }
  function open(file) {
    var im = new Image();
    im.onload = function () {
      img = im; name = T.baseName(file.name); ftype = /^image\/(png|webp|jpeg)$/.test(file.type) ? file.type : 'image/jpeg'; results.clear();
      var max = 1200; scale = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
      cv.width = Math.round(im.naturalWidth * scale); cv.height = Math.round(im.naturalHeight * scale);
      crop = fitRect(im.naturalWidth, im.naturalHeight, +ratio.value); if (!+ratio.value) crop = clamp({ x: im.naturalWidth * 0.1, y: im.naturalHeight * 0.1, w: im.naturalWidth * 0.8, h: im.naturalHeight * 0.8 }, im.naturalWidth, im.naturalHeight);
      paint(); go.disabled = false;
    };
    im.onerror = function () { status.error(file.name + ' could not be opened. Try a JPG, PNG or WebP.'); };
    im.src = URL.createObjectURL(file);
  }
  var drag = null;
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width / scale, y: (e.clientY - r.top) * cv.height / r.height / scale, k: cv.width / r.width / scale }; }
  cv.addEventListener('pointerdown', function (e) {
    if (!img) return; var p = pt(e), c = crop; cv.setPointerCapture(e.pointerId);
    if (Math.abs(p.x - (c.x + c.w)) < 22 * p.k && Math.abs(p.y - (c.y + c.h)) < 22 * p.k) drag = { mode: 'size' };
    else if (p.x > c.x && p.x < c.x + c.w && p.y > c.y && p.y < c.y + c.h) drag = { mode: 'move', dx: p.x - c.x, dy: p.y - c.y };
    else drag = { mode: 'new', sx: p.x, sy: p.y };
  });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return; var p = pt(e), r = +ratio.value, c = crop, iw = img.naturalWidth, ih = img.naturalHeight;
    if (drag.mode === 'move') { c.x = p.x - drag.dx; c.y = p.y - drag.dy; }
    else {
      var x0 = drag.mode === 'new' ? Math.min(drag.sx, p.x) : c.x, y0 = drag.mode === 'new' ? Math.min(drag.sy, p.y) : c.y;
      var w = drag.mode === 'new' ? Math.abs(p.x - drag.sx) : p.x - c.x, hh = drag.mode === 'new' ? Math.abs(p.y - drag.sy) : p.y - c.y;
      w = Math.min(Math.max(8, w), iw - x0); hh = Math.min(Math.max(8, hh), ih - y0);
      if (r) { if (w / hh > r) w = hh * r; else hh = w / r; }
      c.x = x0; c.y = y0; c.w = w; c.h = hh;
    }
    clamp(c, iw, ih); paint();
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drag = null; }); });
  ratio.addEventListener('change', function () { if (img) { crop = +ratio.value ? fitRect(img.naturalWidth, img.naturalHeight, +ratio.value) : crop; paint(); } });
  function run() {
    if (!img) return;
    var c = crop, ow = +outW.value || c.w, oh = Math.round(ow * c.h / c.w), type = fmt.value === 'same' ? ftype : fmt.value;
    var out = h('canvas'); out.width = ow; out.height = oh; var g = out.getContext('2d');
    if (type === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, ow, oh); }
    g.imageSmoothingQuality = 'high'; g.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, ow, oh);
    T.canvasBlob(out, type, 0.92).then(function (b) {
      var ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type];
      results.set([{ name: name + '-cropped.' + ext, blob: b, preview: URL.createObjectURL(b), note: ow + ' × ' + oh }]);
      status.ok('Cropped to ' + ow + ' × ' + oh + ' px.');
    });
  }
  var go = T.button('Crop', { primary: true, disabled: true, onclick: run });
  function sample() {
    var c = h('canvas'); c.width = 1600; c.height = 1067; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1067);
    gr.addColorStop(0, '#7dd3fc'); gr.addColorStop(0.6, '#fde68a'); gr.addColorStop(1, '#86efac'); g.fillStyle = gr; g.fillRect(0, 0, 1600, 1067);
    g.fillStyle = '#f59e0b'; g.beginPath(); g.arc(1200, 280, 140, 0, 7); g.fill(); g.fillStyle = '#166534'; g.beginPath(); g.moveTo(0, 1067); g.lineTo(500, 500); g.lineTo(1000, 1067); g.fill();
    return T.canvasBlob(c, 'image/jpeg', 0.9).then(function (b) { return new File([b], 'sample-photo.jpg', { type: 'image/jpeg' }); });
  }
  function take(files) { open(files[0]); }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', paste: true, icon: '✂️', label: 'Choose a photo', hint: 'JPG, PNG or WebP · nothing is uploaded', filter: function (f) { return /^image\//.test(f.type); }, onFiles: take }),
    T.field('Shape', ratio), prev, h('div', { 'class': 'tgrid2' }, [T.field('Left (px)', nums.x), T.field('Top (px)', nums.y), T.field('Width (px)', nums.w), T.field('Height (px)', nums.h)]),
    h('div', { 'class': 'tgrid2' }, [T.field('Output width (optional)', outW, 'e.g. 413 for a 35 mm passport photo at 300 DPI'), T.field('Save as', fmt)]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { ratio.value = '1'; take([f]); setTimeout(run, 400); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['image-crop'] = function () {
    var f = [], s = function (r) { return [r.x, r.y, r.w, r.h].join(','); };
    if (s(fitRect(4000, 3000, 1)) !== '500,0,3000,3000') f.push('square ' + s(fitRect(4000, 3000, 1)));
    if (s(fitRect(4000, 3000, 16 / 9)) !== '0,375,4000,2250') f.push('16:9 ' + s(fitRect(4000, 3000, 16 / 9)));
    if (s(fitRect(3000, 4000, 9 / 16)) !== '375,0,2250,4000') f.push('9:16');
    if (s(clamp({ x: -50, y: 3900, w: 5000, h: 300 }, 4000, 3000)) !== '0,2700,4000,300') f.push('clamp ' + s(clamp({ x: -50, y: 3900, w: 5000, h: 300 }, 4000, 3000)));
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
