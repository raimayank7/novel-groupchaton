/* Infinity by GroupChatOn — pdf-to-word. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* PDF to Word: rebuilds paragraphs, headings, bold and page breaks as an editable .docx, or places each page as a picture for an exact look (pdf.js + JSZip). */
GCOTools.register('pdf-to-word', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ''); }
  // one page's text items → paragraphs [{ runs: [{ t, b, i, size }], size, center }]
  function paragraphs(items, fontOf, pageW) {
    var runs = [];
    items.forEach(function (it) {
      if (!it.str || !it.transform) return;
      var t = it.transform, size = Math.hypot(t[2], t[3]) || 10, name = fontOf(it.fontName);
      runs.push({ t: it.str, x: t[4], y: t[5], w: it.width || 0, size: size, b: /bold|black|heavy|semibold|demi/i.test(name), i: /italic|oblique/i.test(name) });
    });
    runs.sort(function (a, b) { return b.y - a.y; });
    var lines = [];
    runs.forEach(function (r) {
      var l = lines[lines.length - 1];
      if (l && Math.abs(l.y - r.y) <= 0.5 * Math.min(l.size, r.size)) { l.runs.push(r); l.size = Math.max(l.size, r.size); }
      else lines.push({ y: r.y, size: r.size, runs: [r] });
    });
    lines.forEach(function (l) {
      l.runs.sort(function (a, b) { return a.x - b.x; });
      var out = [], prev = null;
      l.runs.forEach(function (r) {
        var t = r.t;
        if (prev && r.x - (prev.x + prev.w) > 0.2 * r.size && !/\s$/.test(out[out.length - 1].t) && !/^\s/.test(t)) t = ' ' + t;
        var last = out[out.length - 1];
        if (last && last.b === r.b && last.i === r.i && Math.abs(last.size - r.size) < 0.6) last.t += t; else out.push({ t: t, b: r.b, i: r.i, size: r.size });
        prev = r;
      });
      l.parts = out; l.x0 = l.runs[0].x; l.x1 = Math.max.apply(0, l.runs.map(function (r) { return r.x + r.w; })); l.text = out.map(function (p) { return p.t; }).join('');
    });
    lines = lines.filter(function (l) { return l.text.trim(); });
    var right = Math.max.apply(0, lines.map(function (l) { return l.x1; }).concat([0])), paras = [], cur = null, last = null;
    lines.forEach(function (l) {
      var newPara = !cur || last.y - l.y > 1.8 * last.size || Math.abs(l.size - cur.size) > 1.2 || /^([•▪●◦\-–]|\d+[.)]|\(?[a-z]\))\s/.test(l.text) || last.x1 < right - pageW * 0.2;
      if (newPara) { cur = { runs: [], size: l.size, lines: [] }; paras.push(cur); }
      else {
        var tail = cur.runs[cur.runs.length - 1];
        if (/[A-Za-z]-$/.test(tail.t)) tail.t = tail.t.slice(0, -1); else tail.t += ' ';
      }
      l.parts.forEach(function (p) { var t = cur.runs[cur.runs.length - 1]; if (t && t.b === p.b && t.i === p.i && Math.abs(t.size - p.size) < 0.6) t.t += p.t; else cur.runs.push({ t: p.t, b: p.b, i: p.i, size: p.size }); });
      cur.lines.push(l); last = l;
    });
    paras.forEach(function (p) { p.center = p.lines.every(function (l) { return Math.abs((l.x0 + l.x1) / 2 - pageW / 2) < pageW * 0.04 && l.x1 - l.x0 < pageW * 0.7; }) && p.lines.length < 4; });
    return paras;
  }
  function picXml(id, cx, cy) {
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + id + '" name="Page ' + id + '"/>' +
      '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="' + id + '" name="page' + id + '.jpg"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="rIdP' + id + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  }
  // mode: 'text' (editable) or 'pages' (each page as a picture) → Blob (.docx)
  function convert(src, mode, prog) {
    return Promise.all([T.lib('pdfjs'), T.lib('jszip')]).then(function (L) {
      return L[0].getDocument({ data: new Uint8Array(src).slice(0), fontExtraProperties: true }).promise.then(function (doc) {
        var zip = new L[1](), body = [], rels = [], n = 0, pageW = 595.28, pageH = 841.89, all = [], bodySize = 11;
        function next() {
          if (n >= doc.numPages) return finish();
          n++; if (prog) prog(n, doc.numPages);
          return doc.getPage(n).then(function (page) {
            var vp = page.getViewport({ scale: 1 });
            if (n === 1) { pageW = vp.width; pageH = vp.height; }
            var picture = function () {
              return T.renderPage(doc, n, 2).then(function (c) { return T.canvasBlob(c, 'image/jpeg', 0.85).then(function (b) { var w = c.width, hh = c.height; c.width = 0; return { b: b, w: w, h: hh }; }); }).then(function (im) {
                zip.file('word/media/page' + n + '.jpg', im.b); rels.push('<Relationship Id="rIdP' + n + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page' + n + '.jpg"/>');
                var margin = mode === 'pages' ? 18 : 56.7, maxW = pageW - 2 * margin, maxH = pageH - 2 * margin - 4, s = Math.min(maxW / vp.width, maxH / vp.height);
                all.push({ pic: picXml(n, Math.round(vp.width * s * 12700), Math.round(vp.height * s * 12700)), page: n });
              });
            };
            if (mode === 'pages') return picture().then(next);
            return page.getOperatorList().then(function () { return page.getTextContent(); }).then(function (tc) {
              var fontOf = function (id) { try { var f = page.commonObjs.get(id); return (f && (f.name || f.loadedName)) || ''; } catch (e) { return (tc.styles[id] || {}).fontFamily || ''; } };
              var paras = paragraphs(tc.items, fontOf, vp.width);
              if (!paras.length) return picture();   // a scanned page: keep it as a picture
              paras.forEach(function (p, i) { p.page = n; p.first = i === 0; all.push(p); });
            }).then(next);
          });
        }
        function finish() {
          var sizes = []; all.forEach(function (p) { if (p.runs) p.runs.forEach(function (r) { for (var k = 0; k < Math.min(50, r.t.length); k++) sizes.push(r.size); }); });
          sizes.sort(function (a, b) { return a - b; }); if (sizes.length) bodySize = sizes[Math.floor(sizes.length / 2)];
          var lastPage = 0;
          all.forEach(function (p) {
            var brk = p.page !== lastPage && lastPage ? '<w:pageBreakBefore/>' : ''; lastPage = p.page;
            if (p.pic) { body.push('<w:p><w:pPr>' + brk + '<w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr>' + p.pic + '</w:p>'); return; }
            var head = p.size >= bodySize * 1.8 ? 1 : p.size >= bodySize * 1.3 ? 2 : 0;
            body.push('<w:p><w:pPr>' + (head ? '<w:pStyle w:val="Heading' + head + '"/>' : '') + brk + (p.center ? '<w:jc w:val="center"/>' : '') + '</w:pPr>' +
              p.runs.map(function (r) { var sz = Math.max(8, Math.round(r.size * 2)); return '<w:r><w:rPr>' + (r.b || head ? '<w:b/>' : '') + (r.i ? '<w:i/>' : '') + '<w:sz w:val="' + sz + '"/><w:szCs w:val="' + sz + '"/></w:rPr><w:t xml:space="preserve">' + esc(r.t) + '</w:t></w:r>'; }).join('') + '</w:p>');
          });
          var m = mode === 'pages' ? 360 : 1134;
          zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
          zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
          zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' + rels.join('') + '</Relationships>');
          zip.file('word/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
            '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
            '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/></w:rPr></w:style>' +
            '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/></w:rPr></w:style></w:styles>');
          zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + body.join('') +
            '<w:sectPr><w:pgSz w:w="' + Math.round(pageW * 20) + '" w:h="' + Math.round(pageH * 20) + '"' + (pageW > pageH ? ' w:orient="landscape"' : '') + '/><w:pgMar w:top="' + m + '" w:right="' + m + '" w:bottom="' + m + '" w:left="' + m + '" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>');
          return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE' });
        }
        return next();
      });
    }).catch(function (e) { if (/password/i.test(e.name + e.message)) throw new Error('This PDF is password-protected. Remove the password first.'); throw e; });
  }
  var mode = T.seg([['text', 'Editable text'], ['pages', 'Exact look']], 'text', function () { hint.textContent = mode.value() === 'text' ? 'Rebuilds paragraphs, headings and bold text so you can edit everything. Scanned pages are kept as pictures.' : 'Each page is placed as a picture: looks identical, but the text cannot be edited.'; });
  var hint = h('small', { 'class': 'tstatus', text: 'Rebuilds paragraphs, headings and bold text so you can edit everything. Scanned pages are kept as pictures.' });
  var go = T.button('Convert to Word', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    go.disabled = true; status.progress(0, 'Reading the PDF…');
    T.read(file).then(function (b) { return convert(b, mode.value(), function (i, n) { status.progress(i / n, 'Converting page ' + i + ' of ' + n + '…'); }); }).then(function (blob) {
      results.set([{ name: T.baseName(file.name) + '.docx', blob: blob, icon: '📘' }]);
      status.ok('Done! Open the .docx in Word, Google Docs, WPS or LibreOffice. Check tables and columns: complex layouts may need small fixes.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf() {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.create().then(function (d) {
        return Promise.all([d.embedFont(L.StandardFonts.Helvetica), d.embedFont(L.StandardFonts.HelveticaBold)]).then(function (f) {
          var p = d.addPage([595.28, 841.89]);
          p.drawText('Quarterly Report', { x: 60, y: 770, size: 26, font: f[1] });
          var text = ['Sales grew steadily this quarter across all three regions, led by strong demand', 'for our new product line and better delivery times in the north.', '', 'Costs stayed close to the budget. The team plans to open two new', 'stores before the festive season.'];
          text.forEach(function (t, i) { if (t) p.drawText(t, { x: 60, y: 720 - i * 16, size: 12, font: f[0] }); });
          p.drawText('Next steps', { x: 60, y: 610, size: 17, font: f[1] });
          ['- Hire two store managers', '- Launch the festive offer'].forEach(function (t, i) { p.drawText(t, { x: 60, y: 585 - i * 18, size: 12, font: f[0] }); });
          d.addPage([595.28, 841.89]).drawText('Appendix: regional figures', { x: 60, y: 770, size: 17, font: f[1] });
          return d.save();
        });
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '📘', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    T.field('Convert to', mode), hint,
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { samplePdf().then(function (b) { take([new File([b], 'sample-report.pdf', { type: 'application/pdf' })]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-to-word'] = function () {
    var f = [];
    return samplePdf().then(function (src) {
      return convert(src, 'text').then(function (blob) { return T.lib('jszip').then(function (Z) { return Z.loadAsync(blob); }); }).then(function (z) { return z.file('word/document.xml').async('string'); }).then(function (x) {
        if (new DOMParser().parseFromString(x, 'application/xml').getElementsByTagName('parsererror').length) f.push('document.xml is not valid XML');
        if (!/Heading1"\/>.*Quarterly Report/.test(x)) f.push('no heading');
        if (x.indexOf('across all three regions, led by strong demand for our new product line') < 0) f.push('lines not joined into a paragraph');
        if (x.indexOf('Hire two store managers') < 0 || (x.match(/<w:pageBreakBefore\/>/g) || []).length !== 1) f.push('list or page break');
        return convert(src, 'pages');
      }).then(function (blob) { return T.lib('jszip').then(function (Z) { return Z.loadAsync(blob); }); }).then(function (z) { if (!z.file('word/media/page2.jpg')) f.push('page pictures missing'); });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 5, fails: f }; });
  };
});
