/* Infinity by GroupChatOn — image-upscale. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Upscale images 2× or 4× with an AI super-resolution model on your device (TensorFlow.js + ESRGAN-slim from UpscalerJS), or a fast sharp resize. */
GCOTools.register('image-upscale', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), img = null, name = 'image', models = {};
  var TFJS = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js', MODEL = 'https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-slim@1.0.0/models/x';
  var PAD = 12;
  function model(k) {
    if (models[k]) return models[k];
    return (models[k] = T.loadScript(TFJS).then(function () { return window.tf.ready(); }).then(function () { return window.tf.loadLayersModel(MODEL + k + '/model.json'); }).catch(function (e) { delete models[k]; throw e; }));
  }
  // the image in overlapping tiles through the model: phones run out of graphics memory on big single passes
  function ai(c, k, prog, tile) {
    var TILE = tile || 192;
    return model(k).then(function (m) {
      var tf = window.tf, out = h('canvas'); out.width = c.width * k; out.height = c.height * k;
      var g = out.getContext('2d'), tiles = [];
      for (var y = 0; y < c.height; y += TILE) for (var x = 0; x < c.width; x += TILE) tiles.push([x, y]);
      var i = 0;
      function next() {
        if (i >= tiles.length) return out;
        var x = tiles[i][0], y = tiles[i][1], x0 = Math.max(0, x - PAD), y0 = Math.max(0, y - PAD), x1 = Math.min(c.width, x + TILE + PAD), y1 = Math.min(c.height, y + TILE + PAD);
        var piece = h('canvas'); piece.width = x1 - x0; piece.height = y1 - y0; piece.getContext('2d').drawImage(c, x0, y0, piece.width, piece.height, 0, 0, piece.width, piece.height);
        var res = tf.tidy(function () { return m.predict(tf.browser.fromPixels(piece).toFloat().div(255).expandDims(0)).squeeze().clipByValue(0, 1); });
        i++; if (prog) prog(i, tiles.length);
        return tf.browser.toPixels(res).then(function (px) {
          res.dispose();
          var t = h('canvas'); t.width = piece.width * k; t.height = piece.height * k; t.getContext('2d').putImageData(new ImageData(px, t.width, t.height), 0, 0);
          var w = Math.min(TILE, c.width - x), hh = Math.min(TILE, c.height - y);
          g.drawImage(t, (x - x0) * k, (y - y0) * k, w * k, hh * k, x * k, y * k, w * k, hh * k);
          return new Promise(function (ok) { setTimeout(ok, 0); }).then(next);   // let the page breathe between tiles
        });
      }
      return next();
    });
  }
  // no AI: smooth enlargement in steps, then a light sharpen
  function quick(c, k) {
    var cur = c;
    for (var s = 1; s < k; s *= 2) { var n = h('canvas'); n.width = cur.width * 2; n.height = cur.height * 2; var ng = n.getContext('2d'); ng.imageSmoothingQuality = 'high'; ng.drawImage(cur, 0, 0, n.width, n.height); cur = n; }
    var g = cur.getContext('2d'), id = g.getImageData(0, 0, cur.width, cur.height), d = id.data, o = new Uint8ClampedArray(d), w = cur.width, a = 0.35;
    for (var y = 1; y < cur.height - 1; y++) for (var x = 1; x < w - 1; x++) for (var ch = 0; ch < 3; ch++) {
      var i = (y * w + x) * 4 + ch;
      o[i] = d[i] * (1 + 4 * a) - a * (d[i - 4] + d[i + 4] + d[i - w * 4] + d[i + w * 4]);
    }
    g.putImageData(new ImageData(o, w, cur.height), 0, 0); return cur;
  }
  var scale = T.seg([['2', '2×'], ['4', '4×']], '2'), mode = T.seg([['ai', 'AI (best)'], ['quick', 'Quick']], 'ai');
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Preview' }), prev = h('div', { 'class': 'tfit-prev', hidden: true }, [cv]);
  var go = T.button('Upscale', { primary: true, disabled: true, onclick: run });
  function limit(k) { return k === 4 ? 900 : 1600; }
  function take(files) {
    var f = files[0], im = new Image(); name = T.baseName(f.name); results.clear();
    return new Promise(function (ok) {
    im.onload = function () { ok();
      var c = h('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0);
      img = c; go.disabled = false; cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0); prev.hidden = false; URL.revokeObjectURL(im.src);
      status.info(f.name + ' · ' + c.width + ' × ' + c.height + ' px.');
    };
    im.onerror = function () { ok(); status.error(f.name + ' could not be opened. Try a JPG, PNG or WebP.'); };
    im.src = URL.createObjectURL(f);
    });
  }
  function run() {
    if (!img) return Promise.resolve();
    var k = +scale.value(), src = img, max = limit(k);
    if (Math.max(img.width, img.height) > max) {   // keep the result within what a phone can hold
      var s = max / Math.max(img.width, img.height); src = h('canvas'); src.width = Math.round(img.width * s); src.height = Math.round(img.height * s); src.getContext('2d').drawImage(img, 0, 0, src.width, src.height);
    }
    go.disabled = true; status.progress(0.05, mode.value() === 'ai' ? (models[k] ? 'Upscaling…' : 'Loading the AI model (about 2 MB, only the first time)…') : 'Upscaling…');
    var job = mode.value() === 'ai' ? ai(src, k, function (i, n) { status.progress(i / n, 'Upscaling part ' + i + ' of ' + n + '…'); }).catch(function (e) {
      status.info('The AI could not run on this device (' + e.message + '). Using Quick mode instead.'); return quick(src, k);
    }) : Promise.resolve(quick(src, k));
    return job.then(function (out) {
      cv.width = out.width; cv.height = out.height; cv.getContext('2d').drawImage(out, 0, 0);
      return T.canvasBlob(out, 'image/png').then(function (b) {
        results.set([{ name: name + '-' + k + 'x.png', blob: b, preview: URL.createObjectURL(b), note: out.width + ' × ' + out.height }]);
        status.ok('Done! ' + src.width + ' × ' + src.height + ' → ' + out.width + ' × ' + out.height + ' px.' + (src !== img ? ' (Big photos are first reduced to ' + max + ' px so your device can handle them.)' : ''));
      });
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function sample() {
    var c = h('canvas'); c.width = 200; c.height = 140; var g = c.getContext('2d'); g.fillStyle = '#fefce8'; g.fillRect(0, 0, 200, 140);
    g.fillStyle = '#16a34a'; g.beginPath(); g.arc(52, 70, 34, 0, 7); g.fill(); g.fillStyle = '#1e3a8a'; g.font = 'bold 22px sans-serif'; g.fillText('Logo', 98, 66); g.font = '13px sans-serif'; g.fillText('small and blurry', 96, 90);
    return T.canvasBlob(c, 'image/png').then(function (b) { return new File([b], 'small-logo.png', { type: 'image/png' }); });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', paste: true, icon: '🔍', label: 'Choose an image', hint: 'JPG, PNG or WebP · the AI runs on your device', filter: function (f) { return /^image\//.test(f.type); }, onFiles: take }),
    h('div', { 'class': 'tgrid2' }, [T.field('Make it', scale), T.field('Method', mode)]), prev,
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { return take([f]); }).then(run); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['image-upscale'] = function () {
    var f = [], c = h('canvas'); c.width = 20; c.height = 10; var g = c.getContext('2d'); g.fillStyle = '#2050c0'; g.fillRect(0, 0, 20, 10);
    var q2 = quick(c, 2), q4 = quick(c, 4), p = q4.getContext('2d').getImageData(40, 20, 1, 1).data;
    if (q2.width !== 40 || q2.height !== 20 || q4.width !== 80 || q4.height !== 40) f.push('quick size');
    if (Math.abs(p[0] - 32) > 3 || Math.abs(p[2] - 192) > 3) f.push('quick colour ' + p[0] + ',' + p[2]);
    var big = h('canvas'); big.width = 100; big.height = 40; var bg = big.getContext('2d'); bg.fillStyle = '#c0392b'; bg.fillRect(0, 0, 100, 40); bg.fillStyle = '#fff'; bg.fillRect(70, 12, 20, 16);
    return ai(big, 2, null, 48).then(function (out) {   // small tiles here: the 3 tiles must join into one picture of the right size, with the colours kept
      if (out.width !== 200 || out.height !== 80) f.push('ai size ' + out.width + 'x' + out.height);
      var d = out.getContext('2d'), a = d.getImageData(30, 30, 1, 1).data, w = d.getImageData(160, 40, 1, 1).data, seam = d.getImageData(96, 40, 1, 1).data;
      if (Math.abs(a[0] - 192) > 20 || a[1] > 80) f.push('ai colour ' + a[0] + ',' + a[1]);
      if (w[0] < 220 || w[1] < 220) f.push('ai white box ' + w[0] + ',' + w[1]);
      if (Math.abs(seam[0] - 192) > 20) f.push('tile seam ' + seam[0]);
    }).catch(function (e) { f.push('ai threw ' + e.message); }).then(function () { return { ok: !f.length, n: 5, fails: f }; });
  };
});
