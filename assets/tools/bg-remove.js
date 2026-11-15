/* Infinity by GroupChatOn — bg-remove. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Remove image background with AI that runs on your device: people or any object, then a see-through, white, colour or blurred background (transformers.js: ormbg / MODNet). */
GCOTools.register('bg-remove', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), img = null, name = 'photo', cut = null, models = {};
  var TF = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js';
  var MODELS = { any: ['onnx-community/ormbg-ONNX', 'pixel_values', '42 MB'], person: ['Xenova/modnet', 'input', '6 MB'] };
  function lib() { return T.__tf || (T.__tf = import(TF).then(function (X) { X.env.allowLocalModels = false; return X; })); }
  function load(which) {
    if (models[which]) return models[which];
    var id = MODELS[which][0];
    return (models[which] = lib().then(function (X) { return Promise.all([X, X.AutoModel.from_pretrained(id, { dtype: 'q8' }), X.AutoProcessor.from_pretrained(id)]); }).catch(function (e) { delete models[which]; throw e; }));
  }
  // the AI mask: 0 = background … 255 = subject, one byte per pixel of the canvas
  function maskOf(c, which) {
    return load(which).then(function (r) {
      var X = r[0], g = c.getContext('2d'), raw = new X.RawImage(g.getImageData(0, 0, c.width, c.height).data, c.width, c.height, 4);
      return r[2](raw).then(function (inp) { var a = {}; a[MODELS[which][1]] = inp.pixel_values; return r[1](a); }).then(function (out) {
        var t = out[Object.keys(out)[0]];
        return X.RawImage.fromTensor(t[0].mul(255).to('uint8')).resize(c.width, c.height);
      }).then(function (m) { return m.data; });
    });
  }
  function applyMask(c, mask) {   // → a new canvas with a see-through background
    var o = h('canvas'); o.width = c.width; o.height = c.height; var g = o.getContext('2d'); g.drawImage(c, 0, 0);
    var id = g.getImageData(0, 0, o.width, o.height), d = id.data;
    for (var i = 0, j = 3; i < mask.length; i++, j += 4) d[j] = mask[i];
    g.putImageData(id, 0, 0); return o;
  }
  function compose(fg, bg, color, orig) {   // the cut-out on its new background
    var o = h('canvas'); o.width = fg.width; o.height = fg.height; var g = o.getContext('2d');
    if (bg === 'white' || bg === 'color') { g.fillStyle = bg === 'white' ? '#ffffff' : color; g.fillRect(0, 0, o.width, o.height); }
    if (bg === 'blur') { g.filter = 'blur(' + Math.max(6, Math.round(o.width / 90)) + 'px)'; g.drawImage(orig, 0, 0); g.filter = 'none'; }
    g.drawImage(fg, 0, 0); return o;
  }
  var which = T.seg([['any', 'Any object'], ['person', 'People (fast)']], 'any');
  var bg = T.seg([['none', 'See-through'], ['white', 'White'], ['color', 'Colour'], ['blur', 'Blur']], 'none', show), color = h('input', { type: 'color', value: '#0ea5e9' }), colorF = T.field('Background colour', color);
  color.addEventListener('input', show); colorF.hidden = true;
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Result preview' }), prev = h('div', { 'class': 'tfit-prev is-checker', hidden: true }, [cv]);
  var go = T.button('Remove background', { primary: true, disabled: true, onclick: run }), seq = 0;
  function show() {   // preview + a ready-to-download file for the background picked now
    colorF.hidden = bg.value() !== 'color';
    if (!cut) return;
    var b = bg.value(), o = compose(cut, b, color.value, img), type = b === 'none' ? 'image/png' : 'image/jpeg', tok = ++seq;
    cv.width = o.width; cv.height = o.height; cv.getContext('2d').drawImage(o, 0, 0); prev.hidden = false;
    T.canvasBlob(o, type, 0.92).then(function (blob) {
      if (tok !== seq) return;
      results.set([{ name: name + (b === 'none' ? '-no-background.png' : '-new-background.jpg'), blob: blob, preview: URL.createObjectURL(blob), note: o.width + ' × ' + o.height }]);
    });
  }
  function take(files) {
    var f = files[0], im = new Image(); name = T.baseName(f.name); cut = null; results.clear();
    return new Promise(function (ok) {
    im.onload = function () { ok();
      var k = Math.min(1, 2048 / Math.max(im.naturalWidth, im.naturalHeight)), c = h('canvas');   // very big photos are worked on at 2048 px
      c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      img = c; go.disabled = false; cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0); prev.hidden = false; URL.revokeObjectURL(im.src);
      status.info(f.name + ' · ' + im.naturalWidth + ' × ' + im.naturalHeight + '. Press Remove background.');
    };
    im.onerror = function () { ok(); status.error(f.name + ' could not be opened. Try a JPG, PNG or WebP.'); };
    im.src = URL.createObjectURL(f);
    });
  }
  function run() {
    if (!img) return Promise.resolve();
    var w = which.value(); go.disabled = true;
    status.progress(0.1, models[w] ? 'Finding the subject…' : 'Downloading the AI model (' + MODELS[w][2] + ', only the first time)…');
    return maskOf(img, w).then(function (m) { status.progress(0.9, 'Cutting out…'); cut = applyMask(img, m); show(); status.ok('Done! Change the background if you like, then download below. Check fine edges like hair.'); })
      .catch(function (e) { status.error(/fetch|network|Failed to/i.test(e.message) ? 'The AI model could not be downloaded. Check your connection and try again.' : e); })
      .then(function () { go.disabled = false; });
  }
  function sample() {
    var c = h('canvas'); c.width = 640; c.height = 480; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 480);
    gr.addColorStop(0, '#a7d8f5'); gr.addColorStop(1, '#d9f99d'); g.fillStyle = gr; g.fillRect(0, 0, 640, 480);
    g.fillStyle = '#c2410c'; g.beginPath(); g.ellipse(320, 400, 150, 140, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#f1c27d'; g.beginPath(); g.arc(320, 200, 85, 0, 7); g.fill(); g.fillStyle = '#3f2a1d'; g.beginPath(); g.arc(320, 170, 88, Math.PI, 0); g.fill();
    return T.canvasBlob(c, 'image/jpeg', 0.92).then(function (b) { return new File([b], 'sample-portrait.jpg', { type: 'image/jpeg' }); });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', paste: true, icon: '✨', label: 'Choose a photo', hint: 'JPG, PNG or WebP · the AI runs on your device', filter: function (f) { return /^image\//.test(f.type); }, onFiles: take }),
    T.field('What is in the photo', which), prev, T.field('New background', bg), colorF,
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { return take([f]); }).then(run); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['bg-remove'] = function () {
    var f = [], c = h('canvas'); c.width = 2; c.height = 1; var g = c.getContext('2d'); g.fillStyle = '#ff0000'; g.fillRect(0, 0, 2, 1);
    var cutC = applyMask(c, new Uint8Array([255, 0])), d = cutC.getContext('2d').getImageData(0, 0, 2, 1).data;
    if (d[3] !== 255 || d[7] !== 0 || d[0] !== 255) f.push('mask ' + [d[0], d[3], d[7]].join(','));
    var w = compose(cutC, 'white', '', c).getContext('2d').getImageData(0, 0, 2, 1).data;
    if (w[0] !== 255 || w[1] !== 0 || w[4] !== 255 || w[5] !== 255 || w[7] !== 255) f.push('white background ' + Array.prototype.slice.call(w).join(','));
    var col = compose(cutC, 'color', '#0000ff', c).getContext('2d').getImageData(1, 0, 1, 1).data;
    if (col[2] !== 255 || col[0] !== 0) f.push('colour background');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
