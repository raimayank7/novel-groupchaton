/* Infinity by GroupChatOn — box-shadow. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS box-shadow generator: offsets, blur, spread, colour, opacity, inset, with a live preview and presets. */
GCOTools.register('box-shadow', function (spot, T) {
  var h = T.h;
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ', ' + (n >> 8 & 255) + ', ' + (n & 255) + ', ' + Math.round(a * 100) / 100 + ')'; }
  function css(o) { return (o.inset ? 'inset ' : '') + o.x + 'px ' + o.y + 'px ' + o.blur + 'px ' + o.spread + 'px ' + rgba(o.color, o.alpha); }
  var st = { x: 0, y: 10, blur: 30, spread: -5, color: '#000000', alpha: 0.25, inset: false, radius: 16, bg: '#ffffff' };
  var box = h('div', { style: 'width:min(220px,70%);height:140px;margin:28px auto;border-radius:16px;background:#fff' });
  var stage = h('div', { style: 'padding:24px 12px;border-radius:16px;background:#eef2f7' }, [box]);
  var out = h('textarea', { rows: '2', 'class': 'tout tmono', readonly: true, 'aria-label': 'CSS code' });
  var inputs = {};
  function slider(k, label, min, max) {
    var i = h('input', { type: 'range', min: String(min), max: String(max), value: String(st[k]) }), f = T.field(label + ': ' + st[k] + 'px', i);
    i.addEventListener('input', function () { st[k] = +i.value; f.firstChild.textContent = label + ': ' + i.value + 'px'; draw(); });
    inputs[k] = [i, f, label]; return f;
  }
  var col = h('input', { type: 'color', value: st.color, style: 'width:56px;height:40px;padding:2px' });
  var alpha = h('input', { type: 'range', min: '0', max: '100', value: '25' }), alphaF = T.field('Opacity: 25%', alpha);
  var inset = h('input', { type: 'checkbox' });
  col.addEventListener('input', function () { st.color = col.value; draw(); });
  alpha.addEventListener('input', function () { st.alpha = alpha.value / 100; alphaF.firstChild.textContent = 'Opacity: ' + alpha.value + '%'; draw(); });
  inset.addEventListener('change', function () { st.inset = inset.checked; draw(); });
  function draw() {
    var v = css(st);
    box.style.boxShadow = v; box.style.borderRadius = st.radius + 'px';
    out.value = 'box-shadow: ' + v + ';\nborder-radius: ' + st.radius + 'px;';
  }
  var PRESETS = [['Soft', { x: 0, y: 10, blur: 30, spread: -5, alpha: 0.25, inset: false }], ['Card', { x: 0, y: 2, blur: 8, spread: 0, alpha: 0.15, inset: false }],
    ['Floating', { x: 0, y: 24, blur: 48, spread: -12, alpha: 0.35, inset: false }], ['Hard', { x: 8, y: 8, blur: 0, spread: 0, alpha: 1, inset: false }],
    ['Inner', { x: 0, y: 2, blur: 6, spread: 0, alpha: 0.3, inset: true }], ['Glow', { x: 0, y: 0, blur: 24, spread: 4, alpha: 0.6, inset: false, color: '#38bdf8' }]];
  function preset(p) {
    Object.keys(p).forEach(function (k) { st[k] = p[k]; });
    if (!p.color) st.color = '#000000';
    Object.keys(inputs).forEach(function (k) { inputs[k][0].value = st[k]; inputs[k][1].firstChild.textContent = inputs[k][2] + ': ' + st[k] + 'px'; });
    col.value = st.color; alpha.value = Math.round(st.alpha * 100); alphaF.firstChild.textContent = 'Opacity: ' + alpha.value + '%'; inset.checked = st.inset; draw();
  }
  var copy = T.button('Copy CSS', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([stage, h('div', { 'class': 'tgrid2' }, [slider('x', 'Horizontal', -50, 50), slider('y', 'Vertical', -50, 50), slider('blur', 'Blur', 0, 100),
    slider('spread', 'Spread', -50, 50), slider('radius', 'Corner radius', 0, 80), alphaF]),
    T.row([T.field('Colour', col), h('label', { 'class': 'tcheck' }, [inset, ' Inner shadow (inset)'])]),
    T.field('Presets', T.row(PRESETS.map(function (p) { return T.button(p[0], { small: true, onclick: function () { preset(p[1]); } }); }))), T.field('CSS', out), T.row([copy])]));
  draw();
  T.tests['box-shadow'] = function () {
    var f = [];
    if (css({ x: 0, y: 10, blur: 30, spread: -5, color: '#000000', alpha: 0.25 }) !== '0px 10px 30px -5px rgba(0, 0, 0, 0.25)') f.push('soft ' + css({ x: 0, y: 10, blur: 30, spread: -5, color: '#000000', alpha: 0.25 }));
    if (css({ x: 1, y: 2, blur: 3, spread: 0, color: '#38bdf8', alpha: 0.6, inset: true }) !== 'inset 1px 2px 3px 0px rgba(56, 189, 248, 0.6)') f.push('inset colour');
    if (!box.style.boxShadow) f.push('preview not painted');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
