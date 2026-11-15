/* Infinity by GroupChatOn — dice. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Dice roller: 1–10 dice of 4 to 100 sides, or game notation like 2d6+3, with totals and a roll history. */
GCOTools.register('dice', function (spot, T) {
  var h = T.h, status = T.status(), FACE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function parse(s) {
    var m = /^\s*(\d*)\s*d\s*(\d+)\s*(?:([+-])\s*(\d+))?\s*$/i.exec(s);
    if (!m) throw new Error('Write dice like 2d6, d20 or 3d8+2.');
    var n = +(m[1] || 1), sides = +m[2], mod = m[3] ? (m[3] === '-' ? -1 : 1) * +m[4] : 0;
    if (n < 1 || n > 100 || sides < 2 || sides > 1000) throw new Error('Use 1–100 dice with 2–1000 sides.');
    return { n: n, sides: sides, mod: mod };
  }
  function roll(d) { var v = []; for (var i = 0; i < d.n; i++) v.push(1 + rnd(d.sides)); return { v: v, total: v.reduce(function (a, b) { return a + b; }, 0) + d.mod }; }
  var n = T.select([1, 2, 3, 4, 5, 6, 8, 10].map(function (x) { return [x, x + (x === 1 ? ' die' : ' dice')]; }), 2);
  var sides = T.select([[4, 'd4'], [6, 'd6 (normal dice)'], [8, 'd8'], [10, 'd10'], [12, 'd12'], [20, 'd20'], [100, 'd100 (percent)']], 6);
  var note = h('input', { type: 'text', 'class': 'tmono', placeholder: 'or type 3d6+2', 'aria-label': 'Dice notation' });
  var faces = h('div', { 'aria-live': 'polite', style: 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;min-height:86px;align-items:center' });
  var total = h('div', { 'data-out': '', style: 'text-align:center;font-size:22px;font-weight:700' }), hist = h('textarea', { rows: '4', 'class': 'tout tmono', readonly: true, 'aria-label': 'History' }), past = [];
  function go() {
    try {
      var d = note.value.trim() ? parse(note.value) : { n: +n.value, sides: +sides.value, mod: 0 }, r = roll(d);
      faces.innerHTML = '';
      r.v.forEach(function (x) {
        faces.appendChild(d.sides === 6 ? h('span', { style: 'font-size:76px;line-height:1', text: FACE[x], title: String(x) })
          : h('span', { style: 'display:grid;place-items:center;min-width:64px;height:64px;padding:0 8px;border-radius:14px;border:2px solid var(--line);font:800 26px system-ui', text: String(x) }));
      });
      var label = d.n + 'd' + d.sides + (d.mod ? (d.mod > 0 ? '+' : '') + d.mod : '');
      total.textContent = 'Total: ' + r.total + (d.n > 1 || d.mod ? '  (' + r.v.join(' + ') + (d.mod ? (d.mod > 0 ? ' + ' : ' − ') + Math.abs(d.mod) : '') + ')' : '');
      past.unshift(label + ' → ' + r.v.join(', ') + (d.n > 1 || d.mod ? ' = ' + r.total : '')); past = past.slice(0, 50); hist.value = past.join('\n'); status.clear();
    } catch (e) { status.error(e); }
  }
  note.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Dice', n), T.field('Sides', sides), T.field('Game notation (optional)', note)]),
    T.row([T.button('Roll', { primary: true, onclick: go }), T.button('Clear history', { small: true, onclick: function () { past = []; hist.value = ''; } })]), status.el, faces, total, T.field('Last rolls', hist)]));
  T.tests['dice'] = function () {
    var f = [], p = parse('3d8+2'), q = parse('d20'), r = parse('2D6 - 1');
    if (p.n !== 3 || p.sides !== 8 || p.mod !== 2 || q.n !== 1 || q.sides !== 20 || r.mod !== -1) f.push('parse');
    for (var i = 0; i < 500; i++) { var x = roll({ n: 2, sides: 6, mod: 3 }); if (x.total < 5 || x.total > 15 || x.v.length !== 2) { f.push('roll ' + JSON.stringify(x)); break; } }
    try { parse('6 sided'); f.push('bad notation accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
