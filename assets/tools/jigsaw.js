/* Infinity by GroupChatOn — jigsaw. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Jigsaw puzzle from your own photo: real tab-and-blank pieces (9 to 64), drag them onto the board; pieces snap when close. */
GCOTools.register('jigsaw', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  // edges[r][c] = [top, right, bottom, left]: 0 flat border, 1 tab sticking out, -1 hole
  function cut(rows, cols) {
    var E = [], r, c;
    for (r = 0; r < rows; r++) { E.push([]); for (c = 0; c < cols; c++) E[r].push([0, 0, 0, 0]); }
    for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) {
      if (c < cols - 1) { var s = rnd(2) ? 1 : -1; E[r][c][1] = s; E[r][c + 1][3] = -s; }
      if (r < rows - 1) { var t = rnd(2) ? 1 : -1; E[r][c][2] = t; E[r + 1][c][0] = -t; }
    }
    return E;
  }
  // outline of one piece (cell w × h at x, y) with tabs of size m
  function outline(g, x, y, w, h2, e, m) {
    function side(x0, y0, x1, y1, s) {
      var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, nx = uy, ny = -ux;
      if (!s) { g.lineTo(x1, y1); return; }
      var p = function (a, b) { return [x0 + ux * a * L + nx * b * m * s, y0 + uy * a * L + ny * b * m * s]; };
      var a1 = p(0.35, 0), a2 = p(0.4, 0.15), a3 = p(0.3, 0.95), a4 = p(0.5, 1), a5 = p(0.7, 0.95), a6 = p(0.6, 0.15), a7 = p(0.65, 0);
      g.lineTo(a1[0], a1[1]); g.bezierCurveTo(a2[0], a2[1], a3[0], a3[1], a4[0], a4[1]); g.bezierCurveTo(a5[0], a5[1], a6[0], a6[1], a7[0], a7[1]); g.lineTo(x1, y1);
    }
    g.beginPath(); g.moveTo(x, y);
    side(x, y, x + w, y, e[0]); side(x + w, y, x + w, y + h2, e[1]); side(x + w, y + h2, x, y + h2, e[2]); side(x, y + h2, x, y, e[3]);
    g.closePath();
  }
  var img = null, P = null, stage = h('div', { style: 'position:relative;width:100%;max-width:560px;margin:0 auto;user-select:none;-webkit-user-select:none' });
  var boardEl = h('div', { style: 'position:absolute;left:0;top:0;border:2px dashed var(--line);border-radius:6px;box-sizing:border-box;background:var(--surface-2) center/100% 100% no-repeat' });
  var trayEl = h('div', { 'aria-hidden': 'true', style: 'position:absolute;left:0;border-radius:12px;background:var(--surface-2);opacity:.6' });
  var count = T.select([[3, '9 pieces'], [4, '16 pieces'], [5, '25 pieces'], [6, '36 pieces'], [8, '64 pieces']], T.store.get('jg-n', 4));
  var ghost = h('input', { type: 'checkbox', checked: true }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var placedEl = h('b', { text: '0' }), clock = h('b', { text: '0:00' }), t0 = 0, timer = null;
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function build() {
    if (!img) return;
    T.store.set('jg-n', +count.value);
    var n = +count.value, A = Math.max(0.75, Math.min(1.34, img.height / img.width)), cols = n, rows = Math.max(2, Math.round(n * A));
    // crop the photo to the board's shape
    var sw = img.width, sh = img.width * A; if (sh > img.height) { sh = img.height; sw = sh / A; }
    var BW = 1200, BH = Math.round(BW * A), src = h('canvas', { width: String(BW), height: String(BH) });
    src.getContext('2d').drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, BW, BH);
    var cw = BW / cols, ch = BH / rows, m = Math.min(cw, ch) * 0.24, E = cut(rows, cols);
    P = { rows: rows, cols: cols, A: A, BW: BW, BH: BH, cw: cw, ch: ch, m: m, pieces: [], done: 0, src: src };
    stage.querySelectorAll('canvas').forEach(function (c) { c.remove(); });
    boardEl.style.backgroundImage = ghost.checked ? 'linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72)),url(' + src.toDataURL('image/jpeg', 0.6) + ')' : '';
    var trayH = BH * 1.15;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var pw = Math.ceil(cw + 2 * m), ph = Math.ceil(ch + 2 * m), cv = h('canvas', { width: String(pw), height: String(ph), tabindex: '0', role: 'img', 'aria-label': 'Piece from row ' + (r + 1) + ', column ' + (c + 1) + '. Press Enter to put it in place.', style: 'position:absolute;left:0;top:0;touch-action:none;cursor:grab;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))' });
      var g = cv.getContext('2d');
      outline(g, m, m, cw, ch, E[r][c], m); g.save(); g.clip();
      g.drawImage(src, c * cw - m, r * ch - m, pw, ph, 0, 0, pw, ph);
      g.restore(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; outline(g, m, m, cw, ch, E[r][c], m); g.stroke();
      var piece = { el: cv, r: r, c: c, hx: c * cw - m, hy: r * ch - m, x: rnd(Math.max(1, Math.round(BW - pw))), y: BH + 20 + rnd(Math.max(1, Math.round(trayH - ph - 30))), fixed: false, w: pw, h: ph };
      cv.__p = piece; P.pieces.push(piece); stage.appendChild(cv);
      cv.addEventListener('keydown', key);
    }
    P.trayH = trayH; t0 = 0; out.textContent = ''; status.clear(); layout();
    clearInterval(timer); timer = setInterval(function () { if (P && P.done < P.pieces.length && !document.hidden) { t0++; clock.textContent = fmt(t0); } }, 1000);
  }
  function layout() {
    if (!P) return;
    var W = stage.clientWidth || 320, k = W / P.BW, H = (P.BH + 20 + P.trayH) * k;
    stage.style.height = H + 'px';
    boardEl.style.width = W + 'px'; boardEl.style.height = P.BH * k + 'px';
    trayEl.style.top = (P.BH + 12) * k + 'px'; trayEl.style.width = W + 'px'; trayEl.style.height = (P.trayH + 8) * k + 'px';
    P.pieces.forEach(function (p) { p.el.style.width = p.w * k + 'px'; p.el.style.height = p.h * k + 'px'; p.el.style.transform = 'translate(' + p.x * k + 'px,' + p.y * k + 'px)'; p.el.style.zIndex = p.fixed ? '1' : String(p.z || 2); });
    placedEl.textContent = P.done + '/' + P.pieces.length;
  }
  function snapIfClose(p) {
    if (Math.abs(p.x - p.hx) < P.cw * 0.28 && Math.abs(p.y - p.hy) < P.ch * 0.28) { place(p); return true; }
    return false;
  }
  function place(p) {
    if (p.fixed) return;
    p.x = p.hx; p.y = p.hy; p.fixed = true; P.done++;
    p.el.style.cursor = 'default'; p.el.style.filter = 'none'; p.el.setAttribute('aria-label', 'Piece in place'); p.el.tabIndex = -1;
    layout();
    if (P.done === P.pieces.length) { out.textContent = '🎉 Finished! ' + P.pieces.length + ' pieces in ' + fmt(t0) + '.'; status.ok('Puzzle complete.'); }
  }
  var drag = null, z = 10;
  function opaque(cv, e) {
    var r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * cv.width), y = Math.floor((e.clientY - r.top) / r.height * cv.height);
    try { return cv.getContext('2d').getImageData(x, y, 1, 1).data[3] > 20; } catch (err) { return true; }
  }
  stage.addEventListener('pointerdown', function (e) {
    if (!P) return;
    var hit = document.elementsFromPoint(e.clientX, e.clientY).filter(function (el) { return el.__p && !el.__p.fixed && opaque(el, e); })[0];
    if (!hit) return;
    e.preventDefault();
    var p = hit.__p, k = stage.clientWidth / P.BW;
    p.z = ++z; drag = { p: p, dx: e.clientX / k - p.x, dy: e.clientY / k - p.y, k: k };
    hit.style.cursor = 'grabbing'; layout();
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var p = drag.p, k = drag.k;
    p.x = Math.max(-p.w / 2, Math.min(P.BW - p.w / 2, e.clientX / k - drag.dx)); p.y = Math.max(-P.m, Math.min(P.BH + P.trayH - p.h / 2, e.clientY / k - drag.dy));
    p.el.style.transform = 'translate(' + p.x * k + 'px,' + p.y * k + 'px)';
  });
  stage.addEventListener('pointerup', function () { if (!drag) return; var p = drag.p; drag = null; p.el.style.cursor = 'grab'; snapIfClose(p); });
  function key(e) {
    var p = e.target.__p; if (!p || p.fixed) return;
    var step = P.cw / 4, d = { ArrowUp: [0, -step], ArrowDown: [0, step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] }[e.key];
    if (d) { e.preventDefault(); p.x += d[0]; p.y += d[1]; p.z = ++z; layout(); snapIfClose(p); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(p); var next = P.pieces.filter(function (q) { return !q.fixed; })[0]; if (next) next.el.focus(); }
  }
  window.addEventListener('resize', layout);
  function useSrc(src) {
    var im = new Image();
    im.onload = function () { img = im; build(); };
    im.onerror = function () { status.error('That file could not be opened as a picture.'); };
    im.src = src;
  }
  function sample() {
    var cv = h('canvas', { width: '900', height: '900' }), g = cv.getContext('2d'), sky = g.createLinearGradient(0, 0, 0, 900);
    sky.addColorStop(0, '#f97316'); sky.addColorStop(0.55, '#fcd34d'); sky.addColorStop(0.56, '#0e7490'); sky.addColorStop(1, '#164e63');
    g.fillStyle = sky; g.fillRect(0, 0, 900, 900);
    g.fillStyle = '#fff7ed'; g.beginPath(); g.arc(450, 470, 120, Math.PI, 0); g.fill();
    for (var i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.5 - i * 0.05) + ')'; g.fillRect(330 + i * 6, 520 + i * 32, 240 - i * 12, 8); }
    g.fillStyle = '#7c2d12'; g.beginPath(); g.moveTo(80, 900); g.quadraticCurveTo(120, 600, 60, 380); g.lineTo(90, 380); g.quadraticCurveTo(160, 620, 120, 900); g.fill();
    ['#15803d', '#16a34a', '#22c55e'].forEach(function (col, k) { g.fillStyle = col; g.beginPath(); g.ellipse(75, 380, 150 - k * 30, 40, -0.4 + k * 0.4, 0, 7); g.fill(); });
    g.fillStyle = '#1f2937'; g.beginPath(); g.moveTo(560, 700); g.lineTo(760, 700); g.lineTo(730, 740); g.lineTo(590, 740); g.fill(); g.fillRect(655, 600, 6, 100);
    g.fillStyle = '#fef3c7'; g.beginPath(); g.moveTo(661, 605); g.lineTo(735, 690); g.lineTo(661, 690); g.fill();
    useSrc(cv.toDataURL('image/png'));
  }
  var drop = T.dropzone({ accept: 'image/*', label: 'Choose a photo', hint: 'or drop one here. It never leaves your device.', icon: '🧩', onFiles: function (f) { T.read(f[0], 'dataURL').then(useSrc, function (e) { status.error(e); }); } });
  ghost.addEventListener('change', function () { if (P) boardEl.style.backgroundImage = ghost.checked ? 'linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72)),url(' + P.src.toDataURL('image/jpeg', 0.6) + ')' : ''; });
  stage.appendChild(boardEl); stage.appendChild(trayEl);
  spot.appendChild(T.card([drop, T.row([T.field('Pieces', count), T.button('Start / restart', { primary: true, onclick: function () { if (img) build(); else status.error('Choose a photo first, or press Try a sample.'); } }), T.button('Try a sample', { small: true, onclick: sample })]),
    h('label', { 'class': 'tcheck' }, [ghost, ' Show a faint picture on the board']),
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [placedEl, h('span', { text: 'In place' })]), h('div', { 'class': 'tstat' }, [clock, h('span', { text: 'Time' })])]),
    stage, status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['jigsaw'] = function () {
    var f = [], E = cut(5, 7);
    for (var r = 0; r < 5; r++) for (var c = 0; c < 7; c++) {
      var e = E[r][c];
      if ((r === 0) !== (e[0] === 0) || (c === 6) !== (e[1] === 0) || (r === 4) !== (e[2] === 0) || (c === 0) !== (e[3] === 0)) f.push('border at ' + r + ',' + c);
      if (c < 6 && e[1] !== -E[r][c + 1][3]) f.push('sides do not match');
      if (r < 4 && e[2] !== -E[r + 1][c][0]) f.push('top/bottom do not match');
    }
    var cv = h('canvas', { width: '200', height: '200' }), g = cv.getContext('2d');
    outline(g, 50, 50, 100, 100, [1, -1, 1, -1], 24); g.fill();
    var px = function (x, y) { return g.getImageData(x, y, 1, 1).data[3]; };
    if (!px(100, 100) || !px(100, 40) || px(140, 100) || px(10, 10)) f.push('piece shape');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f.slice(0, 5) });
  };
});
