/* Image fitter engine: puts a whole photo on a fixed-size canvas without cutting it off.
   Kinds: dp (square profile photo), status (9:16 story / status), sticker (512 × 512 transparent WebP under 100 KB).
   GCOTools.engine('imgfit', 'wa-dp', { kind: 'dp' })
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var T = window.GCOTools, h = T.h;
  var KIND = {
    dp: { w: 1080, h: 1080, bg: 'blur', name: 'profile-photo.jpg', type: 'image/jpeg', label: 'Profile photo (1080 × 1080)', circle: true },
    status: { w: 1080, h: 1920, bg: 'blur', name: 'status-9x16.jpg', type: 'image/jpeg', label: 'Status / story (1080 × 1920, 9:16)' },
    sticker: { w: 512, h: 512, bg: 'none', name: 'sticker.webp', type: 'image/webp', label: 'Sticker (512 × 512 WebP)', margin: 16, max: 100 * 1024 }
  };
  // draw the photo on a canvas of the kind's size; returns the canvas
  function render(img, k, o) {
    var c = document.createElement('canvas'); c.width = k.w; c.height = k.h;
    var g = c.getContext('2d'), m = k.margin || 0;
    var s = Math.min((k.w - 2 * m) / img.width, (k.h - 2 * m) / img.height) * (o.zoom || 1);
    var w = img.width * s, ht = img.height * s, x = (k.w - w) / 2 + (o.dx || 0) * k.w, y = (k.h - ht) / 2 + (o.dy || 0) * k.h;
    if (o.bg === 'blur') {   // the same photo, enlarged and blurred, fills the empty space
      var cs = Math.max(k.w / img.width, k.h / img.height);
      g.filter = 'blur(' + Math.round(k.w / 24) + 'px) brightness(.8)';
      var pad = k.w / 5;   // drawn larger than the canvas so the blur has no see-through edge
      g.drawImage(img, (k.w - img.width * cs) / 2 - pad, (k.h - img.height * cs) / 2 - pad, img.width * cs + 2 * pad, img.height * cs + 2 * pad);
      g.filter = 'none';
    } else if (o.bg !== 'none') { g.fillStyle = o.bg; g.fillRect(0, 0, k.w, k.h); }
    if (o.outline) {   // white sticker outline: the shape in white, drawn around the photo
      var sh = document.createElement('canvas'); sh.width = k.w; sh.height = k.h;
      var sg = sh.getContext('2d'); sg.drawImage(img, x, y, w, ht); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#fff'; sg.fillRect(0, 0, k.w, k.h);
      for (var a = 0; a < 360; a += 30) g.drawImage(sh, 7 * Math.cos(a * Math.PI / 180), 7 * Math.sin(a * Math.PI / 180));
    }
    g.drawImage(img, x, y, w, ht);
    return c;
  }
  function blob(c, k) {
    if (k.type !== 'image/webp') return T.canvasBlob(c, k.type, 0.92);
    var q = 0.92;
    function go() { return T.canvasBlob(c, 'image/webp', q).then(function (b) { if (b.size > k.max && q > 0.3) { q -= 0.1; return go(); } return b; }); }
    return go();
  }
  T.imgFit = render;
  T.engines.imgfit = function (spot, T, def, id) {
    var k = KIND[def.kind], img = null, status = T.status();
    var bgOpts = def.kind === 'sticker' ? [['none', 'See-through'], ['#ffffff', 'White']] : [['blur', 'Blurred photo'], ['#ffffff', 'White'], ['#000000', 'Black'], ['color', 'A colour']];
    var bg = T.seg(bgOpts, k.bg, draw), col = h('input', { type: 'color', value: '#25D366', 'aria-label': 'Background colour' });
    var zoom = h('input', { type: 'range', min: '0.5', max: '2', step: '0.01', value: '1', 'aria-label': 'Size' });
    var dx = h('input', { type: 'range', min: '-0.5', max: '0.5', step: '0.005', value: '0', 'aria-label': 'Left / right' }), dy = h('input', { type: 'range', min: '-0.5', max: '0.5', step: '0.005', value: '0', 'aria-label': 'Up / down' });
    var outline = h('input', { type: 'checkbox', checked: def.kind === 'sticker' });
    var prev = h('div', { 'class': 'tfit-prev' + (k.circle ? ' is-circle' : '') + (def.kind === 'sticker' ? ' is-checker' : '') }), out = null;
    var save = T.button('Download', { primary: true, disabled: true, onclick: function () {
      if (!out) return;
      blob(out, k).then(function (b) { T.download(b, k.name); status.ok('Saved ' + k.name + ' (' + T.bytes(b.size) + ').' + (def.kind === 'sticker' ? ' Add it with a sticker-maker app, or send it as a file.' : '')); });
    } });
    function opts() { var b = bg.value(); return { bg: b === 'color' ? col.value : b, zoom: +zoom.value, dx: +dx.value, dy: +dy.value, outline: def.kind === 'sticker' && outline.checked }; }
    function draw() {
      if (!img) return;
      out = render(img, k, opts());
      prev.innerHTML = ''; out.className = 'tfit-canvas'; prev.appendChild(out); save.disabled = false;
    }
    [zoom, dx, dy, col, outline].forEach(function (e) { e.addEventListener('input', draw); });
    function take(file) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { img = im; zoom.value = 1; dx.value = 0; dy.value = 0; status.clear(); draw(); };
      im.onerror = function () { status.error('This file could not be opened as a picture. Try a JPG or PNG.'); };
      im.src = u;
    }
    spot.appendChild(T.card([T.dropzone({ accept: 'image/*', label: 'Choose a photo', icon: '🖼️', hint: 'or drop / paste it here', paste: true, onFiles: function (f) { take(f[0]); } }), status.el,
      h('div', { 'class': 'tfit' }, [prev, h('div', { 'class': 'tfit-ctl' }, [h('p', { 'class': 'tfield-label', text: k.label }), T.field('Background', bg), def.kind !== 'sticker' ? T.field('Colour', col) : null,
        def.kind === 'sticker' ? h('label', { 'class': 'tcheck' }, [outline, ' White outline']) : null,
        T.field('Size', zoom), T.field('Move left / right', dx), T.field('Move up / down', dy), T.row([save, T.button('Reset', { small: true, onclick: function () { zoom.value = 1; dx.value = 0; dy.value = 0; draw(); } })])])]),
      h('p', { 'class': 'tnote', text: def.kind === 'dp' ? 'WhatsApp shows profile photos in a circle: keep faces near the middle. Nothing is uploaded.' : def.kind === 'status' ? 'Status and stories are 9:16. The whole photo stays visible; the empty space is filled. Nothing is uploaded.' : 'WhatsApp stickers are 512 × 512 WebP files under 100 KB with a see-through background. Nothing is uploaded.' })]));
    T.tests[id] = function () {
      var c = document.createElement('canvas'); c.width = 300; c.height = 120;
      var g = c.getContext('2d'); g.fillStyle = '#e11'; g.fillRect(0, 0, 300, 120);
      return new Promise(function (ok) {
        var im = new Image();
        im.onload = function () {
          img = im; draw();
          var fails = [], px = out.getContext('2d').getImageData(0, 0, 1, 1).data, mid = out.getContext('2d').getImageData(k.w / 2, k.h / 2, 1, 1).data;
          if (out.width !== k.w || out.height !== k.h) fails.push('size ' + out.width + '×' + out.height);
          if (mid[0] < 200 || mid[1] > 60) fails.push('photo not in the middle ' + mid.join(','));
          if (def.kind === 'sticker' ? px[3] !== 0 : px[3] !== 255) fails.push('corner alpha ' + px[3]);
          blob(out, k).then(function (b) {
            if (b.type !== k.type) fails.push('type ' + b.type);
            if (k.max && b.size > k.max) fails.push('too big ' + b.size);
            img = null; prev.innerHTML = ''; save.disabled = true;
            ok({ ok: !fails.length, n: 5, fails: fails });
          });
        };
        im.src = c.toDataURL();
      });
    };
  };
})();
