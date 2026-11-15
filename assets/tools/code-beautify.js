/* Infinity by GroupChatOn — code-beautify. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Code beautifier: tidy JavaScript / JSON, CSS, HTML (js-beautify) and SQL (sql-formatter), with automatic language detection. Libraries load on first use. */
GCOTools.register('code-beautify', function (spot, T) {
  var B = 'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.15.1/', SF = 'https://cdn.jsdelivr.net/npm/sql-formatter@15.4.5/dist/sql-formatter.min.js';
  var NAMES = { js: 'JavaScript / JSON', css: 'CSS', html: 'HTML', sql: 'SQL' };
  function guess(t) {
    var s = t.trim();
    if (/^</.test(s)) return 'html';
    if (/^(select|insert|update|delete|create|with|alter|drop)\b/i.test(s)) return 'sql';
    if (/^[{\[]/.test(s)) return 'js';
    if (/^[@.#:\w\[*][^{;()]*\{[^{}]*:[^{}]*\}/.test(s) && !/\b(function|var|let|const|return|=>)\b/.test(s)) return 'css';
    return 'js';
  }
  var last = 'js';
  function beautify(t, o) {
    var lang = o.lang === 'auto' || !o.lang ? guess(t) : o.lang, tab = o.indent === 'tab', n = tab ? 1 : +o.indent || 2;
    last = lang;
    if (lang === 'sql') return T.loadScript(SF).then(function () { return window.sqlFormatter.format(t, { language: 'sql', tabWidth: n, useTabs: tab, keywordCase: 'upper', linesBetweenQueries: 1 }); });
    var opts = { indent_size: n, indent_char: tab ? '\t' : ' ', indent_with_tabs: tab, preserve_newlines: true, max_preserve_newlines: 2, end_with_newline: false, wrap_line_length: 0, indent_inner_html: false };
    return ['beautify.min.js', 'beautify-css.min.js', 'beautify-html.min.js'].reduce(function (p, f) { return p.then(function () { return T.loadScript(B + f); }); }, Promise.resolve()).then(function () {
      return lang === 'css' ? window.css_beautify(t, opts) : lang === 'html' ? window.html_beautify(t, opts) : window.js_beautify(t, opts);
    });
  }
  var lang = T.seg([['auto', 'Auto'], ['js', 'JS'], ['css', 'CSS'], ['html', 'HTML'], ['sql', 'SQL']], 'auto');
  lang.setAttribute('data-opt', 'lang');
  T.transformer(spot, { id: 'code-beautify', inLabel: 'Messy or minified code', outLabel: 'Beautified code', mono: true, rows: 12, download: 'beautified.txt', run: beautify,
    options: [lang, T.opt.select('indent', 'Indent', [['2', '2 spaces'], ['4', '4 spaces'], ['tab', 'Tab']], '2')],
    sample: 'function total(items){let sum=0;for(const i of items){if(i.qty>0){sum+=i.qty*i.price}}return {sum:sum,count:items.length}}const cart=[{qty:2,price:45},{qty:1,price:120}];console.log(total(cart));',
    note: function (a, b) { return b ? '✓ ' + NAMES[last] + ' · ' + b.split('\n').length + ' lines' : ''; } });
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['code-beautify'] = function () {
    var f = [], n = 0;
    function c(src, o, want) { n++; return beautify(src, o).then(function (r) { if (r !== want) f.push(src.slice(0, 30) + ' → ' + JSON.stringify(r)); }); }
    ['<p>x</p>', 'html', 'SELECT 1', 'sql', '{"a":1}', 'js', '.a{color:red}', 'css', 'const a = {b: 1}', 'js', 'a:hover{color:red}', 'css'].forEach(function (x, i, a) { if (i % 2 === 0) { n++; if (guess(x) !== a[i + 1]) f.push('guess ' + x + ' → ' + guess(x)); } });
    return c('function a(){return 1}', { lang: 'js', indent: '2' }, 'function a() {\n  return 1\n}')
      .then(function () { return c('a{color:red;margin:0}', { lang: 'css', indent: '4' }, 'a {\n    color: red;\n    margin: 0\n}'); })
      .then(function () { return c('<div><p>Hi</p></div>', { lang: 'html', indent: '2' }, '<div>\n  <p>Hi</p>\n</div>'); })
      .then(function () { return c('select a,b from t where c=1', { lang: 'sql', indent: '2' }, 'SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  c = 1'); })
      .then(function () { return { ok: !f.length, n: n, fails: f }; });
  };
});
