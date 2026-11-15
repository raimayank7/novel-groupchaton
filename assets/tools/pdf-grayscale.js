/* Infinity by GroupChatOn — pdf-grayscale. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* PDF to black and white: grayscale, or crisp pure black and white for scans, to save colour ink (pdf.js + pdf-lib). */
GCOTools.register('pdf-grayscale', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  function paintPage(P, doc, n, scale) {   // like T.renderPage, but filled-in form fields are drawn too
    return doc.getPage(n).then(function (page) {
      var vp = page.getViewport({ scale: scale }), c = h('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      return page.render({ canvasContext: g, viewport: vp, intent: 'print', annotationMode: P.AnnotationMode.ENABLE }).promise.then(function () { return c; });
    });
  }
  function toGray(c, bw, cut) {
    var g = c.getContext('2d'), id = g.getImageData(0, 0, c.width, c.height), d = id.data;
    for (var i = 0; i < d.length; i += 4) { var y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; if (bw) y = y < cut ? 0 : 255; d[i] = d[i + 1] = d[i + 2] = y; }
    g.putImageData(id, 0, 0); return c;
  }
  // o: { bw: pure black and white, cut: 0–255 threshold, scale }
  function convert(src, o, prog) {
    return Promise.all([T.lib('pdfjs'), T.lib('pdflib')]).then(function (L) {
      return L[0].getDocument({ data: new Uint8Array(src).slice(0) }).promise.then(function (doc) {
        return L[1].PDFDocument.create().then(function (out) {
          var i = 0;
          function next() {
            if (i >= doc.numPages) return out.save();
            i++; if (prog) prog(i, doc.numPages);
            return doc.getPage(i).then(function (pg) {
              var vp = pg.getViewport({ scale: 1 });
              return paintPage(L[0], doc, i, o.scale).then(function (c) { return T.canvasBlob(toGray(c, o.bw, o.cut), 'image/jpeg', o.bw ? 0.9 : 0.85).then(function (b) { c.width = 0; return b.arrayBuffer(); }); })
                .then(function (jb) { return out.embedJpg(jb); }).then(function (img) { out.addPage([vp.width, vp.height]).drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height }); return next(); });
            });
          }
          return next();
        });
      });
    }).catch(function (e) { if (/password/i.test(e.name + e.message)) throw new Error('This PDF is password-protected. Remove the password first.'); throw e; });
  }
  var mode = T.seg([['gray', 'Grayscale'], ['bw', 'Black & white']], 'gray', function () { cutF.hidden = mode.value() !== 'bw'; });
  var cut = h('input', { type: 'range', min: '80', max: '220', value: '160' }), cutF = T.field('Darkness cut-off (lighter ↔ darker)', cut);
  var quality = T.select([[2.08, 'Normal (150 dpi)'], [2.78, 'Sharp (200 dpi)'], [4.17, 'Print (300 dpi)']], 2.08);
  var go = T.button('Convert', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    go.disabled = true; status.progress(0, 'Converting…');
    T.read(file).then(function (b) { return convert(b, { bw: mode.value() === 'bw', cut: +cut.value, scale: +quality.value }, function (i, n) { status.progress(i / n, 'Converting page ' + i + ' of ' + n + '…'); }); }).then(function (out) {
      results.set([{ name: T.baseName(file.name) + (mode.value() === 'bw' ? '-black-white' : '-grayscale') + '.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      status.ok('Done! ' + T.bytes(file.size) + ' → ' + T.bytes(out.length) + '.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf() {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.create().then(function (d) {
        return d.embedFont(L.StandardFonts.HelveticaBold).then(function (f) {
          var p = d.addPage([595.28, 841.89]);
          p.drawRectangle({ x: 60, y: 600, width: 300, height: 150, color: L.rgb(0.9, 0.1, 0.2) });
          p.drawRectangle({ x: 60, y: 420, width: 300, height: 150, color: L.rgb(0.1, 0.5, 0.9) });
          p.drawText('Colourful flyer (sample)', { x: 60, y: 780, size: 22, font: f, color: L.rgb(0.1, 0.6, 0.2) });
          return d.save();
        });
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🖤', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    T.field('Style', mode), cutF, T.field('Quality', quality),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { samplePdf().then(function (b) { take([new File([b], 'sample-flyer.pdf', { type: 'application/pdf' })]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  cutF.hidden = true;
  T.tests['pdf-grayscale'] = function () {
    var f = [], c = h('canvas'); c.width = 2; c.height = 1; var g = c.getContext('2d'); g.fillStyle = '#ff0000'; g.fillRect(0, 0, 1, 1); g.fillStyle = '#ffff00'; g.fillRect(1, 0, 1, 1);
    var d = toGray(c, false).getContext('2d').getImageData(0, 0, 2, 1).data;
    if (Math.abs(d[0] - 76) > 1 || d[0] !== d[1] || Math.abs(d[4] - 226) > 1) f.push('gray values ' + d[0] + ',' + d[4]);
    return samplePdf().then(function (b) { return convert(b, { bw: false, cut: 160, scale: 1 }); }).then(function (out) {
      return T.lib('pdfjs').then(function (P) { return P.getDocument({ data: out.slice(0) }).promise; }).then(function (doc) { return T.renderPage(doc, 1, 1); }).then(function (cv) {
        var px = cv.getContext('2d').getImageData(200, Math.round(841.89 - 680), 1, 1).data;   // inside the red box
        if (Math.abs(px[0] - px[1]) > 4 || Math.abs(px[1] - px[2]) > 4 || px[0] > 120) f.push('not gray: ' + px[0] + ',' + px[1] + ',' + px[2]);
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 2, fails: f }; });
  };
});
