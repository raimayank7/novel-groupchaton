/* Infinity by GroupChatOn — border-radius. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Border-radius and blob maker: round each corner separately, or make organic blob shapes with the 8-value syntax, and copy the CSS. */
GCOTools.register('border-radius', function (spot, T) {
  var h = T.h;
  function css(o) {
    if (o.mode === 'blob') { var v = o.blob; return v[0] + '% ' + v[1] + '% ' + v[2] + '% ' + v[3] + '% / ' + v[4] + '% ' + v[5] + '% ' + v[6] + '% ' + v[7] + '%'; }
    var c = [o.tl, o.tr, o.br, o.bl].map(function (x) { return x + o.unit; });
    return c[0] === c[1] && c[1] === c[2] && c[2] === c[3] ? c[0] : c[0] === c[2] && c[1] === c[3] ? c[0] + ' ' + c[1] : c.join(' ');
  }
  var st = { mode: 'corners', unit: 'px', tl: 24, tr: 24, br: 24, bl: 24, blob: [30, 70, 70, 30, 30, 30, 70, 70] };
  var shape = h('div', { style: 'width:min(240px,70%);aspect-ratio:1;margin:12px auto;background:linear-gradient(135deg,#38bdf8,#a78bfa);transition:border-radius .3s' });
  var out = h('textarea', { rows: '2', 'class': 'tout tmono', readonly: true, 'aria-label': 'CSS' }), sl = {};
  function slider(k, label) {
    var i = h('input', { type: 'range', min: '0', max: '200', value: String(st[k]) }), f = T.field(label + ': ' + st[k] + st.unit, i);
    i.addEventListener('input', function () { st[k] = +i.value; if (link.checked) ['tl', 'tr', 'br', 'bl'].forEach(function (x) { st[x] = +i.value; }); sync(); draw(); });
    sl[k] = [i, f, label]; return f;
  }
  function sync() { Object.keys(sl).forEach(function (k) { sl[k][0].max = st.unit === '%' ? '50' : '200'; sl[k][0].value = st[k]; sl[k][1].firstChild.textContent = sl[k][2] + ': ' + st[k] + st.unit; }); }
  var link = h('input', { type: 'checkbox' }), unit = T.select([['px', 'px'], ['%', '%']], 'px');
  unit.addEventListener('change', function () { st.unit = unit.value; ['tl', 'tr', 'br', 'bl'].forEach(function (k) { st[k] = Math.min(st[k], st.unit === '%' ? 50 : 200); }); sync(); draw(); });
  var corners = h('div', { 'class': 'tgrid2' }, [slider('tl', 'Top left'), slider('tr', 'Top right'), slider('bl', 'Bottom left'), slider('br', 'Bottom right'), T.field('Unit', unit), h('label', { 'class': 'tcheck' }, [link, ' Same for all corners'])]);
  var blobBox = h('div', { hidden: true }, [T.row([T.button('New random blob', { primary: true, onclick: function () { st.blob = st.blob.map(function () { return 20 + Math.round(Math.random() * 60); }); draw(); } })])]);
  var mode = T.seg([['corners', 'Corners'], ['blob', 'Blob shape']], 'corners', function (v) { st.mode = v; corners.hidden = v !== 'corners'; blobBox.hidden = v !== 'blob'; draw(); });
  function draw() { var v = css(st); shape.style.borderRadius = v; out.value = 'border-radius: ' + v + ';'; }
  var copy = T.button('Copy CSS', { onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([shape, T.field('Style', mode), corners, blobBox, T.field('CSS', out), T.row([copy])]));
  draw();
  T.tests['border-radius'] = function () {
    var f = [], b = { mode: 'corners', unit: 'px' };
    if (css(Object.assign({}, b, { tl: 8, tr: 8, br: 8, bl: 8 })) !== '8px') f.push('same');
    if (css(Object.assign({}, b, { tl: 8, tr: 0, br: 8, bl: 0 })) !== '8px 0px') f.push('pairs');
    if (css(Object.assign({}, b, { tl: 1, tr: 2, br: 3, bl: 4, unit: '%' })) !== '1% 2% 3% 4%') f.push('four');
    if (css({ mode: 'blob', blob: [30, 70, 70, 30, 30, 30, 70, 70] }) !== '30% 70% 70% 30% / 30% 30% 70% 70%') f.push('blob');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
