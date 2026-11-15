/* Infinity by GroupChatOn — specificity. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS specificity calculator: (ID, class, element) score for any selector, including :is, :not, :has and :where, ranked so you see which rule wins. */
GCOTools.register('specificity', function (spot, T) {
  var LEGACY = { before: 1, after: 1, 'first-line': 1, 'first-letter': 1 };
  function split(s) {   // split at top-level commas
    var out = [], depth = 0, cur = '', q = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (q) { cur += c; if (c === q && s[i - 1] !== '\\') q = ''; continue; }
      if (c === '"' || c === "'") q = c;
      if (c === '(' || c === '[') depth++;
      if (c === ')' || c === ']') depth--;
      if (c === ',' && !depth) { out.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function group(s, i) { var depth = 0, j = i; for (; j < s.length; j++) { if (s[j] === '(') depth++; else if (s[j] === ')' && !--depth) break; } return [s.slice(i + 1, j), j + 1]; }
  function max(list) { return list.map(spec).reduce(function (m, x) { return cmp(x, m) > 0 ? x : m; }, [0, 0, 0]); }
  function cmp(x, y) { return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }
  function spec(sel) {
    var a = 0, b = 0, c = 0, i = 0, s = sel.trim(), id = /^-?[A-Za-z_ -￿\\][\w\- -￿\\]*/;
    function skip() { var m = id.exec(s.slice(i)); i += m ? m[0].length : 1; return m ? m[0] : ''; }
    while (i < s.length) {
      var ch = s[i];
      if (ch === '#') { i++; skip(); a++; }
      else if (ch === '.') { i++; skip(); b++; }
      else if (ch === '[') { var q = '', j = i + 1; for (; j < s.length; j++) { if (q) { if (s[j] === q) q = ''; } else if (s[j] === '"' || s[j] === "'") q = s[j]; else if (s[j] === ']') break; } i = j + 1; b++; }
      else if (ch === ':' && s[i + 1] === ':') { i += 2; skip(); c++; if (s[i] === '(') i = group(s, i)[1]; }
      else if (ch === ':') {
        i++; var name = skip().toLowerCase();
        if (LEGACY[name]) { c++; continue; }
        if (s[i] === '(') {
          var g = group(s, i); i = g[1];
          if (name === 'where') continue;
          if (name === 'not' || name === 'is' || name === 'has' || name === 'matches' || name === '-webkit-any') { var m = max(split(g[0])); a += m[0]; b += m[1]; c += m[2]; continue; }
          if (/^nth-(last-)?child$/.test(name)) { var of = /\sof\s+(.+)$/i.exec(g[0]); b++; if (of) { var n = max(split(of[1])); a += n[0]; b += n[1]; c += n[2]; } continue; }
        }
        b++;
      }
      else if (/[A-Za-z_ -￿-]/.test(ch) && (i === 0 || /[\s>+~(|]/.test(s[i - 1]) || s[i - 1] === undefined)) { skip(); if (s[i] === '|') { i++; continue; } c++; }
      else i++;
    }
    return [a, b, c];
  }
  function run(t) {
    var all = [];
    t.split(/\r?\n/).forEach(function (l) { l = l.replace(/\{[\s\S]*$/, '').trim(); if (l) split(l).forEach(function (s) { all.push([s, spec(s)]); }); });
    if (!all.length) return '';
    var ranked = all.slice().sort(function (x, y) { return cmp(y[1], x[1]); }), w = Math.min(46, Math.max.apply(0, all.map(function (x) { return x[0].length; })));
    return ['(IDs, classes, elements)   selector', ''].concat(all.map(function (x) { return '(' + x[1].join(', ') + ')' + '                    '.slice(0, 18 - x[1].join(', ').length) + '   ' + x[0]; }),
      ['', 'Strongest first:'], ranked.map(function (x, k) { return (k + 1) + '. ' + (x[0].length > w ? x[0].slice(0, w - 1) + '…' : x[0]) + '  (' + x[1].join(',') + ')'; }),
      ranked.length > 1 && !cmp(ranked[0][1], ranked[1][1]) ? ['', 'The top two are equal: the one written LATER in the CSS wins.'] : []).join('\n');
  }
  T.transformer(spot, { id: 'specificity', inLabel: 'CSS selectors (one per line)', mono: true, rows: 6, outLabel: 'Specificity', download: false,
    sample: '#nav .menu a:hover\nul li::before\n.btn.btn-primary\nbody main article p\n:is(#main, .content) > p\n:where(.card) h2\nbutton:not(.disabled)', run: run,
    note: function () { return 'Compare left to right: one ID beats any number of classes; one class beats any number of elements. Inline styles and !important beat all of these.'; } });
  T.tests['specificity'] = function () {
    var f = [], c = [['#nav .item a:hover', '1,2,1'], ['ul li::before', '0,0,3'], ['a::after', '0,0,2'], ['p:first-line', '0,0,2'], [':not(#a, .b)', '1,0,0'], [':where(#a) p', '0,0,1'],
      ['a[href^="http"]', '0,1,1'], ['li:nth-child(2n+1 of .x)', '0,2,1'], ['*', '0,0,0'], ['input:is(:focus, #x)', '1,0,1'], ['.a.b.c', '0,3,0'], ['div > p + span ~ em', '0,0,4'], ['svg|rect', '0,0,1'], [':has(> img)', '0,0,1']];
    c.forEach(function (x) { var s = spec(x[0]).join(); if (s !== x[1]) f.push(x[0] + ' → ' + s); });
    if (split('a, b:is(c, d), [x=","]').length !== 3) f.push('split');
    return Promise.resolve({ ok: !f.length, n: 15, fails: f });
  };
});
