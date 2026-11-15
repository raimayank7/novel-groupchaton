/* Infinity by GroupChatOn — css-grid. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS grid generator: columns, rows, gaps and alignment with layout presets, a live numbered preview, and the CSS and HTML to copy. */
GCOTools.register('css-grid', function (spot, T) {
  var h = T.h;
  function css(o) {
    return '.grid {\n  display: grid;\n  grid-template-columns: ' + o.cols + ';\n' + (o.rows && o.rows !== 'auto' ? '  grid-template-rows: ' + o.rows + ';\n' : '') + (o.areas ? '  grid-template-areas:\n' + o.areas.map(function (r) { return '    "' + r + '"'; }).join('\n') + ';\n' : '') +
      (o.cg === o.rg ? '  gap: ' + o.cg + 'px;\n' : '  gap: ' + o.rg + 'px ' + o.cg + 'px;\n') + (o.ji !== 'stretch' ? '  justify-items: ' + o.ji + ';\n' : '') + (o.ai !== 'stretch' ? '  align-items: ' + o.ai + ';\n' : '') + '}';
  }
  function html(o) { return '<div class="grid">\n' + (o.names ? o.names.map(function (n) { return '  <div class="' + n + '">' + n + '</div>'; }) : Array.apply(null, Array(o.n)).map(function (x, i) { return '  <div>' + (i + 1) + '</div>'; })).join('\n') + '\n</div>'; }
  var PRE = { 'Three equal columns': { cols: 'repeat(3, 1fr)', rows: 'auto', n: 6 }, 'Responsive cards': { cols: 'repeat(auto-fit, minmax(140px, 1fr))', rows: 'auto', n: 8 },
    'Sidebar + content': { cols: '220px 1fr', rows: 'auto', n: 2 }, 'Holy grail page': { cols: '180px 1fr 180px', rows: 'auto 1fr auto', areas: ['header header header', 'nav main aside', 'footer footer footer'], names: ['header', 'nav', 'main', 'aside', 'footer'] },
    'Photo gallery': { cols: 'repeat(4, 1fr)', rows: 'repeat(2, 120px)', n: 8 } };
  var cols = h('input', { type: 'text', 'class': 'tmono', value: 'repeat(3, 1fr)' }), rows = h('input', { type: 'text', 'class': 'tmono', value: 'auto' }), n = h('input', { type: 'number', min: '1', max: '40', value: '6' });
  var cg = h('input', { type: 'number', min: '0', value: '12' }), rg = h('input', { type: 'number', min: '0', value: '12' }), al = ['stretch', 'start', 'center', 'end'].map(function (x) { return [x, x]; }), ji = T.select(al, 'stretch'), ai = T.select(al, 'stretch');
  var box = h('div', { style: 'min-height:200px;padding:10px;border:2px dashed var(--line);border-radius:14px;background:var(--bg);overflow:auto' }), out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, 'aria-label': 'CSS and HTML' }), cur = {};
  function o() { return { cols: cols.value.trim() || '1fr', rows: rows.value.trim(), n: Math.max(1, Math.min(40, +n.value || 1)), cg: +cg.value || 0, rg: +rg.value || 0, ji: ji.value, ai: ai.value, areas: cur.areas, names: cur.names }; }
  function draw() {
    var op = o(); box.style.display = 'grid'; box.style.gridTemplateColumns = op.cols; box.style.gridTemplateRows = op.rows; box.style.gap = op.rg + 'px ' + op.cg + 'px';
    box.style.gridTemplateAreas = op.areas ? op.areas.map(function (r) { return '"' + r + '"'; }).join(' ') : ''; box.style.justifyItems = op.ji; box.style.alignItems = op.ai; box.innerHTML = '';
    (op.names || Array.apply(null, Array(op.n)).map(function (x, i) { return String(i + 1); })).forEach(function (t, i) {
      box.appendChild(h('div', { text: t, style: 'display:grid;place-items:center;min-height:56px;padding:8px;border-radius:10px;font:700 15px system-ui;color:#0f172a;background:' + ['#38bdf8', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#fb923c'][i % 6] + (op.names ? ';grid-area:' + t : '') }));
    });
    out.value = css(op) + '\n\n' + html(op);
  }
  [cols, rows, n, cg, rg, ji, ai].forEach(function (x) { x.addEventListener('input', function () { if (x === cols || x === rows || x === n) cur = {}; draw(); }); x.addEventListener('change', draw); });
  var copy = T.button('Copy', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([T.field('Layouts', T.row(Object.keys(PRE).map(function (k) { return T.button(k, { small: true, onclick: function () { var p = PRE[k]; cur = p; cols.value = p.cols; rows.value = p.rows; n.value = p.n || p.names.length; draw(); } }); }))),
    box, h('div', { 'class': 'tgrid2' }, [T.field('Columns', cols, 'e.g. 1fr 2fr, 200px 1fr, repeat(4, 1fr)'), T.field('Rows', rows, 'auto lets content decide'), T.field('Items', n), T.field('Column gap (px)', cg), T.field('Row gap (px)', rg),
      T.field('justify-items', ji), T.field('align-items', ai)]), T.field('CSS and HTML', out), T.row([copy])]));
  draw();
  T.tests['css-grid'] = function () {
    var f = [], c = css({ cols: 'repeat(3, 1fr)', rows: 'auto', cg: 12, rg: 12, ji: 'stretch', ai: 'center' });
    if (c !== '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n  align-items: center;\n}') f.push(c);
    var p = PRE['Holy grail page'], a = css({ cols: p.cols, rows: p.rows, areas: p.areas, cg: 8, rg: 4, ji: 'stretch', ai: 'stretch' });
    if (a.indexOf('    "nav main aside"') < 0 || a.indexOf('gap: 4px 8px;') < 0 || html({ names: p.names }).indexOf('<div class="main">main</div>') < 0) f.push('areas');
    if (box.children.length !== 6) f.push('preview');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
