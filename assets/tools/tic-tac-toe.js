/* Infinity by GroupChatOn — tic-tac-toe. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Tic-tac-toe (noughts and crosses): play the computer at three levels (the hardest never loses) or a friend on the same device. */
GCOTools.register('tic-tac-toe', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  function winner(b) {
    for (var i = 0; i < 8; i++) { var l = LINES[i]; if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { p: b[l[0]], line: l }; }
    return b.indexOf('') < 0 ? { p: 'draw' } : null;
  }
  // perfect play: +10 win, -10 loss, prefers quicker wins
  function minimax(b, me, turn, depth) {
    var w = winner(b);
    if (w) return w.p === 'draw' ? 0 : w.p === me ? 10 - depth : depth - 10;
    var best = turn === me ? -99 : 99, other = turn === 'X' ? 'O' : 'X';
    for (var i = 0; i < 9; i++) if (!b[i]) {
      b[i] = turn; var s = minimax(b, me, other, depth + 1); b[i] = '';
      best = turn === me ? Math.max(best, s) : Math.min(best, s);
    }
    return best;
  }
  function aiMove(b, me, level) {
    var free = []; b.forEach(function (v, i) { if (!v) free.push(i); });
    if (level === 'easy' || (level === 'medium' && rnd(100) < 35)) return free[rnd(free.length)];
    var other = me === 'X' ? 'O' : 'X', scores = free.map(function (i) { b[i] = me; var s = minimax(b, me, other, 1); b[i] = ''; return s; });
    var top = Math.max.apply(null, scores), picks = free.filter(function (i, k) { return scores[k] === top; });
    return picks[rnd(picks.length)];
  }
  var board = ['', '', '', '', '', '', '', '', ''], turn = 'X', over = false, mode = T.store.get('ttt-mode', 'cpu'), level = T.store.get('ttt-level', 'hard'), human = 'X', score = T.store.get('ttt-score', { X: 0, O: 0, D: 0 }), firstX = true;
  var grid = h('div', { role: 'grid', 'aria-label': 'Board. Press 1 to 9 to play a square.', tabindex: '0', style: 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(100%,360px);aspect-ratio:1;margin:0 auto;touch-action:manipulation' });
  var cells = [], msg = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font:800 20px/1.3 var(--ui);text-align:center;min-height:28px' }), stats = h('div', { 'class': 'tstats' });
  for (var i = 0; i < 9; i++) (function (i) {
    var c = h('button', { type: 'button', 'aria-label': 'Square ' + (i + 1), style: 'border:0;border-radius:16px;background:var(--surface-2);font:900 clamp(40px,14vw,72px)/1 var(--ui);cursor:pointer;color:var(--ink)', onclick: function () { play(i, true); } });
    cells.push(c); grid.appendChild(c);
  })(i);
  var modeSeg = T.seg([['cpu', 'vs computer'], ['two', '2 players']], mode, function (v) { mode = v; T.store.set('ttt-mode', v); lvBox.hidden = v !== 'cpu'; reset(); });
  var lvSeg = T.seg([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Unbeatable']], level, function (v) { level = v; T.store.set('ttt-level', v); reset(); });
  var lvBox = h('div', { hidden: mode !== 'cpu' }, [lvSeg]);
  function draw(line) {
    cells.forEach(function (c, i) {
      c.textContent = board[i]; c.style.color = board[i] === 'X' ? '#2563eb' : '#e11d48';
      c.style.background = line && line.indexOf(i) >= 0 ? 'var(--accent-soft)' : 'var(--surface-2)';
      c.setAttribute('aria-label', 'Square ' + (i + 1) + (board[i] ? ': ' + board[i] : ''));
    });
    stats.innerHTML = '';
    var names = mode === 'cpu' ? [['X', human === 'X' ? 'You (X)' : 'Computer (X)'], ['O', human === 'O' ? 'You (O)' : 'Computer (O)']] : [['X', 'Player X'], ['O', 'Player O']];
    names.concat([['D', 'Draws']]).forEach(function (n) { stats.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(score[n[0]]) }), h('span', { text: n[1] })])); });
  }
  function play(i, byHuman) {
    if (over || board[i]) return;
    if (byHuman && mode === 'cpu' && turn !== human) return;
    board[i] = turn; turn = turn === 'X' ? 'O' : 'X';
    var w = winner(board);
    if (w) {
      over = true; score[w.p === 'draw' ? 'D' : w.p]++; T.store.set('ttt-score', score);
      msg.textContent = w.p === 'draw' ? 'It’s a draw!' : mode === 'cpu' ? (w.p === human ? '🎉 You win!' : 'The computer wins.') : '🎉 ' + w.p + ' wins!';
      draw(w.line); return;
    }
    msg.textContent = mode === 'cpu' ? (turn === human ? 'Your turn (' + human + ')' : 'Computer is thinking…') : turn + '’s turn';
    draw();
    if (mode === 'cpu' && turn !== human) setTimeout(function () { play(aiMove(board, turn, level), false); }, 350);
  }
  function reset() {
    board = ['', '', '', '', '', '', '', '', '']; over = false; turn = 'X';
    human = mode === 'cpu' ? (firstX ? 'X' : 'O') : 'X';
    msg.textContent = mode === 'cpu' ? (human === 'X' ? 'You go first (X)' : 'Computer goes first') : 'X goes first';
    draw();
    if (mode === 'cpu' && human === 'O') setTimeout(function () { play(aiMove(board, 'X', level), false); }, 400);
  }
  grid.addEventListener('keydown', function (e) { if (/^[1-9]$/.test(e.key)) play(+e.key - 1, true); });
  spot.appendChild(T.card([modeSeg, lvBox, msg, grid, stats,
    T.row([T.button('New game', { primary: true, onclick: reset }), T.button('Swap who starts', { small: true, onclick: function () { firstX = !firstX; reset(); } }),
      T.button('Reset score', { small: true, onclick: function () { score = { X: 0, O: 0, D: 0 }; T.store.set('ttt-score', score); draw(); } })])]));
  reset();
  T.tests['tic-tac-toe'] = function () {
    var f = [];
    if (!winner(['X', 'X', 'X', '', '', '', '', '', '']) || winner(['X', 'O', 'X', '', '', '', '', '', ''])) f.push('winner');
    if (winner(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']).p !== 'draw') f.push('draw');
    if (aiMove(['O', 'O', '', 'X', 'X', '', '', '', ''], 'O', 'hard') !== 2) f.push('missed a win');
    if (aiMove(['X', 'X', '', '', 'O', '', '', '', ''], 'O', 'hard') !== 2) f.push('missed a block');
    // the unbeatable computer must never lose, whatever the person plays
    var losses = 0;
    (function explore(b, t) {
      var w = winner(b); if (w) { if (w.p === 'X') losses++; return; }
      if (t === 'O') { var m = aiMove(b.slice(), 'O', 'hard'); b[m] = 'O'; explore(b, 'X'); b[m] = ''; return; }
      for (var i = 0; i < 9; i++) if (!b[i]) { b[i] = 'X'; explore(b, 'O'); b[i] = ''; }
    })(['', '', '', '', '', '', '', '', ''], 'X');
    if (losses) f.push('computer lost ' + losses + ' games');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
