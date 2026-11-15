/* Infinity by GroupChatOn — excel-to-csv. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Excel ↔ CSV converter: every sheet of an .xlsx / .xls / .ods file to its own CSV, or CSV files into one Excel workbook (SheetJS, loaded on first use). Nothing is uploaded. */
GCOTools.register('excel-to-csv', function (spot, T) {
  var h = T.h, XL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', status = T.status(), results = T.results();
  function lib() { return T.loadScript(XL).then(function () { return window.XLSX; }); }
  function parse(text) {
    var lines = text.split(/\r?\n/).slice(0, 20), d = ',', best = 0;
    [',', ';', '\t', '|'].forEach(function (c) { var n = (lines[0] || '').split(c).length - 1; if (n > best) { best = n; d = c; } });
    var out = [], row = [], f = '', q = false, i = text.charCodeAt(0) === 0xFEFF ? 1 : 0;
    for (; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; continue; }
      if (ch === '"' && f === '') { q = true; continue; }
      if (ch === d) { row.push(f); f = ''; continue; }
      if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); out.push(row); row = []; f = ''; continue; }
      f += ch;
    }
    if (f !== '' || row.length) { row.push(f); out.push(row); }
    return out.filter(function (r) { return r.length > 1 || r[0] !== ''; });
  }
  // numbers become real numbers in Excel, but codes like 007 or long phone numbers stay text
  function cell(v) { var s = String(v).trim(); return /^-?(0|[1-9]\d{0,14})(\.\d+)?$/.test(s) ? +s : v; }
  function sheetName(n, used) {
    var s = String(n).replace(/\.[^.]+$/, '').replace(/[\\\/?*\[\]:]/g, ' ').trim().slice(0, 31) || 'Sheet', base = s, k = 2;
    while (used[s.toLowerCase()]) { var tail = ' (' + k++ + ')'; s = base.slice(0, 31 - tail.length) + tail; }
    used[s.toLowerCase()] = 1;
    return s;
  }
  function toCsv(buf, o) {
    return lib().then(function (X) {
      var wb = X.read(new Uint8Array(buf), { type: 'array' });
      return wb.SheetNames.map(function (n) { return { sheet: n, csv: X.utils.sheet_to_csv(wb.Sheets[n], { FS: o.sep, blankrows: false }) }; });
    });
  }
  function toXlsx(files) {
    return lib().then(function (X) {
      var wb = X.utils.book_new(), used = {};
      files.forEach(function (f) { X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(parse(f.text).map(function (r) { return r.map(cell); })), sheetName(f.name, used)); });
      return new Uint8Array(X.write(wb, { bookType: 'xlsx', type: 'array' }));
    });
  }
  var mode = T.seg([['x2c', 'Excel → CSV'], ['c2x', 'CSV → Excel']], 'x2c', function () { sync(); });
  var sep = T.select([[',', 'Comma ,'], [';', 'Semicolon ; (Europe)'], ['\t', 'Tab']], ','), bom = h('input', { type: 'checkbox', checked: true });
  var opts = h('div', { 'class': 'tgrid2' }, [T.field('Separator', sep), h('label', { 'class': 'tcheck', style: 'align-self:end' }, [bom, ' Add BOM so Excel shows ₹, é, हिंदी correctly'])]);
  var preview = h('textarea', { rows: '6', 'class': 'tout tmono', readonly: true, 'aria-label': 'Preview of the first sheet', hidden: true });
  function runX2C(files) {
    results.clear(); preview.hidden = true; status.info('Reading ' + files.length + ' file' + (files.length > 1 ? 's' : '') + '…');
    var out = [];
    return files.reduce(function (p, file) {
      return p.then(function () { return T.read(file); }).then(function (buf) { return toCsv(buf, { sep: sep.value }); }).then(function (sheets) {
        sheets.forEach(function (s) {
          var name = T.baseName(file.name) + (sheets.length > 1 ? ' - ' + s.sheet : '') + (sep.value === '\t' ? '.tsv' : '.csv');
          out.push({ name: name.replace(/[\\\/:*?"<>|]+/g, '_'), blob: new Blob([(bom.checked ? '﻿' : '') + s.csv], { type: 'text/csv;charset=utf-8' }), note: s.csv.split('\n').length + ' rows', icon: '📄', csv: s.csv });
        });
      });
    }, Promise.resolve()).then(function () {
      results.set(out, 'csv-files');
      if (out[0]) { preview.value = out[0].csv.split('\n').slice(0, 30).join('\n'); preview.hidden = false; }
      status.ok('✓ ' + out.length + ' CSV file' + (out.length === 1 ? '' : 's') + ' ready (one per sheet).');
      return out;
    }).catch(function (e) { status.error('Could not read this file: ' + e.message); });
  }
  function runC2X(files) {
    results.clear(); preview.hidden = true; status.info('Building the workbook…');
    return Promise.all(files.map(function (f) { return T.read(f, 'text').then(function (t) { return { name: f.name, text: t }; }); })).then(toXlsx).then(function (bytes) {
      var name = (files.length === 1 ? T.baseName(files[0].name) : 'workbook') + '.xlsx';
      results.set([{ name: name, blob: new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), note: files.length + ' sheet' + (files.length > 1 ? 's' : ''), icon: '📗' }], 'workbook');
      status.ok('✓ Excel workbook ready' + (files.length > 1 ? ' with one sheet per CSV file.' : '.'));
      return bytes;
    }).catch(function (e) { status.error(e); });
  }
  var dzX = T.dropzone({ accept: '.xlsx,.xlsm,.xls,.xlsb,.ods', multiple: true, icon: '📗', label: 'Choose Excel files', hint: '.xlsx, .xls or .ods · they stay on your device', onFiles: runX2C });
  var dzC = T.dropzone({ accept: '.csv,.tsv,.txt,text/csv', multiple: true, icon: '📄', label: 'Choose CSV files', hint: 'Several files become several sheets', onFiles: runC2X });
  function sync() { var x = mode.value() === 'x2c'; dzX.hidden = !x; opts.hidden = !x; dzC.hidden = x; results.clear(); preview.hidden = true; status.clear(); }
  var SAMPLE = 'Name,Phone,City,Amount\nAsha Verma,09876543210,Pune,1250.50\nRavi Kumar,08765432109,Delhi,980\n"Lopez, Maria",+34 600 123 456,Madrid,2100\n';
  spot.appendChild(T.card([mode, dzX, dzC, opts,
    T.row([T.button('Try a sample', { small: true, onclick: function () {
      var file = new File([SAMPLE], 'customers.csv', { type: 'text/csv' });
      lib().then(function () { return toXlsx([{ name: 'customers.csv', text: SAMPLE }]); }).then(function (bytes) { mode.querySelector('button').click(); return runX2C([new File([bytes], 'customers.xlsx')]); }).catch(status.error);
      return file;
    } })]), status.el, results.el, preview]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  sync();
  T.tests['excel-to-csv'] = function () {
    var f = [], used = {};
    if (sheetName('sales/2026:Q1?.csv', used) !== 'sales 2026 Q1' || sheetName('Sales 2026 Q1.csv', used) !== 'Sales 2026 Q1 (2)' || sheetName('x'.repeat(40) + '.csv', used).length !== 31) f.push('sheet names');
    if (cell('007') !== '007' || cell('1250.50') !== 1250.5 || cell('98765432101234567') !== '98765432101234567' || cell('-3') !== -3 || cell('1e5') !== '1e5') f.push('cells');
    if (JSON.stringify(parse('a;b\n1;"x;y"')) !== '[["a","b"],["1","x;y"]]') f.push('parse');
    return toXlsx([{ name: 'customers.csv', text: SAMPLE }, { name: 'second.csv', text: 'x,y\n1,2' }]).then(function (bytes) { return toCsv(bytes, { sep: ',' }); }).then(function (sheets) {
      if (sheets.length !== 2 || sheets[0].sheet !== 'customers' || sheets[1].csv !== 'x,y\n1,2') f.push('sheets ' + JSON.stringify(sheets.map(function (s) { return s.sheet; })));
      var lines = sheets[0].csv.split('\n');
      if (lines[1] !== 'Asha Verma,09876543210,Pune,1250.5' || lines[3] !== '"Lopez, Maria",+34 600 123 456,Madrid,2100') f.push('round trip ' + JSON.stringify(lines));
      return { ok: !f.length, n: 6, fails: f };
    });
  };
});
