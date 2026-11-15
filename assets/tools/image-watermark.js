/* Infinity by GroupChatOn — image-watermark. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Watermark photos: your name, © text or logo on every image, in a corner, the centre or tiled across, with size and opacity control. */
GCOTools.register('image-watermark', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), logo = null, first = null;
  function load(file) { return new Promise(function (ok, fail) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { fail(new Error(file.name + ' could not be opened.')); }; im.src = URL.createObjectURL(file); }); }
  function pos(p, W, H, w, hh, m) {
    var x = p[1] === 'l' ? m : p[1] === 'c' ? (W - w) / 2 : W - w - m, y = p[0] === 't' ? m : p[0] === 'm' ? (H - hh) / 2 : H - hh - m;
    return [Math.round(x), Math.round(y)];
  }
  function mark(g, W, H, o) {
    var m = Math.round(Math.min(W, H) * 0.03), w, hh, tile = o.pos === 'tile';
    g.save(); g.globalAlpha = o.alpha;
    if (o.kind === 'logo' && o.logo) { w = W * o.size / 100; hh = w * o.logo.height / o.logo.width; }
    else {
      var fs = Math.max(8, W * o.size / 100 / 3); g.font = '700 ' + fs + 'px system-ui,"Segoe UI",Arial,sans-serif'; g.textBaseline = 'top';
      w = g.measureText(o.text).width; hh = fs * 1.15; g.fillStyle = o.color;
      var light = parseInt(o.color.slice(1, 3), 16) + parseInt(o.color.slice(3, 5), 16) + parseInt(o.color.slice(5, 7), 16) > 380;
      g.shadowColor = light ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.45)'; g.shadowBlur = fs / 8;
    }
    function put(x, y) { if (o.kind === 'logo' && o.logo) g.drawImage(o.logo, x, y, w, hh); else g.fillText(o.text, x, y); }
    if (tile) {
      g.translate(W / 2, H / 2); g.rotate(-Math.PI / 6);
      var stepX = w * 1.6 + m, stepY = hh * 4, R = Math.sqrt(W * W + H * H) / 2;
      for (var y = -R; y < R; y += stepY) for (var x = -R + ((Math.round((y + R) / stepY) % 2) * stepX / 2); x < R; x += stepX) put(x, y);
    } else { var p = pos(o.pos, W, H, w, hh, m); put(p[0], p[1]); }
    g.restore();
  }
  var kind = T.seg([['text', 'Text'], ['logo', 'Logo image']], 'text', function () { txtBox.hidden = kind.value() !== 'text'; logoBox.hidden = kind.value() !== 'logo'; paint(); });
  var text = h('input', { type: 'text', value: T.store.get('wm-text', '© Your Name') }), color = h('input', { type: 'color', value: '#ffffff' }), size = h('input', { type: 'range', min: '5', max: '60', value: '20' });
  var alpha = h('input', { type: 'range', min: '10', max: '100', value: '60' }), place = T.select([['br', 'Bottom right'], ['bl', 'Bottom left'], ['bc', 'Bottom centre'], ['tr', 'Top right'], ['tl', 'Top left'], ['tc', 'Top centre'], ['mc', 'Centre'], ['tile', 'Tiled across the photo']], 'br');
  var fmt = T.select([['same', 'Same as original'], ['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']], 'same');
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Preview' }), prev = h('div', { 'class': 'tfit-prev' }, [cv]);
  var txtBox = h('div', { 'class': 'tgrid2' }, [T.field('Watermark text', text), T.field('Colour', color)]);
  var logoBox = h('div', { hidden: true }, [T.dropzone({ accept: 'image/png,image/webp,image/svg+xml,image/*', icon: '🏷️', label: 'Choose your logo', hint: 'A PNG with a transparent background looks best',
    onFiles: function (l) { load(l[0]).then(function (im) { logo = im; paint(); }, status.error); } })]);
  function o() { return { kind: kind.value(), text: text.value || '©', color: color.value, size: +size.value, alpha: alpha.value / 100, pos: place.value, logo: logo }; }
  function paint() {
    T.store.set('wm-text', text.value);
    if (!first) return;
    var k = Math.min(1, 900 / Math.max(first.naturalWidth, first.naturalHeight)); cv.width = Math.round(first.naturalWidth * k); cv.height = Math.round(first.naturalHeight * k);
    var g = cv.getContext('2d'); g.drawImage(first, 0, 0, cv.width, cv.height); mark(g, cv.width, cv.height, o());
  }
  [text, color, size, alpha, place].forEach(function (x) { x.addEventListener('input', paint); x.addEventListener('change', paint); });
  var go = T.button('Add watermark', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = !f.length; results.clear(); if (f.length) load(f[0].file).then(function (im) { first = im; paint(); }); });
  function run() {
    if (kind.value() === 'logo' && !logo) { status.error('Choose your logo first.'); return; }
    var files = list.files(), out = [], i = 0, op = o(); go.disabled = true;
    (function next() {
      if (i >= files.length) { results.set(out, 'watermarked'); status.ok('Done! ' + out.length + ' photo' + (out.length > 1 ? 's' : '') + ' watermarked.'); go.disabled = false; return; }
      var f = files[i++], type = fmt.value === 'same' ? (/^image\/(png|webp|jpeg)$/.test(f.type) ? f.type : 'image/jpeg') : fmt.value;
      status.progress(i / files.length, 'Watermarking ' + f.name + '…');
      load(f).then(function (im) {
        var c = h('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; var g = c.getContext('2d');
        g.drawImage(im, 0, 0); mark(g, c.width, c.height, op); URL.revokeObjectURL(im.src);
        return T.canvasBlob(c, type, 0.92).then(function (b) { out.push({ name: T.baseName(f.name) + '-watermarked.' + { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type], blob: b, preview: URL.createObjectURL(b), note: c.width + ' × ' + c.height }); next(); });
      }).catch(function (e) { status.error(e); go.disabled = false; });
    })();
  }
  function sample() {
    var c = h('canvas'); c.width = 1600; c.height = 1067; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1067);
    gr.addColorStop(0, '#7dd3fc'); gr.addColorStop(0.6, '#fde68a'); gr.addColorStop(1, '#86efac'); g.fillStyle = gr; g.fillRect(0, 0, 1600, 1067);
    g.fillStyle = '#166534'; g.beginPath(); g.moveTo(0, 1067); g.lineTo(500, 500); g.lineTo(1000, 1067); g.fill();
    return T.canvasBlob(c, 'image/jpeg', 0.9).then(function (b) { return new File([b], 'sample-photo.jpg', { type: 'image/jpeg' }); });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', multiple: true, paste: true, icon: '💧', label: 'Choose photos', hint: 'The same watermark goes on every photo · nothing is uploaded', filter: function (f) { return /^image\//.test(f.type); }, onFiles: list.add }),
    list.el, T.field('Watermark', kind), txtBox, logoBox, h('div', { 'class': 'tgrid2' }, [T.field('Size', size), T.field('Opacity', alpha), T.field('Position', place), T.field('Save as', fmt)]), prev,
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { list.clear(); list.add([f]); setTimeout(run, 300); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['image-watermark'] = function () {
    var f = [];
    if (pos('br', 1000, 800, 200, 50, 24).join() !== '776,726' || pos('tl', 1000, 800, 200, 50, 24).join() !== '24,24' || pos('mc', 1000, 800, 200, 50, 24).join() !== '400,375') f.push('positions');
    var lg = h('canvas'); lg.width = lg.height = 10; lg.getContext('2d').fillStyle = '#f00'; lg.getContext('2d').fillRect(0, 0, 10, 10);
    var c = h('canvas'); c.width = 200; c.height = 100; var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 200, 100);
    mark(g, 200, 100, { kind: 'logo', logo: lg, size: 10, alpha: 1, pos: 'br' });   // 20 × 20 logo, 3 px margin → x 177–196, y 77–96
    var d = g.getImageData(186, 86, 1, 1).data, e = g.getImageData(100, 50, 1, 1).data;
    if (d[0] < 250 || d[1] > 5 || e[1] < 250) f.push('logo placement ' + Array.from(d));
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
