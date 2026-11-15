/* Infinity by GroupChatOn — pdf-flatten. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Flatten a PDF: form answers, comments, stamps and drawings become part of the page, or the whole page becomes a picture (pdf-lib + pdf.js). */
GCOTools.register('pdf-flatten', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  function paintPage(P, doc, n, scale) {   // like T.renderPage, but filled-in form fields are drawn too
    return doc.getPage(n).then(function (page) {
      var vp = page.getViewport({ scale: scale }), c = h('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      return page.render({ canvasContext: g, viewport: vp, intent: 'print', annotationMode: P.AnnotationMode.ENABLE }).promise.then(function () { return c; });
    });
  }
  function nums(arr) { var out = []; for (var i = 0; i < arr.size(); i++) out.push(arr.lookup(i).asNumber()); return out; }
  // form fields + every annotation that has a look of its own (comments, highlights, stamps, ink) → ordinary page content; links stay clickable
  function flatVector(src) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.load(src).then(function (doc) {
        if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        var form = doc.getForm(), done = { fields: form.getFields().length, notes: 0 };
        try { form.flatten(); } catch (e) { form.flatten({ updateFieldAppearances: false }); }
        doc.getPages().forEach(function (page) {
          var annots = page.node.Annots(); if (!annots) return;
          var keep = [];
          for (var i = 0; i < annots.size(); i++) {
            var ref = annots.get(i), a = annots.lookup(i);
            if (!(a instanceof L.PDFDict)) continue;   // pdf-lib's form flatten deletes widgets but can leave their entry here
            var sub = String(a.get(L.PDFName.of('Subtype')) || '');
            if (sub === '/Link') { keep.push(ref); continue; }
            if (sub === '/Popup') continue;
            var flags = a.lookup(L.PDFName.of('F')), ap = a.lookup(L.PDFName.of('AP'));
            if (flags && flags.asNumber() & 2) continue;   // hidden
            var n = ap && ap.get(L.PDFName.of('N')), nObj = n && doc.context.lookup(n);
            if (nObj && !nObj.dict && nObj instanceof L.PDFDict) {   // one look per state (ticked / not ticked): use the current one
               var as = a.get(L.PDFName.of('AS')); n = as ? nObj.get(as) : null; nObj = n && doc.context.lookup(n); }
            if (!n || !nObj || !nObj.dict) { keep.push(ref); continue; }
            var sd = nObj.dict, bb = sd.lookup(L.PDFName.of('BBox')), mt = sd.lookup(L.PDFName.of('Matrix')), rect = nums(a.lookup(L.PDFName.of('Rect')));
            if (!bb) { keep.push(ref); continue; }
            var b = nums(bb), m = mt ? nums(mt) : [1, 0, 0, 1, 0, 0];
            var pts = [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(function (p) { return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]]; });
            var x0 = Math.min.apply(0, pts.map(function (p) { return p[0]; })), x1 = Math.max.apply(0, pts.map(function (p) { return p[0]; }));
            var y0 = Math.min.apply(0, pts.map(function (p) { return p[1]; })), y1 = Math.max.apply(0, pts.map(function (p) { return p[1]; }));
            var rx0 = Math.min(rect[0], rect[2]), ry0 = Math.min(rect[1], rect[3]), sx = (Math.abs(rect[2] - rect[0])) / ((x1 - x0) || 1), sy = (Math.abs(rect[3] - rect[1])) / ((y1 - y0) || 1);
            if (!sd.get(L.PDFName.of('Subtype'))) sd.set(L.PDFName.of('Subtype'), L.PDFName.of('Form'));
            var name = page.node.newXObject('FlatNote', n);
            page.pushOperators(L.pushGraphicsState(), L.concatTransformationMatrix(sx, 0, 0, sy, rx0 - x0 * sx, ry0 - y0 * sy), L.drawObject(name), L.popGraphicsState());
            done.notes++;
          }
          if (keep.length) page.node.set(L.PDFName.of('Annots'), doc.context.obj(keep)); else page.node.delete(L.PDFName.of('Annots'));
        });
        return doc.save().then(function (b) { return { bytes: b, done: done }; });
      });
    });
  }
  function flatImage(src, scale, prog) {
    return Promise.all([T.lib('pdfjs'), T.lib('pdflib')]).then(function (L) {
      return L[0].getDocument({ data: new Uint8Array(src).slice(0) }).promise.then(function (doc) {
        return L[1].PDFDocument.create().then(function (out) {
          var i = 0;
          function next() {
            if (i >= doc.numPages) return out.save().then(function (b) { return { bytes: b }; });
            i++; if (prog) prog(i, doc.numPages);
            return doc.getPage(i).then(function (pg) {
              var vp = pg.getViewport({ scale: 1 });
              return paintPage(L[0], doc, i, scale).then(function (c) { return T.canvasBlob(c, 'image/jpeg', 0.9).then(function (b) { c.width = 0; return b.arrayBuffer(); }); })
                .then(function (jb) { return out.embedJpg(jb); }).then(function (img) { out.addPage([vp.width, vp.height]).drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height }); return next(); });
            });
          }
          return next();
        });
      });
    }).catch(function (e) { if (/password/i.test(e.name + e.message)) throw new Error('This PDF is password-protected. Remove the password first.'); throw e; });
  }
  var mode = T.seg([['vector', 'Forms and comments'], ['image', 'Whole page as image']], 'vector', function () { hint.textContent = mode.value() === 'vector' ? 'Keeps text sharp and selectable. Form answers, comments, highlights, stamps and drawings become part of the page.' : 'The safest, most universal result: every page becomes one picture, exactly as it prints. Text can no longer be selected.'; });
  var hint = h('small', { 'class': 'tstatus', text: 'Keeps text sharp and selectable. Form answers, comments, highlights, stamps and drawings become part of the page.' });
  var go = T.button('Flatten PDF', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    go.disabled = true; status.progress(0.2, 'Flattening…');
    T.read(file).then(function (b) { return mode.value() === 'vector' ? flatVector(b) : flatImage(b, 2.78, function (i, n) { status.progress(i / n, 'Page ' + i + ' of ' + n + '…'); }); }).then(function (r) {
      results.set([{ name: T.baseName(file.name) + '-flattened.pdf', blob: new Blob([r.bytes], { type: 'application/pdf' }) }]);
      status.ok(r.done ? 'Done! ' + r.done.fields + (r.done.fields === 1 ? ' form field' : ' form fields') + ' and ' + r.done.notes + (r.done.notes === 1 ? ' comment or mark' : ' comments or marks') + ' are now part of the pages.' : 'Done! Every page is now a flat picture.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf() {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.create().then(function (d) {
        return d.embedFont(L.StandardFonts.Helvetica).then(function (f) {
          var p = d.addPage([595.28, 841.89]), form = d.getForm();
          p.drawText('Leave form (sample)', { x: 60, y: 770, size: 22, font: f });
          p.drawText('Name', { x: 60, y: 706, size: 12, font: f });
          var tf = form.createTextField('name'); tf.addToPage(p, { x: 130, y: 700, width: 260, height: 24 }); tf.setText('Asha Verma');
          var ap = d.context.register(d.context.stream('0 0.45 0.9 rg 0 0 120 50 re f', { Type: 'XObject', Subtype: 'Form', BBox: [0, 0, 120, 50] }));
          var note = d.context.register(d.context.obj({ Type: 'Annot', Subtype: 'Square', Rect: [300, 400, 420, 450], F: 4, AP: { N: ap }, Contents: L.PDFString.of('Approved') }));
          p.node.addAnnot(note);
          return d.save();
        });
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🧱', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    T.field('What to flatten', mode), hint,
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { samplePdf().then(function (b) { take([new File([b], 'sample-leave-form.pdf', { type: 'application/pdf' })]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-flatten'] = function () {
    var f = [];
    function pixel(bytes, x, y) { return T.lib('pdfjs').then(function (P) { return P.getDocument({ data: bytes.slice(0) }).promise.then(function (d) { return paintPage(P, d, 1, 1); }); }).then(function (c) { return c.getContext('2d').getImageData(x, Math.round(841.89 - y), 1, 1).data; }); }
    return samplePdf().then(function (src) {
      return flatVector(src).then(function (r) {
        if (r.done.fields !== 1 || r.done.notes !== 1) f.push('counted ' + JSON.stringify(r.done));
        return T.lib('pdflib').then(function (L) { return L.PDFDocument.load(r.bytes).then(function (d) {
          if (d.getForm().getFields().length) f.push('fields left');
          if (d.getPage(0).node.Annots()) f.push('annotations left');
        }); }).then(function () { return pixel(r.bytes, 360, 425); }).then(function (px) { if (px[2] < 180 || px[0] > 60) f.push('square not drawn: ' + px[0] + ',' + px[2]); });
      }).then(function () { return flatImage(src, 1); }).then(function (r) { return pixel(r.bytes, 360, 425); }).then(function (px) { if (px[2] < 160 || px[0] > 80) f.push('image mode lost the square'); });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
