/* Infinity by GroupChatOn — four-in-row. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Four in a row: drop discs into a 7 × 6 grid and line up four; play the computer (three levels) or a friend. */
GCOTools.register('four-in-row', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var R = 6, C = 7, ORDER = [3, 2, 4, 1, 5, 0, 6];
  // board: array of 42, row 0 at the top; 0 empty, 1 and 2 players
  function drop(b, c) { for (var r = R - 1; r >= 0; r--) if (!b[r * C + c]) return r * C + c; return -1; }
  function line4(b) {
    var dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (var r = 0; r < R; r++) for (var c = 0; c < C; c++) {
      var p = b[r * C + c]; if (!p) continue;
      for (var d = 0; d < 4; d++) {
        var cells = [r * C + c], ok = true;
        for (var k = 1; k < 4 && ok; k++) { var rr = r + dirs[d][0] * k, cc = c + dirs[d][1] * k; if (rr < 0 || rr >= R || cc < 0 || cc >= C || b[rr * C + cc] !== p) ok = false; else cells.push(rr * C + cc); }
        if (ok) return { p: p, cells: cells };
      }
    }
    return null;
  }
  function full(b) { for (var c = 0; c < C; c++) if (!b[c]) return false; return true; }
  function score(b, me) {
    var s = 0, other = 3 - me, win = function (cells) {
      var m = 0, o = 0; cells.forEach(function (k) { if (b[k] === me) m++; else if (b[k] === other) o++; });
      if (m && o) return 0; if (m === 3) return 5; if (m === 2) return 2; if (o === 3) return -4; if (o === 2) return -1; return 0;
    };
    for (var r = 0; r < R; r++) { if (b[r * C + 3] === me) s += 3; for (var c = 0; c < C; c++) [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(function (d) {
      var er = r + d[0] * 3, ec = c + d[1] * 3; if (er < 0 || er >= R || ec < 0 || ec >= C) return;
      s += win([0, 1, 2, 3].map(function (k) { return (r + d[0] * k) * C + c + d[1] * k; }));
    }); }
    return s;
  }
  function negamax(b, me, depth, a, beta) {
    var w = line4(b);
    if (w) return w.p === me ? 100000 + depth : -100000 - depth;
    if (full(b)) return 0;
    if (!depth) return score(b, me);
    var best = -Infinity;
    for (var i = 0; i < 7; i++) {
      var k = drop(b, ORDER[i]); if (k < 0) continue;
      b[k] = me; var v = -negamax(b, 3 - me, depth - 1, -beta, -a); b[k] = 0;
      if (v > best) best = v; if (v > a) a = v; if (a >= beta) break;
    }
    return best;
  }
  var DEPTH = { easy: 1, medium: 3, hard: 6 };
  function aiMove(b, me, level) {
    var cols = ORDER.filter(function (c) { return drop(b, c) >= 0; });
    if (level === 'easy' && rnd(100) < 40) return cols[rnd(cols.length)];
    var best = -Infinity, picks = [];
    cols.forEach(function (c) {
      var k = drop(b, c); b[k] = me; var v = -negamax(b, 3 - me, DEPTH[level], -Infinity, Infinity); b[k] = 0;
      if (v > best) { best = v; picks = [c]; } else if (v === best) picks.push(c);
    });
    return picks[rnd(picks.length)];
  }
  var COLORS = ['', '#ef4444', '#facc15'], NAMES = ['', 'Red', 'Yellow'];
  var b = [], turn = 1, over = false, mode = T.store.get('c4-mode', 'cpu'), level = T.store.get('c4-level', 'medium'), human = 1, cursor = 3, busy = false, firstHuman = true;
  var score2 = T.store.get('c4-score', { 1: 0, 2: 0, d: 0 });
  var grid = h('div', { tabindex: '0', role: 'grid', 'aria-label': 'Four in a row board. Press 1 to 7, or arrows and Enter, to drop a disc.', style: 'display:grid;grid-template-columns:repeat(7,1fr);gap:5px;width:min(100%,460px);margin:0 auto;padding:8px;border-radius:16px;background:#1d4ed8;touch-action:manipulation' });
  var holes = [], arrows = h('div', { 'aria-hidden': 'true', style: 'display:grid;grid-template-columns:repeat(7,1fr);width:min(100%,460px);margin:0 auto;padding:0 8px;box-sizing:border-box;text-align:center;font-size:18px;color:var(--muted)' });
  var msg = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font:800 19px/1.3 var(--ui);text-align:center;min-height:26px' }), stats = h('div', { 'class': 'tstats' });
  for (var i = 0; i < R * C; i++) (function (i) {
    var x = h('div', { style: 'aspect-ratio:1;border-radius:50%;background:var(--surface);cursor:pointer;transition:background .15s', onclick: function () { humanDrop(i % C); } });
    holes.push(x); grid.appendChild(x);
  })(i);
  for (i = 0; i < C; i++) arrows.appendChild(h('span', { text: '' }));
  var modeSeg = T.seg([['cpu', 'vs computer'], ['two', '2 players']], mode, function (v) { mode = v; T.store.set('c4-mode', v); lvBox.hidden = v !== 'cpu'; reset(); });
  var lvBox = h('div', { hidden: mode !== 'cpu' }, [T.seg([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], level, function (v) { level = v; T.store.set('c4-level', v); reset(); })]);
  function draw(win) {
    holes.forEach(function (x, k) { x.style.background = b[k] ? COLORS[b[k]] : 'var(--surface)'; x.style.boxShadow = win && win.indexOf(k) >= 0 ? '0 0 0 4px #fff inset' : ''; });
    Array.prototype.forEach.call(arrows.children, function (s, c) { s.textContent = c === cursor && !over ? '▼' : ''; s.style.color = COLORS[turn]; });
    stats.innerHTML = '';
    [[1, mode === 'cpu' ? (human === 1 ? 'You (red)' : 'Computer (red)') : 'Red'], [2, mode === 'cpu' ? (human === 2 ? 'You (yellow)' : 'Computer (yellow)') : 'Yellow'], ['d', 'Draws']].forEach(function (n) {
      stats.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(score2[n[0]]) }), h('span', { text: n[1] })]));
    });
  }
  function put(c) {
    var k = drop(b, c); if (k < 0 || over) return false;
    b[k] = turn;
    var w = line4(b);
    if (w || full(b)) {
      over = true; score2[w ? w.p : 'd']++; T.store.set('c4-score', score2);
      msg.textContent = !w ? 'It’s a draw!' : mode === 'cpu' ? (w.p === human ? '🎉 You win!' : 'The computer wins.') : '🎉 ' + NAMES[w.p] + ' wins!';
      draw(w && w.cells); return true;
    }
    turn = 3 - turn;
    msg.textContent = mode === 'cpu' ? (turn === human ? 'Your turn' : 'Computer is thinking…') : NAMES[turn] + '’s turn';
    draw();
    if (mode === 'cpu' && turn !== human) { busy = true; setTimeout(function () { busy = false; put(aiMove(b, turn, level)); }, 300); }
    return true;
  }
  function humanDrop(c) { if (busy || over || (mode === 'cpu' && turn !== human)) return; cursor = c; put(c); }
  function reset() {
    b = []; for (var k = 0; k < R * C; k++) b.push(0);
    over = false; turn = 1; human = mode === 'cpu' ? (firstHuman ? 1 : 2) : 1;
    msg.textContent = mode === 'cpu' ? (human === 1 ? 'You are red and go first' : 'Computer (red) goes first') : 'Red goes first';
    draw();
    if (mode === 'cpu' && human === 2) { busy = true; setTimeout(function () { busy = false; put(aiMove(b, 1, level)); }, 400); }
  }
  grid.addEventListener('keydown', function (e) {
    if (/^[1-7]$/.test(e.key)) { humanDrop(+e.key - 1); return; }
    if (e.key === 'ArrowLeft') cursor = (cursor + 6) % 7; else if (e.key === 'ArrowRight') cursor = (cursor + 1) % 7;
    else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); humanDrop(cursor); return; } else return;
    e.preventDefault(); draw();
  });
  grid.addEventListener('pointermove', function (e) { var r = grid.getBoundingClientRect(), c = Math.floor((e.clientX - r.left) / r.width * 7); if (c >= 0 && c < 7 && c !== cursor) { cursor = c; draw(); } });
  spot.appendChild(T.card([modeSeg, lvBox, msg, h('div', {}, [arrows, grid]), stats,
    T.row([T.button('New game', { primary: true, onclick: reset }), T.button('Swap who starts', { small: true, onclick: function () { firstHuman = !firstHuman; reset(); } }),
      T.button('Reset score', { small: true, onclick: function () { score2 = { 1: 0, 2: 0, d: 0 }; T.store.set('c4-score', score2); draw(); } })])]));
  reset();
  T.tests['four-in-row'] = function () {
    var f = [], e = function () { var a = []; for (var k = 0; k < 42; k++) a.push(0); return a; };
    var t = e(); [0, 1, 2, 3].forEach(function (c) { t[drop(t, c)] = 1; });
    if (!line4(t) || line4(t).p !== 1) f.push('row of four');
    t = e(); [[35, 1], [29, 1], [23, 1], [17, 1]].forEach(function (x) { t[x[0]] = x[1]; });
    if (!line4(t)) f.push('diagonal');
    t = e(); [1, 1, 1].forEach(function () { t[drop(t, 4)] = 2; });
    if (aiMove(t, 2, 'medium') !== 4) f.push('missed own win');
    t = e(); [0, 1, 2].forEach(function (c) { t[drop(t, c)] = 1; });
    if (aiMove(t, 2, 'medium') !== 3) f.push('missed a block');
    t = e(); for (var k = 0; k < 6; k++) t[drop(t, 0)] = 1 + (k % 2);
    if (drop(t, 0) !== -1) f.push('full column accepted');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
