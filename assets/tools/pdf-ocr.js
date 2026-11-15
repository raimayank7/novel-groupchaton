/* Infinity by GroupChatOn — pdf-ocr. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Make a scanned PDF searchable: OCR reads each page on your device and lays invisible, selectable text over it (tesseract.js + pdf.js + pdf-lib). */
GCOTools.register('pdf-ocr', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, worker = null, workerLang = '';
  function spotOn(L, page) {
    var b = page.getCropBox(), r = ((page.getRotation().angle % 360) + 360) % 360, W = b.width, H = b.height, x = 0, y = 0;
    if (r === 90) { x = W; } else if (r === 180) { x = W; y = H; } else if (r === 270) { y = H; }
    return { x: b.x + x, y: b.y + y, rotate: L.degrees(r), w: r % 180 ? H : W, h: r % 180 ? W : H };
  }
  function getWorker(lang, log) {
    if (worker && workerLang === lang) return Promise.resolve(worker);
    return (worker ? worker.terminate() : Promise.resolve()).then(function () { return T.lib('tesseract'); }).then(function (Tess) {
      return Tess.createWorker(lang, 1, { logger: log });
    }).then(function (w) { worker = w; workerLang = lang; return w.setParameters({ textonly_pdf: '1' }).then(function () { return w; }); });
  }
  // o: { lang, scale, skipText, pages } → { bytes, done: pages read, kept: pages that already had text }
  function ocr(src, o, prog) {
    return Promise.all([T.lib('pdfjs'), T.lib('pdflib')]).then(function (L) {
      return Promise.all([L[0].getDocument({ data: new Uint8Array(src).slice(0) }).promise, L[1].PDFDocument.load(src)]).then(function (r) {
        var doc = r[0], out = r[1], list = o.pages ? T.parseRanges(o.pages, doc.numPages) : T.parseRanges('1-', doc.numPages), i = 0, res = { done: 0, kept: 0 };
        if (out.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        return getWorker(o.lang, function (m) { if (prog && /load|initial/.test(m.status)) prog(0, 'Loading the text reader and ' + o.lang + ' language data…'); }).then(function (w) {
          function next() {
            if (i >= list.length) return out.save().then(function (b) { res.bytes = b; return res; });
            var n = list[i++];
            if (prog) prog((i - 0.5) / list.length, 'Reading page ' + n + ' (' + i + ' of ' + list.length + ')…');
            return doc.getPage(n).then(function (pg) { return o.skipText ? pg.getTextContent() : { items: [] }; }).then(function (tc) {
              if (tc.items.map(function (x) { return x.str; }).join('').replace(/\s/g, '').length > 25) { res.kept++; return next(); }
              return T.renderPage(doc, n, o.scale).then(function (c) { return w.recognize(c, {}, { pdf: true, text: false }).then(function (rr) { c.width = 0; return rr; }); }).then(function (rr) {
                return out.embedPdf(rr.data.pdf, [0]).then(function (emb) {
                  var page = out.getPage(n - 1), s = spotOn(L[1], page);
                  page.drawPage(emb[0], { x: s.x, y: s.y, width: s.w, height: s.h, rotate: s.rotate });
                  res.done++; return next();
                });
              });
            });
          }
          return next();
        });
      });
    }).catch(function (e) { if (/password/i.test(e.name + e.message)) throw new Error('This PDF is password-protected. Remove the password first.'); throw e; });
  }
  var lang = T.select([['eng', 'English'], ['hin', 'Hindi'], ['pan', 'Punjabi'], ['eng+hin', 'English + Hindi'], ['ben', 'Bengali'], ['tam', 'Tamil'], ['tel', 'Telugu'], ['mar', 'Marathi'], ['guj', 'Gujarati'], ['urd', 'Urdu'],
    ['spa', 'Spanish'], ['fra', 'French'], ['deu', 'German'], ['por', 'Portuguese'], ['ara', 'Arabic'], ['chi_sim', 'Chinese (Simplified)'], ['jpn', 'Japanese'], ['kor', 'Korean']], 'eng');
  var quality = T.select([[2.78, 'Normal (200 dpi)'], [4.17, 'Small print (300 dpi)']], 2.78), pages = h('input', { type: 'text', placeholder: 'All pages' }), skip = h('input', { type: 'checkbox', checked: true });
  var go = T.button('Make searchable', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    go.disabled = true; status.progress(0, 'Starting…');
    T.read(file).then(function (b) { return ocr(b, { lang: lang.value, scale: +quality.value, skipText: skip.checked, pages: pages.value.trim() }, function (p, t) { status.progress(p, t); }); }).then(function (r) {
      if (!r.done) { status.info(r.kept ? 'Every page already has text you can search, so nothing needed reading. Untick “Skip pages that already have text” to read them anyway.' : 'No pages were read.'); return; }
      results.set([{ name: T.baseName(file.name) + '-searchable.pdf', blob: new Blob([r.bytes], { type: 'application/pdf' }), note: r.done + (r.done === 1 ? ' page read' : ' pages read') }]);
      status.ok('Done! ' + r.done + (r.done === 1 ? ' page is' : ' pages are') + ' now searchable' + (r.kept ? ' (' + r.kept + ' already were)' : '') + '. Try Ctrl+F or select text in any PDF reader.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf() {   // a "scan": a picture of text, with no text inside the PDF
    var c = h('canvas'); c.width = 1240; c.height = 900; var g = c.getContext('2d');
    g.fillStyle = '#fbfaf5'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#111'; g.font = 'bold 64px Arial, sans-serif'; g.fillText('HELLO OCR 2026', 90, 160);
    g.font = '40px Georgia, serif'; ['Invoice number 4711', 'Paid in full on 3 March', 'Thank you for your business'].forEach(function (t, i) { g.fillText(t, 90, 300 + i * 90); });
    return Promise.all([T.lib('pdflib'), T.canvasBlob(c, 'image/jpeg', 0.9).then(function (b) { return b.arrayBuffer(); })]).then(function (r) {
      return r[0].PDFDocument.create().then(function (d) { return d.embedJpg(r[1]).then(function (img) { d.addPage([595.28, 432]).drawImage(img, { x: 0, y: 0, width: 595.28, height: 432 }); return d.save(); }); });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🔎', label: 'Choose a scanned PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    h('div', { 'class': 'tgrid2' }, [T.field('Language of the text', lang), T.field('Quality', quality), T.field('Pages (optional)', pages, 'e.g. 1-5. Empty = all pages.'), h('label', { 'class': 'tcheck' }, [skip, ' Skip pages that already have text'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { samplePdf().then(function (b) { take([new File([b], 'sample-scan.pdf', { type: 'application/pdf' })]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-ocr'] = function () {
    var f = [];
    return samplePdf().then(function (src) { return ocr(src, { lang: 'eng', scale: 2.78, skipText: true, pages: '' }); }).then(function (r) {
      if (r.done !== 1) f.push('pages read ' + r.done);
      return T.lib('pdfjs').then(function (P) { return P.getDocument({ data: r.bytes.slice(0) }).promise; }).then(function (d) { return d.getPage(1); }).then(function (p) { return p.getTextContent(); }).then(function (tc) {
        var t = tc.items.map(function (i) { return i.str; }).join(' ');
        if (!/HELLO/.test(t) || !/4711/.test(t)) f.push('text layer: ' + t.slice(0, 80));
        return ocr(r.bytes, { lang: 'eng', scale: 2.78, skipText: true, pages: '' });
      }).then(function (again) { if (again.done !== 0 || again.kept !== 1) f.push('searchable page not skipped'); });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
