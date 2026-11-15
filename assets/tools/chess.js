/* Infinity by GroupChatOn — chess. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Chess vs the computer or a friend: rules (checks, castling, en passant, promotion, draws) by the open-source chess.js library; the computer player is our own small search. */
GCOTools.register('chess', function (spot, T) {
  var h = T.h, status = T.status();
  var LIB = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js';
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var VAL = { p: 100, n: 310, b: 330, r: 500, q: 900, k: 0 };
  // a small bonus for good squares (row 0 = the far side for White)
  function bonus(t, r, c) {
    var mid = 3.5 - Math.max(Math.abs(r - 3.5), Math.abs(c - 3.5));
    if (t === 'p') return (6 - r) * 7 + (c > 1 && c < 6 ? mid * 5 : 0);
    if (t === 'n') return mid * 10 - 15;
    if (t === 'b') return mid * 5;
    if (t === 'r') return r === 1 ? 12 : 0;
    if (t === 'q') return mid * 2;
    return r === 7 ? (c === 6 || c === 2 || c === 1 ? 20 : 5) : -12 * (7 - r);
  }
  function evaluate(g) {   // from White's point of view
    var b = g.board(), s = 0;
    for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
      var p = b[r][c]; if (!p) continue;
      var v = VAL[p.type] + bonus(p.type, p.color === 'w' ? r : 7 - r, c);
      s += p.color === 'w' ? v : -v;
    }
    return s;
  }
  function ordered(g) { return g.moves({ verbose: true }).sort(function (a, b) { return (b.captured ? VAL[b.captured] * 10 - VAL[b.piece] : 0) + (b.promotion ? 800 : 0) - (a.captured ? VAL[a.captured] * 10 - VAL[a.piece] : 0) - (a.promotion ? 800 : 0); }); }
  function negamax(g, depth, a, beta, sign) {
    if (!depth) return sign * evaluate(g);
    var ms = ordered(g);
    if (!ms.length) return g.in_check() ? -100000 - depth : 0;
    var best = -1e9;
    for (var i = 0; i < ms.length; i++) {
      g.move(ms[i]); var v = -negamax(g, depth - 1, -beta, -a, -sign); g.undo();
      if (v > best) best = v; if (v > a) a = v; if (a >= beta) break;
    }
    return best;
  }
  var DEPTH = { easy: 1, medium: 2, hard: 3 };
  function aiMove(g, level) {
    var ms = ordered(g), sign = g.turn() === 'w' ? 1 : -1, scored = [];
    ms.forEach(function (m) { g.move(m); scored.push([m, -negamax(g, DEPTH[level] - 1, -1e9, 1e9, -sign)]); g.undo(); });
    var top = Math.max.apply(null, scored.map(function (x) { return x[1]; })), slack = level === 'easy' ? 120 : level === 'medium' ? 15 : 0;
    var picks = scored.filter(function (x) { return x[1] >= top - slack; });
    return picks[rnd(picks.length)][0];
  }
  var GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }, FILES = 'abcdefgh';
  var game = null, sel = null, flip = false, mode = T.store.get('ch-mode', 'cpu'), level = T.store.get('ch-level', 'medium'), human = T.store.get('ch-side', 'w'), last = null, cursor = 'e2', thinking = false, promo = null;
  var boardEl = h('div', { tabindex: '0', role: 'grid', 'aria-label': 'Chess board. Arrow keys move, Enter picks a piece and its square.', style: 'display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);width:min(100%,480px);aspect-ratio:1;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,.25);touch-action:manipulation;user-select:none;-webkit-user-select:none' });
  var msg = h('div', { 'aria-live': 'polite', style: 'font:800 18px/1.3 var(--ui);text-align:center;min-height:26px' });
  var moveList = h('div', { 'data-out': '', 'class': 'tmono', style: 'max-height:120px;overflow:auto;font-size:13px;line-height:1.6;color:var(--ink-soft,var(--ink))' });
  var promoRow = h('div', { hidden: true, style: 'display:flex;gap:8px;justify-content:center;align-items:center' });
  var lost = h('div', { style: 'display:flex;justify-content:space-between;gap:8px;font-size:20px;min-height:26px;flex-wrap:wrap' });
  var modeSeg = T.seg([['cpu', 'vs computer'], ['two', '2 players']], mode, function (v) { mode = v; T.store.set('ch-mode', v); cpuBox.hidden = v !== 'cpu'; newGame(); });
  var cpuBox = h('div', { hidden: mode !== 'cpu', style: 'display:grid;gap:8px' }, [
    T.seg([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], level, function (v) { level = v; T.store.set('ch-level', v); }),
    T.seg([['w', 'I play White'], ['b', 'I play Black']], human, function (v) { human = v; T.store.set('ch-side', v); flip = v === 'b'; newGame(); })]);
  function sqName(r, c) { return FILES[c] + (8 - r); }
  function draw() {
    if (!game) return;
    var b = game.board(), targets = {}, inCheck = game.in_check(), turn = game.turn();
    if (sel) game.moves({ square: sel, verbose: true }).forEach(function (m) { targets[m.to] = m.captured ? 'x' : 'o'; });
    boardEl.innerHTML = '';
    for (var i = 0; i < 64; i++) {
      var rr = flip ? 7 - ((i / 8) | 0) : (i / 8) | 0, cc = flip ? 7 - i % 8 : i % 8, name = sqName(rr, cc), p = b[rr][cc], light = (rr + cc) % 2 === 0;
      var bg = light ? '#ecdfc8' : '#a47a58';
      if (last && (last.from === name || last.to === name)) bg = light ? '#e6d27a' : '#c1a14a';
      if (sel === name) bg = '#7fb1d8';
      if (inCheck && p && p.type === 'k' && p.color === turn) bg = '#ef4444';
      var cell = h('div', { 'data-sq': name, style: 'position:relative;display:grid;place-items:center;min-width:0;min-height:0;cursor:pointer;background:' + bg + (cursor === name && document.activeElement === boardEl ? ';box-shadow:inset 0 0 0 3px #2563eb' : ''), 'aria-label': name + (p ? ' ' + (p.color === 'w' ? 'white ' : 'black ') + { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' }[p.type] : '') });
      if (p) cell.appendChild(h('span', { style: 'font:400 clamp(26px,9vw,50px)/1 "Segoe UI Symbol","Noto Sans Symbols 2","DejaVu Sans",serif;' + (p.color === 'w' ? 'color:#fff;text-shadow:0 0 2px #000,0 0 2px #000,0 1px 2px #000' : 'color:#1c1917;text-shadow:0 0 2px rgba(255,255,255,.6)'), text: GLYPH[p.type] + '︎' }));
      if (targets[name]) cell.appendChild(h('span', { style: 'position:absolute;border-radius:50%;' + (targets[name] === 'x' ? 'inset:6%;border:4px solid rgba(37,99,235,.55)' : 'width:28%;height:28%;background:rgba(37,99,235,.5)') }));
      if ((flip ? rr === 0 : rr === 7)) cell.appendChild(h('span', { style: 'position:absolute;right:3px;bottom:1px;font:700 10px/1 var(--ui);color:' + (light ? '#a47a58' : '#ecdfc8'), text: FILES[cc] }));
      if ((flip ? cc === 7 : cc === 0)) cell.appendChild(h('span', { style: 'position:absolute;left:3px;top:2px;font:700 10px/1 var(--ui);color:' + (light ? '#a47a58' : '#ecdfc8'), text: String(8 - rr) }));
      boardEl.appendChild(cell);
    }
    var hist = game.history(), txt = [];
    for (var k = 0; k < hist.length; k += 2) txt.push((k / 2 + 1) + '. ' + hist[k] + (hist[k + 1] ? ' ' + hist[k + 1] : ''));
    moveList.textContent = txt.join('   ') || 'No moves yet.';
    moveList.scrollTop = moveList.scrollHeight;
    var taken = { w: [], b: [] }, start = { p: 8, n: 2, b: 2, r: 2, q: 1 }, have = { w: {}, b: {} };
    b.forEach(function (row) { row.forEach(function (p) { if (p) have[p.color][p.type] = (have[p.color][p.type] || 0) + 1; }); });
    ['w', 'b'].forEach(function (c) { Object.keys(start).forEach(function (t) { for (var n = have[c][t] || 0; n < start[t]; n++) taken[c].push(GLYPH[t]); }); });
    lost.innerHTML = '';
    lost.appendChild(h('span', { title: 'White pieces taken', text: taken.w.join('') })); lost.appendChild(h('span', { title: 'Black pieces taken', style: 'opacity:.75', text: taken.b.join('') }));
    status.clear(); msg.textContent = describe();
  }
  function describe() {
    var who = game.turn() === 'w' ? 'White' : 'Black', other = who === 'White' ? 'Black' : 'White';
    if (game.in_checkmate()) return mode === 'cpu' ? (game.turn() === human ? 'Checkmate: the computer wins.' : '🎉 Checkmate! You win.') : '🎉 Checkmate! ' + other + ' wins.';
    if (game.in_stalemate()) return 'Stalemate: it’s a draw.';
    if (game.in_threefold_repetition()) return 'Draw by repetition.';
    if (game.insufficient_material()) return 'Draw: not enough pieces left to checkmate.';
    if (game.in_draw()) return 'Draw (50-move rule).';
    if (thinking) return 'Computer is thinking…';
    return (mode === 'cpu' ? (game.turn() === human ? 'Your move' : 'Computer to move') : who + ' to move') + (game.in_check() ? ': check!' : '');
  }
  function save() { try { T.store.set('ch-game', { pgn: game.pgn(), mode: mode }); } catch (e) {} }
  function myTurn() { return !game.game_over() && !thinking && (mode === 'two' || game.turn() === human); }
  function tap(name) {
    if (!game || !myTurn()) return;
    cursor = name; promoRow.hidden = true;
    if (sel) {
      var ms = game.moves({ square: sel, verbose: true }).filter(function (m) { return m.to === name; });
      if (ms.length) {
        if (ms[0].promotion) { askPromo(sel, name); return; }
        doMove({ from: sel, to: name }); return;
      }
    }
    var p = game.get(name);
    sel = p && p.color === game.turn() ? (sel === name ? null : name) : null;
    draw();
  }
  function askPromo(from, to) {
    promoRow.innerHTML = ''; promoRow.appendChild(h('b', { text: 'Promote to:' }));
    [['q', 'Queen'], ['r', 'Rook'], ['b', 'Bishop'], ['n', 'Knight']].forEach(function (x) {
      promoRow.appendChild(T.button(GLYPH[x[0]] + '︎ ' + x[1], { small: true, onclick: function () { promoRow.hidden = true; doMove({ from: from, to: to, promotion: x[0] }); } }));
    });
    promoRow.hidden = false;
  }
  function doMove(m) {
    var done = game.move(m); if (!done) return;
    last = done; sel = null; save(); draw();
    if (mode === 'cpu' && !game.game_over() && game.turn() !== human) computer();
  }
  function computer() {
    thinking = true; draw();
    setTimeout(function () {
      var m = aiMove(game, level); thinking = false;
      last = game.move(m); save(); draw();
    }, 60);
  }
  function newGame() {
    if (!window.Chess) return;
    game = new window.Chess(); sel = null; last = null; thinking = false; promoRow.hidden = true; flip = mode === 'cpu' && human === 'b'; save(); draw();
    if (mode === 'cpu' && human === 'b') computer();
  }
  function undo() {
    if (!game || thinking) return;
    game.undo(); if (mode === 'cpu' && game.turn() !== human) game.undo();
    var h2 = game.history({ verbose: true }); last = h2[h2.length - 1] || null; sel = null; save(); draw();
  }
  boardEl.addEventListener('click', function (e) { var c = e.target.closest('[data-sq]'); if (c) tap(c.getAttribute('data-sq')); });
  boardEl.addEventListener('keydown', function (e) {
    var d = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
    if (d) {
      e.preventDefault(); if (flip) d = [-d[0], -d[1]];
      var f = Math.max(0, Math.min(7, FILES.indexOf(cursor[0]) + d[0])), r = Math.max(1, Math.min(8, +cursor[1] + d[1]));
      cursor = FILES[f] + r; draw();
    } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(cursor); }
  });
  boardEl.addEventListener('focus', draw); boardEl.addEventListener('blur', draw);
  var copyBtn = T.button('Copy moves', { small: true, onclick: function () { if (game) T.copy(game.pgn() || '(no moves)', copyBtn); } });
  spot.appendChild(T.card([modeSeg, cpuBox, msg, lost, boardEl, promoRow,
    T.row([T.button('New game', { primary: true, onclick: newGame }), T.button('Undo', { small: true, onclick: undo }), T.button('Flip board', { small: true, onclick: function () { flip = !flip; draw(); } }), copyBtn]),
    status.el, h('div', {}, [h('b', { text: 'Moves' }), moveList])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  status.progress(0.3, 'Loading the chess rules…');
  var ready = T.loadScript(LIB).then(function () {
    var s = T.store.get('ch-game', null);
    game = new window.Chess();
    if (s && s.pgn && s.mode === mode) { try { game.load_pgn(s.pgn); } catch (e) { game = new window.Chess(); } }
    var hv = game.history({ verbose: true }); last = hv[hv.length - 1] || null; flip = mode === 'cpu' && human === 'b';
    status.clear(); draw();
    if (mode === 'cpu' && !game.game_over() && game.turn() !== human) computer();
  }, function (e) { status.error(e); });
  T.tests['chess'] = function () {
    return ready.then(function () {
      var f = [], C = window.Chess, g = new C();
      if (g.moves().length !== 20) f.push('20 opening moves');
      if (evaluate(g) !== 0) f.push('start position not level');
      ['f3', 'e5', 'g4', 'Qh4'].forEach(function (m) { g.move(m); });
      if (!g.in_checkmate()) f.push('quick mate not seen');
      g = new C('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1');
      if (aiMove(g, 'medium').san !== 'Rd8#') f.push('missed mate in one');
      g = new C('k7/8/8/3q4/8/8/8/K2R4 w - - 0 1');
      if (aiMove(g, 'hard').san !== 'Rxd5') f.push('missed a free queen');
      g = new C('7k/P7/8/8/8/8/8/K7 w - - 0 1');
      if (aiMove(g, 'medium').san.indexOf('a8=Q') !== 0) f.push('did not promote');
      return { ok: !f.length, n: 6, fails: f };
    });
  };
});
