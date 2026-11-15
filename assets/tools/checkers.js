/* Infinity by GroupChatOn — checkers. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Checkers (English draughts): 8 × 8, forced captures, multi-jumps and kings; play the computer at three levels or a friend. */
GCOTools.register('checkers', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  // board: 64 squares; 'r'/'R' red man/king (bottom, moves up), 'w'/'W' white man/king (top, moves down), '' empty
  function start() { var b = []; for (var i = 0; i < 64; i++) { var r = (i / 8) | 0, c = i % 8, dark = (r + c) % 2 === 1; b.push(dark && r < 3 ? 'w' : dark && r > 4 ? 'r' : ''); } return b; }
  function side(p) { return p ? p.toLowerCase() : ''; }
  function dirs(p) { return p === 'r' ? [[-1, -1], [-1, 1]] : p === 'w' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1]]; }
  function sq(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8 ? r * 8 + c : -1; }
  // all legal moves for a side: { path: [from, …, to], caps: [captured squares] }; captures are compulsory
  function moves(b, s, forced) {
    var caps = [], quiet = [];
    for (var i = 0; i < 64; i++) if (side(b[i]) === s) {
      (function jump(at, piece, path, taken) {
        var any = false, r = (at / 8) | 0, c = at % 8;
        dirs(piece).forEach(function (d) {
          var over = sq(r + d[0], c + d[1]), land = sq(r + 2 * d[0], c + 2 * d[1]);
          if (over < 0 || land < 0 || b[land] && land !== path[0] || taken.indexOf(over) >= 0) return;
          if (side(b[over]) && side(b[over]) !== s) {
            any = true;
            var crowned = piece === 'r' && land < 8 || piece === 'w' && land >= 56;
            if (crowned) caps.push({ path: path.concat(land), caps: taken.concat(over) });   // reaching the far row ends the turn
            else jump(land, piece, path.concat(land), taken.concat(over));
          }
        });
        if (!any && taken.length) caps.push({ path: path, caps: taken });
      })(i, b[i], [i], []);
      dirs(b[i]).forEach(function (d) { var t = sq(((i / 8) | 0) + d[0], i % 8 + d[1]); if (t >= 0 && !b[t]) quiet.push({ path: [i, t], caps: [] }); });
    }
    return caps.length && forced !== false ? caps : caps.concat(quiet);
  }
  function apply(b, m) {
    var n = b.slice(), from = m.path[0], to = m.path[m.path.length - 1], p = n[from];
    n[from] = ''; m.caps.forEach(function (k) { n[k] = ''; });
    if (p === 'r' && to < 8) p = 'R'; if (p === 'w' && to >= 56) p = 'W';
    n[to] = p; return n;
  }
  function evaluate(b, s) {
    var v = 0;
    b.forEach(function (p, i) { if (!p) return; var r = (i / 8) | 0, val = p === 'r' ? 100 + (7 - r) * 3 : p === 'w' ? 100 + r * 3 : 170; if ((i % 8 === 0 || i % 8 === 7)) val += 2; v += side(p) === s ? val : -val; });
    return v;
  }
  function search(b, s, depth, a, beta, forced) {
    var ms = moves(b, s, forced);
    if (!ms.length) return -100000 - depth;
    if (!depth) return evaluate(b, s);
    var best = -Infinity;
    for (var i = 0; i < ms.length; i++) {
      var v = -search(apply(b, ms[i]), s === 'r' ? 'w' : 'r', depth - 1, -beta, -a, forced);
      if (v > best) best = v; if (v > a) a = v; if (a >= beta) break;
    }
    return best;
  }
  var DEPTH = { easy: 1, medium: 4, hard: 6 };
  function aiMove(b, s, level, forced) {
    var ms = moves(b, s, forced);
    if (!ms.length) return null;
    if (level === 'easy' && rnd(100) < 50) return ms[rnd(ms.length)];
    var best = -Infinity, picks = [];
    ms.forEach(function (m) { var v = -search(apply(b, m), s === 'r' ? 'w' : 'r', DEPTH[level], -Infinity, Infinity, forced); if (v > best) { best = v; picks = [m]; } else if (v === best) picks.push(m); });
    return picks[rnd(picks.length)];
  }
  var b, turn, sel = -1, cursor = 57, over = false, mode = T.store.get('ck-mode', 'cpu'), level = T.store.get('ck-level', 'medium'), human = 'r', quietPlies = 0, last = null;
  var forcedBox = h('input', { type: 'checkbox', checked: T.store.get('ck-forced', true) });
  var boardEl = h('div', { tabindex: '0', role: 'grid', 'aria-label': 'Checkers board. Arrow keys move, Enter picks a piece and then its destination.', style: 'display:grid;grid-template-columns:repeat(8,1fr);width:min(100%,480px);aspect-ratio:1;margin:0 auto;border:6px solid #7c4a1e;border-radius:10px;overflow:hidden;touch-action:manipulation;user-select:none;-webkit-user-select:none' });
  var squares = [], msg = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font:800 18px/1.3 var(--ui);text-align:center;min-height:26px' }), counts = h('div', { 'class': 'tstats' });
  for (var i = 0; i < 64; i++) (function (i) { var s = h('div', { style: 'display:grid;place-items:center;min-width:0;position:relative', onclick: function () { tap(i); } }); squares.push(s); boardEl.appendChild(s); })(i);
  var modeSeg = T.seg([['cpu', 'vs computer'], ['two', '2 players']], mode, function (v) { mode = v; T.store.set('ck-mode', v); lvBox.hidden = v !== 'cpu'; reset(); });
  var lvBox = h('div', { hidden: mode !== 'cpu' }, [T.seg([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], level, function (v) { level = v; T.store.set('ck-level', v); })]);
  function legal() { return over ? [] : moves(b, turn, forcedBox.checked); }
  function draw() {
    var ms = legal(), from = {}, to = {};
    ms.forEach(function (m) { from[m.path[0]] = 1; if (m.path[0] === sel) to[m.path[m.path.length - 1]] = 1; });
    squares.forEach(function (s, i) {
      var dark = (((i / 8) | 0) + i % 8) % 2 === 1, p = b[i];
      s.style.background = !dark ? '#f0d9b5' : i === sel ? '#d97706' : last && last.indexOf(i) >= 0 ? '#8b6a3e' : '#6b4423';
      s.style.boxShadow = i === cursor && document.activeElement === boardEl ? 'inset 0 0 0 3px #38bdf8' : '';
      s.innerHTML = '';
      if (p) s.appendChild(h('div', { style: 'width:78%;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;font:900 clamp(12px,4vw,22px)/1 var(--ui);' +
        (side(p) === 'r' ? 'background:radial-gradient(circle at 35% 30%,#f87171,#b91c1c);color:#fde68a;' : 'background:radial-gradient(circle at 35% 30%,#fffbeb,#d6c7a1);color:#92400e;') +
        'box-shadow:0 3px 0 rgba(0,0,0,.4)' + (from[i] && side(p) === turn && isHuman() ? ',0 0 0 3px rgba(56,189,248,.55)' : ''), text: p === 'R' || p === 'W' ? '♛' : '' }));
      if (to[i]) s.appendChild(h('div', { style: 'position:absolute;width:30%;aspect-ratio:1;border-radius:50%;background:rgba(56,189,248,.8)' }));
      s.setAttribute('aria-label', (p ? (side(p) === 'r' ? 'red ' : 'white ') + (p === p.toUpperCase() ? 'king' : 'piece') : dark ? 'empty' : 'light square') + (to[i] ? ', you can move here' : ''));
    });
    var n = { r: 0, w: 0 }; b.forEach(function (p) { if (p) n[side(p)]++; });
    counts.innerHTML = '';
    [['r', mode === 'cpu' ? (human === 'r' ? 'You (red)' : 'Computer (red)') : 'Red pieces'], ['w', mode === 'cpu' ? (human === 'w' ? 'You (white)' : 'Computer (white)') : 'White pieces']].forEach(function (x) {
      counts.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(n[x[0]]) }), h('span', { text: x[1] })]));
    });
  }
  function isHuman() { return mode === 'two' || turn === human; }
  function tap(i) {
    if (over || !isHuman()) return;
    cursor = i;
    var ms = legal();
    if (sel >= 0) {
      var m = ms.filter(function (x) { return x.path[0] === sel && x.path[x.path.length - 1] === i; }).sort(function (a, c) { return c.caps.length - a.caps.length; })[0];
      if (m) { play(m); return; }
    }
    if (ms.some(function (x) { return x.path[0] === i; })) sel = i;
    else if (side(b[i]) === turn) { sel = -1; msg.textContent = ms.length && ms[0].caps.length ? 'You must capture: a jump is available.' : 'That piece cannot move.'; }
    else sel = -1;
    draw();
  }
  function play(m) {
    b = apply(b, m); sel = -1; last = m.path;
    quietPlies = m.caps.length ? 0 : quietPlies + 1;
    turn = turn === 'r' ? 'w' : 'r';
    var ms = legal(), name = { r: 'Red', w: 'White' };
    if (!ms.length) { over = true; var winner = turn === 'r' ? 'w' : 'r'; msg.textContent = mode === 'cpu' ? (winner === human ? '🎉 You win!' : 'The computer wins.') : '🎉 ' + name[winner] + ' wins!'; }
    else if (quietPlies >= 80) { over = true; msg.textContent = 'Draw: 40 moves each without a capture.'; }
    else msg.textContent = mode === 'cpu' ? (turn === human ? 'Your move' + (ms[0].caps.length ? ' (you must capture)' : '') : 'Computer is thinking…') : name[turn] + ' to move' + (ms[0].caps.length ? ' (must capture)' : '');
    draw();
    if (!over && !isHuman()) setTimeout(function () { var a = aiMove(b, turn, level, forcedBox.checked); if (a) play(a); }, 350);
  }
  function reset() {
    b = start(); turn = 'r'; sel = -1; over = false; quietPlies = 0; last = null;
    msg.textContent = mode === 'cpu' ? (human === 'r' ? 'You are red: you move first' : 'Computer (red) moves first') : 'Red moves first';
    draw();
    if (mode === 'cpu' && human === 'w') setTimeout(function () { play(aiMove(b, 'r', level, forcedBox.checked)); }, 400);
  }
  boardEl.addEventListener('keydown', function (e) {
    var r = (cursor / 8) | 0, c = cursor % 8, d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (d) { e.preventDefault(); cursor = Math.max(0, Math.min(7, r + d[0])) * 8 + Math.max(0, Math.min(7, c + d[1])); draw(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(cursor); }
  });
  boardEl.addEventListener('focus', draw); boardEl.addEventListener('blur', draw);
  forcedBox.addEventListener('change', function () { T.store.set('ck-forced', forcedBox.checked); sel = -1; draw(); });
  spot.appendChild(T.card([modeSeg, lvBox, msg, boardEl, counts,
    T.row([T.button('New game', { primary: true, onclick: reset }), T.button('Swap sides', { small: true, onclick: function () { human = human === 'r' ? 'w' : 'r'; reset(); } })]),
    h('label', { 'class': 'tcheck' }, [forcedBox, ' Captures are compulsory (standard rule)']),
    h('p', { 'class': 'tstatus', text: 'Tap a piece, then a blue dot. Jumps over several pieces happen in one go.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  reset();
  T.tests['checkers'] = function () {
    var f = [], s = start(), e = function () { var a = []; for (var k = 0; k < 64; k++) a.push(''); return a; };
    if (s.filter(function (p) { return p === 'r'; }).length !== 12 || s.filter(function (p) { return p === 'w'; }).length !== 12) f.push('start position');
    if (moves(s, 'r').length !== 7) f.push('opening moves ' + moves(s, 'r').length);
    var t = e(); t[45] = 'r'; t[36] = 'w'; t[22] = 'w'; t[47] = 'r';   // red at 45 can double-jump 45→27→9? (36, then 18 empty)
    t[22] = ''; t[18] = 'w';
    var m = moves(t, 'r');
    if (!m.length || !m.every(function (x) { return x.caps.length; })) f.push('capture not forced');
    if (!m.some(function (x) { return x.caps.length === 2 && x.path[x.path.length - 1] === 9; })) f.push('double jump ' + JSON.stringify(m));
    t = e(); t[9] = 'r'; var cr = apply(t, { path: [9, 0], caps: [] });
    if (cr[0] !== 'R') f.push('no crowning');
    t = e(); t[18] = 'R'; if (moves(t, 'r').length !== 4) f.push('king moves');
    t = e(); t[27] = 'r'; t[18] = 'w'; t[20] = 'w';
    if (aiMove(t, 'r', 'medium').caps.length !== 1) f.push('computer skipped a capture');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
