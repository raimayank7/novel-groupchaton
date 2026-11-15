/* Infinity by GroupChatOn — pdf-n-up. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Print several pages per sheet: 2, 4, 6, 8, 9 or 16 PDF pages on one A4 or Letter sheet, sharp and still selectable (pdf-lib). */
GCOTools.register('pdf-n-up', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  var SHEETS = { a4: [595.28, 841.89], letter: [612, 792], legal: [612, 1008], a3: [841.89, 1190.55] }, MM = 72 / 25.4;
  // the grid (columns × rows) and sheet turn that make the pages biggest: { sw, sh, cols, rows, scale }
  function layout(n, pw, ph, sheet, orient, margin, gap) {
    var best = null;
    ['p', 'l'].forEach(function (o) {
      if (orient !== 'auto' && orient !== o) return;
      var sw = o === 'p' ? Math.min(sheet[0], sheet[1]) : Math.max(sheet[0], sheet[1]), sh = o === 'p' ? Math.max(sheet[0], sheet[1]) : Math.min(sheet[0], sheet[1]);
      for (var c = 1; c <= n; c++) {
        if (n % c) continue;
        var r = n / c, cw = (sw - 2 * margin - (c - 1) * gap) / c, chh = (sh - 2 * margin - (r - 1) * gap) / r, s = Math.min(cw / pw, chh / ph);
        if (!best || s > best.scale + 1e-9) best = { sw: sw, sh: sh, cols: c, rows: r, scale: s };
      }
    });
    return best;
  }
  // o: { n, sheet, orient, order: 'across' | 'down', margin (mm), gap (mm), border }
  function nup(src, o) {
    return T.lib('pdflib').then(function (L) {
      return Promise.all([L.PDFDocument.load(src), L.PDFDocument.create()]).then(function (r) {
        var inDoc = r[0], out = r[1];
        if (inDoc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        var count = inDoc.getPageCount(), idx = []; for (var i = 0; i < count; i++) idx.push(i);
        return out.embedPdf(inDoc, idx).then(function (emb) {
          var p0 = inDoc.getPage(0), rot0 = p0.getRotation().angle % 180, s0 = p0.getSize();
          var lay = layout(o.n, rot0 ? s0.height : s0.width, rot0 ? s0.width : s0.height, SHEETS[o.sheet], o.orient, o.margin * MM, o.gap * MM);
          var cw = (lay.sw - 2 * o.margin * MM - (lay.cols - 1) * o.gap * MM) / lay.cols, chh = (lay.sh - 2 * o.margin * MM - (lay.rows - 1) * o.gap * MM) / lay.rows, sheet;
          emb.forEach(function (e, i) {
            var k = i % o.n; if (!k) sheet = out.addPage([lay.sw, lay.sh]);
            var col = o.order === 'down' ? Math.floor(k / lay.rows) : k % lay.cols, row = o.order === 'down' ? k % lay.rows : Math.floor(k / lay.cols);
            var rot = ((inDoc.getPage(i).getRotation().angle % 360) + 360) % 360, pw = rot % 180 ? e.height : e.width, ph = rot % 180 ? e.width : e.height, s = Math.min(cw / pw, chh / ph);
            var vw = pw * s, vh = ph * s, cx = o.margin * MM + col * (cw + o.gap * MM) + (cw - vw) / 2, cy = lay.sh - o.margin * MM - row * (chh + o.gap * MM) - chh + (chh - vh) / 2;
            var at = rot === 90 ? [cx, cy + vh, -90] : rot === 180 ? [cx + vw, cy + vh, 180] : rot === 270 ? [cx + vw, cy, 90] : [cx, cy, 0];
            sheet.drawPage(e, { x: at[0], y: at[1], xScale: s, yScale: s, rotate: L.degrees(at[2]) });
            if (o.border) sheet.drawRectangle({ x: cx, y: cy, width: vw, height: vh, borderColor: L.rgb(0.6, 0.6, 0.6), borderWidth: 0.6 });
          });
          return out.save().then(function (b) { return { bytes: b, sheets: out.getPageCount(), grid: lay.cols + ' × ' + lay.rows }; });
        });
      });
    });
  }
  var n = T.select([[2, '2 pages per sheet'], [4, '4 pages per sheet'], [6, '6 pages per sheet'], [8, '8 pages per sheet'], [9, '9 pages per sheet'], [16, '16 pages per sheet']], 4);
  var sheet = T.select([['a4', 'A4'], ['letter', 'US Letter'], ['legal', 'US Legal'], ['a3', 'A3']], 'a4'), orient = T.select([['auto', 'Best fit (automatic)'], ['p', 'Portrait'], ['l', 'Landscape']], 'auto');
  var order = T.select([['across', 'Across, then down'], ['down', 'Down, then across']], 'across'), margin = T.select([[5, 'Small (5 mm)'], [10, 'Normal (10 mm)'], [15, 'Wide (15 mm)']], 10);
  var gap = T.select([[2, 'Tight'], [5, 'Normal'], [10, 'Roomy']], 5), border = h('input', { type: 'checkbox', checked: true });
  var go = T.button('Make the sheets', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function opts() { return { n: +n.value, sheet: sheet.value, orient: orient.value, order: order.value, margin: +margin.value, gap: +gap.value, border: border.checked }; }
  function run() {
    if (!file) return;
    go.disabled = true; status.progress(0.3, 'Arranging the pages…');
    T.read(file).then(function (b) { return nup(b, opts()); }).then(function (r) {
      results.set([{ name: T.baseName(file.name) + '-' + n.value + '-per-sheet.pdf', blob: new Blob([r.bytes], { type: 'application/pdf' }), note: r.sheets + ' sheets' }]);
      status.ok('Done! ' + r.sheets + (r.sheets === 1 ? ' sheet' : ' sheets') + ', ' + r.grid + ' pages each. Print at “Actual size”.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf(L, count) {
    return L.PDFDocument.create().then(function (d) {
      return d.embedFont(L.StandardFonts.HelveticaBold).then(function (f) {
        var col = [[0.98, 0.8, 0.3], [0.5, 0.8, 0.98], [0.6, 0.9, 0.6], [0.98, 0.6, 0.7]];
        for (var i = 1; i <= count; i++) { var p = d.addPage([595.28, 841.89]), c = col[i % 4]; p.drawRectangle({ x: 40, y: 40, width: 515, height: 762, color: L.rgb(c[0], c[1], c[2]) }); p.drawText('Slide ' + i, { x: 200, y: 420, size: 60, font: f }); }
        return d.save();
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🗂️', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    h('div', { 'class': 'tgrid2' }, [T.field('Pages on each sheet', n), T.field('Sheet size', sheet), T.field('Sheet direction', orient), T.field('Page order', order), T.field('Outer margin', margin), T.field('Space between pages', gap),
      h('label', { 'class': 'tcheck' }, [border, ' Thin border around each page'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { T.lib('pdflib').then(function (L) { return samplePdf(L, 8); }).then(function (b) { take([new File([b], 'sample-slides.pdf', { type: 'application/pdf' })]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-n-up'] = function () {
    var f = [], A = SHEETS.a4;
    function g(k) { var l = layout(k, 595.28, 841.89, A, 'auto', 10 * MM, 5 * MM); return (l.sw > l.sh ? 'L' : 'P') + l.cols + 'x' + l.rows; }
    [[2, 'L2x1'], [4, 'P2x2'], [6, 'L3x2'], [9, 'P3x3'], [16, 'P4x4']].forEach(function (x) { if (g(x[0]) !== x[1]) f.push(x[0] + '-up → ' + g(x[0])); });
    return T.lib('pdflib').then(function (L) {
      return samplePdf(L, 6).then(function (b) { return nup(b, { n: 4, sheet: 'a4', orient: 'auto', order: 'across', margin: 10, gap: 5, border: true }); }).then(function (r) {
        return L.PDFDocument.load(r.bytes).then(function (d) { if (d.getPageCount() !== 2 || r.grid !== '2 × 2') f.push('sheets ' + d.getPageCount() + ' grid ' + r.grid); });
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 6, fails: f }; });
  };
});
