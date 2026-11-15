/* Infinity by GroupChatOn — word-to-pdf. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Word to PDF: opens a .docx on your device, lays it out on A4 pages and saves a PDF, or prints it with selectable text (mammoth.js + html2canvas + pdf-lib). */
GCOTools.register('word-to-pdf', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  var MAMMOTH = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js', W = 650, K = (595.28 - 108) / 650, PAGE_H = Math.floor((841.89 - 108) / K);
  var CSS = '.wdoc{width:650px;background:#fff;color:#111;font:15px/1.55 Calibri,Carlito,"Segoe UI",Arial,sans-serif;overflow-wrap:break-word}.wdoc h1{font-size:27px;margin:0 0 12px}.wdoc h2{font-size:21px;margin:18px 0 8px}.wdoc h3{font-size:18px;margin:14px 0 6px}' +
    '.wdoc p{margin:0 0 10px}.wdoc table{border-collapse:collapse;width:100%;margin:0 0 12px}.wdoc td,.wdoc th{border:1px solid #9ca3af;padding:4px 6px;vertical-align:top}.wdoc img{max-width:100%;height:auto}.wdoc ul,.wdoc ol{margin:0 0 10px;padding-left:28px}';
  function toHtml(buf) {
    return T.loadScript(MAMMOTH).then(function () { return window.mammoth.convertToHtml({ arrayBuffer: buf }); }).then(function (r) {
      if (!r.value.trim()) throw new Error('This Word file looks empty, or it is an old .doc file. Open it in Word or Google Docs and save it as .docx first.');
      return r.value;
    }, function (e) { throw /zip|central directory|corrupt/i.test(e.message) ? new Error('This is not a .docx file. Old .doc files must be saved as .docx in Word or Google Docs first.') : e; });
  }
  // where to cut pages: under a line of text or a block, never through one
  function cuts(el, total) {
    var top = el.getBoundingClientRect().top, list = [], r = document.createRange(), walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = walk.nextNode())) { r.selectNodeContents(n); Array.prototype.forEach.call(r.getClientRects(), function (q) { list.push(q.bottom - top + 1); }); }
    Array.prototype.forEach.call(el.querySelectorAll('p,li,tr,img,h1,h2,h3,h4,h5,h6,table'), function (x) { list.push(x.getBoundingClientRect().bottom - top + 1); });
    list.sort(function (a, b) { return a - b; });
    var starts = [0], s = 0;
    while (s + PAGE_H < total) {
      var best = 0; list.forEach(function (c) { if (c > s + PAGE_H * 0.4 && c <= s + PAGE_H) best = c; });
      s = Math.ceil(best || s + PAGE_H); starts.push(s);
    }
    return starts;
  }
  function toPdf(html, prog) {
    var host = h('div', { style: 'position:absolute;left:-14000px;top:0;width:' + W + 'px' });
    host.innerHTML = '<style>' + CSS + '</style><div class="wdoc">' + html + '</div>';
    document.body.appendChild(host);
    var doc = host.lastChild;
    var imgs = Array.prototype.slice.call(doc.querySelectorAll('img')).map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); });
    return Promise.all(imgs).then(function () { return Promise.all([T.lib('html2canvas'), T.lib('pdflib')]); }).then(function (L) {
      var total = doc.scrollHeight, starts = cuts(doc, total);
      return L[1].PDFDocument.create().then(function (out) {
        var i = 0;
        function next() {
          if (i >= starts.length) return out.save().then(function (b) { return { bytes: b, pages: starts.length }; });
          var s = starts[i], e = i + 1 < starts.length ? starts[i + 1] : total; i++;
          if (prog) prog(i, starts.length);
          var win = h('div', { style: 'position:absolute;left:-14000px;top:0;width:' + W + 'px;height:' + Math.max(1, e - s) + 'px;overflow:hidden;background:#fff' });
          var inner = doc.cloneNode(true); inner.style.marginTop = -s + 'px';
          win.appendChild(inner); host.appendChild(win);
          return L[0](win, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true }).then(function (c) {
            win.remove();
            return T.canvasBlob(c, 'image/jpeg', 0.92).then(function (b) { return b.arrayBuffer(); });
          }).then(function (jb) { return out.embedJpg(jb); }).then(function (img) {
            var hp = (e - s) * K, page = out.addPage([595.28, 841.89]);
            page.drawImage(img, { x: 54, y: 841.89 - 54 - hp, width: W * K, height: hp });
            return next();
          });
        }
        return next();
      });
    }).then(function (r) { host.remove(); return r; }, function (e) { host.remove(); throw e; });
  }
  var lastHtml = '';
  function printIt() {
    if (!lastHtml) return;
    var fr = h('iframe', { style: 'position:fixed;width:0;height:0;border:0;right:0;bottom:0', title: 'Print' });
    document.body.appendChild(fr);
    var d = fr.contentDocument; d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + T.baseName(file ? file.name : 'document') + '</title><style>@page{size:A4;margin:19mm}body{margin:0}' + CSS.replace(/width:650px;/, '') + '</style></head><body><div class="wdoc">' + lastHtml + '</div></body></html>'); d.close();
    setTimeout(function () { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(function () { fr.remove(); }, 60000); }, 400);
  }
  var go = T.button('Convert to PDF', { primary: true, disabled: true, onclick: run }), pr = T.button('Print / Save as PDF (selectable text)', { small: true, disabled: true, onclick: printIt });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; lastHtml = ''; results.clear(); status.clear(); go.disabled = false; pr.disabled = true; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    go.disabled = true; status.progress(0.05, 'Opening the Word file…');
    T.read(file).then(toHtml).then(function (html) { lastHtml = html; pr.disabled = false; return toPdf(html, function (i, n) { status.progress(i / n, 'Laying out page ' + i + ' of ' + n + '…'); }); }).then(function (r) {
      results.set([{ name: T.baseName(file.name) + '.pdf', blob: new Blob([r.bytes], { type: 'application/pdf' }), note: r.pages + (r.pages === 1 ? ' page' : ' pages') }]);
      status.ok('Done! The PDF shows each page as a sharp picture. For text you can select and search, use Print / Save as PDF.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function sampleDocx(extra) {
    return T.lib('jszip').then(function (Z) {
      var z = new Z(), P = function (t, big) { return '<w:p><w:r>' + (big ? '<w:rPr><w:b/><w:sz w:val="40"/></w:rPr>' : '') + '<w:t xml:space="preserve">' + t + '</w:t></w:r></w:p>'; };
      var cell = function (t) { return '<w:tc><w:p><w:r><w:t>' + t + '</w:t></w:r></w:p></w:tc>'; };
      var body = P('Leave application', true) + P('To the Principal,') + P('I request leave from 10 to 12 March because of a family wedding. I will complete the missed work after I return.');
      for (var i = 0; i < (extra || 0); i++) body += P('Extra paragraph ' + (i + 1) + ': the quick brown fox jumps over the lazy dog, again and again, to fill the page with text.');
      body += '<w:tbl><w:tr>' + cell('Date') + cell('Reason') + '</w:tr><w:tr>' + cell('10 March') + cell('Wedding') + '</w:tr></w:tbl>' + P('Yours sincerely, Asha');
      z.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
      z.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
      z.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body + '</w:body></w:document>');
      return z.generateAsync({ type: 'arraybuffer' });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: '📄', label: 'Choose a Word file (.docx)', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    T.row([go, pr, T.button('Try a sample', { small: true, onclick: function () { sampleDocx(0).then(function (b) { take([new File([b], 'sample-leave-application.docx')]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['word-to-pdf'] = function () {
    var f = [];
    return sampleDocx(0).then(toHtml).then(function (html) {
      if (html.indexOf('Leave application') < 0 || html.indexOf('<table') < 0) f.push('html ' + html.slice(0, 80));
      return toPdf(html);
    }).then(function (r) { if (r.pages !== 1) f.push('short doc pages ' + r.pages); return sampleDocx(90); }).then(toHtml).then(toPdf).then(function (r) {
      return T.lib('pdflib').then(function (L) { return L.PDFDocument.load(r.bytes); }).then(function (d) { if (d.getPageCount() < 3 || d.getPageCount() !== r.pages) f.push('long doc pages ' + d.getPageCount()); });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
