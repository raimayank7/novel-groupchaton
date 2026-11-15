/* CSV to JSON — reads CSV or TSV (quotes, commas inside quotes, line breaks inside cells) into JSON.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('csv-to-json', function (spot, T) {
  function parse(text, sep) {
    var rows = [], row = [], cell = '', q = false, i = 0, c;
    text = text.replace(/^﻿/, '');
    if (sep === 'auto') {
      var first = text.split(/\r?\n/)[0] || '';
      sep = [',', ';', '\t', '|'].map(function (s) { return [s, first.split(s).length]; }).sort(function (x, y) { return y[1] - x[1]; })[0][0];
    }
    for (; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"' && !cell) q = true;
      else if (c === sep) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.length > 1 || r[0] !== ''; });
  }
  function typed(v) {
    if (/^-?\d+(\.\d+)?$/.test(v) && !/^0\d/.test(v)) return Number(v);
    if (v === 'true' || v === 'false') return v === 'true';
    if (v === '') return null;
    return v;
  }
  T.transformer(spot, { id: 'csv-to-json', inLabel: 'CSV', outLabel: 'JSON', mono: true, rows: 11, download: 'data.json', type: 'application/json',
    sample: 'name,age,city\nAsha,31,Pune\n"Ravi, Jr.",27,"New\nDelhi"',
    options: [T.opt.select('sep', 'Separator', [['auto', 'Detect'], [',', 'Comma'], [';', 'Semicolon'], ['\t', 'Tab'], ['|', 'Pipe']], 'auto'),
      T.opt.check('head', 'First row is the header', true), T.opt.check('types', 'Numbers and true/false as values', true)],
    run: function (t, o) {
      var rows = parse(t, o.sep);
      if (!rows.length) return '[]';
      var out;
      if (o.head) {
        var head = rows.shift().map(function (h, i) { return h.trim() || 'column' + (i + 1); });
        out = rows.map(function (r) { var obj = {}; head.forEach(function (h, i) { var v = r[i] == null ? '' : r[i]; obj[h] = o.types ? typed(v) : v; }); return obj; });
      } else out = rows.map(function (r) { return o.types ? r.map(typed) : r; });
      return JSON.stringify(out, null, 2);
    },
    note: function (a, b) { try { var n = JSON.parse(b).length; return n + ' record' + (n === 1 ? '' : 's'); } catch (e) { return ''; } } });
});
