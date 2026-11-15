/* Image Compressor & Resizer — smaller photos with a size limit, quality and format choice.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('image-compress', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  var go = T.button('Compress', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = !f.length; results.clear(); });
  var maxSide = T.select([[0, 'Keep original size'], [3840, '3840 px (4K)'], [2560, '2560 px'], [1920, '1920 px (Full HD)'], [1280, '1280 px'], [1080, '1080 px (Instagram)'], [800, '800 px'], [640, '640 px']], 1920);
  var fmt = T.select([['same', 'Same as original'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP (smallest)']], 'same');
  var q = h('input', { type: 'range', min: '30', max: '95', value: '75' });
  var qf = T.field('Quality: 75%', q, 'Around 70–80% looks the same to the eye and saves the most.');
  q.addEventListener('input', function () { qf.firstChild.textContent = 'Quality: ' + q.value + '%'; });
  spot.appendChild(T.card([
    T.dropzone({ accept: 'image/jpeg,image/png,image/webp', multiple: true, paste: true, icon: '🗜️', label: 'Choose photos', hint: 'JPG, PNG or WebP · nothing is uploaded',
      filter: function (f) { return /^image\/(jpeg|png|webp)$/.test(f.type); }, onFiles: list.add }),
    list.el, h('div', { 'class': 'tgrid2' }, [T.field('Longest side', maxSide), T.field('Format', fmt), qf]), T.row([go]), status.el, results.el]));

  function encode(file, type, quality, max) {
    return T.read(file, 'dataURL').then(function (url) {
      return new Promise(function (ok, fail) {
        var im = new Image();
        im.onload = function () {
          var r = max ? Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)) : 1;
          var c = h('canvas'); c.width = Math.round(im.naturalWidth * r); c.height = Math.round(im.naturalHeight * r);
          var x = c.getContext('2d');
          if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
          x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, c.width, c.height);
          c.toBlob(function (b) { b ? ok({ blob: b, w: c.width, h: c.height }) : fail(new Error('Could not save ' + file.name)); }, type, quality);
        };
        im.onerror = function () { fail(new Error(file.name + ' could not be opened.')); };
        im.src = url;
      });
    });
  }
  function run() {
    var files = list.files(), out = [], i = 0, before = 0, after = 0;
    go.disabled = true;
    (function next() {
      if (i >= files.length) {
        results.set(out, 'compressed-images');
        var saved = before ? Math.round((1 - after / before) * 100) : 0;
        status.ok('Done! ' + T.bytes(before) + ' → ' + T.bytes(after) + (saved > 0 ? ' (' + saved + '% smaller)' : '') + '.' +
          (saved < 5 && files.some(function (f) { return f.type === 'image/png'; }) && fmt.value === 'same' ? ' PNG is lossless, so it barely shrinks: choose JPG or WebP as the format for a much smaller file.' : ''));
        go.disabled = false; return;
      }
      var f = files[i++];
      // PNG stays PNG when "same" is picked only if it has to; photos compress far better as JPG/WebP
      var type = fmt.value === 'same' ? (f.type === 'image/png' ? 'image/png' : f.type) : fmt.value;
      status.progress(i / files.length, 'Compressing ' + f.name + '…');
      encode(f, type, q.value / 100, +maxSide.value).then(function (r) {
        var blob = r.blob.size < f.size || +maxSide.value ? r.blob : f;   // never hand back a bigger file at the same size
        before += f.size; after += blob.size;
        var ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[blob.type] || 'jpg';
        out.push({ name: T.baseName(f.name) + '-small.' + ext, blob: blob, preview: URL.createObjectURL(blob),
          note: T.bytes(f.size) + ' → ' + T.bytes(blob.size) + ' · ' + r.w + '×' + r.h });
        next();
      }).catch(function (e) { status.error(e); go.disabled = false; });
    })();
  }
});
