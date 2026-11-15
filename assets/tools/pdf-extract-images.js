/* Infinity by GroupChatOn — pdf-extract-images. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Extract images from a PDF: every photo and picture inside, saved as PNG or JPG, with repeats and tiny icons skipped (pdf.js). */
GCOTools.register('pdf-extract-images', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  function canvasOf(img) {
    if (!img || !img.width || !img.height) return null;
    var c = h('canvas'); c.width = img.width; c.height = img.height; var g = c.getContext('2d');
    if (img.bitmap) { g.drawImage(img.bitmap, 0, 0); return c; }
    if (!img.data) return null;
    var id = g.createImageData(img.width, img.height), d = id.data, s = img.data, n = img.width * img.height, i, j;
    if (img.kind === 3) d.set(s.subarray(0, n * 4));
    else if (img.kind === 2) for (i = 0, j = 0; i < n; i++, j += 3) { d[i * 4] = s[j]; d[i * 4 + 1] = s[j + 1]; d[i * 4 + 2] = s[j + 2]; d[i * 4 + 3] = 255; }
    else { var row = (img.width + 7) >> 3; for (var y = 0; y < img.height; y++) for (var x = 0; x < img.width; x++) { var v = (s[y * row + (x >> 3)] >> (7 - (x & 7))) & 1 ? 255 : 0, o = (y * img.width + x) * 4; d[o] = d[o + 1] = d[o + 2] = v; d[o + 3] = 255; } }
    g.putImageData(id, 0, 0); return c;
  }
  function sig(c) {   // a cheap fingerprint so the same picture used on many pages is saved once
    var g = c.getContext('2d'), w = c.width, hh = c.height, s = w + 'x' + hh;
    for (var i = 1; i <= 24; i++) { var p = g.getImageData(Math.floor(w * (i * 0.618 % 1)), Math.floor(hh * (i * 0.382 % 1)), 1, 1).data; s += ',' + p[0] + p[1] + p[2]; }
    return s;
  }
  function getObj(page, id) {
    return new Promise(function (ok) {
      var store = id.indexOf('g_') === 0 ? page.commonObjs : page.objs, done = false, t = setTimeout(function () { if (!done) ok(null); }, 4000);
      try { store.get(id, function (o) { done = true; clearTimeout(t); ok(o); }); } catch (e) { clearTimeout(t); ok(null); }
    });
  }
  // [{ canvas, page }] for every image of the PDF (bytes)
  function extract(src, minSize, prog) {
    return T.lib('pdfjs').then(function (P) {
      return P.getDocument({ data: new Uint8Array(src).slice(0) }).promise.then(function (doc) {
        var out = [], seen = {}, n = 0;
        function next() {
          if (n >= doc.numPages) return out;
          n++; if (prog) prog(n, doc.numPages);
          return doc.getPage(n).then(function (page) {
            return page.getOperatorList().then(function (ops) {
              var found = [];
              ops.fnArray.forEach(function (fn, i) {
                if (fn === P.OPS.paintImageXObject || fn === P.OPS.paintImageXObjectRepeat) found.push(getObj(page, ops.argsArray[i][0]));
                else if (fn === P.OPS.paintInlineImageXObject) found.push(Promise.resolve(ops.argsArray[i][0]));
              });
              return Promise.all(found);
            }).then(function (imgs) {
              imgs.forEach(function (im) {
                var c = canvasOf(im); if (!c || c.width < minSize || c.height < minSize) return;
                var k = sig(c); if (seen[k]) return; seen[k] = 1; out.push({ canvas: c, page: n });
              });
              return next();
            });
          });
        }
        return next();
      });
    }).catch(function (e) { if (/password/i.test(e.name + e.message)) throw new Error('This PDF is password-protected. Remove the password first.'); throw e; });
  }
  var fmt = T.seg([['image/png', 'PNG'], ['image/jpeg', 'JPG']], 'image/png'), tiny = h('input', { type: 'checkbox', checked: true });
  var go = T.button('Extract images', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    go.disabled = true; results.clear(); status.progress(0, 'Looking for images…');
    var type = fmt.value(), ext = type === 'image/png' ? 'png' : 'jpg', base = T.baseName(file.name);
    T.read(file).then(function (b) { return extract(b, tiny.checked ? 24 : 1, function (i, n) { status.progress(i / n, 'Searching page ' + i + ' of ' + n + '…'); }); }).then(function (list) {
      if (!list.length) { status.info('No pictures found in this PDF. If it is a scan, use PDF to JPG to save whole pages instead.'); return; }
      var count = {};
      return Promise.all(list.map(function (x) {
        var c = x.canvas;
        if (type === 'image/jpeg') { var w = h('canvas'); w.width = c.width; w.height = c.height; var g = w.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w.width, w.height); g.drawImage(c, 0, 0); c = w; }
        return T.canvasBlob(c, type, 0.92).then(function (b) {
          count[x.page] = (count[x.page] || 0) + 1;
          var th = h('canvas'); th.width = 96; th.height = Math.max(1, Math.round(96 * c.height / c.width)); th.getContext('2d').drawImage(c, 0, 0, th.width, th.height);
          return { name: base + '-page' + x.page + '-image' + count[x.page] + '.' + ext, blob: b, preview: th.toDataURL('image/jpeg', 0.7), note: c.width + ' × ' + c.height };
        });
      })).then(function (items) { results.set(items, base + '-images'); status.ok('Found ' + items.length + (items.length === 1 ? ' image.' : ' images.')); });
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf() {
    return T.lib('pdflib').then(function (L) {
      function pic(w, hh, a, b) { var c = h('canvas'); c.width = w; c.height = hh; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, w, hh); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, w, hh); g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, hh / 2, Math.min(w, hh) / 4, 0, 7); g.fill(); return T.canvasBlob(c, 'image/png').then(function (x) { return x.arrayBuffer(); }); }
      return Promise.all([pic(320, 200, '#f97316', '#db2777'), pic(240, 240, '#0ea5e9', '#22c55e'), L.PDFDocument.create()]).then(function (r) {
        var d = r[2];
        return Promise.all([d.embedPng(r[0]), d.embedPng(r[1]), d.embedFont(L.StandardFonts.Helvetica)]).then(function (e) {
          var p1 = d.addPage([595.28, 841.89]); p1.drawText('Travel brochure (sample)', { x: 60, y: 770, size: 22, font: e[2] });
          p1.drawImage(e[0], { x: 60, y: 450, width: 320, height: 200 }); p1.drawImage(e[1], { x: 60, y: 150, width: 240, height: 240 });
          d.addPage([595.28, 841.89]).drawImage(e[0], { x: 60, y: 450, width: 160, height: 100 });   // the same photo again: saved once
          return d.save();
        });
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🖼️', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    h('div', { 'class': 'tgrid2' }, [T.field('Save as', fmt), h('label', { 'class': 'tcheck' }, [tiny, ' Skip tiny images (lines, bullets, icons)'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { samplePdf().then(function (b) { take([new File([b], 'sample-brochure.pdf', { type: 'application/pdf' })]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-extract-images'] = function () {
    var f = [];
    return samplePdf().then(function (b) { return extract(b, 24); }).then(function (list) {
      var dims = list.map(function (x) { return x.canvas.width + 'x' + x.canvas.height; }).sort().join(',');
      if (dims !== '240x240,320x200') f.push('found ' + dims);
      var c = list.filter(function (x) { return x.canvas.width === 320; })[0];
      if (c) { var px = c.canvas.getContext('2d').getImageData(160, 100, 1, 1).data; if (px[0] < 240 || px[1] < 240) f.push('pixels ' + px[0] + ',' + px[1]); }
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 2, fails: f }; });
  };
});
