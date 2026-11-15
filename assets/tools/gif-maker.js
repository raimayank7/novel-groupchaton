/* Infinity by GroupChatOn — gif-maker. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* GIF maker: turn photos or frames into an animated GIF with your own speed, size and looping (gifenc). */
GCOTools.register('gif-maker', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  var GIFENC = 'https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js';
  function lib() { return T.__gifenc || (T.__gifenc = import(GIFENC)); }
  function load(f) { return new Promise(function (ok, fail) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { fail(new Error(f.name + ' could not be opened.')); }; im.src = URL.createObjectURL(f); }); }
  function frame(im, w, hh, fit, bg) {
    var c = h('canvas'); c.width = w; c.height = hh; var g = c.getContext('2d'), iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
    g.fillStyle = bg; g.fillRect(0, 0, w, hh);
    var s = fit === 'cover' ? Math.max(w / iw, hh / ih) : Math.min(w / iw, hh / ih);
    g.imageSmoothingQuality = 'high'; g.drawImage(im, (w - iw * s) / 2, (hh - ih * s) / 2, iw * s, ih * s);
    return c;
  }
  // frames: canvases of the same size → GIF bytes
  function encode(G, frames, delay, loop, colors) {
    var enc = G.GIFEncoder(), w = frames[0].width, hh = frames[0].height;
    frames.forEach(function (c, i) {
      var d = c.getContext('2d').getImageData(0, 0, w, hh).data, pal = G.quantize(d, colors), idx = G.applyPalette(d, pal);
      enc.writeFrame(idx, w, hh, i ? { palette: pal, delay: delay } : { palette: pal, delay: delay, repeat: loop ? 0 : -1 });
    });
    enc.finish(); return enc.bytes();
  }
  var width = T.select([[240, 'Small (240 px)'], [320, 'Medium (320 px)'], [480, 'Large (480 px)'], [640, 'Extra large (640 px)']], 480);
  var delay = h('input', { type: 'range', min: '60', max: '2000', step: '20', value: '500' }), delayF = T.field('Each picture shows for 0.5 s', delay);
  var fit = T.select([['contain', 'Whole picture (adds bars)'], ['cover', 'Fill the frame (crops)']], 'contain'), bg = h('input', { type: 'color', value: '#ffffff' });
  var loop = h('input', { type: 'checkbox', checked: true }), bounce = h('input', { type: 'checkbox' }), colors = T.select([[256, 'Best (256 colours)'], [128, 'Smaller file (128)'], [64, 'Smallest (64)']], 256);
  delay.addEventListener('input', function () { delayF.firstChild.textContent = 'Each picture shows for ' + (delay.value / 1000).toFixed(2).replace(/0$/, '') + ' s'; });
  var go = T.button('Make GIF', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = f.length < 2; results.clear(); });
  function run(filesIn) {
    var files = Array.isArray(filesIn) ? filesIn : list.files();
    if (files.length < 2) return Promise.resolve(status.error('Choose at least 2 pictures.'));
    go.disabled = true; status.progress(0.05, 'Loading the pictures…');
    return Promise.all([lib(), Promise.all(files.map(load))]).then(function (r) {
      var G = r[0], ims = r[1], w = +width.value, hh = Math.round(w * (ims[0].naturalHeight / ims[0].naturalWidth));
      hh = Math.max(16, Math.min(hh, w * 2));
      var frames = ims.map(function (im) { var c = frame(im, w, hh, fit.value, bg.value); URL.revokeObjectURL(im.src); return c; });
      if (bounce.checked && frames.length > 2) frames = frames.concat(frames.slice(1, -1).reverse());
      status.progress(0.5, 'Making the GIF (' + frames.length + ' frames)…');
      return new Promise(function (ok) { setTimeout(ok, 30); }).then(function () {
        var bytes = encode(G, frames, +delay.value, loop.checked, +colors.value), blob = new Blob([bytes], { type: 'image/gif' });
        results.set([{ name: 'animation.gif', blob: blob, preview: URL.createObjectURL(blob), note: w + ' × ' + hh + ' · ' + frames.length + ' frames' }]);
        status.ok('Done! Your GIF is ' + T.bytes(blob.size) + '. WhatsApp and most chats accept GIFs under 16 MB.');
      });
    }).catch(status.error).then(function () { go.disabled = list.files().length < 2; });
  }
  function sample() {
    var cols = ['#f43f5e', '#f59e0b', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899'];
    return Promise.all(cols.map(function (c, i) {
      var cv = h('canvas'); cv.width = 400; cv.height = 300; var g = cv.getContext('2d'); g.fillStyle = '#0f172a'; g.fillRect(0, 0, 400, 300);
      g.fillStyle = c; g.beginPath(); g.arc(60 + i * 56, 150 - Math.sin(i / 5 * Math.PI) * 90, 34, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.fillText('Frame ' + (i + 1), 140, 280);
      return T.canvasBlob(cv, 'image/png').then(function (b) { return new File([b], 'frame-' + (i + 1) + '.png', { type: 'image/png' }); });
    }));
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', multiple: true, paste: true, icon: '🎞️', label: 'Choose 2 or more pictures', hint: 'they play in this order · reorder with the arrows', filter: function (f) { return /^image\//.test(f.type); }, onFiles: list.add }),
    list.el, h('div', { 'class': 'tgrid2' }, [delayF, T.field('Size', width), T.field('Fit', fit), T.field('Bar colour', bg), T.field('Quality', colors),
      h('div', { 'class': 'tchecks' }, [h('label', { 'class': 'tcheck' }, [loop, ' Loop forever']), h('label', { 'class': 'tcheck' }, [bounce, ' Play forward then back (boomerang)'])])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { list.clear(); list.add(f); return run(f); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  list.el.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['gif-maker'] = function () {
    var f = [];
    return lib().then(function (G) {
      var frames = ['#ff0000', '#00ff00', '#0000ff'].map(function (c) { var cv = h('canvas'); cv.width = 40; cv.height = 30; var g = cv.getContext('2d'); g.fillStyle = c; g.fillRect(0, 0, 40, 30); return cv; });
      var b = encode(G, frames, 200, true, 64), head = String.fromCharCode.apply(null, b.subarray(0, 6)), gce = 0, s = '';
      for (var i = 0; i + 1 < b.length; i++) if (b[i] === 0x21 && b[i + 1] === 0xF9) gce++;
      for (i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
      if (head !== 'GIF89a') f.push('header ' + head);
      if (gce !== 3) f.push('frames ' + gce);
      if (s.indexOf('NETSCAPE2.0') < 0) f.push('no loop block');
      return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im.naturalWidth + 'x' + im.naturalHeight); }; im.onerror = function () { ok('broken'); }; im.src = URL.createObjectURL(new Blob([b], { type: 'image/gif' })); });
    }).then(function (sz) { if (sz !== '40x30') f.push('decoded ' + sz); }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
