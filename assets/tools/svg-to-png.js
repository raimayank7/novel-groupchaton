/* Infinity by GroupChatOn — svg-to-png. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* SVG to PNG / JPG / WebP: sharp images at any size from SVG files or pasted SVG code, with a transparent or solid background. */
GCOTools.register('svg-to-png', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  function fix(txt) { return /\sxmlns=/.test(txt) ? txt : txt.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"'); }
  function svgSize(txt) {
    var d = new DOMParser().parseFromString(fix(txt), 'image/svg+xml'), s = d.documentElement;
    if (!s || d.getElementsByTagName('parsererror').length || s.localName !== 'svg') throw new Error('This is not a valid SVG.');
    var num = function (v) { var m = /^\s*([\d.]+)\s*(px)?\s*$/.exec(v || ''); return m ? +m[1] : 0; };
    var vb = (s.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number), w = num(s.getAttribute('width')), hh = num(s.getAttribute('height'));
    if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) { if (!w && !hh) { w = vb[2]; hh = vb[3]; } else if (!w) w = hh * vb[2] / vb[3]; else if (!hh) hh = w * vb[3] / vb[2]; }
    return { w: w || 300, h: hh || 150, el: s };
  }
  function render(txt, o) {
    var z = svgSize(txt), s = z.el, k = o.width ? o.width / z.w : o.scale, W = Math.max(1, Math.round(z.w * k)), H = Math.max(1, Math.round(z.h * k));
    if (W * H > 16e7) return Promise.reject(new Error('That is too big for the browser to draw. Choose a smaller size.'));
    if (!s.getAttribute('viewBox')) s.setAttribute('viewBox', '0 0 ' + z.w + ' ' + z.h);
    s.setAttribute('width', W); s.setAttribute('height', H);
    var url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(s)], { type: 'image/svg+xml' }));
    return new Promise(function (ok, fail) {
      var im = new Image();
      im.onload = function () {
        var c = h('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
        if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, W, H); }
        g.drawImage(im, 0, 0, W, H); URL.revokeObjectURL(url); ok(c);
      };
      im.onerror = function () { URL.revokeObjectURL(url); fail(new Error('The browser could not draw this SVG. SVGs that load outside images or fonts may not convert.')); };
      im.src = url;
    });
  }
  var code = h('textarea', { rows: '5', 'class': 'tin tmono', spellcheck: 'false', placeholder: '…or paste SVG code here (<svg …>…</svg>)', 'aria-label': 'SVG code' }), files = [];
  var scale = T.select([[1, '1× (original size)'], [2, '2× (sharp on phones)'], [3, '3×'], [4, '4×'], [8, '8×'], ['w', 'Set a width…']], 2), width = h('input', { type: 'number', min: '1', placeholder: '1024' }), wF = T.field('Width (px)', width);
  var bg = T.select([['', 'Transparent'], ['#ffffff', 'White'], ['#000000', 'Black']], ''), fmt = T.select([['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']], 'image/png');
  var note = h('p', { 'class': 'tstatus' });
  function sync() { wF.hidden = scale.value !== 'w'; }
  scale.addEventListener('change', sync);
  function sources() {
    var s = files.map(function (f) { return T.read(f, 'text').then(function (t) { return { name: T.baseName(f.name), txt: t }; }); });
    if (code.value.trim()) s.push(Promise.resolve({ name: 'pasted-svg', txt: code.value }));
    return Promise.all(s);
  }
  function run() {
    var o = { scale: scale.value === 'w' ? 1 : +scale.value, width: scale.value === 'w' ? +width.value : 0, bg: fmt.value === 'image/jpeg' ? (bg.value || '#ffffff') : bg.value }, out = [];
    sources().then(function (list) {
      if (!list.length) throw new Error('Choose SVG files or paste SVG code first.');
      return list.reduce(function (p, it, i) {
        return p.then(function () {
          status.progress((i + 1) / list.length, 'Converting ' + it.name + '…');
          return render(it.txt, o).then(function (c) { return T.canvasBlob(c, fmt.value, 0.92).then(function (b) {
            out.push({ name: it.name + '.' + { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[fmt.value], blob: b, preview: URL.createObjectURL(b), note: c.width + ' × ' + c.height }); }); });
        });
      }, Promise.resolve());
    }).then(function () { results.set(out, 'svg-images'); status.ok('Done! ' + out.length + ' image' + (out.length > 1 ? 's' : '') + ' ready.'); }).catch(function (e) { status.error(e); });
  }
  var SAMPLE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#0ea5e9"/><circle cx="60" cy="52" r="22" fill="#fde047"/><path d="M24 98c10-18 24-26 36-26s26 8 36 26" fill="#fff"/></svg>';
  spot.appendChild(T.card([T.dropzone({ accept: '.svg,image/svg+xml', multiple: true, icon: '🖌️', label: 'Choose SVG files', hint: 'or drop them here · nothing is uploaded',
    filter: function (f) { return /svg/i.test(f.type) || /\.svg$/i.test(f.name); }, onFiles: function (l) { files = files.concat(l); note.textContent = files.length + ' SVG file' + (files.length > 1 ? 's' : '') + ' chosen: ' + files.map(function (f) { return f.name; }).join(', '); } }),
    note, code, h('div', { 'class': 'tgrid2' }, [T.field('Size', scale), wF, T.field('Background', bg), T.field('Save as', fmt)]),
    T.row([T.button('Convert', { primary: true, onclick: run }), T.button('Try a sample', { small: true, onclick: function () { code.value = SAMPLE; run(); } }),
      T.button('Clear', { small: true, onclick: function () { files = []; code.value = ''; note.textContent = ''; results.clear(); status.clear(); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  sync();
  T.tests['svg-to-png'] = function () {
    var f = [], s = function (t) { var z = svgSize(t); return z.w + 'x' + z.h; };
    if (s('<svg width="100" height="50"></svg>') !== '100x50') f.push('w/h');
    if (s('<svg viewBox="0 0 24 24"></svg>') !== '24x24') f.push('viewBox');
    if (s('<svg width="48" viewBox="0 0 24 12"></svg>') !== '48x24') f.push('width + viewBox');
    try { svgSize('<div>no</div>'); f.push('html accepted'); } catch (e) {}
    return render('<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#f00"/></svg>', { scale: 2, bg: '' }).then(function (c) {
      var d = c.getContext('2d').getImageData(100, 50, 1, 1).data;
      if (c.width !== 200 || c.height !== 100 || d[0] < 250 || d[3] < 250) f.push('render ' + c.width + 'x' + c.height + ' ' + Array.from(d));
      return { ok: !f.length, n: 5, fails: f };
    });
  };
});
