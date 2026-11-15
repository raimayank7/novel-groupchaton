/* Infinity by GroupChatOn — css-gradient. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS gradient generator: linear, radial or conic, 2–6 colour stops, live preview and copy-ready CSS. */
GCOTools.register('css-gradient', function (spot, T) {
  var h = T.h;
  function css(o) {
    var stops = o.stops.slice().sort(function (a, b) { return a[1] - b[1]; }).map(function (s) { return s[0] + ' ' + s[1] + '%'; }).join(', ');
    if (o.type === 'radial') return 'radial-gradient(' + o.shape + ' at center, ' + stops + ')';
    if (o.type === 'conic') return 'conic-gradient(from ' + o.angle + 'deg at center, ' + stops + ')';
    return 'linear-gradient(' + o.angle + 'deg, ' + stops + ')';
  }
  var PRESETS = [['Sunset', [['#ff7e5f', 0], ['#feb47b', 100]], 135], ['Ocean', [['#2193b0', 0], ['#6dd5ed', 100]], 90], ['Mango', [['#ffe259', 0], ['#ffa751', 100]], 45],
    ['Forest', [['#134e5e', 0], ['#71b280', 100]], 160], ['Purple haze', [['#7f00ff', 0], ['#e100ff', 100]], 120], ['Tricolour', [['#ff9933', 0], ['#ffffff', 50], ['#138808', 100]], 180]];
  var st = { type: 'linear', angle: 135, shape: 'circle', stops: PRESETS[0][1].map(function (s) { return s.slice(); }) };
  var preview = h('div', { style: 'height:180px;border-radius:16px;border:1px solid var(--line)' });
  var out = h('textarea', { rows: '3', 'class': 'tout tmono', readonly: true, 'aria-label': 'CSS code' });
  var stopsBox = h('div', { style: 'display:grid;gap:8px' });
  var angle = h('input', { type: 'range', min: '0', max: '360', value: String(st.angle) }), angleF = T.field('Angle: 135°', angle);
  var shape = T.select([['circle', 'Circle'], ['ellipse', 'Ellipse']], 'circle'), shapeF = T.field('Shape', shape);
  var type = T.seg([['linear', 'Linear'], ['radial', 'Radial'], ['conic', 'Conic']], 'linear', function (v) { st.type = v; draw(); });
  angle.addEventListener('input', function () { st.angle = +angle.value; draw(); });
  shape.addEventListener('change', function () { st.shape = shape.value; draw(); });
  function drawStops() {
    stopsBox.innerHTML = '';
    st.stops.forEach(function (s, i) {
      var col = h('input', { type: 'color', value: s[0], 'aria-label': 'Colour ' + (i + 1), style: 'width:56px;height:40px;padding:2px' });
      var pos = h('input', { type: 'number', min: '0', max: '100', value: String(s[1]), 'aria-label': 'Position %', style: 'width:90px' });
      col.addEventListener('input', function () { s[0] = col.value; draw(); });
      pos.addEventListener('input', function () { s[1] = Math.max(0, Math.min(100, +pos.value || 0)); draw(); });
      stopsBox.appendChild(T.row([col, pos, h('span', { text: '%' }), st.stops.length > 2 ? T.button('Remove', { small: true, onclick: function () { st.stops.splice(i, 1); drawStops(); draw(); } }) : null]));
    });
  }
  function draw() {
    var g = css(st);
    preview.style.background = g;
    angleF.firstChild.textContent = (st.type === 'conic' ? 'Start angle: ' : 'Angle: ') + st.angle + '°';
    angleF.hidden = st.type === 'radial'; shapeF.hidden = st.type !== 'radial';
    out.value = 'background: ' + st.stops[0][0] + ';\nbackground: ' + g + ';';
  }
  var copy = T.button('Copy CSS', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([preview, T.field('Type', type), h('div', { 'class': 'tgrid2' }, [angleF, shapeF]),
    T.field('Colours and positions', stopsBox), T.row([T.button('+ Add colour', { small: true, onclick: function () { if (st.stops.length < 6) { st.stops.push(['#ffffff', 100]); drawStops(); draw(); } } }),
      T.button('Random', { small: true, onclick: function () { st.stops.forEach(function (s) { s[0] = '#' + ('00000' + Math.floor(Math.random() * 16777216).toString(16)).slice(-6); }); st.angle = Math.floor(Math.random() * 360); angle.value = st.angle; drawStops(); draw(); } })]),
    T.field('Presets', T.row(PRESETS.map(function (p) { return T.button(p[0], { small: true, onclick: function () { st.stops = p[1].map(function (s) { return s.slice(); }); st.angle = p[2]; angle.value = p[2]; drawStops(); draw(); } }); }))),
    T.field('CSS', out), T.row([copy])]));
  drawStops(); draw();
  T.tests['css-gradient'] = function () {
    var f = [], s = [['#ff0000', 0], ['#0000ff', 100]];
    if (css({ type: 'linear', angle: 90, stops: s }) !== 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)') f.push('linear ' + css({ type: 'linear', angle: 90, stops: s }));
    if (css({ type: 'radial', shape: 'circle', stops: s }) !== 'radial-gradient(circle at center, #ff0000 0%, #0000ff 100%)') f.push('radial');
    if (css({ type: 'conic', angle: 0, stops: [['#000', 100], ['#fff', 0]] }) !== 'conic-gradient(from 0deg at center, #fff 0%, #000 100%)') f.push('conic / stop order');
    if (preview.style.background.indexOf('gradient') < 0) f.push('preview not painted');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
