/* JSON Formatter — beautify, minify, sort keys and validate, with the exact line and column of any error.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('json-format', function (spot, T) {
  function where(text, e) {
    var m = String(e.message).match(/position (\d+)/), pos = m ? +m[1] : -1;
    var lc = String(e.message).match(/line (\d+) column (\d+)/);
    if (lc) return ' (line ' + lc[1] + ', column ' + lc[2] + ')';
    if (pos < 0) return '';
    var before = text.slice(0, pos).split('\n');
    return ' (line ' + before.length + ', column ' + (before[before.length - 1].length + 1) + ')';
  }
  function sortKeys(v) {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (v && typeof v === 'object') return Object.keys(v).sort().reduce(function (o, k) { o[k] = sortKeys(v[k]); return o; }, {});
    return v;
  }
  T.transformer(spot, { id: 'json-format', inLabel: 'JSON', outLabel: 'Formatted JSON', mono: true, rows: 12, download: 'formatted.json', type: 'application/json',
    sample: '{"name":"Infinity","tools":["json","pdf"],"free":true,"stats":{"users":1200,"rating":4.9}}',
    options: [T.opt.select('indent', 'Style', [['2', 'Pretty (2 spaces)'], ['4', 'Pretty (4 spaces)'], ['tab', 'Pretty (tabs)'], ['min', 'Minify (one line)']], '2'),
      T.opt.check('sort', 'Sort keys A → Z')],
    run: function (t, o) {
      var v;
      try { v = JSON.parse(t); } catch (e) { throw new Error('Not valid JSON: ' + e.message.replace(/^JSON\.parse: /, '') + where(t, e)); }
      if (o.sort) v = sortKeys(v);
      return JSON.stringify(v, null, o.indent === 'min' ? 0 : o.indent === 'tab' ? '\t' : +o.indent);
    },
    note: function (a, b) { return '✓ Valid JSON · ' + T.bytes(new Blob([b]).size); } });
});
