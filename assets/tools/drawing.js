/* Infinity by GroupChatOn — drawing. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Drawing board / whiteboard: pen, marker, eraser, line, box and circle, colours and sizes, white / chalkboard / grid paper, undo and redo, save as PNG. */
GCOTools.register('drawing', function (spot, T) {
  var h = T.h, W = 1600, H = 1000;
  var wrap = h('div', { style: 'position:relative;width:100%;aspect-ratio:16/10;border:1px solid var(--line);border-radius:12px;overflow:hidden;touch-action:none;background:#fff;cursor:crosshair' });
  function layer() { var c = h('canvas', { width: String(W), height: String(H), style: 'position:absolute;inset:0;width:100%;height:100%' }); wrap.appendChild(c); return c; }
  var bg = layer(), ink = layer(), live = layer(), gi = ink.getContext('2d'), gl = live.getContext('2d');
  ink.setAttribute('aria-label', 'Drawing area'); live.setAttribute('role', 'img'); live.setAttribute('aria-label', 'Drawing board');
  var strokes = [], redo = [], cur = null;
  var tool = T.seg([['pen', 'Pen'], ['marker', 'Marker'], ['eraser', 'Eraser'], ['line', 'Line'], ['rect', 'Box'], ['circle', 'Circle']], 'pen');
  var color = h('input', { type: 'color', value: '#111111', 'aria-label': 'Colour' }), size = h('input', { type: 'range', min: '1', max: '80', value: '6', 'aria-label': 'Size' });
  var sw = T.row(['#111111', '#ffffff', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'].map(function (c) {
    return h('button', { type: 'button', 'aria-label': 'Colour ' + c, style: 'width:32px;height:32px;border-radius:50%;border:2px solid var(--line);background:' + c + ';cursor:pointer', onclick: function () { color.value = c; } });
  }).concat([color]));
  var paper = T.seg([['white', 'White'], ['grid', 'Grid'], ['dots', 'Dots'], ['board', 'Chalkboard'], ['dark', 'Dark']], 'white', drawBg);
  function drawBg() {
    var g = bg.getContext('2d'), p = paper.value();
    g.fillStyle = p === 'board' ? '#1f3b2d' : p === 'dark' ? '#111827' : '#ffffff'; g.fillRect(0, 0, W, H);
    if (p === 'grid' || p === 'dots') { g.fillStyle = g.strokeStyle = '#cbd5e1'; g.lineWidth = 1;
      for (var x = 40; x < W; x += 40) for (var y = 40; y < H; y += 40) { if (p === 'dots') { g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); } }
      if (p === 'grid') { g.beginPath(); for (x = 40; x < W; x += 40) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); } for (y = 40; y < H; y += 40) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); } g.stroke(); } }
    if ((p === 'board' || p === 'dark') && color.value === '#111111') color.value = '#ffffff';
    if ((p === 'white' || p === 'grid' || p === 'dots') && color.value === '#ffffff') color.value = '#111111';
  }
  function paint(g, s) {
    if (s.tool === 'clear') { g.clearRect(0, 0, W, H); return; }
    var p = s.pts; g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = s.size; g.strokeStyle = g.fillStyle = s.color;
    if (s.tool === 'eraser') { g.globalCompositeOperation = 'destination-out'; g.strokeStyle = g.fillStyle = '#000'; g.lineWidth = s.size * 3; }
    if (s.tool === 'marker') { g.globalAlpha = 0.35; g.lineWidth = s.size * 3; g.lineCap = 'butt'; }
    g.beginPath();
    if (s.tool === 'line') { g.moveTo(p[0][0], p[0][1]); g.lineTo(p[1][0], p[1][1]); g.stroke(); }
    else if (s.tool === 'rect') g.strokeRect(Math.min(p[0][0], p[1][0]), Math.min(p[0][1], p[1][1]), Math.abs(p[1][0] - p[0][0]), Math.abs(p[1][1] - p[0][1]));
    else if (s.tool === 'circle') { g.ellipse((p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2, Math.abs(p[1][0] - p[0][0]) / 2 + 0.1, Math.abs(p[1][1] - p[0][1]) / 2 + 0.1, 0, 0, Math.PI * 2); g.stroke(); }
    else if (p.length === 1) { g.arc(p[0][0], p[0][1], g.lineWidth / 2, 0, Math.PI * 2); g.fill(); }
    else { g.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.stroke(); }
    g.restore();
  }
  function redraw() { gi.clearRect(0, 0, W, H); strokes.forEach(function (s) { paint(gi, s); }); }
  function commit(s) { strokes.push(s); redo = []; paint(gi, s); }
  function undo() { if (!strokes.length) return; redo.push(strokes.pop()); redraw(); }
  function again() { if (!redo.length) return; var s = redo.pop(); strokes.push(s); paint(gi, s); }
  function pt(e) { var r = live.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * W / r.width), Math.round((e.clientY - r.top) * H / r.height)]; }
  live.addEventListener('pointerdown', function (e) {
    live.setPointerCapture(e.pointerId); var t = tool.value(), p = pt(e);
    cur = { tool: t, color: color.value, size: +size.value, pts: t === 'line' || t === 'rect' || t === 'circle' ? [p, p] : [p] };
    if (t === 'pen' || t === 'eraser') paint(gi, cur); else { gl.clearRect(0, 0, W, H); paint(gl, cur); }
  });
  live.addEventListener('pointermove', function (e) {
    if (!cur) return; var p = pt(e), t = cur.tool;
    if (t === 'line' || t === 'rect' || t === 'circle') { cur.pts[1] = p; gl.clearRect(0, 0, W, H); paint(gl, cur); return; }
    var last = cur.pts[cur.pts.length - 1]; if (Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) < 2) return;
    cur.pts.push(p);
    if (t === 'marker') { gl.clearRect(0, 0, W, H); paint(gl, cur); } else paint(gi, { tool: t, color: cur.color, size: cur.size, pts: [last, p] });
  });
  function end() { if (!cur) return; gl.clearRect(0, 0, W, H); strokes.push(cur); redo = []; if (cur.tool === 'marker' || cur.tool === 'line' || cur.tool === 'rect' || cur.tool === 'circle') paint(gi, cur); cur = null; }
  live.addEventListener('pointerup', end); live.addEventListener('pointercancel', end);
  wrap.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) again(); else undo(); } });
  wrap.tabIndex = 0;
  function merged() { var c = h('canvas', { width: String(W), height: String(H) }), g = c.getContext('2d'); g.drawImage(bg, 0, 0); g.drawImage(ink, 0, 0); return c; }
  var orient = T.seg([['land', 'Landscape'], ['port', 'Portrait']], 'land', function (v) {
    W = v === 'land' ? 1600 : 1000; H = v === 'land' ? 1000 : 1400; wrap.style.aspectRatio = v === 'land' ? '16/10' : '10/14'; wrap.style.maxWidth = v === 'land' ? '' : '520px';
    [bg, ink, live].forEach(function (c) { c.width = W; c.height = H; }); drawBg(); redraw();
  });
  spot.appendChild(T.card([tool, sw, T.field('Size', size), wrap,
    T.row([T.button('↶ Undo', { small: true, onclick: undo }), T.button('↷ Redo', { small: true, onclick: again }), T.button('Clear', { small: true, onclick: function () { if (strokes.length) commit({ tool: 'clear' }); } }),
      T.button('Save PNG', { primary: true, small: true, onclick: function () { T.canvasBlob(merged(), 'image/png').then(function (b) { T.download(b, 'drawing.png'); }); } }),
      T.button('Full screen', { small: true, onclick: function () { if (wrap.requestFullscreen) wrap.requestFullscreen().catch(function () {}); } })]),
    T.field('Paper', paper), T.field('Board shape', orient),
    h('p', { 'class': 'tnote', text: 'Draw with a finger, stylus or mouse. Ctrl+Z undoes. Clear can be undone too. Your drawing stays on this device until you save it.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  drawBg();
  T.tests.drawing = function () {
    var f = [], keep = strokes, kr = redo; strokes = []; redo = []; redraw();
    function px(x, y) { return gi.getImageData(x, y, 1, 1).data; }
    commit({ tool: 'pen', color: '#ff0000', size: 10, pts: [[100, 100], [300, 100]] });
    var a = px(200, 100); if (a[0] < 250 || a[3] < 250) f.push('pen pixel ' + a);
    undo(); if (px(200, 100)[3] !== 0) f.push('undo');
    again(); if (px(200, 100)[0] < 250) f.push('redo');
    commit({ tool: 'eraser', size: 10, pts: [[150, 100], [250, 100]] }); if (px(200, 100)[3] !== 0) f.push('eraser');
    commit({ tool: 'rect', color: '#0000ff', size: 4, pts: [[400, 400], [500, 450]] }); if (px(450, 400)[2] < 250 || px(450, 425)[3] !== 0) f.push('box outline');
    commit({ tool: 'clear' }); if (px(450, 400)[3] !== 0) f.push('clear'); undo(); if (px(450, 400)[2] < 250) f.push('undo clear');
    strokes = keep; redo = kr; redraw();
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
