/* Infinity by GroupChatOn — ruler. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* On-screen ruler. Screens differ, so it is calibrated once with a bank card (85.60 mm wide) or the screen size, then remembered. */
GCOTools.register('ruler', function (spot, T) {
  var h = T.h;
  var pxmm = T.store.get('ruler-pxmm', 96 / 25.4);
  var canvas = h('canvas', { 'class': 'truler', role: 'img', 'aria-label': 'Ruler' }), read = h('p', { 'class': 'tx-read', 'aria-live': 'polite', text: 'Tap or drag on the ruler to measure.' });
  var card = h('div', { 'class': 'truler-card', title: 'Hold a bank card here' }), slider = h('input', { type: 'range', min: '2', max: '12', step: '0.005', value: String(pxmm), 'aria-label': 'Card width' });
  var diag = h('input', { type: 'number', step: '0.1', placeholder: 'e.g. 15.6', 'aria-label': 'Screen size in inches' }), status = T.status(), mark = 0;
  function cardSize() { card.style.width = (85.6 * pxmm) + 'px'; card.style.height = (53.98 * pxmm) + 'px'; }
  function draw() {
    var W = canvas.clientWidth || 600, H = 120, dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.height = H + 'px';
    var g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cs = getComputedStyle(canvas);
    g.fillStyle = '#F7E9B8'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#2a2414'; g.fillStyle = '#2a2414'; g.lineWidth = 1; g.font = '11px system-ui, sans-serif';
    for (var mm = 0; mm * pxmm <= W; mm++) {   // centimetres on top
      var x = Math.round(mm * pxmm) + 0.5, len = mm % 10 === 0 ? 26 : mm % 5 === 0 ? 18 : 10;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, len); g.stroke();
      if (mm % 10 === 0 && mm) g.fillText(String(mm / 10), x + 2, 38);
    }
    g.fillText('cm', 4, 38);
    var ppi = pxmm * 25.4;
    for (var s = 0; s * ppi / 16 <= W; s++) {   // inches below, in sixteenths
      var xi = Math.round(s * ppi / 16) + 0.5, li = s % 16 === 0 ? 26 : s % 8 === 0 ? 20 : s % 4 === 0 ? 15 : s % 2 === 0 ? 10 : 6;
      g.beginPath(); g.moveTo(xi, H); g.lineTo(xi, H - li); g.stroke();
      if (s % 16 === 0 && s) g.fillText(String(s / 16), xi + 2, H - 30);
    }
    g.fillText('in', 4, H - 30);
    if (mark > 0) { g.strokeStyle = '#E11D48'; g.lineWidth = 2; g.beginPath(); g.moveTo(mark, 0); g.lineTo(mark, H); g.stroke(); }
    cs = null;
  }
  function measure(e) {
    var r = canvas.getBoundingClientRect(); mark = Math.max(0, Math.min(r.width, e.clientX - r.left)); draw();
    var mmv = mark / pxmm; read.textContent = (mmv / 10).toFixed(2) + ' cm  ·  ' + mmv.toFixed(1) + ' mm  ·  ' + (mmv / 25.4).toFixed(3) + ' in';
  }
  var down = false;
  canvas.addEventListener('pointerdown', function (e) { down = true; canvas.setPointerCapture(e.pointerId); measure(e); });
  canvas.addEventListener('pointermove', function (e) { if (down) measure(e); });
  canvas.addEventListener('pointerup', function () { down = false; });
  function set(v, msg) { pxmm = v; slider.value = String(v); T.store.set('ruler-pxmm', v); cardSize(); draw(); if (msg) status.ok(msg); }
  slider.addEventListener('input', function () { set(+slider.value); });
  function fromDiag(inch) {
    var dpr = window.devicePixelRatio || 1, w = screen.width * dpr, hh = screen.height * dpr;
    return Math.hypot(w, hh) / inch / 25.4 / dpr;
  }
  var useDiag = T.button('Use screen size', { small: true, onclick: function () { var d = parseFloat(diag.value); if (!(d > 2)) return status.error('Type your screen size in inches (the diagonal), e.g. 15.6.'); set(fromDiag(d), 'Calibrated from a ' + d + '″ screen.'); } });
  spot.appendChild(T.card([canvas, read,
    h('details', { 'class': 'tcalc-details' }, [h('summary', { text: 'Make the ruler exact for this screen (calibrate)' }),
      h('p', { text: 'Hold any bank / debit / ID card (85.6 × 54 mm) against the screen and drag the slider until the box matches the card.' }), card, slider,
      h('p', { text: 'Or type your screen size (diagonal) in inches:' }), T.row([diag, useDiag]), status.el,
      T.button('Reset', { small: true, onclick: function () { set(96 / 25.4, 'Back to the browser’s standard size.'); } })]),
    h('p', { 'class': 'tnote', text: 'After calibrating once, the ruler is saved for this device. Browser zoom must be 100%.' })]));
  cardSize(); draw();
  addEventListener('resize', draw);
  T.tests.ruler = function () {
    var keep = pxmm, fails = [];
    var r = Math.hypot(1920, 1080) / 15.6 / 25.4;
    if (Math.abs(r - 5.5595275) > 1e-5) fails.push('15.6" 1080p gives ' + r);
    set(4); if (Math.abs(parseFloat(card.style.width) - 342.4) > 0.01) fails.push('card box at 4 px/mm is ' + card.style.width);
    measure({ clientX: canvas.getBoundingClientRect().left + 200 }); if (read.textContent.indexOf('5.00 cm') !== 0) fails.push('200 px at 4 px/mm read ' + read.textContent);
    set(keep); mark = 0; draw(); read.textContent = 'Tap or drag on the ruler to measure.'; status.clear();
    return Promise.resolve({ ok: !fails.length, n: 3, fails: fails });
  };
});
