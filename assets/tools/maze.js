/* Infinity by GroupChatOn — maze. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Maze generator and solver: play with arrows, swipes or the pad, show the shortest way out, print or download any size. */
GCOTools.register('maze', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var N = 1, E = 2, S = 4, W = 8, DIRS = [[N, -1, 0, S], [E, 0, 1, W], [S, 1, 0, N], [W, 0, -1, E]];
  // a perfect maze (exactly one way between any two squares), grown with a randomised depth-first search
  function make(rows, cols) {
    var g = [], seen = [], stack = [0], i;
    for (i = 0; i < rows * cols; i++) { g.push(0); seen.push(false); }
    seen[0] = true;
    while (stack.length) {
      var k = stack[stack.length - 1], r = (k / cols) | 0, c = k % cols, opts = [];
      DIRS.forEach(function (d) { var rr = r + d[1], cc = c + d[2]; if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && !seen[rr * cols + cc]) opts.push(d); });
      if (!opts.length) { stack.pop(); continue; }
      var d = opts[rnd(opts.length)], nk = (r + d[1]) * cols + c + d[2];
      g[k] |= d[0]; g[nk] |= d[3]; seen[nk] = true; stack.push(nk);
    }
    return { rows: rows, cols: cols, g: g };
  }
  function path(M, from, to) {
    var prev = {}, q = [from]; prev[from] = -1;
    while (q.length) {
      var k = q.shift(); if (k === to) break;
      var r = (k / M.cols) | 0, c = k % M.cols;
      DIRS.forEach(function (d) { if (M.g[k] & d[0]) { var nk = (r + d[1]) * M.cols + c + d[2]; if (!(nk in prev)) { prev[nk] = k; q.push(nk); } } });
    }
    if (!(to in prev)) return null;
    var out = []; for (var x = to; x !== -1; x = prev[x]) out.unshift(x);
    return out;
  }
  var SIZES = { s: [10, 10], m: [18, 18], l: [28, 28], xl: [40, 40] };
  var M, me = 0, trail = {}, showSol = false, steps = 0, t0 = 0, timer = null, won = false;
  var size = T.select([['s', 'Easy (10 × 10)'], ['m', 'Medium (18 × 18)'], ['l', 'Hard (28 × 28)'], ['xl', 'Huge (40 × 40, best printed)']], T.store.get('mz-size', 'm'));
  var cv = h('canvas', { tabindex: '0', role: 'application', 'aria-label': 'Maze. Use the arrow keys or swipe to move the dot to the exit.', style: 'display:block;width:min(100%,520px);aspect-ratio:1;margin:0 auto;border-radius:10px;background:#fff;touch-action:none' });
  var out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' }), stepsEl = h('b', { text: '0' }), clock = h('b', { text: '0:00' });
  var solBtn = T.button('Show the way out', { small: true, onclick: function () { showSol = !showSol; solBtn.textContent = showSol ? 'Hide the way out' : 'Show the way out'; draw(); } });
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function newMaze() {
    var s = SIZES[size.value]; T.store.set('mz-size', size.value);
    M = make(s[0], s[1]); me = 0; trail = {}; trail[0] = 1; steps = 0; t0 = 0; won = false; showSol = false; solBtn.textContent = 'Show the way out'; out.textContent = ''; status.clear();
    clearInterval(timer); timer = setInterval(function () { if (steps && !won && !document.hidden) { t0++; clock.textContent = fmt(t0); } }, 1000);
    draw();
  }
  function render(c, opts) {
    var px = opts.px, cell = (px - 20) / Math.max(M.rows, M.cols), g = c.getContext('2d'), ox = 10, oy = 10;
    c.width = px; c.height = px;
    g.fillStyle = '#fff'; g.fillRect(0, 0, px, px);
    if (opts.play) {
      g.fillStyle = 'rgba(59,130,246,.18)';
      Object.keys(trail).forEach(function (k) { g.fillRect(ox + (k % M.cols) * cell, oy + ((k / M.cols) | 0) * cell, cell, cell); });
    }
    if (opts.sol) {
      var p = path(M, opts.play ? me : 0, M.rows * M.cols - 1);
      g.strokeStyle = '#ef4444'; g.lineWidth = Math.max(2, cell * 0.28); g.lineCap = g.lineJoin = 'round'; g.beginPath();
      p.forEach(function (k, i) { var x = ox + (k % M.cols + 0.5) * cell, y = oy + (((k / M.cols) | 0) + 0.5) * cell; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
    }
    g.strokeStyle = '#111'; g.lineWidth = Math.max(1.5, cell * 0.12); g.lineCap = 'square'; g.beginPath();
    for (var k = 0; k < M.g.length; k++) {
      var r = (k / M.cols) | 0, cc = k % M.cols, x = ox + cc * cell, y = oy + r * cell, w = M.g[k];
      if (!(w & N) && k !== 0) { g.moveTo(x, y); g.lineTo(x + cell, y); }
      if (!(w & W)) { g.moveTo(x, y); g.lineTo(x, y + cell); }
      if (r === M.rows - 1 && k !== M.g.length - 1) { g.moveTo(x, y + cell); g.lineTo(x + cell, y + cell); }
      if (cc === M.cols - 1) { g.moveTo(x + cell, y); g.lineTo(x + cell, y + cell); }
    }
    g.stroke();
    g.fillStyle = '#16a34a'; g.font = 'bold ' + Math.max(10, cell * 0.7) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (opts.play) {
      g.beginPath(); g.arc(ox + (me % M.cols + 0.5) * cell, oy + (((me / M.cols) | 0) + 0.5) * cell, cell * 0.32, 0, 7); g.fillStyle = '#2563eb'; g.fill();
      g.fillStyle = '#16a34a'; g.fillText('★', ox + (M.cols - 0.5) * cell, oy + (M.rows - 0.5) * cell);
    }
  }
  function draw() { render(cv, { px: Math.min(1040, Math.round((cv.clientWidth || 400) * (window.devicePixelRatio || 1))), play: true, sol: showSol }); stepsEl.textContent = String(steps); }
  function canGo(k, d) { return !!(M.g[k] & d[0]); }
  function step(d, run) {
    if (won) return;
    var moved = false;
    do {
      if (!canGo(me, d)) break;
      me = (((me / M.cols) | 0) + d[1]) * M.cols + me % M.cols + d[2]; trail[me] = 1; steps++; moved = true;
      if (!run) break;
      var exits = DIRS.filter(function (x) { return canGo(me, x); }).length;
    } while (run && exits === 2 && me !== M.rows * M.cols - 1);
    if (!moved) return;
    if (me === M.rows * M.cols - 1) { won = true; var best = path(M, 0, me).length - 1; out.textContent = '🎉 Out in ' + fmt(t0) + ' with ' + steps + ' steps (shortest way: ' + best + ').'; status.ok('You escaped the maze!'); }
    draw();
  }
  cv.addEventListener('keydown', function (e) {
    var i = { ArrowUp: 0, w: 0, ArrowRight: 1, d: 1, ArrowDown: 2, s: 2, ArrowLeft: 3, a: 3 }[e.key];
    if (i === undefined) return;
    e.preventDefault(); step(DIRS[i], e.shiftKey);
  });
  var down = null;
  cv.addEventListener('pointerdown', function (e) { down = [e.clientX, e.clientY]; cv.focus({ preventScroll: true }); });
  cv.addEventListener('pointerup', function (e) {
    if (!down) return;
    var dx = e.clientX - down[0], dy = e.clientY - down[1]; down = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) {   // a tap: move towards the tapped side of the dot
      var r = cv.getBoundingClientRect(), cell = r.width / M.cols, mx = r.left + (me % M.cols + 0.5) * cell, my = r.top + (((me / M.cols) | 0) + 0.5) * cell;
      dx = e.clientX - mx; dy = e.clientY - my; if (Math.max(Math.abs(dx), Math.abs(dy)) < cell / 2) return;
    }
    step(Math.abs(dx) > Math.abs(dy) ? DIRS[dx > 0 ? 1 : 3] : DIRS[dy > 0 ? 2 : 0], true);
  });
  function pad() {
    var b = function (t, i) { return h('button', { type: 'button', 'class': 'tbtn', 'aria-label': ['Up', 'Right', 'Down', 'Left'][i], style: 'min-width:54px;font-size:20px', onclick: function () { step(DIRS[i], true); } }, [t]); };
    return h('div', { style: 'display:grid;grid-template-columns:repeat(3,58px);gap:6px;justify-content:center' }, [h('span'), b('▲', 0), h('span'), b('◀', 3), b('▼', 2), b('▶', 1)]);
  }
  function image(sol) { var c = h('canvas'); render(c, { px: 1600, play: false, sol: sol }); return c.toDataURL('image/png'); }
  function print() {
    var fr = h('iframe', { style: 'position:fixed;right:0;bottom:0;width:0;height:0;border:0', title: 'print' });
    document.body.appendChild(fr);
    var d = fr.contentDocument;
    d.open(); d.write('<!doctype html><title>Maze</title><style>@page{size:A4;margin:12mm}body{margin:0;font:16px Arial;text-align:center}img{width:180mm;display:block;margin:6mm auto}.p{page-break-before:always}</style>' +
      '<h2>Find the way from the top-left to the bottom-right</h2><img src="' + image(false) + '"><p style="color:#888">infinity.groupchaton.com</p>' + (ans.checked ? '<h2 class="p">Answer</h2><img src="' + image(true) + '">' : '')); d.close();
    setTimeout(function () { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(function () { fr.remove(); }, 4000); }, 400);
  }
  var ans = h('input', { type: 'checkbox', checked: true });
  window.addEventListener('resize', function () { if (M) draw(); });
  spot.appendChild(T.card([T.row([T.field('Size', size), T.button('New maze', { primary: true, onclick: newMaze })]), cv, pad(),
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [stepsEl, h('span', { text: 'Steps' })]), h('div', { 'class': 'tstat' }, [clock, h('span', { text: 'Time' })])]),
    T.row([solBtn, T.button('Print', { small: true, onclick: print }), T.button('Download PNG', { small: true, onclick: function () { fetch(image(false)).then(function (r) { return r.blob(); }).then(function (b) { T.download(b, 'maze.png'); }); } })]),
    h('label', { 'class': 'tcheck' }, [ans, ' Print an answer page too']), status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  newMaze();
  T.tests['maze'] = function () {
    var f = [];
    [[5, 5], [10, 14], [30, 30]].forEach(function (s) {
      var m = make(s[0], s[1]), links = 0;
      m.g.forEach(function (w) { for (var b = 1; b <= 8; b <<= 1) if (w & b) links++; });
      if (links / 2 !== s[0] * s[1] - 1) f.push('not a perfect maze ' + s.join('x'));
      for (var k = 0; k < m.g.length; k++) {
        var r = (k / m.cols) | 0, c = k % m.cols;
        if ((m.g[k] & E) && !(m.g[k + 1] & W)) f.push('one-way wall');
        if ((r === 0 && m.g[k] & N) || (c === 0 && m.g[k] & W)) f.push('hole in border');
      }
      var p = path(m, 0, m.g.length - 1);
      if (!p || p[0] !== 0 || p[p.length - 1] !== m.g.length - 1) f.push('no way out');
      for (var i = 1; p && i < p.length; i++) { var a = p[i - 1], b = p[i], dd = DIRS.filter(function (d) { return (((a / m.cols) | 0) + d[1]) * m.cols + a % m.cols + d[2] === b; })[0]; if (!dd || !(m.g[a] & dd[0])) { f.push('path goes through a wall'); break; } }
    });
    return Promise.resolve({ ok: !f.length, n: 12, fails: f.slice(0, 5) });
  };
});
