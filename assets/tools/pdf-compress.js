/* Infinity by GroupChatOn — pdf-compress. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Compress PDF: a light tidy-up that keeps text sharp, or stronger levels that redraw each page as a JPEG at a lower resolution (pdf-lib + pdf.js). */
GCOTools.register('pdf-compress', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  function paintPage(P, doc, n, scale) {   // like T.renderPage, but filled-in form fields are drawn too
    return doc.getPage(n).then(function (page) {
      var vp = page.getViewport({ scale: scale }), c = h('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      return page.render({ canvasContext: g, viewport: vp, intent: 'print', annotationMode: P.AnnotationMode.ENABLE }).promise.then(function () { return c; });
    });
  }
  var LEVELS = { strong: [1.6, 0.62], max: [1.15, 0.45] };   // [scale (× 72 dpi), JPEG quality]
  var NOTES = { light: 'Keeps text selectable: re-packs the file. Best for PDFs made on a computer.',
    strong: 'Redraws every page as a sharp picture (about 115 dpi). Big savings on scans and photo-heavy PDFs; text can no longer be selected.',
    max: 'About 80 dpi and stronger JPEG: the smallest file, still easy to read on a screen.' };
  var hint = h('small', { 'class': 'tstatus' });
  var level = T.seg([['light', 'Light'], ['strong', 'Strong'], ['max', 'Smallest']], 'strong', function () { hint.textContent = NOTES[level.value()]; });
  hint.textContent = NOTES.strong;
  function light(bytes) {
    return T.lib('pdflib').then(function (L) { return L.PDFDocument.load(bytes); }).then(function (d) {
      if (d.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
      return d.save({ useObjectStreams: true });
    });
  }
  function raster(bytes, sc, q, prog) {
    return Promise.all([T.lib('pdfjs'), T.lib('pdflib')]).then(function (L) {
      return L[0].getDocument({ data: bytes.slice(0) }).promise.then(function (pdf) {
        return L[1].PDFDocument.create().then(function (out) {
          var i = 0;
          function next() {
            if (i >= pdf.numPages) return out.save();
            i++; if (prog) prog(i, pdf.numPages);
            return pdf.getPage(i).then(function (pg) {
              var vp = pg.getViewport({ scale: 1 });
              return paintPage(L[0], pdf, i, sc).then(function (c) {
                return T.canvasBlob(c, 'image/jpeg', q).then(function (b) { c.width = 0; return b.arrayBuffer(); });
              }).then(function (jb) { return out.embedJpg(jb); }).then(function (img) {
                out.addPage([vp.width, vp.height]).drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
                return next();
              });
            });
          }
          return next();
        });
      });
    }).catch(function (e) { if (/password/i.test(e.name + e.message)) throw new Error('This PDF is password-protected. Remove the password first.'); throw e; });
  }
  function squeeze(bytes, lv, prog) { return lv === 'light' ? light(bytes) : raster(bytes, LEVELS[lv][0], LEVELS[lv][1], prog); }
  function sample() {
    return T.lib('pdflib').then(function (L) {
      var c = h('canvas'); c.width = 900; c.height = 640; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 900, 640);
      gr.addColorStop(0, '#0ea5e9'); gr.addColorStop(1, '#f97316'); g.fillStyle = gr; g.fillRect(0, 0, 900, 640);
      var id = g.getImageData(0, 0, 900, 640), d = id.data;
      for (var i = 0; i < d.length; i += 4) { var n = (Math.sin(i * 12.9898) * 43758.5453) % 1 * 40; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      g.putImageData(id, 0, 0);
      return T.canvasBlob(c, 'image/png').then(function (b) { return b.arrayBuffer(); }).then(function (png) {
        return L.PDFDocument.create().then(function (doc) {
          return Promise.all([doc.embedPng(png), doc.embedFont(L.StandardFonts.HelveticaBold)]).then(function (r) {
            for (var p = 1; p <= 2; p++) {
              var pg = doc.addPage([595.28, 841.89]);
              pg.drawText('Sample photo report, page ' + p, { x: 50, y: 780, size: 22, font: r[1] });
              pg.drawImage(r[0], { x: 50, y: 300, width: 495, height: 352 });
            }
            return doc.save();
          });
        });
      }).then(function (b) { return new File([b], 'sample-photo-report.pdf', { type: 'application/pdf' }); });
    });
  }
  var go = T.button('Compress PDF', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    go.disabled = true; results.clear(); status.progress(0.02, 'Reading ' + file.name + '…');
    T.read(file).then(function (buf) {
      return squeeze(new Uint8Array(buf), level.value(), function (i, n) { status.progress(i / n, 'Compressing page ' + i + ' of ' + n + '…'); });
    }).then(function (out) {
      var before = file.size, after = out.length, pct = Math.round((1 - after / before) * 100);
      if (after >= before * 0.98) { status.info('This PDF is already well compressed: this level would not make it smaller. ' + (level.value() === 'light' ? 'Try Strong.' : 'Your original is the best version.')); return; }
      results.set([{ name: T.baseName(file.name) + '-compressed.pdf', blob: new Blob([out], { type: 'application/pdf' }), note: pct + '% smaller' }]);
      status.ok('Done! ' + T.bytes(before) + ' → ' + T.bytes(after) + ' (' + pct + '% smaller).');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🗜️', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    T.field('Compression', level), hint, T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { take([f]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-compress'] = function () {
    var f = [];
    return sample().then(function (s) { return T.read(s); }).then(function (buf) {
      var src = new Uint8Array(buf);
      return squeeze(src, 'strong').then(function (out) {
        if (!(out.length < src.length * 0.7)) f.push('strong not smaller: ' + src.length + ' → ' + out.length);
        return T.lib('pdflib').then(function (L) { return L.PDFDocument.load(out); }).then(function (d) { if (d.getPageCount() !== 2) f.push('pages ' + d.getPageCount()); });
      }).then(function () { return squeeze(src, 'light'); }).then(function (out) { if (!(out.length > 1000)) f.push('light empty'); });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
