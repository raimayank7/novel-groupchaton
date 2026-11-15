/* Infinity by GroupChatOn — html-table. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* HTML table generator: paste rows from Excel, Google Sheets or CSV and get a clean, accessible HTML table with optional styling and a live preview. */
GCOTools.register('html-table', function (spot, T) {
  var h = T.h;
  function rows(t) {
    t = t.replace(/\r\n?/g, '\n').replace(/\n+$/, '');
    var sep = t.indexOf('\t') >= 0 ? '\t' : (t.split('\n')[0].split(';').length > t.split('\n')[0].split(',').length ? ';' : ','), out = [[]], cur = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"' && t[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; continue; }
      if (c === '"' && cur === '') q = true;
      else if (c === sep) { out[out.length - 1].push(cur); cur = ''; }
      else if (c === '\n') { out[out.length - 1].push(cur); cur = ''; out.push([]); }
      else cur += c;
    }
    out[out.length - 1].push(cur);
    return out.map(function (r) { return r.map(function (x) { return x.trim(); }); });
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function build(t, o) {
    var r = rows(t), w = Math.max.apply(0, r.map(function (x) { return x.length; })), num = function (x) { return /^[-+]?[₹$€£]?\s?[\d,]+(\.\d+)?%?$/.test(x); };
    r = r.map(function (x) { while (x.length < w) x.push(''); return x; });
    var head = o.head ? r.shift() : null, L = [];
    if (o.css) L.push('<style>\n.gco-table { border-collapse: collapse; width: 100%; font-family: system-ui, sans-serif; font-size: 15px; }\n.gco-table th, .gco-table td { padding: 8px 12px; border: 1px solid #d0d7de; text-align: left; }\n.gco-table th { background: #f1f5f9; }\n' +
      (o.striped ? '.gco-table tbody tr:nth-child(even) { background: #f8fafc; }\n' : '') + '.gco-table td.num { text-align: right; font-variant-numeric: tabular-nums; }\n.gco-wrap { overflow-x: auto; }\n</style>');
    L.push((o.css ? '<div class="gco-wrap">\n' : '') + '<table' + (o.css ? ' class="gco-table"' : '') + '>');
    if (o.caption) L.push('  <caption>' + esc(o.caption) + '</caption>');
    if (head) L.push('  <thead>\n    <tr>' + head.map(function (x) { return '<th scope="col">' + esc(x) + '</th>'; }).join('') + '</tr>\n  </thead>');
    L.push('  <tbody>');
    r.forEach(function (x) { L.push('    <tr>' + x.map(function (c) { return '<td' + (o.css && num(c) ? ' class="num"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'); });
    L.push('  </tbody>\n</table>' + (o.css ? '\n</div>' : ''));
    return L.join('\n');
  }
  var preview = h('div', { style: 'overflow:auto;padding:12px;border-radius:14px;background:#fff;color:#111' });
  var tr = T.transformer(spot, { id: 'html-table', inLabel: 'Rows (paste from Excel / Google Sheets, or CSV)', mono: true, rows: 8, outLabel: 'HTML', download: 'table.html', type: 'text/html',
    sample: 'Product\tQty\tPrice\nBasmati rice 5 kg\t2\t₹640\nMustard oil 1 L\t3\t₹185\n"Tea, masala"\t1\t₹120',
    options: [T.opt.check('head', 'First row is the header', true), T.opt.check('css', 'Add simple styling', true), T.opt.check('striped', 'Striped rows', true), T.opt.text('caption', 'Caption (optional)', '', 'e.g. Price list, May 2026')],
    run: function (t, o) { var r = build(t, o); preview.innerHTML = r; return r; } });
  spot.lastChild.appendChild(T.field('Preview', preview));
  tr.update();
  T.tests['html-table'] = function () {
    var f = [], r = rows('a,"b, c","say ""hi"""\n1,2,3');
    if (JSON.stringify(r) !== '[["a","b, c","say \\"hi\\""],["1","2","3"]]') f.push('csv ' + JSON.stringify(r));
    if (JSON.stringify(rows('x\ty\n1\t2')) !== '[["x","y"],["1","2"]]' || JSON.stringify(rows('x;y\n1;2')) !== '[["x","y"],["1","2"]]') f.push('tab / semicolon');
    var b = build('Name,Amt\n<b>,₹5\nZ', { head: true, css: false, caption: 'C' });
    if (b !== '<table>\n  <caption>C</caption>\n  <thead>\n    <tr><th scope="col">Name</th><th scope="col">Amt</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>&lt;b&gt;</td><td>₹5</td></tr>\n    <tr><td>Z</td><td></td></tr>\n  </tbody>\n</table>') f.push('build ' + b);
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
