/* Image Converter — JPG / PNG / WebP in bulk, in the browser. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('image-convert', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  var go = T.button('Convert', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = !f.length; results.clear(); });
  var fmt = T.seg([['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']], 'image/webp', sync);
  var q = h('input', { type: 'range', min: '40', max: '100', value: '90' });
  var qLabel = T.field('Quality: 90%', q);
  q.addEventListener('input', function () { qLabel.firstChild.textContent = 'Quality: ' + q.value + '%'; });
  spot.appendChild(T.card([
    T.dropzone({ accept: 'image/*', multiple: true, paste: true, icon: '🔁', label: 'Choose images', hint: 'JPG, PNG, WebP, GIF, BMP, SVG… or paste a screenshot',
      filter: function (f) { return /^image\//.test(f.type); }, onFiles: list.add }),
    list.el, h('div', { 'class': 'tgrid2' }, [T.field('Convert to', fmt), qLabel]), T.row([go]), status.el, results.el]));
  function sync() { qLabel.hidden = fmt.value() === 'image/png'; }
  sync();

  T.convertImage = T.convertImage || function (file, type, quality, maxW, maxH) {
    return T.read(file, 'dataURL').then(function (url) {
      return new Promise(function (ok, fail) {
        var im = new Image();
        im.onload = function () {
          var w = im.naturalWidth || 800, hh = im.naturalHeight || 600, r = 1;
          if (maxW || maxH) r = Math.min(1, (maxW || Infinity) / w, (maxH || Infinity) / hh);
          var c = h('canvas'); c.width = Math.round(w * r); c.height = Math.round(hh * r);
          var x = c.getContext('2d');
          if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
          x.imageSmoothingQuality = 'high';
          x.drawImage(im, 0, 0, c.width, c.height);
          c.toBlob(function (b) { b ? ok({ blob: b, w: c.width, h: c.height }) : fail(new Error('This browser cannot save ' + type.split('/')[1].toUpperCase())); }, type, quality);
        };
        im.onerror = function () { fail(new Error(file.name + ' could not be opened.')); };
        im.src = url;
      });
    });
  };
  function run() {
    var files = list.files(), type = fmt.value(), ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type], out = [], i = 0;
    go.disabled = true;
    (function next() {
      if (i >= files.length) { results.set(out, 'converted-images'); status.ok(out.length + ' converted.'); go.disabled = false; return; }
      var f = files[i++];
      status.progress(i / files.length, 'Converting ' + f.name + '…');
      T.convertImage(f, type, q.value / 100).then(function (r) {
        out.push({ name: T.baseName(f.name) + '.' + ext, blob: r.blob, preview: URL.createObjectURL(r.blob), note: T.bytes(f.size) + ' → ' + T.bytes(r.blob.size) });
        next();
      }).catch(function (e) { status.error(e); go.disabled = false; });
    })();
  }
});
