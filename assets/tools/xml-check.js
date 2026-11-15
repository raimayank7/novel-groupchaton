/* Infinity by GroupChatOn — xml-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* XML validator: checks that XML is well-formed, points to the line and column of any error, and summarises the document. */
GCOTools.register('xml-check', function (spot, T) {
  function check(s) {
    var d = new DOMParser().parseFromString(s.trim(), 'application/xml'), e = d.getElementsByTagName('parsererror')[0];
    if (e) {
      var msg = (e.textContent || '').replace(/\s+/g, ' ').trim(), m = /line (\d+) at column (\d+):?\s*(.*?)(Below is|$)/i.exec(msg) || /(\d+):(\d+):\s*(.*)/.exec(msg);
      var line = m ? +m[1] : 0, col = m ? +m[2] : 0, why = (m ? m[3] : msg.replace(/^.*?error[^:]*:\s*/i, '')).replace(/\.$/, '');
      return { ok: false, line: line, col: col, why: why.slice(0, 200) };
    }
    var all = d.getElementsByTagName('*'), names = {}, attrs = 0, ns = {};
    Array.prototype.forEach.call(all, function (x) { names[x.nodeName] = (names[x.nodeName] || 0) + 1; attrs += x.attributes.length; if (x.namespaceURI) ns[x.namespaceURI] = 1; });
    var depth = function (n) { var m = 0; Array.prototype.forEach.call(n.children, function (c) { m = Math.max(m, depth(c)); }); return m + 1; };
    return { ok: true, root: d.documentElement.nodeName, count: all.length, attrs: attrs, depth: depth(d.documentElement), ns: Object.keys(ns), top: Object.keys(names).sort(function (a, b) { return names[b] - names[a]; }).slice(0, 8).map(function (k) { return k + ' ×' + names[k]; }) };
  }
  function run(t) {
    var r = check(t);
    if (!r.ok) {
      var L = t.trim().split('\n')[r.line - 1] || '';
      throw new Error((r.line ? 'Line ' + r.line + ', column ' + r.col + ': ' : '') + r.why + (L ? '\n' + L.slice(0, 120) : '') +
        '\nCommon causes: a tag not closed, tags closed in the wrong order, a bare & (write &amp;), or text before the first tag.');
    }
    return ['✓ Well-formed XML', 'Root element   ' + r.root, 'Elements       ' + r.count, 'Attributes     ' + r.attrs, 'Deepest level  ' + r.depth,
      'Namespaces     ' + (r.ns.length ? r.ns.join(', ') : 'none'), 'Most used      ' + r.top.join(', ')].join('\n');
  }
  var tr = T.transformer(spot, { id: 'xml-check', inLabel: 'XML to check', mono: true, rows: 12, outLabel: 'Result', download: false,
    sample: '<?xml version="1.0"?>\n<order id="1001">\n  <customer>Asha & Sons</customer>\n  <item qty="2">Notebook</item>\n</order>', run: run });
  tr.status.el.style.whiteSpace = 'pre-wrap';
  T.tests['xml-check'] = function () {
    var f = [], a = check('<a x="1"><b/><b><c/></b></a>'), b = check('<a>\n<b></a>'), c = check('<a>Tom & Jerry</a>');
    if (!a.ok || a.count !== 4 || a.depth !== 3 || a.attrs !== 1 || a.root !== 'a') f.push('summary ' + JSON.stringify(a));
    if (b.ok || b.line !== 2) f.push('mismatched tag line ' + JSON.stringify(b));
    if (c.ok) f.push('bare & accepted');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
