/* Infinity by GroupChatOn — pdf-page-numbers. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Add page numbers to a PDF: position, style ("Page 1 of 9"…), start number, and pages left unnumbered (pdf-lib). */
GCOTools.register('pdf-page-numbers', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  function spotOn(L, page, u, v) {
    var b = page.getCropBox(), r = ((page.getRotation().angle % 360) + 360) % 360, W = b.width, H = b.height, x = u, y = v;
    if (r === 90) { x = W - v; y = u; } else if (r === 180) { x = W - u; y = H - v; } else if (r === 270) { x = v; y = H - u; }
    return { x: b.x + x, y: b.y + y, rotate: L.degrees(r) };
  }
  function seen(page) { var b = page.getCropBox(); return page.getRotation().angle % 180 ? { w: b.height, h: b.width } : { w: b.width, h: b.height }; }
  // o: { pos, format ('Page {n} of {t}'), start, skip (pages left without a number), size, margin (mm), color }
  function label(o, k, count) { return o.format.replace('{n}', String(o.start + k)).replace('{t}', String(o.start + count - 1)); }
  function number(bytes, o) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.load(bytes).then(function (doc) {
        if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        return doc.embedFont(L.StandardFonts.Helvetica).then(function (font) {
          var n = doc.getPageCount(), count = n - o.skip, m = o.margin * 72 / 25.4, col = { black: L.rgb(0, 0, 0), grey: L.rgb(0.4, 0.4, 0.4), blue: L.rgb(0.1, 0.25, 0.6) }[o.color] || L.rgb(0, 0, 0);
          if (count < 1) throw new Error('Every page would be skipped: lower “Leave unnumbered”.');
          for (var i = o.skip; i < n; i++) {
            var page = doc.getPage(i), s = seen(page), k = i - o.skip, t = label(o, k, count), w = font.widthOfTextAtSize(t, o.size), pos = o.pos;
            if (pos === 'out') pos = k % 2 ? 'bl' : 'br';   // books: right on odd pages, left on even
            var u = pos[1] === 'l' ? m : pos[1] === 'r' ? s.w - m - w : (s.w - w) / 2, v = pos[0] === 'b' ? m : s.h - m - o.size * 0.72;
            var p = spotOn(L, page, u, v);
            page.drawText(t, { x: p.x, y: p.y, size: o.size, font: font, color: col, rotate: p.rotate });
          }
          return doc.save();
        });
      });
    });
  }
  var pos = T.select([['bc', 'Bottom centre'], ['br', 'Bottom right'], ['bl', 'Bottom left'], ['tc', 'Top centre'], ['tr', 'Top right'], ['tl', 'Top left'], ['out', 'Outside corner (books)']], 'bc');
  var format = T.select([['{n}', '1, 2, 3'], ['Page {n}', 'Page 1'], ['Page {n} of {t}', 'Page 1 of 9'], ['{n} / {t}', '1 / 9'], ['- {n} -', '- 1 -']], 'Page {n} of {t}');
  var start = h('input', { type: 'number', min: '0', value: '1' }), skip = h('input', { type: 'number', min: '0', value: '0' });
  var size = T.select([[9, 'Small (9 pt)'], [11, 'Normal (11 pt)'], [14, 'Large (14 pt)']], 11), margin = T.select([[8, 'Close to the edge'], [14, 'Normal'], [22, 'Far from the edge']], 14);
  var color = T.select([['black', 'Black'], ['grey', 'Grey'], ['blue', 'Blue']], 'black');
  var go = T.button('Add page numbers', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function opts() { return { pos: pos.value, format: format.value, start: Math.max(0, parseInt(start.value, 10) || 0), skip: Math.max(0, parseInt(skip.value, 10) || 0), size: +size.value, margin: +margin.value, color: color.value }; }
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    go.disabled = true; status.progress(0.3, 'Numbering the pages…');
    T.read(file).then(function (b) { return number(b, opts()); }).then(function (out) {
      results.set([{ name: T.baseName(file.name) + '-numbered.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      status.ok('Done! Page numbers added.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf(L, n) {
    return L.PDFDocument.create().then(function (d) {
      return d.embedFont(L.StandardFonts.Helvetica).then(function (f) {
        for (var i = 1; i <= n; i++) { var p = d.addPage([595.28, 841.89]); p.drawText(i === 1 ? 'Cover page' : 'Chapter ' + (i - 1), { x: 60, y: 760, size: 26, font: f }); }
        return d.save();
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🔢', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    h('div', { 'class': 'tgrid2' }, [T.field('Position', pos), T.field('Style', format), T.field('First number', start), T.field('Leave unnumbered', skip, 'e.g. 1 keeps the cover page clean'),
      T.field('Size', size), T.field('Margin', margin), T.field('Colour', color)]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () {
      T.lib('pdflib').then(function (L) { return samplePdf(L, 5); }).then(function (b) { skip.value = '1'; take([new File([b], 'sample-book.pdf', { type: 'application/pdf' })]); run(); });
    } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-page-numbers'] = function () {
    var f = [];
    if (label({ format: 'Page {n} of {t}', start: 1 }, 0, 9) !== 'Page 1 of 9') f.push('label');
    if (label({ format: '{n} / {t}', start: 5 }, 2, 3) !== '7 / 7') f.push('label start');
    function textOf(bytes, n) { return T.lib('pdfjs').then(function (P) { return P.getDocument({ data: bytes.slice(0) }).promise; }).then(function (pdf) { return pdf.getPage(n); }).then(function (p) { return p.getTextContent(); }).then(function (tc) { return tc.items.map(function (i) { return i.str; }).join(' '); }); }
    return T.lib('pdflib').then(function (L) { return samplePdf(L, 3); }).then(function (src) {
      return number(src, { pos: 'br', format: 'Page {n} of {t}', start: 1, skip: 1, size: 11, margin: 14, color: 'black' });
    }).then(function (out) { return Promise.all([textOf(out, 1), textOf(out, 2), textOf(out, 3)]); }).then(function (t) {
      if (/Page \d/.test(t[0])) f.push('cover numbered');
      if (t[1].indexOf('Page 1 of 2') < 0) f.push('page 2: ' + t[1]);
      if (t[2].indexOf('Page 2 of 2') < 0) f.push('page 3: ' + t[2]);
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 5, fails: f }; });
  };
});
