/* Image to PDF — one page per image, in the chosen order (jsPDF). Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('image-to-pdf', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  var go = T.button('Make PDF', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = !f.length; results.clear(); });
  var size = T.select([['fit', 'Same as image'], ['a4', 'A4'], ['letter', 'Letter']], 'a4');
  var orient = T.select([['auto', 'Automatic'], ['p', 'Portrait'], ['l', 'Landscape']], 'auto');
  var margin = T.select([[0, 'No margin'], [20, 'Small'], [40, 'Large']], 20);
  spot.appendChild(T.card([
    T.dropzone({ accept: 'image/*', multiple: true, paste: true, icon: '📄', label: 'Choose images', hint: 'JPG, PNG, WebP… drag them here or paste a screenshot',
      filter: function (f) { return /^image\//.test(f.type); }, onFiles: list.add }),
    list.el,
    h('div', { 'class': 'tgrid2' }, [T.field('Page size', size), T.field('Orientation', orient), T.field('Margin', margin)]),
    T.row([go]), status.el, results.el]));

  function loadImg(file) {
    return T.read(file, 'dataURL').then(function (url) {
      return new Promise(function (ok, fail) {
        var im = new Image();
        im.onload = function () {
          // re-encode as JPEG on a white background (handles PNG transparency, WebP, HEIC-as-JPEG…)
          var c = h('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
          var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0);
          ok({ data: c.toDataURL('image/jpeg', 0.92), w: c.width, h: c.height });
        };
        im.onerror = function () { fail(new Error(file.name + ' is not an image this browser can open.')); };
        im.src = url;
      });
    });
  }
  function run() {
    var files = list.files(); go.disabled = true;
    T.lib('jspdf').then(function (lib) {
      var JsPDF = lib.jsPDF, pdf = null, i = 0, m = +margin.value;
      function next() {
        if (i >= files.length) return pdf;
        var f = files[i++];
        status.progress(i / files.length, 'Adding ' + f.name + '…');
        return loadImg(f).then(function (im) {
          var land = orient.value === 'auto' ? im.w > im.h : orient.value === 'l';
          var fmtv = size.value === 'fit' ? [im.w * 0.75 + m * 2, im.h * 0.75 + m * 2] : size.value;
          var o = size.value === 'fit' ? (im.w > im.h ? 'l' : 'p') : (land ? 'l' : 'p');
          if (!pdf) pdf = new JsPDF({ orientation: o, unit: 'pt', format: fmtv });
          else pdf.addPage(fmtv, o);
          var pw = pdf.internal.pageSize.getWidth() - m * 2, ph = pdf.internal.pageSize.getHeight() - m * 2;
          var r = Math.min(pw / im.w, ph / im.h), w = im.w * r, hh = im.h * r;
          pdf.addImage(im.data, 'JPEG', m + (pw - w) / 2, m + (ph - hh) / 2, w, hh);
          return next();
        });
      }
      return next();
    }).then(function (pdf) {
      var blob = pdf.output('blob');
      results.set([{ name: 'images.pdf', blob: blob, note: files.length + ' pages' }]);
      status.ok('Done! Your PDF has ' + files.length + ' pages.');
    }).catch(status.error).then(function () { go.disabled = !list.files().length; });
  }
});
