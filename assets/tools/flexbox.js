/* Infinity by GroupChatOn — flexbox. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Flexbox playground: set direction, wrap, justify, align and gap, watch numbered boxes move, and copy the CSS. */
GCOTools.register('flexbox', function (spot, T) {
  var h = T.h;
  var P = [['flex-direction', ['row', 'row-reverse', 'column', 'column-reverse'], 'row'], ['flex-wrap', ['nowrap', 'wrap', 'wrap-reverse'], 'wrap'],
    ['justify-content', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], 'flex-start'], ['align-items', ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'], 'stretch'],
    ['align-content', ['normal', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'stretch'], 'normal']];
  function css(o) { return '.container {\n  display: flex;\n' + P.filter(function (p) { return o[p[0]] !== (p[0] === 'flex-wrap' ? 'nowrap' : p[0] === 'flex-direction' ? 'row' : p[0] === 'align-content' ? 'normal' : p[0] === 'align-items' ? 'stretch' : 'flex-start'); })
    .map(function (p) { return '  ' + p[0] + ': ' + o[p[0]] + ';\n'; }).join('') + (o.gap ? '  gap: ' + o.gap + 'px;\n' : '') + '}'; }
  var sel = {}, gap = h('input', { type: 'range', min: '0', max: '40', value: '10' }), gapF = T.field('gap: 10px', gap), n = h('input', { type: 'range', min: '1', max: '12', value: '5' }), nF = T.field('Boxes: 5', n), mixed = h('input', { type: 'checkbox', checked: true });
  var box = h('div', { style: 'min-height:260px;padding:10px;border:2px dashed var(--line);border-radius:14px;background:var(--bg);overflow:auto' }), out = h('textarea', { rows: '8', 'class': 'tout tmono', readonly: true, 'aria-label': 'CSS' });
  var COLORS = ['#38bdf8', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#fb923c'];
  function o() { var r = { gap: +gap.value }; P.forEach(function (p) { r[p[0]] = sel[p[0]].value; }); return r; }
  function draw() {
    var op = o(); gapF.firstChild.textContent = 'gap: ' + gap.value + 'px'; nF.firstChild.textContent = 'Boxes: ' + n.value;
    box.style.display = 'flex'; P.forEach(function (p) { box.style[p[0].replace(/-(.)/g, function (m, c) { return c.toUpperCase(); })] = op[p[0]]; }); box.style.gap = op.gap + 'px';
    box.innerHTML = '';
    for (var i = 0; i < +n.value; i++) box.appendChild(h('div', { text: String(i + 1), style: 'display:grid;place-items:center;font:700 18px system-ui;color:#0f172a;border-radius:10px;background:' + COLORS[i % 6] + ';min-width:56px;min-height:48px;' + (mixed.checked ? 'padding:' + (6 + (i * 7) % 22) + 'px ' + (8 + (i * 11) % 30) + 'px' : 'padding:10px') }));
    out.value = css(op);
  }
  var copy = T.button('Copy CSS', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([box, h('div', { 'class': 'tgrid2' }, P.map(function (p) { sel[p[0]] = T.select(p[1].map(function (x) { return [x, x]; }), p[2]); sel[p[0]].addEventListener('change', draw); return T.field(p[0], sel[p[0]]); }).concat([gapF, nF])),
    h('label', { 'class': 'tcheck' }, [mixed, ' Boxes of different sizes']), T.field('CSS', out), T.row([copy])]));
  [gap, n, mixed].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  draw();
  T.tests['flexbox'] = function () {
    var f = [], c = css({ 'flex-direction': 'row', 'flex-wrap': 'wrap', 'justify-content': 'space-between', 'align-items': 'center', 'align-content': 'normal', gap: 8 });
    if (c !== '.container {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: 8px;\n}') f.push(c);
    if (box.children.length !== 5 || box.style.flexWrap !== 'wrap') f.push('preview');
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
