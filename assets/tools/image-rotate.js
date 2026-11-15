/* Infinity by GroupChatOn — image-rotate. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Rotate and flip images: 90° turns, mirror, and fine straightening by any angle, for one photo or a whole batch. */
GCOTools.register('image-rotate', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), st = { rot: 0, fh: false, fv: false, fine: 0 };
  function load(file) { return new Promise(function (ok, fail) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { fail(new Error(file.name + ' could not be opened.')); }; im.src = URL.createObjectURL(file); }); }
  function outSize(w, hh, deg) { var a = deg * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)); return [Math.round(w * c + hh * s), Math.round(w * s + hh * c)]; }
  function render(src, o, k, bg) {
    var w = (src.naturalWidth || src.width) * k, hh = (src.naturalHeight || src.height) * k, deg = o.rot + o.fine, sz = outSize(w, hh, deg), c = h('canvas'), g;
    c.width = sz[0]; c.height = sz[1]; g = c.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, sz[0], sz[1]); }
    g.imageSmoothingEnabled = o.fine !== 0 || k !== 1; g.imageSmoothingQuality = 'high';
    g.translate(sz[0] / 2, sz[1] / 2); g.rotate(deg * Math.PI / 180); g.scale(o.fh ? -1 : 1, o.fv ? -1 : 1); g.drawImage(src, -w / 2, -hh / 2, w, hh);
    return c;
  }
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Preview' }), prev = h('div', { 'class': 'tfit-prev is-checker' }, [cv]), first = null;
  var fine = h('input', { type: 'range', min: '-45', max: '45', step: '0.5', value: '0' }), fineF = T.field('Straighten: 0°', fine), bg = T.select([['', 'Transparent (PNG / WebP)'], ['#ffffff', 'White'], ['#000000', 'Black']], '#ffffff');
  var fmt = T.select([['same', 'Same as original'], ['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']], 'same');
  function paint() {
    fineF.firstChild.textContent = 'Straighten: ' + st.fine + '°';
    if (!first) return;
    var k = Math.min(1, 700 / Math.max(first.naturalWidth, first.naturalHeight)), c = render(first, st, k, bg.value);
    cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0);
    var s = outSize(first.naturalWidth, first.naturalHeight, st.rot + st.fine);
    status.info('Turned ' + ((st.rot % 360) + 360) % 360 + '°' + (st.fine ? ' and straightened ' + st.fine + '°' : '') + (st.fh ? ', mirrored' : '') + (st.fv ? ', flipped upside down' : '') + ' → ' + s[0] + ' × ' + s[1] + ' px');
  }
  var go = T.button('Save rotated', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = !f.length; results.clear(); if (f.length) load(f[0].file).then(function (im) { first = im; paint(); }); else { first = null; cv.width = cv.height = 0; } });
  fine.addEventListener('input', function () { st.fine = +fine.value; paint(); }); bg.addEventListener('change', paint);
  function act(fn) { return function () { fn(); paint(); }; }
  function run() {
    var files = list.files(), out = [], i = 0; go.disabled = true;
    (function next() {
      if (i >= files.length) { results.set(out, 'rotated-images'); status.ok('Done! ' + out.length + ' image' + (out.length > 1 ? 's' : '') + ' saved.'); go.disabled = false; return; }
      var f = files[i++], type = fmt.value === 'same' ? (/^image\/(png|webp|jpeg)$/.test(f.type) ? f.type : 'image/jpeg') : fmt.value;
      status.progress(i / files.length, 'Rotating ' + f.name + '…');
      load(f).then(function (im) {
        var c = render(im, st, 1, type === 'image/jpeg' ? (bg.value || '#ffffff') : bg.value); URL.revokeObjectURL(im.src);
        return T.canvasBlob(c, type, 0.92).then(function (b) {
          out.push({ name: T.baseName(f.name) + '-rotated.' + { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type], blob: b, preview: URL.createObjectURL(b), note: c.width + ' × ' + c.height }); next();
        });
      }).catch(function (e) { status.error(e); go.disabled = false; });
    })();
  }
  function sample() {
    var c = h('canvas'); c.width = 1200; c.height = 800; var g = c.getContext('2d'); g.fillStyle = '#e0f2fe'; g.fillRect(0, 0, 1200, 800);
    g.fillStyle = '#0369a1'; g.font = 'bold 160px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Hello ↑', 600, 400);
    return T.canvasBlob(c, 'image/png').then(function (b) { return new File([b], 'sample.png', { type: 'image/png' }); });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', multiple: true, paste: true, icon: '🔄', label: 'Choose photos', hint: 'All photos get the same turn · nothing is uploaded', filter: function (f) { return /^image\//.test(f.type); }, onFiles: list.add }),
    list.el, prev, T.row([T.button('↺ Left', { onclick: act(function () { st.rot -= 90; }) }), T.button('↻ Right', { onclick: act(function () { st.rot += 90; }) }), T.button('180°', { onclick: act(function () { st.rot += 180; }) }),
      T.button('⇋ Mirror', { onclick: act(function () { st.fh = !st.fh; }) }), T.button('⇅ Flip', { onclick: act(function () { st.fv = !st.fv; }) }),
      T.button('Reset', { small: true, onclick: act(function () { st = { rot: 0, fh: false, fv: false, fine: 0 }; fine.value = 0; }) })]),
    h('div', { 'class': 'tgrid2' }, [fineF, T.field('Empty corners', bg), T.field('Save as', fmt)]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { list.clear(); list.add([f]); st.rot = 90; setTimeout(run, 300); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['image-rotate'] = function () {
    var f = [];
    if (outSize(400, 300, 90).join() !== '300,400' || outSize(400, 300, 180).join() !== '400,300' || outSize(100, 100, 45).join() !== '141,141') f.push('sizes');
    var s = h('canvas'); s.width = 2; s.height = 1; var g = s.getContext('2d'); g.fillStyle = '#f00'; g.fillRect(0, 0, 1, 1); g.fillStyle = '#00f'; g.fillRect(1, 0, 1, 1);
    var r = render(s, { rot: 90, fine: 0, fh: false, fv: false }, 1, ''), d = r.getContext('2d').getImageData(0, 0, 1, 2).data;
    if (r.width !== 1 || r.height !== 2 || d[0] < 200 || d[6] < 200) f.push('90° right: red should be on top');
    var m = render(s, { rot: 0, fine: 0, fh: true, fv: false }, 1, ''), e = m.getContext('2d').getImageData(0, 0, 2, 1).data;
    if (e[2] < 200 || e[4] < 200) f.push('mirror');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
