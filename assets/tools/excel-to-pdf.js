/* Infinity by GroupChatOn — excel-to-pdf. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Excel to PDF: every sheet of an .xlsx, .xls, .ods or .csv as tidy printed pages, with gridlines, header row on each page and fit-to-width (SheetJS + pdf-lib). */
GCOTools.register('excel-to-pdf', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, wb = null;
  var XLSXJS = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', PX = 2.5, FS = 9, MARGIN = 28;
  function open(buf) { return T.loadScript(XLSXJS).then(function () { return window.XLSX.read(buf, { type: 'array', cellDates: true }); }); }
  function table(ws) {
    var rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '', blankrows: false }).map(function (r) { return r.map(function (c) { return c == null ? '' : String(c); }); });
    var cols = 0; rows.forEach(function (r) { for (var i = r.length - 1; i >= 0; i--) if (r[i] !== '') { cols = Math.max(cols, i + 1); break; } });
    return { rows: rows.map(function (r) { var x = r.slice(0, cols); while (x.length < cols) x.push(''); return x; }), cols: cols, info: ws['!cols'] || [] };
  }
  function widths(t) {   // column widths in points: from the sheet, or measured from the text
    var g = h('canvas').getContext('2d'); g.font = FS + 'px Arial';
    var out = [];
    for (var c = 0; c < t.cols; c++) {
      var ci = t.info[c] || {}, w = ci.wpx ? ci.wpx * 0.75 : ci.wch ? ci.wch * 5.6 + 6 : 0;
      if (!w) { w = 30; for (var r = 0; r < Math.min(400, t.rows.length); r++) w = Math.max(w, g.measureText(t.rows[r][c]).width + 10); }
      out.push(Math.max(22, Math.min(230, w)));
    }
    return out;
  }
  // the pages of one sheet: [{ r0, r1 (exclusive), c0, c1, scale }]
  function plan(rowCount, colW, o) {
    var land = o.orient === 'l', total = colW.reduce(function (a, b) { return a + b; }, 0);
    if (o.orient === 'auto') land = total > 595.28 - 2 * MARGIN;
    var pw = land ? 841.89 : 595.28, ph = land ? 595.28 : 841.89, aw = pw - 2 * MARGIN, ah = ph - 2 * MARGIN - 30;
    var s = o.fit ? Math.min(1, aw / total) : 1, groups = [], c0 = 0;
    while (c0 < colW.length) { var c1 = c0, w = 0; while (c1 < colW.length && (c1 === c0 || w + colW[c1] * s <= aw)) w += colW[c1++] * s; groups.push([c0, c1]); c0 = c1; }
    var rowH = FS * 1.6 * s, head = o.header && rowCount > 1 ? 1 : 0, per = Math.max(1, Math.floor((ah - head * rowH) / rowH)), pages = [];
    groups.forEach(function (g) { for (var r = head; r < Math.max(rowCount, head + 1); r += per) pages.push({ r0: r, r1: Math.min(rowCount, r + per), c0: g[0], c1: g[1], s: s, pw: pw, ph: ph, head: head }); });
    return pages;
  }
  function draw(t, colW, pg, o, label) {
    var c = h('canvas'); c.width = Math.round(pg.pw * PX); c.height = Math.round(pg.ph * PX);
    var g = c.getContext('2d'), s = pg.s, rowH = FS * 1.6 * s, x0 = MARGIN, y = MARGIN + 18;
    g.scale(PX, PX); g.fillStyle = '#fff'; g.fillRect(0, 0, pg.pw, pg.ph);
    g.fillStyle = '#6b7280'; g.font = '8px Arial'; g.fillText(label, MARGIN, MARGIN + 6);
    var rows = (pg.head ? [0] : []).concat(Array.from({ length: pg.r1 - pg.r0 }, function (_, i) { return pg.r0 + i; }));
    rows.forEach(function (r, k) {
      var x = x0, isHead = pg.head && k === 0;
      if (isHead) { g.fillStyle = '#e8eef7'; g.fillRect(x0, y, colW.slice(pg.c0, pg.c1).reduce(function (a, b) { return a + b * s; }, 0), rowH); }
      for (var ci = pg.c0; ci < pg.c1; ci++) {
        var w = colW[ci] * s, v = t.rows[r] ? t.rows[r][ci] : '';
        if (o.grid) { g.strokeStyle = '#c7cdd6'; g.lineWidth = 0.5; g.strokeRect(x, y, w, rowH); }
        if (v) {
          g.save(); g.beginPath(); g.rect(x + 1, y, w - 2, rowH); g.clip();
          g.fillStyle = '#111'; g.font = (isHead ? 'bold ' : '') + (FS * s) + 'px Arial'; g.textBaseline = 'middle';
          var num = /^[-+(]?[\d.,\s]+%?\)?$|^[-+]?[$€£₹¥]\s?[\d.,]+$/.test(v.trim());
          g.textAlign = num ? 'right' : 'left'; g.fillText(v, num ? x + w - 3 * s : x + 3 * s, y + rowH / 2);
          g.restore();
        }
        x += w;
      }
      y += rowH;
    });
    return c;
  }
  // names: the sheets to print; o: { orient, fit, header, grid }
  function convert(book, names, o, prog) {
    var jobs = [];
    names.forEach(function (n) { var t = table(book.Sheets[n]); if (!t.cols) return; var cw = widths(t); plan(t.rows.length, cw, o).forEach(function (p) { jobs.push({ t: t, cw: cw, p: p, name: n }); }); });
    if (!jobs.length) return Promise.reject(new Error('These sheets are empty.'));
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.create().then(function (out) {
        var i = 0;
        function next() {
          if (i >= jobs.length) return out.save().then(function (b) { return { bytes: b, pages: jobs.length }; });
          var j = jobs[i++]; if (prog) prog(i, jobs.length);
          var c = draw(j.t, j.cw, j.p, o, j.name + ' · page ' + i + ' of ' + jobs.length);
          return T.canvasBlob(c, 'image/png').then(function (b) { c.width = 0; return b.arrayBuffer(); }).then(function (png) { return out.embedPng(png); }).then(function (img) {
            out.addPage([j.p.pw, j.p.ph]).drawImage(img, { x: 0, y: 0, width: j.p.pw, height: j.p.ph }); return next();
          });
        }
        return next();
      });
    });
  }
  var sheets = h('div', { 'class': 'tchecks' }), orient = T.select([['auto', 'Automatic'], ['p', 'Portrait'], ['l', 'Landscape']], 'auto');
  var fit = h('input', { type: 'checkbox', checked: true }), head = h('input', { type: 'checkbox', checked: true }), grid = h('input', { type: 'checkbox', checked: true });
  var go = T.button('Convert to PDF', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) {
    file = files[0]; wb = null; results.clear(); sheets.innerHTML = ''; status.info('Opening ' + file.name + '…');
    return T.read(file).then(open).then(function (b) {
      wb = b; go.disabled = false; info.textContent = file.name + ' · ' + b.SheetNames.length + (b.SheetNames.length === 1 ? ' sheet' : ' sheets');
      b.SheetNames.forEach(function (n) { sheets.appendChild(h('label', { 'class': 'tcheck' }, [h('input', { type: 'checkbox', checked: true, value: n }), ' ' + n])); });
      status.clear();
    }).catch(function (e) { status.error(/zip|Unsupported|corrupt/i.test(e.message) ? 'This file could not be read as a spreadsheet. Try saving it as .xlsx or .csv.' : e); });
  }
  function run() {
    if (!wb) return;
    var names = Array.prototype.filter.call(sheets.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return x.value; });
    if (!names.length) return status.error('Tick at least one sheet.');
    go.disabled = true; status.progress(0, 'Laying out the pages…');
    convert(wb, names, { orient: orient.value, fit: fit.checked, header: head.checked, grid: grid.checked }, function (i, n) { status.progress(i / n, 'Page ' + i + ' of ' + n + '…'); }).then(function (r) {
      results.set([{ name: T.baseName(file.name) + '.pdf', blob: new Blob([r.bytes], { type: 'application/pdf' }), note: r.pages + (r.pages === 1 ? ' page' : ' pages') }]);
      status.ok('Done! ' + r.pages + (r.pages === 1 ? ' page' : ' pages') + ' ready.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function sampleBook() {
    return T.loadScript(XLSXJS).then(function () {
      var X = window.XLSX, items = ['Rent', 'Groceries', 'Electricity', 'Petrol', 'Internet', 'School fees', 'Medicines', 'Dining out'], rows = [['Date', 'Item', 'Category', 'Amount (₹)']];
      for (var i = 0; i < 70; i++) rows.push(['2026-' + ('0' + (1 + i % 12)).slice(-2) + '-' + ('0' + (1 + i % 28)).slice(-2), items[i % items.length], i % 3 ? 'Home' : 'Family', String(500 + (i * 137) % 4200)]);
      var b = X.utils.book_new(); X.utils.book_append_sheet(b, X.utils.aoa_to_sheet(rows), 'Expenses'); X.utils.book_append_sheet(b, X.utils.aoa_to_sheet([['Category', 'Total'], ['Home', '84,200'], ['Family', '41,750']]), 'Summary');
      return X.write(b, { type: 'array', bookType: 'xlsx' });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: '.xlsx,.xls,.xlsm,.ods,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv', icon: '📊', label: 'Choose a spreadsheet', hint: 'Excel, ODS or CSV · nothing is uploaded', onFiles: take }), info,
    T.field('Sheets to print', sheets), h('div', { 'class': 'tgrid2' }, [T.field('Page direction', orient), h('div', { 'class': 'tchecks' }, [h('label', { 'class': 'tcheck' }, [fit, ' Fit all columns to the page width']), h('label', { 'class': 'tcheck' }, [head, ' Repeat the first row on every page']), h('label', { 'class': 'tcheck' }, [grid, ' Gridlines'])])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sampleBook().then(function (b) { return take([new File([b], 'sample-expenses.xlsx')]); }).then(run); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['excel-to-pdf'] = function () {
    var f = [], o = { orient: 'p', fit: true, header: true, grid: true };
    var p = plan(121, [60, 120, 80, 60], o), per = Math.floor((841.89 - 56 - 30 - 9 * 1.6) / (9 * 1.6));
    if (p.length !== Math.ceil(120 / per) || p[0].r0 !== 1 || p[p.length - 1].r1 !== 121) f.push('plan ' + p.length + ' pages, ' + per + ' rows each');
    var wide = plan(10, [200, 200, 200, 200], { orient: 'p', fit: false, header: false, grid: true });
    if (wide.length !== 2 || wide[0].c1 !== 2) f.push('column groups ' + JSON.stringify(wide.map(function (x) { return [x.c0, x.c1]; })));
    if (plan(10, [400, 400], { orient: 'auto', fit: true, header: true, grid: true })[0].pw !== 841.89) f.push('auto landscape');
    return sampleBook().then(open).then(function (b) { return convert(b, b.SheetNames, o); }).then(function (r) {
      return T.lib('pdflib').then(function (L) { return L.PDFDocument.load(r.bytes); }).then(function (d) { if (d.getPageCount() !== 3 || r.pages !== 3) f.push('sample pages ' + d.getPageCount()); /* 70 expense rows on 2 pages + the summary sheet */ });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
