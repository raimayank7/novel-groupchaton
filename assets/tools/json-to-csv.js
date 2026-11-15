/* JSON to CSV — turns a JSON list of objects into a spreadsheet-ready CSV (nested fields become a.b columns).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('json-to-csv', function (spot, T) {
  function flat(o, pre, out) {
    Object.keys(o).forEach(function (k) {
      var v = o[k], key = pre ? pre + '.' + k : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
      else out[key] = Array.isArray(v) ? v.map(function (x) { return typeof x === 'object' ? JSON.stringify(x) : x; }).join('; ') : v;
    });
    return out;
  }
  T.transformer(spot, { id: 'json-to-csv', inLabel: 'JSON (a list of objects)', outLabel: 'CSV', mono: true, rows: 11, download: 'data.csv', type: 'text/csv',
    sample: '[{"name":"Asha","age":31,"city":{"name":"Pune"}},{"name":"Ravi","age":27,"city":{"name":"Delhi"},"tags":["new","vip"]}]',
    options: [T.opt.select('sep', 'Separator', [[',', 'Comma (,)'], [';', 'Semicolon (;)'], ['\t', 'Tab']], ','), T.opt.check('bom', 'Excel-friendly (keeps ₹, é, Hindi…)', true)],
    run: function (t, o) {
      var v;
      try { v = JSON.parse(t); } catch (e) { throw new Error('Not valid JSON: ' + e.message); }
      if (!Array.isArray(v)) v = [v];
      var rows = v.map(function (r) { return r && typeof r === 'object' ? flat(r, '', {}) : { value: r }; });
      var cols = [];
      rows.forEach(function (r) { Object.keys(r).forEach(function (k) { if (cols.indexOf(k) < 0) cols.push(k); }); });
      function cell(x) {
        if (x == null) return '';
        x = String(x);
        return /["\n\r]/.test(x) || x.indexOf(o.sep) >= 0 ? '"' + x.replace(/"/g, '""') + '"' : x;
      }
      var csv = [cols.map(cell).join(o.sep)].concat(rows.map(function (r) { return cols.map(function (c) { return cell(r[c]); }).join(o.sep); })).join('\r\n');
      return (o.bom ? '﻿' : '') + csv;
    },
    note: function (a, b) { var n = b.split('\r\n').length - 1; return n + ' row' + (n === 1 ? '' : 's'); } });
});
