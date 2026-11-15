/* Infinity by GroupChatOn — emmet. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Emmet abbreviation expander: type ul>li*3 or m10 and get the full HTML, JSX or CSS (the official Emmet engine, loaded on first use). */
GCOTools.register('emmet', function (spot, T) {
  var h = T.h, EM = 'https://cdn.jsdelivr.net/npm/emmet@2.4.7/+esm', emmet = null;
  function load() { return emmet ? Promise.resolve(emmet) : import(EM).then(function (m) { emmet = m.default; return emmet; }); }
  var CSS = /^(css|scss|sass|less)$/;
  function expand(text, o) {
    return load().then(function (E) {
      var syntax = o.syntax || 'html', cfg = { syntax: syntax, type: CSS.test(syntax) ? 'stylesheet' : 'markup',
        options: { 'output.indent': o.indent === 'tab' ? '\t' : o.indent === '4' ? '    ' : '  ', 'output.selfClosingStyle': o.xhtml ? 'xhtml' : 'html' } };
      return text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (abbr) {
        try { return E(abbr, cfg); } catch (e) { throw new Error('Could not expand “' + abbr + '”: ' + e.message); }
      }).join('\n');
    });
  }
  var syntax = T.seg([['html', 'HTML'], ['jsx', 'JSX'], ['css', 'CSS'], ['scss', 'SCSS']], 'html');
  syntax.setAttribute('data-opt', 'syntax');
  var tr = T.transformer(spot, { id: 'emmet', inLabel: 'Emmet abbreviations (one per line)', outLabel: 'Expanded code', mono: true, rows: 7, download: 'snippet.html', type: 'text/html',
    placeholder: 'ul.menu>li.item$*3>a{Link $}', run: expand,
    options: [syntax, T.opt.select('indent', 'Indent', [['2', '2 spaces'], ['4', '4 spaces'], ['tab', 'Tab']], '2'), T.opt.check('xhtml', 'Close empty tags like <br />', false)],
    sample: '!\nnav>ul.menu>li.item$*3>a[href=#]{Link $}\nform#signup>(label+input:email)+button:s{Join}\ntable>tr*2>td*3',
    note: function (a, b) { return b ? '✓ ' + b.split('\n').length + ' lines of code' : ''; } });
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  var cheat = [['div.box', 'class'], ['div#main', 'id'], ['ul>li*3', 'child × 3'], ['h1+p', 'sibling'], ['li.item$*3', 'numbered'], ['a{Click}', 'text'], ['img[src=a.jpg]', 'attribute'], ['m10', 'CSS margin'], ['df', 'CSS display:flex']];
  spot.lastChild.appendChild(h('p', { 'class': 'tnote', style: 'font-size:14px' }, ['Try: '].concat(cheat.map(function (c, i) {
    return h('span', {}, [i ? ' · ' : '', h('a', { href: '#', text: c[0], onclick: function (e) { e.preventDefault(); tr.input.value = c[0]; tr.update(); } }), ' (' + c[1] + ')']);
  }))));
  T.tests['emmet'] = function () {
    var f = [], n = 0;
    function c(a, o, want) { n++; return expand(a, o).then(function (r) { if (r !== want) f.push(a + ' → ' + JSON.stringify(r)); }, function (e) { f.push(a + ' threw ' + e.message); }); }
    return c('ul>li.item$*2', { syntax: 'html', indent: '2' }, '<ul>\n  <li class="item1"></li>\n  <li class="item2"></li>\n</ul>')
      .then(function () { return c('p{Hi}+a', { syntax: 'html', indent: '2' }, '<p>Hi</p>\n<a href=""></a>'); })
      .then(function () { return c('div.box', { syntax: 'jsx', indent: '2' }, '<div className="box"></div>'); })
      .then(function () { return c('m10\np5-10', { syntax: 'css', indent: '2' }, 'margin: 10px;\npadding: 5px 10px;'); })
      .then(function () { return c('br', { syntax: 'html', indent: '2', xhtml: true }, '<br />'); })
      .then(function () { return { ok: !f.length, n: n, fails: f }; });
  };
});
