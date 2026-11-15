/* Infinity by GroupChatOn — xml-format. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* XML formatter: beautify, minify and validate XML, and convert XML ↔ JSON — all with the browser's own XML parser. */
GCOTools.register('xml-format', function (spot, T) {
  function esc(s, attr) { s = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); return attr ? s.replace(/"/g, '&quot;') : s; }
  function parse(s) {
    var d = new DOMParser().parseFromString(s.trim(), 'application/xml'), e = d.getElementsByTagName('parsererror')[0];
    if (e) throw new Error('This is not valid XML: ' + (e.textContent || '').replace(/\s+/g, ' ').replace(/^.*?error[^:]*:\s*/i, '').slice(0, 200));
    return d;
  }
  function ser(n, ind, lvl) {
    var pad = ind === null ? '' : new Array(lvl + 1).join(ind), nl = ind === null ? '' : '\n';
    if (n.nodeType === 3) { var t = n.nodeValue.trim(); return t ? pad + esc(ind === null ? t : t.replace(/\s+/g, ' ')) + nl : ''; }
    if (n.nodeType === 4) return pad + '<![CDATA[' + n.nodeValue + ']]>' + nl;
    if (n.nodeType === 8) return pad + '<!--' + n.nodeValue + '-->' + nl;
    if (n.nodeType === 7) return pad + '<?' + n.target + ' ' + n.data + '?>' + nl;
    if (n.nodeType !== 1) return '';
    var open = '<' + n.nodeName + Array.prototype.map.call(n.attributes, function (a) { return ' ' + a.name + '="' + esc(a.value, true) + '"'; }).join('');
    var kids = Array.prototype.filter.call(n.childNodes, function (c) { return c.nodeType !== 3 || c.nodeValue.trim(); });
    if (!kids.length) return pad + open + '/>' + nl;
    if (kids.length === 1 && kids[0].nodeType === 3) return pad + open + '>' + esc(kids[0].nodeValue.trim()) + '</' + n.nodeName + '>' + nl;
    return pad + open + '>' + nl + kids.map(function (c) { return ser(c, ind, lvl + 1); }).join('') + pad + '</' + n.nodeName + '>' + nl;
  }
  function decl(s) { var m = /^\s*(<\?xml[^?]*\?>)/.exec(s); return m ? m[1] : ''; }
  function format(s, ind) {
    var d = parse(s), body = Array.prototype.map.call(d.childNodes, function (c) { return ser(c, ind, 0); }).join('');
    return (decl(s) ? decl(s) + (ind === null ? '' : '\n') : '') + (ind === null ? body : body.replace(/\n$/, ''));
  }
  function toObj(el) {
    var o = {}, has = false;
    Array.prototype.forEach.call(el.attributes, function (a) { o['@' + a.name] = a.value; has = true; });
    var text = '';
    Array.prototype.forEach.call(el.childNodes, function (c) {
      if (c.nodeType === 3 || c.nodeType === 4) { text += c.nodeValue; return; }
      if (c.nodeType !== 1) return;
      var v = toObj(c); has = true;
      if (c.nodeName in o) { if (!Array.isArray(o[c.nodeName])) o[c.nodeName] = [o[c.nodeName]]; o[c.nodeName].push(v); } else o[c.nodeName] = v;
    });
    text = text.trim();
    if (!has) return text;
    if (text) o['#text'] = text;
    return o;
  }
  function toXml(k, v, ind, lvl) {
    var pad = new Array(lvl + 1).join(ind);
    if (Array.isArray(v)) return v.map(function (x) { return toXml(k, x, ind, lvl); }).join('');
    if (v === null || typeof v !== 'object') return pad + (v === null || v === '' ? '<' + k + '/>' : '<' + k + '>' + esc(v) + '</' + k + '>') + '\n';
    var attrs = '', kids = '', text = '';
    Object.keys(v).forEach(function (c) {
      if (c[0] === '@') attrs += ' ' + c.slice(1) + '="' + esc(v[c], true) + '"';
      else if (c === '#text') text = esc(v[c]);
      else kids += toXml(/^[A-Za-z_][\w.-]*$/.test(c) ? c : 'item', v[c], ind, lvl + 1);
    });
    if (!kids) return pad + '<' + k + attrs + (text ? '>' + text + '</' + k + '>' : '/>') + '\n';
    return pad + '<' + k + attrs + '>\n' + (text ? pad + ind + text + '\n' : '') + kids + pad + '</' + k + '>\n';
  }
  function run(t, o) {
    var ind = o.indent === 'tab' ? '\t' : new Array((+o.indent || 2) + 1).join(' ');
    if (o.mode === 'min') return format(t, null);
    if (o.mode === 'json') { var r = parse(t).documentElement, x = {}; x[r.nodeName] = toObj(r); return JSON.stringify(x, null, ind); }
    if (o.mode === 'xml') {
      var j; try { j = JSON.parse(t); } catch (e) { throw new Error('This is not valid JSON: ' + e.message); }
      var keys = j && typeof j === 'object' && !Array.isArray(j) ? Object.keys(j) : [];
      return '<?xml version="1.0" encoding="UTF-8"?>\n' + (keys.length === 1 && !Array.isArray(j[keys[0]]) ? toXml(keys[0], j[keys[0]], ind, 0) : toXml('root', j, ind, 0)).replace(/\n$/, '');
    }
    return format(t, ind);
  }
  T.transformer(spot, { id: 'xml-format', inLabel: 'XML (or JSON for JSON → XML)', mono: true, download: 'result.xml', type: 'application/xml',
    sample: '<?xml version="1.0"?><catalog><book id="b1" lang="en"><title>Wings of Fire</title><author>A. P. J. Abdul Kalam</author><year>1999</year></book><book id="b2"><title>The Guide</title><author>R. K. Narayan</author><year>1958</year></book></catalog>',
    options: [T.opt.select('mode', 'Do', [['pretty', 'Format (beautify)'], ['min', 'Minify'], ['json', 'XML → JSON'], ['xml', 'JSON → XML']], 'pretty'),
      T.opt.select('indent', 'Indent', [['2', '2 spaces'], ['4', '4 spaces'], ['tab', 'Tab']], '2')],
    note: function (a, b) { return b ? 'Valid ✓ · ' + b.split('\n').length + ' lines' : ''; }, run: run });
  T.tests['xml-format'] = function () {
    var f = [], o = { mode: 'pretty', indent: '2' };
    var p = run('<a><b x="1">hi</b><c/><!--note--></a>', o);
    if (p !== '<a>\n  <b x="1">hi</b>\n  <c/>\n  <!--note-->\n</a>') f.push('format ' + p);
    if (run('<?xml version="1.0"?>\n<a>\n  <b> 1 </b>\n</a>', { mode: 'min' }) !== '<?xml version="1.0"?><a><b>1</b></a>') f.push('minify ' + run('<?xml version="1.0"?>\n<a>\n  <b> 1 </b>\n</a>', { mode: 'min' }));
    var j = run('<r><i n="1">x</i><i n="2">y</i><e/></r>', { mode: 'json', indent: '2' });
    if (JSON.stringify(JSON.parse(j)) !== '{"r":{"i":[{"@n":"1","#text":"x"},{"@n":"2","#text":"y"}],"e":""}}') f.push('to json ' + j);
    var x = run('{"r":{"i":[{"@n":"1","#text":"x"}, "y"],"e":"a&b"}}', { mode: 'xml', indent: '2' });
    if (x !== '<?xml version="1.0" encoding="UTF-8"?>\n<r>\n  <i n="1">x</i>\n  <i>y</i>\n  <e>a&amp;b</e>\n</r>') f.push('to xml ' + x);
    try { run('<a><b></a>', o); f.push('broken xml accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
