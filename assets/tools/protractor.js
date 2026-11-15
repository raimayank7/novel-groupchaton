/* Infinity by GroupChatOn — protractor. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Protractor: three handles (two arm ends and the corner). Measure on screen, or on a photo you open. */
GCOTools.register('protractor', function (spot, T) {
  var h = T.h;
  var canvas = h('canvas', { 'class': 'tprot', role: 'img', 'aria-label': 'Protractor' }), read = h('div', { 'class': 'tu-big', 'aria-live': 'polite' });
  var img = null, pts = null, drag = -1, W = 600, H = 400;
  function reset() { pts = [{ x: W * 0.85, y: H * 0.8 }, { x: W / 2, y: H * 0.8 }, { x: W * 0.5 + 160 * Math.cos(-Math.PI / 3), y: H * 0.8 + 160 * Math.sin(-Math.PI / 3) }]; }
  function angle() {
    var a = Math.atan2(pts[0].y - pts[1].y, pts[0].x - pts[1].x), b = Math.atan2(pts[2].y - pts[1].y, pts[2].x - pts[1].x), d = Math.abs(a - b) * 180 / Math.PI;
    return d > 180 ? 360 - d : d;
  }
  function draw() {
    W = canvas.clientWidth || 600; H = img ? Math.round(W * img.height / img.width) : Math.round(Math.min(460, W * 0.66));
    var dpr = window.devicePixelRatio || 1; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.height = H + 'px';
    if (!pts) reset();
    var g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (img) g.drawImage(img, 0, 0, W, H); else { g.fillStyle = getComputedStyle(canvas).getPropertyValue('--bg') || '#07090F'; g.fillRect(0, 0, W, H); }
    var o = pts[1], R = Math.min(170, W * 0.3);
    g.save(); g.translate(o.x, o.y);   // the protractor scale around the corner
    g.strokeStyle = 'rgba(139,124,255,.85)'; g.fillStyle = 'rgba(139,124,255,.10)'; g.lineWidth = 1.2;
    g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = 'rgba(200,205,255,.9)'; g.font = '10px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var d = 0; d < 360; d++) {
      var t = -d * Math.PI / 180, len = d % 10 === 0 ? 14 : d % 5 === 0 ? 9 : 5;
      g.beginPath(); g.moveTo(R * Math.cos(t), R * Math.sin(t)); g.lineTo((R - len) * Math.cos(t), (R - len) * Math.sin(t)); g.stroke();
      if (d % 30 === 0) g.fillText(String(d), (R - 24) * Math.cos(t), (R - 24) * Math.sin(t));
    }
    g.restore();
    g.strokeStyle = '#22D3EE'; g.lineWidth = 3; g.beginPath(); g.moveTo(pts[0].x, pts[0].y); g.lineTo(o.x, o.y); g.lineTo(pts[2].x, pts[2].y); g.stroke();
    var a1 = Math.atan2(pts[0].y - o.y, pts[0].x - o.x), a2 = Math.atan2(pts[2].y - o.y, pts[2].x - o.x), diff = a2 - a1;
    while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
    g.strokeStyle = '#F472B6'; g.lineWidth = 2.5; g.beginPath(); g.arc(o.x, o.y, 40, a1, a1 + diff, diff < 0); g.stroke();
    pts.forEach(function (p, i) { g.fillStyle = i === 1 ? '#F472B6' : '#22D3EE'; g.beginPath(); g.arc(p.x, p.y, 9, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); });
    var A = angle();
    read.innerHTML = ''; read.appendChild(h('span', { text: 'Angle' })); read.appendChild(h('b', { text: A.toFixed(1) + '°' })); read.appendChild(h('span', { text: '(other side ' + (360 - A).toFixed(1) + '°)' }));
    return A;
  }
  function at(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  canvas.addEventListener('pointerdown', function (e) {
    var p = at(e), best = -1, bd = 900;
    pts.forEach(function (q, i) { var d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { drag = best; canvas.setPointerCapture(e.pointerId); }
  });
  canvas.addEventListener('pointermove', function (e) { if (drag < 0) return; var p = at(e); pts[drag] = { x: Math.max(0, Math.min(W, p.x)), y: Math.max(0, Math.min(H, p.y)) }; draw(); });
  canvas.addEventListener('pointerup', function () { drag = -1; });
  var file = T.dropzone({ accept: 'image/*', label: 'Measure an angle in a photo', hint: 'optional: open or drop a picture', icon: '🖼️', paste: true, onFiles: function (f) {
    var url = URL.createObjectURL(f[0]), im = new Image();
    im.onload = function () { img = im; pts = null; draw(); }; im.src = url;
  } });
  spot.appendChild(T.card([read, canvas, T.row([T.button('Reset handles', { small: true, onclick: function () { pts = null; draw(); } }), T.button('Remove photo', { small: true, onclick: function () { img = null; pts = null; draw(); } })]), file,
    h('p', { 'class': 'tnote', text: 'Drag the pink corner onto the point of the angle, then the two blue dots along each side. The photo never leaves your device.' })]));
  draw();
  addEventListener('resize', function () { pts = null; draw(); });
  T.tests.protractor = function () {
    var fails = [];
    pts = [{ x: 300, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }]; if (Math.abs(draw() - 90) > 1e-9) fails.push('right angle read ' + angle());
    pts = [{ x: 200, y: 100 }, { x: 100, y: 100 }, { x: 100 + 100 * Math.cos(Math.PI / 6), y: 100 - 100 * Math.sin(Math.PI / 6) }]; if (Math.abs(draw() - 30) > 1e-9) fails.push('30° read ' + angle());
    pts = [{ x: 200, y: 100 }, { x: 100, y: 100 }, { x: 0, y: 99.999 }]; if (Math.abs(draw() - 180) > 0.01) fails.push('straight line read ' + angle());
    if (read.textContent.indexOf('°') < 0) fails.push('no reading shown');
    pts = null; draw();
    return Promise.resolve({ ok: !fails.length, n: 4, fails: fails });
  };
});
