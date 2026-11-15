/* Infinity by GroupChatOn — px-rem. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* px ↔ rem / em / pt / vw / vh / % converter with your own base font size and screen size, plus a ready px → rem table. */
GCOTools.register('px-rem', function (spot, T) {
  var h = T.h, U = [['px', 'px'], ['rem', 'rem'], ['em', 'em'], ['pt', 'pt (print)'], ['vw', 'vw (screen width)'], ['vh', 'vh (screen height)'], ['%', '% of parent font']];
  function toPx(v, u, o) { return u === 'px' ? v : u === 'rem' ? v * o.base : u === 'em' || u === '%' ? (u === '%' ? v / 100 : v) * o.parent : u === 'pt' ? v * 96 / 72 : u === 'vw' ? v * o.vw / 100 : v * o.vh / 100; }
  function fromPx(px, u, o) { return u === 'px' ? px : u === 'rem' ? px / o.base : u === 'em' ? px / o.parent : u === '%' ? px / o.parent * 100 : u === 'pt' ? px * 72 / 96 : u === 'vw' ? px / o.vw * 100 : px / o.vh * 100; }
  function nice(n) { return String(Math.round(n * 10000) / 10000); }
  var val = h('input', { type: 'number', value: '24', step: 'any', 'class': 'tbig', 'aria-label': 'Value' }), unit = T.select(U, 'px');
  var base = h('input', { type: 'number', value: '16', min: '1' }), parent = h('input', { type: 'number', value: '16', min: '1' });
  var vw = h('input', { type: 'number', value: String(window.innerWidth || 1440), min: '1' }), vh = h('input', { type: 'number', value: String(window.innerHeight || 900), min: '1' });
  var res = h('div', { 'class': 'tkv', 'data-out': '' }), table = h('div', { 'class': 'tstats' });
  function o() { return { base: +base.value || 16, parent: +parent.value || 16, vw: +vw.value || 1440, vh: +vh.value || 900 }; }
  function draw() {
    var op = o(), px = toPx(+val.value || 0, unit.value, op);
    res.innerHTML = '';
    U.forEach(function (u) {
      if (u[0] === unit.value) return;
      var s = nice(fromPx(px, u[0], op)) + u[0];
      res.appendChild(h('div', {}, [h('span', { text: u[1] }), h('code', { text: s }), T.button('Copy', { small: true, onclick: function (e) { T.copy(s, e.currentTarget); } })]));
    });
    table.innerHTML = '';
    [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].forEach(function (p) { table.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: nice(p / op.base) + 'rem' }), h('span', { text: p + 'px' })])); });
  }
  [val, unit, base, parent, vw, vh].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  spot.appendChild(T.card([T.row([T.field('Value', val), T.field('From', unit)]), res,
    h('div', { 'class': 'tgrid2' }, [T.field('Root font size (px)', base, 'Browsers use 16 px unless you change it'), T.field('Parent font size (px)', parent, 'Used for em and %'),
      T.field('Screen width (px)', vw, 'Yours now: ' + (window.innerWidth || '?')), T.field('Screen height (px)', vh)]),
    T.field('Quick table: px → rem at your root size', table)]));
  draw();
  T.tests['px-rem'] = function () {
    var f = [], op = { base: 16, parent: 20, vw: 1440, vh: 900 };
    if (fromPx(24, 'rem', op) !== 1.5) f.push('24px rem');
    if (toPx(1, 'rem', op) !== 16 || nice(fromPx(16, 'pt', op)) !== '12') f.push('rem/pt');
    if (fromPx(144, 'vw', op) !== 10 || fromPx(90, 'vh', op) !== 10) f.push('vw/vh');
    if (fromPx(30, 'em', op) !== 1.5 || fromPx(30, '%', op) !== 150) f.push('em/%');
    if (nice(fromPx(toPx(2.5, 'vw', op), 'pt', op)) !== '27') f.push('vw→pt ' + nice(fromPx(toPx(2.5, 'vw', op), 'pt', op)));
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
