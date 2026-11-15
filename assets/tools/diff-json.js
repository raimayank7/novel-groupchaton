/* Infinity by GroupChatOn — diff-json. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* JSON compare: two JSON documents compared by meaning (key order ignored), listing every added, removed and changed value with its path. */
GCOTools.register('diff-json', function (spot, T) {
  var h = T.h;
  function key(p, k) { return typeof k === 'number' ? p + '[' + k + ']' : /^[A-Za-z_$][\w$]*$/.test(k) ? p + '.' + k : p + '[' + JSON.stringify(k) + ']'; }
  function type(v) { return v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v; }
  function show(v) { var s = JSON.stringify(v); return s.length > 80 ? s.slice(0, 77) + '…' : s; }
  function diff(a, b, p, out) {
    var ta = type(a), tb = type(b);
    if (ta !== tb) { out.push(['~', p, show(a) + ' → ' + show(b) + ' (' + ta + ' → ' + tb + ')']); return out; }
    if (ta === 'array') {
      for (var i = 0; i < Math.max(a.length, b.length); i++) {
        if (i >= b.length) out.push(['-', key(p, i), show(a[i])]);
        else if (i >= a.length) out.push(['+', key(p, i), show(b[i])]);
        else diff(a[i], b[i], key(p, i), out);
      }
    } else if (ta === 'object') {
      Object.keys(a).forEach(function (k) { if (!(k in b)) out.push(['-', key(p, k), show(a[k])]); else diff(a[k], b[k], key(p, k), out); });
      Object.keys(b).forEach(function (k) { if (!(k in a)) out.push(['+', key(p, k), show(b[k])]); });
    } else if (a !== b) out.push(['~', p, show(a) + ' → ' + show(b)]);
    return out;
  }
  function parse(s, which) {
    try { return JSON.parse(s); } catch (e) {
      var m = /position (\d+)/.exec(e.message), line = m ? s.slice(0, +m[1]).split('\n').length : 0;
      throw new Error('The ' + which + ' JSON has an error' + (line ? ' on line ' + line : '') + ': ' + e.message);
    }
  }
  var A = h('textarea', { rows: '10', 'class': 'tin tmono', spellcheck: 'false', placeholder: '{ "name": "Asha", "age": 30 }', 'aria-label': 'First JSON' });
  var B = h('textarea', { rows: '10', 'class': 'tin tmono', spellcheck: 'false', placeholder: '{ "age": 31, "name": "Asha" }', 'aria-label': 'Second JSON' });
  var out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, 'aria-label': 'Differences' }), status = T.status();
  A.value = T.store.get('diff-json-a', ''); B.value = T.store.get('diff-json-b', '');
  function run() {
    T.store.set('diff-json-a', A.value.slice(0, 100000)); T.store.set('diff-json-b', B.value.slice(0, 100000));
    out.value = '';
    if (!A.value.trim() || !B.value.trim()) { status.info('Paste JSON in both boxes.'); return; }
    try {
      var d = diff(parse(A.value, 'first'), parse(B.value, 'second'), '$', []);
      var n = { '+': 0, '-': 0, '~': 0 }; d.forEach(function (x) { n[x[0]]++; });
      out.value = d.map(function (x) { return x[0] + ' ' + x[1] + ': ' + x[2]; }).join('\n');
      if (d.length) status.info(d.length + ' difference' + (d.length > 1 ? 's' : '') + ': ' + n['+'] + ' added (+), ' + n['-'] + ' removed (−), ' + n['~'] + ' changed (~).');
      else status.ok('Same data ✓ (key order and spacing are ignored).');
    } catch (e) { status.error(e); }
  }
  [A, B].forEach(function (x) { x.addEventListener('input', run); });
  var copy = T.button('Copy differences', { onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('First (old) JSON', A), T.field('Second (new) JSON', B)]),
    T.row([T.button('Try a sample', { small: true, onclick: function () {
      A.value = '{\n  "id": 7,\n  "name": "Asha",\n  "city": "Pune",\n  "tags": ["admin", "beta"],\n  "plan": { "name": "Pro", "price": 499 }\n}';
      B.value = '{\n  "name": "Asha",\n  "id": 7,\n  "tags": ["admin", "beta", "vip"],\n  "plan": { "name": "Pro", "price": 599 },\n  "email": "asha@example.com"\n}'; run(); } }),
      T.button('Swap', { small: true, onclick: function () { var t = A.value; A.value = B.value; B.value = t; run(); } }),
      T.button('Clear', { small: true, onclick: function () { A.value = B.value = ''; run(); } })]), status.el, T.field('Differences', out), T.row([copy])]));
  run();
  T.tests['diff-json'] = function () {
    var f = [], d = diff({ id: 7, city: 'Pune', tags: ['a', 'b'], plan: { price: 499 }, 'my key': 1 }, { tags: ['a', 'b', 'c'], id: 7, plan: { price: 599 }, email: 'x', 'my key': '1' }, '$', [])
      .map(function (x) { return x.join(' '); }).join('|');
    var want = '- $.city "Pune"|+ $.tags[2] "c"|~ $.plan.price 499 → 599|~ $["my key"] 1 → "1" (number → string)|+ $.email "x"';
    if (d !== want) f.push(d);
    if (diff({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 }, '$', []).length) f.push('key order counted');
    try { parse('{"a":1,}', 'first'); f.push('bad json accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
