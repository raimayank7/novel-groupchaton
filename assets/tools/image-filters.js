/* Infinity by GroupChatOn — image-filters. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Photo filters and adjustments: brightness, contrast, saturation, warmth, hue, black & white, sepia, fade, vignette and one-tap presets. */
GCOTools.register('image-filters', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), img = null, name = 'photo', type = 'image/jpeg';
  var I = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]];
  function mul(A, B) { return A.map(function (r) { return [0, 1, 2, 3].map(function (j) { return r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j] + (j === 3 ? r[3] : 0); }); }); }
  function m3(a, off) { return [[a[0], a[1], a[2], off ? off[0] : 0], [a[3], a[4], a[5], off ? off[1] : 0], [a[6], a[7], a[8], off ? off[2] : 0]]; }
  function matrix(o) {
    var M = I, add = function (X) { M = mul(X, M); }, b = o.bright / 100, c = o.contrast / 100, s = o.sat / 100, g = o.gray / 100, sp = o.sepia / 100, t = o.hue * Math.PI / 180, cs = Math.cos(t), sn = Math.sin(t), w = o.warm * 0.4, inv = o.invert / 100;
    if (b !== 1) add(m3([b, 0, 0, 0, b, 0, 0, 0, b]));
    if (c !== 1) { var k = (0.5 - 0.5 * c) * 255; add(m3([c, 0, 0, 0, c, 0, 0, 0, c], [k, k, k])); }
    if (s !== 1) add(m3([0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s]));
    if (o.hue) add(m3([0.213 + cs * 0.787 - sn * 0.213, 0.715 - cs * 0.715 - sn * 0.715, 0.072 - cs * 0.072 + sn * 0.928, 0.213 - cs * 0.213 + sn * 0.143, 0.715 + cs * 0.285 + sn * 0.140, 0.072 - cs * 0.072 - sn * 0.283,
      0.213 - cs * 0.213 - sn * 0.787, 0.715 - cs * 0.715 + sn * 0.715, 0.072 + cs * 0.928 + sn * 0.072]));
    if (w) add(m3([1, 0, 0, 0, 1, 0, 0, 0, 1], [w, w * 0.25, -w]));
    if (sp) { var q = 1 - sp; add(m3([0.393 + 0.607 * q, 0.769 - 0.769 * q, 0.189 - 0.189 * q, 0.349 - 0.349 * q, 0.686 + 0.314 * q, 0.168 - 0.168 * q, 0.272 - 0.272 * q, 0.534 - 0.534 * q, 0.131 + 0.869 * q])); }
    if (g) { var r = 1 - g; add(m3([0.2126 + 0.7874 * r, 0.7152 - 0.7152 * r, 0.0722 - 0.0722 * r, 0.2126 - 0.2126 * r, 0.7152 + 0.2848 * r, 0.0722 - 0.0722 * r, 0.2126 - 0.2126 * r, 0.7152 - 0.7152 * r, 0.0722 + 0.9278 * r])); }
    if (inv) add(m3([1 - 2 * inv, 0, 0, 0, 1 - 2 * inv, 0, 0, 0, 1 - 2 * inv], [inv * 255, inv * 255, inv * 255]));
    return M;
  }
  function apply(d, M) {
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i + 1], b = d[i + 2];
      d[i] = M[0][0] * r + M[0][1] * g + M[0][2] * b + M[0][3]; d[i + 1] = M[1][0] * r + M[1][1] * g + M[1][2] * b + M[1][3]; d[i + 2] = M[2][0] * r + M[2][1] * g + M[2][2] * b + M[2][3];
    }
  }
  function render(src, k, o) {
    var c = h('canvas'); c.width = Math.max(1, Math.round(src.naturalWidth * k)); c.height = Math.max(1, Math.round(src.naturalHeight * k));
    var g = c.getContext('2d'); g.drawImage(src, 0, 0, c.width, c.height);
    var id = g.getImageData(0, 0, c.width, c.height); apply(id.data, matrix(o)); g.putImageData(id, 0, 0);
    if (o.vignette) { var R = Math.hypot(c.width, c.height) / 2, gr = g.createRadialGradient(c.width / 2, c.height / 2, R * 0.45, c.width / 2, c.height / 2, R); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + o.vignette / 100 + ')'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); }
    return c;
  }
  var DEF = { bright: 100, contrast: 100, sat: 100, warm: 0, hue: 0, gray: 0, sepia: 0, invert: 0, vignette: 0 };
  var SL = [['bright', 'Brightness', 0, 200, '%'], ['contrast', 'Contrast', 0, 200, '%'], ['sat', 'Saturation', 0, 200, '%'], ['warm', 'Warmth', -100, 100, ''], ['hue', 'Hue', -180, 180, '°'],
    ['gray', 'Black & white', 0, 100, '%'], ['sepia', 'Sepia', 0, 100, '%'], ['vignette', 'Vignette', 0, 80, '%'], ['invert', 'Invert', 0, 100, '%']];
  var PRESETS = [['Original', {}], ['Vivid', { sat: 140, contrast: 110 }], ['B&W', { gray: 100, contrast: 115 }], ['Vintage', { sepia: 45, contrast: 90, bright: 105, vignette: 35 }], ['Warm', { warm: 40, sat: 110 }],
    ['Cool', { warm: -40 }], ['Fade', { contrast: 80, bright: 110, sat: 80 }], ['Dramatic', { contrast: 140, sat: 120, vignette: 50 }]];
  var st = Object.assign({}, DEF), inputs = {}, cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Preview' }), prev = h('div', { 'class': 'tfit-prev' }, [cv]), small = null, raf = 0;
  function slider(s) {
    var i = h('input', { type: 'range', min: String(s[2]), max: String(s[3]), value: String(st[s[0]]) }), f = T.field(s[1] + ': ' + st[s[0]] + s[4], i);
    i.addEventListener('input', function () { st[s[0]] = +i.value; f.firstChild.textContent = s[1] + ': ' + i.value + s[4]; queue(); });
    inputs[s[0]] = [i, f, s]; return f;
  }
  function sync() { Object.keys(inputs).forEach(function (k) { var x = inputs[k]; x[0].value = st[k]; x[1].firstChild.textContent = x[2][1] + ': ' + st[k] + x[2][4]; }); }
  function queue() { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }
  function paint(orig) { if (!small) return; var c = orig === true ? render(small, 1, DEF) : render(small, 1, st); cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0); }
  function open(file) {
    var im = new Image();
    im.onload = function () {
      img = im; name = T.baseName(file.name); type = /^image\/(png|webp)$/.test(file.type) ? file.type : 'image/jpeg'; results.clear();
      var k = Math.min(1, 800 / Math.max(im.naturalWidth, im.naturalHeight)), c = h('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); small = c; small.naturalWidth = c.width; small.naturalHeight = c.height; paint(); go.disabled = false;
    };
    im.onerror = function () { status.error(file.name + ' could not be opened.'); };
    im.src = URL.createObjectURL(file);
  }
  function run() {
    if (!img) return; status.info('Applying to the full-size photo…');
    setTimeout(function () {
      var c = render(img, 1, st);
      T.canvasBlob(c, type, 0.92).then(function (b) { results.set([{ name: name + '-edited.' + { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type], blob: b, preview: URL.createObjectURL(b), note: c.width + ' × ' + c.height }]); status.ok('Saved at full size: ' + c.width + ' × ' + c.height + ' px.'); });
    }, 30);
  }
  var go = T.button('Save photo', { primary: true, disabled: true, onclick: run });
  var hold = h('button', { type: 'button', 'class': 'tbtn tbtn-sm', text: 'Hold to compare' });
  ['pointerdown'].forEach(function (e) { hold.addEventListener(e, function () { paint(true); }); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) { hold.addEventListener(e, function () { paint(); }); });
  function sample() {
    var c = h('canvas'); c.width = 1600; c.height = 1067; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1067);
    gr.addColorStop(0, '#7dd3fc'); gr.addColorStop(0.6, '#fde68a'); gr.addColorStop(1, '#86efac'); g.fillStyle = gr; g.fillRect(0, 0, 1600, 1067);
    g.fillStyle = '#f59e0b'; g.beginPath(); g.arc(1200, 280, 140, 0, 7); g.fill(); g.fillStyle = '#166534'; g.beginPath(); g.moveTo(0, 1067); g.lineTo(500, 500); g.lineTo(1000, 1067); g.fill();
    return T.canvasBlob(c, 'image/jpeg', 0.9).then(function (b) { return new File([b], 'sample-photo.jpg', { type: 'image/jpeg' }); });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', paste: true, icon: '🎛️', label: 'Choose a photo', hint: 'JPG, PNG or WebP · nothing is uploaded', filter: function (f) { return /^image\//.test(f.type); }, onFiles: function (l) { open(l[0]); } }),
    prev, T.field('Presets', T.row(PRESETS.map(function (p) { return T.button(p[0], { small: true, onclick: function () { st = Object.assign({}, DEF, p[1]); sync(); paint(); } }); }).concat([hold]))),
    h('div', { 'class': 'tgrid2' }, SL.map(slider)), T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { open(f); st = Object.assign({}, DEF, PRESETS[3][1]); sync(); setTimeout(run, 400); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['image-filters'] = function () {
    var f = [], px = function (rgb, o) { var d = new Uint8ClampedArray([rgb[0], rgb[1], rgb[2], 255]); apply(d, matrix(Object.assign({}, DEF, o))); return [d[0], d[1], d[2]].join(','); };
    if (px([255, 0, 0], { gray: 100 }) !== '54,54,54') f.push('grayscale ' + px([255, 0, 0], { gray: 100 }));
    if (px([10, 20, 30], { invert: 100 }) !== '245,235,225') f.push('invert');
    if (px([100, 100, 100], { bright: 150 }) !== '150,150,150') f.push('brightness');
    if (px([100, 100, 100], { contrast: 150 }) !== '86,86,86') f.push('contrast ' + px([100, 100, 100], { contrast: 150 }));
    if (px([12, 34, 56], {}) !== '12,34,56') f.push('identity');
    if (px([120, 120, 120], { hue: 90, sat: 100 }) !== '120,120,120') f.push('hue keeps grey');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
