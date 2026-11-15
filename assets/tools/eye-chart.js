/* Infinity by GroupChatOn — eye-chart. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Eye test chart: a Snellen-style letter chart (or tumbling E) drawn to true size for your screen and viewing distance. A screening aid, not a medical test. */
GCOTools.register('eye-chart', function (spot, T) {
  var h = T.h, status = T.status();
  var WARN = 'margin:0;padding:10px 12px;border-radius:12px;background:#fef3c7;color:#713f12;font-weight:600', SLOAN = 'CDHKNORSVZ', ROWS = [200, 100, 70, 50, 40, 30, 25, 20, 15, 10];
  function rnd(n) { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
  // a letter that 20/20 eyes can just read is 5 arc-minutes tall at the viewing distance
  function letterMm(distM, row) { return distM * 1000 * Math.tan((5 / 60) * Math.PI / 180) * (row / 20); }
  function metric(row) { return '6/' + Math.round(row * 6 / 20 * 10) / 10; }
  var pxmm = T.store.get('ruler-pxmm', 96 / 25.4), dist = h('input', { type: 'number', min: '0.5', max: '6', step: '0.5', value: String(T.store.get('eye-dist', 3)), 'aria-label': 'Distance' });
  var unit = T.select([['m', 'metres'], ['ft', 'feet']], 'm'), kind = 'letters', mirror = h('input', { type: 'checkbox' });
  var card = h('div', { style: 'height:54px;border:2px dashed var(--accent);border-radius:8px;display:grid;place-items:center;font-size:12px;color:var(--muted);box-sizing:border-box', text: 'Hold a bank card here' });
  var slider = h('input', { type: 'range', min: '2', max: '12', step: '0.005', value: String(pxmm), 'aria-label': 'Card width' });
  var chart = h('div', { style: 'display:grid;gap:10px;justify-items:center;padding:20px 8px;background:#fff;color:#000;border-radius:14px;border:1px solid var(--line);overflow:hidden' });
  var info = h('p', { 'class': 'tnote', 'data-out': '' });
  function E(px) {
    var c = h('canvas', { width: String(Math.max(5, Math.round(px))), height: String(Math.max(5, Math.round(px))), style: 'width:' + px + 'px;height:' + px + 'px' }), g = c.getContext('2d'), s = c.width / 5;
    g.fillStyle = '#000'; g.fillRect(0, 0, s, 5 * s); [0, 2, 4].forEach(function (r) { g.fillRect(0, r * s, 5 * s, s); });
    c.style.transform = 'rotate(' + [0, 90, 180, 270][rnd(4)] + 'deg)'; return c;
  }
  function draw() {
    var dm = (+dist.value || 3) * (unit.value === 'ft' ? 0.3048 : 1);
    T.store.set('eye-dist', +dist.value); card.style.width = (85.6 * pxmm) + 'px';
    chart.innerHTML = ''; chart.style.transform = mirror.checked ? 'scaleX(-1)' : '';
    var maxW = chart.clientWidth || 600, shown = 0;
    ROWS.forEach(function (r) {
      var px = letterMm(dm, r) * pxmm, n = r >= 100 ? 1 : r >= 50 ? 3 : r >= 30 ? 4 : 5;
      if (px < 3) return;
      if (px * (n * 1.6) > maxW - 20) n = Math.max(1, Math.floor((maxW - 20) / (px * 1.6)));
      if (px > 420) return;
      var line = h('div', { style: 'display:flex;align-items:center;gap:' + (px * 0.6).toFixed(1) + 'px' });
      var used = '';
      for (var i = 0; i < n; i++) {
        if (kind === 'E') line.appendChild(E(px));
        else { var ch; do ch = SLOAN[rnd(10)]; while (used.indexOf(ch) >= 0); used += ch; line.appendChild(h('span', { style: 'font:700 ' + px.toFixed(1) + 'px/1 Arial,Helvetica,sans-serif;letter-spacing:0', text: ch })); }
      }
      chart.appendChild(h('div', { style: 'display:flex;align-items:center;gap:12px;width:100%;justify-content:space-between' }, [h('small', { style: 'width:52px;color:#666;font:12px system-ui', text: (unit.value === 'ft' ? '20/' + r : metric(r)) }), line, h('small', { style: 'width:52px' })]));
      shown++;
    });
    info.textContent = 'Sit ' + dist.value + ' ' + unit.value + ' from the screen. ' + shown + ' lines fit. The 20/20 (6/6) line letters are ' + letterMm(dm, 20).toFixed(1) + ' mm tall.' + (shown < 6 ? ' Sit further away to see the smaller lines.' : '');
  }
  slider.addEventListener('input', function () { pxmm = +slider.value; T.store.set('ruler-pxmm', pxmm); draw(); });
  [dist, unit, mirror].forEach(function (x) { x.addEventListener('change', draw); x.addEventListener('input', draw); });
  window.addEventListener('resize', function () { clearTimeout(draw.t); draw.t = setTimeout(draw, 200); });
  spot.appendChild(T.card([
    h('p', { style: WARN, text: '⚠️ Not a medical test. This chart can show a change worth checking, but only an optometrist or eye doctor can test and prescribe. See one every 1–2 years, and at once for sudden blur, pain or flashes.' }),
    h('details', {}, [h('summary', { text: '1. Size the chart to your screen (once)' }), h('p', { 'class': 'tnote', text: 'Hold any bank or ID card against the box and move the slider until the box is exactly as wide as the card.' }), card, slider]),
    h('div', { 'class': 'tgrid2' }, [T.field('2. Your distance from the screen', dist), T.field('Units', unit)]),
    T.seg([['letters', 'Letters'], ['E', 'Tumbling E (no reading needed)']], 'letters', function (v) { kind = v; draw(); }),
    T.row([T.button('New letters', { small: true, onclick: draw }), h('label', { 'class': 'tcheck' }, [mirror, ' Flip for viewing in a mirror'])]),
    info, chart, status.el,
    h('p', { 'class': 'tnote', text: 'How to read it: cover one eye, read from the top. The smallest line where you read most letters correctly is your result for that eye. Repeat with the other eye, with and without glasses.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['eye-chart'] = function () {
    var f = [];
    if (Math.abs(letterMm(6, 20) - 8.73) > 0.01) f.push('6 m 6/6 ' + letterMm(6, 20));
    if (Math.abs(letterMm(3, 20) - 4.36) > 0.01) f.push('3 m');
    if (Math.abs(letterMm(6, 200) - 87.3) > 0.1) f.push('big E');
    if (metric(20) !== '6/6' || metric(40) !== '6/12' || metric(200) !== '6/60') f.push('metric ' + metric(40));
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
