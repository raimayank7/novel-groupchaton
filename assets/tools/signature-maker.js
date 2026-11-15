/* Infinity by GroupChatOn — signature-maker. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Signature maker: draw with finger or mouse, or type your name in a handwriting font; save as a trimmed transparent PNG for documents. */
GCOTools.register('signature-maker', function (spot, T) {
  var h = T.h, status = T.status(), strokes = [], cur = null, DPR = 2;
  var FONTS = [['Great Vibes', 'Great Vibes'], ['Dancing Script', 'Dancing Script'], ['Allura', 'Allura'], ['Sacramento', 'Sacramento'], ['Caveat', 'Caveat (simple)']];
  function trim(c, pad) {
    var g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (var y = 0; y < c.height; y++) for (var x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    pad = pad || 0;
    return { x: Math.max(0, x0 - pad), y: Math.max(0, y0 - pad), w: Math.min(c.width, x1 + pad + 1) - Math.max(0, x0 - pad), h: Math.min(c.height, y1 + pad + 1) - Math.max(0, y0 - pad) };
  }
  var mode = T.seg([['draw', 'Draw'], ['type', 'Type']], 'draw', function () { drawBox.hidden = mode.value() !== 'draw'; typeBox.hidden = mode.value() !== 'type'; if (mode.value() === 'type') fonts(); });
  var pen = T.select([['#111111', 'Black'], ['#1d3fbb', 'Blue (like ink)'], ['#0b2a6f', 'Dark blue']], '#1d3fbb'), width = h('input', { type: 'range', min: '1', max: '8', value: '3', step: '0.5' });
  var pad = h('canvas', { style: 'width:100%;height:220px;touch-action:none;background:#fff;border:1px dashed var(--line);border-radius:14px;cursor:crosshair', 'aria-label': 'Signature pad: draw your signature here' });
  function size() { var r = pad.getBoundingClientRect(), w = Math.round((r.width || 600) * DPR), hh = Math.round((r.height || 220) * DPR); if (pad.width !== w || pad.height !== hh) { pad.width = w; pad.height = hh; redraw(); } }
  function line(g, s, k) {
    g.strokeStyle = s.c; g.lineWidth = s.w * k; g.lineCap = g.lineJoin = 'round'; g.beginPath();
    var p = s.p; g.moveTo(p[0][0] * k, p[0][1] * k);
    if (p.length === 1) g.lineTo(p[0][0] * k + 0.1, p[0][1] * k);
    for (var i = 1; i < p.length - 1; i++) g.quadraticCurveTo(p[i][0] * k, p[i][1] * k, (p[i][0] + p[i + 1][0]) / 2 * k, (p[i][1] + p[i + 1][1]) / 2 * k);
    if (p.length > 1) g.lineTo(p[p.length - 1][0] * k, p[p.length - 1][1] * k);
    g.stroke();
  }
  function redraw() { var g = pad.getContext('2d'); g.clearRect(0, 0, pad.width, pad.height); strokes.forEach(function (s) { line(g, s, DPR); }); }
  function at(e) { var r = pad.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  pad.addEventListener('pointerdown', function (e) { size(); pad.setPointerCapture(e.pointerId); cur = { c: pen.value, w: +width.value, p: [at(e)] }; strokes.push(cur); redraw(); });
  pad.addEventListener('pointermove', function (e) { if (!cur) return; cur.p.push(at(e)); redraw(); });
  ['pointerup', 'pointercancel'].forEach(function (ev) { pad.addEventListener(ev, function () { cur = null; }); });
  var name = h('input', { type: 'text', value: T.store.get('sig-name', ''), placeholder: 'Type your name', 'aria-label': 'Your name', style: 'font-size:20px' }), font = T.select(FONTS, 'Great Vibes');
  var tcv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Typed signature preview' }), tprev = h('div', { 'class': 'tfit-prev is-checker' }, [tcv]), loaded = false;
  function fonts() {
    if (!loaded) { loaded = true; document.head.appendChild(h('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Allura&family=Caveat:wght@500&family=Dancing+Script:wght@500&family=Great+Vibes&family=Sacramento&display=swap' })); }
    var ready = document.fonts && document.fonts.load ? document.fonts.load('80px "' + font.value + '"').catch(function () {}) : Promise.resolve();
    ready.then(typed);
  }
  function typed() {
    T.store.set('sig-name', name.value);
    var t = name.value.trim() || 'Your Name', fs = 150, g = tcv.getContext('2d');
    g.font = fs + 'px "' + font.value + '", cursive'; var w = g.measureText(t).width;
    tcv.width = Math.ceil(w + fs * 0.8); tcv.height = Math.ceil(fs * 1.6); g = tcv.getContext('2d');
    g.font = fs + 'px "' + font.value + '", cursive'; g.fillStyle = pen.value; g.textBaseline = 'middle'; g.fillText(t, fs * 0.4, tcv.height / 2);
  }
  name.addEventListener('input', typed); font.addEventListener('change', fonts); pen.addEventListener('change', function () { if (mode.value() === 'type') typed(); });
  function result(white) {
    var src;
    if (mode.value() === 'draw') { if (!strokes.length) { status.error('Draw your signature in the box first.'); return null; } src = h('canvas'); src.width = pad.width * 2; src.height = pad.height * 2; var g = src.getContext('2d'); strokes.forEach(function (s) { line(g, s, DPR * 2); }); }
    else { if (!name.value.trim()) { status.error('Type your name first.'); return null; } src = tcv; }
    var b = trim(src, 16); if (!b) { status.error('The signature is empty.'); return null; }
    var o = h('canvas'); o.width = b.w; o.height = b.h; var og = o.getContext('2d');
    if (white) { og.fillStyle = '#fff'; og.fillRect(0, 0, b.w, b.h); }
    og.drawImage(src, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
    return o;
  }
  function save(type) { var c = result(type === 'image/jpeg'); if (!c) return; T.canvasBlob(c, type, 0.95).then(function (b) { T.download(b, 'signature.' + (type === 'image/png' ? 'png' : 'jpg')); status.ok('Saved ' + c.width + ' × ' + c.height + ' px' + (type === 'image/png' ? ' with a transparent background.' : '.')); }); }
  var drawBox = h('div', { style: 'display:grid;gap:10px' }, [pad, T.row([T.button('Undo', { small: true, onclick: function () { strokes.pop(); redraw(); } }), T.button('Clear', { small: true, onclick: function () { strokes = []; redraw(); status.clear(); } })])]);
  var typeBox = h('div', { hidden: true, style: 'display:grid;gap:10px' }, [h('div', { 'class': 'tgrid2' }, [T.field('Your name', name), T.field('Style', font)]), tprev]);
  spot.appendChild(T.card([T.field('How', mode), h('div', { 'class': 'tgrid2' }, [T.field('Ink colour', pen), T.field('Pen thickness', width)]), drawBox, typeBox,
    T.row([T.button('Download PNG (transparent)', { primary: true, onclick: function () { save('image/png'); } }), T.button('Download JPG (white)', { onclick: function () { save('image/jpeg'); } })]), status.el,
    h('p', { 'class': 'tstatus', text: 'Your signature never leaves this device. Only use it on documents you are allowed to sign.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  setTimeout(size, 50); window.addEventListener('resize', function () { if (pad.isConnected) size(); });
  T.tests['signature-maker'] = function () {
    var f = [], c = h('canvas'); c.width = 100; c.height = 60; var g = c.getContext('2d');
    if (trim(c) !== null) f.push('empty canvas');
    g.fillStyle = '#000'; g.fillRect(10, 20, 30, 5);
    var b = trim(c);
    if (!b || [b.x, b.y, b.w, b.h].join() !== '10,20,30,5') f.push('bbox ' + JSON.stringify(b));
    var p = trim(c, 16); if ([p.x, p.y, p.w, p.h].join() !== '0,4,56,37') f.push('padded ' + JSON.stringify(p));
    strokes = [{ c: '#000', w: 3, p: [[10, 10], [60, 40], [90, 20]] }]; size(); var r = result(false); strokes = []; redraw();
    if (!r || r.width < 50) f.push('drawn result');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
