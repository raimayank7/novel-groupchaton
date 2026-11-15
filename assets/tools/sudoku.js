/* Infinity by GroupChatOn — sudoku. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Sudoku: play new puzzles (easy to expert) with notes, hints, undo and mistake checks, or type in any puzzle and let the solver finish it. */
GCOTools.register('sudoku', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function box(i) { return ((i / 27) | 0) * 3 + (((i % 9) / 3) | 0); }
  // counts solutions (stops at `limit`); the first one is copied into `out`; `random` tries digits in a random order (used to make new grids)
  function solve(g, limit, out, random) {
    var R = [0, 0, 0, 0, 0, 0, 0, 0, 0], C = R.slice(), B = R.slice(), cells = g.slice(), count = 0, i;
    for (i = 0; i < 81; i++) if (cells[i]) {
      var b = 1 << cells[i], r = (i / 9) | 0, c = i % 9, x = box(i);
      if ((R[r] | C[c] | B[x]) & b) return 0;
      R[r] |= b; C[c] |= b; B[x] |= b;
    }
    function go() {
      var best = -1, mask = 0, n = 10;
      for (var k = 0; k < 81; k++) if (!cells[k]) {
        var m = ~(R[(k / 9) | 0] | C[k % 9] | B[box(k)]) & 1022, p = 0, q = m;
        while (q) { q &= q - 1; p++; }
        if (p < n) { best = k; mask = m; n = p; if (p < 2) break; }
      }
      if (best < 0) { count++; if (out && count === 1) for (var j = 0; j < 81; j++) out[j] = cells[j]; return count >= limit; }
      if (!n) return false;
      var r = (best / 9) | 0, c = best % 9, x = box(best), s = random ? rnd(9) : 0;
      for (var t = 0; t < 9; t++) {
        var d = (t + s) % 9 + 1, bit = 1 << d;
        if (!(mask & bit)) continue;
        cells[best] = d; R[r] |= bit; C[c] |= bit; B[x] |= bit;
        if (go()) return true;
        R[r] &= ~bit; C[c] &= ~bit; B[x] &= ~bit; cells[best] = 0;
      }
      return false;
    }
    go();
    return count;
  }
  var LEVELS = { easy: 40, medium: 32, hard: 27, expert: 23 };
  function make(level) {
    var sol = [], zero = [], i;
    for (i = 0; i < 81; i++) zero.push(0);
    solve(zero, 1, sol, true);
    var puz = sol.slice(), left = 81, idx = [];
    for (i = 0; i < 81; i++) idx.push(i);
    shuffle(idx).forEach(function (k) {
      if (left <= LEVELS[level]) return;
      var keep = puz[k]; puz[k] = 0;
      if (solve(puz, 2) !== 1) puz[k] = keep; else left--;
    });
    return { puz: puz, sol: sol };
  }
  function parse(s) {
    var d = String(s).replace(/[^0-9.\-_*]/g, '').replace(/[.\-_*]/g, '0');
    if (d.length !== 81) throw new Error('A puzzle needs 81 cells: type the numbers row by row, with 0 or . for the empty ones (you typed ' + d.length + ').');
    return d.split('').map(Number);
  }
  function css(id, s) { if (!document.getElementById(id)) document.head.appendChild(h('style', { id: id, text: s })); }
  css('tsu-css', '.tsu{display:grid;grid-template-columns:repeat(9,1fr);grid-template-rows:repeat(9,1fr);width:min(100%,460px);aspect-ratio:1;margin:0 auto;border:2px solid var(--ink);border-radius:10px;overflow:hidden;background:var(--surface);touch-action:manipulation;user-select:none;-webkit-user-select:none}' +
    '.tsu:focus-visible{outline:3px solid var(--accent);outline-offset:3px}.tsu div{display:grid;place-items:center;min-width:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);font:600 clamp(17px,5.4vw,27px)/1 var(--ui);color:var(--accent);cursor:pointer}' +
    '.tsu div.c3{border-right:2px solid var(--ink)}.tsu div.r3{border-bottom:2px solid var(--ink)}.tsu div.g{color:var(--ink);font-weight:800}.tsu div.peer{background:var(--surface-2)}.tsu div.same{background:var(--accent-soft)}' +
    '.tsu div.sel{background:var(--accent);color:var(--accent-ink)}.tsu div.bad{color:#dc2626;background:rgba(220,38,38,.13)}.tsu div.sv{color:#16a34a}' +
    '.tsu .nt{display:grid;grid-template-columns:repeat(3,1fr);width:100%;height:100%;place-items:center;font:600 clamp(7px,2.2vw,11px)/1 var(--ui);color:var(--muted)}' +
    '.tpad9{display:grid;grid-template-columns:repeat(9,1fr);gap:5px;width:min(100%,460px);margin:0 auto}.tpad9 button{min-width:0;padding:10px 0;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);color:var(--ink);font:700 20px/1 var(--ui);cursor:pointer}' +
    '.tpad9 button:disabled{opacity:.35}.tpad9 small{display:block;font:500 10px/1.2 var(--ui);color:var(--muted)}');

  var mode = 'play', level = T.store.get('sudoku-level', 'easy'), game = null, sel = 40, noteMode = false, undo = [], timer = null;
  var board = h('div', { 'class': 'tsu', tabindex: '0', role: 'grid', 'aria-label': 'Sudoku board. Use the arrow keys to move and 1 to 9 to fill a square.' });
  var pad = h('div', { 'class': 'tpad9' }), clock = h('b', { text: '0:00' }), miss = h('b', { text: '0' }), filled = h('b', { text: '0/81' });
  var showBad = h('input', { type: 'checkbox', checked: T.store.get('sudoku-showbad', true) });
  var levelSel = T.select([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard'], ['expert', 'Expert']], level);
  var paste = h('textarea', { rows: '3', 'class': 'tmono', placeholder: '81 digits, row by row, 0 or . for empty squares', 'aria-label': 'Puzzle as text' });
  var notesBtn = T.button('Notes: off', { small: true, onclick: function () { noteMode = !noteMode; notesBtn.textContent = 'Notes: ' + (noteMode ? 'on' : 'off'); notesBtn.setAttribute('aria-pressed', String(noteMode)); } });
  var out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font-weight:700;min-height:22px' });
  var cells = [];
  for (var i = 0; i < 81; i++) (function (i) {
    var c = h('div', { role: 'gridcell', 'class': (i % 9 === 2 || i % 9 === 5 ? 'c3' : '') + (((i / 9) | 0) === 2 || ((i / 9) | 0) === 5 ? ' r3' : ''), onclick: function () { sel = i; draw(); board.focus({ preventScroll: true }); } });
    cells.push(c); board.appendChild(c);
  })(i);
  for (var d = 1; d <= 9; d++) (function (d) { pad.appendChild(h('button', { type: 'button', 'aria-label': 'Put ' + d, onclick: function () { put(d); } }, [String(d)])); })(d);

  function fresh(puz, sol) { return { puz: puz, sol: sol, val: puz.slice(), notes: puz.map(function () { return 0; }), miss: 0, time: 0, done: false, solver: !sol }; }
  function newGame() {
    status.info('Making a new ' + level + ' puzzle…');
    setTimeout(function () { var m = make(level); game = fresh(m.puz, m.sol); undo = []; sel = 40; status.clear(); out.textContent = ''; save(); draw(); start(); }, 20);
  }
  function save() { if (game && mode === 'play') T.store.set('sudoku-game', game); }
  function start() {
    clearInterval(timer);
    timer = setInterval(function () { if (game && !game.done && mode === 'play' && !document.hidden) { game.time++; clock.textContent = fmt(game.time); if (game.time % 10 === 0) save(); } }, 1000);
  }
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function clash(g, i) {
    var v = g[i], r = (i / 9) | 0, c = i % 9, x = box(i);
    if (!v) return false;
    for (var k = 0; k < 81; k++) if (k !== i && g[k] === v && ((((k / 9) | 0) === r) || k % 9 === c || box(k) === x)) return true;
    return false;
  }
  function draw() {
    if (!game) return;
    var v = game.val, sv = v[sel], r = (sel / 9) | 0, c = sel % 9, x = box(sel), count = 0, used = {};
    cells.forEach(function (el, k) {
      var cls = el.className.replace(/\s*(g|peer|same|sel|bad|sv)\b/g, '');
      if (game.puz[k]) cls += ' g';
      if (k === sel) cls += ' sel';
      else if (sv && v[k] === sv) cls += ' same';
      else if (((k / 9) | 0) === r || k % 9 === c || box(k) === x) cls += ' peer';
      var wrong = v[k] && (mode === 'solve' ? clash(v, k) : !game.puz[k] && showBad.checked && v[k] !== game.sol[k]);
      if (wrong) cls += ' bad';
      if (game.solved && game.solved[k]) cls += ' sv';
      el.className = cls.trim();
      el.innerHTML = '';
      if (v[k]) { el.textContent = String(v[k]); count++; used[v[k]] = (used[v[k]] || 0) + 1; }
      else if (game.notes[k]) {
        var nt = h('span', { 'class': 'nt' });
        for (var d = 1; d <= 9; d++) nt.appendChild(h('span', { text: game.notes[k] & (1 << d) ? String(d) : '' }));
        el.appendChild(nt);
      }
      el.setAttribute('aria-label', 'Row ' + (((k / 9) | 0) + 1) + ', column ' + (k % 9 + 1) + ': ' + (v[k] || 'empty'));
    });
    Array.prototype.forEach.call(pad.children, function (b, k) {
      var left = 9 - (used[k + 1] || 0);
      b.innerHTML = ''; b.appendChild(document.createTextNode(String(k + 1)));
      if (mode === 'play') b.appendChild(h('small', { text: left > 0 ? left + ' left' : 'done' }));
      b.disabled = mode === 'play' && left <= 0;
    });
    filled.textContent = count + '/81'; miss.textContent = String(game.miss); clock.textContent = fmt(game.time);
  }
  function put(d) {
    if (!game || game.done && mode === 'play') return;
    if (mode === 'play' && game.puz[sel]) { status.info('That number was given in the puzzle and cannot be changed.'); return; }
    if (mode === 'solve' && game.solved) { game.val = game.puz.slice(); game.solved = null; out.textContent = ''; }
    var before = { i: sel, v: game.val[sel], n: game.notes[sel] };
    if (noteMode && d && mode === 'play') { if (game.val[sel]) return; game.notes[sel] ^= 1 << d; }
    else {
      game.val[sel] = game.val[sel] === d ? 0 : d; game.notes[sel] = 0;
      if (mode === 'solve') { game.puz = game.val.slice(); game.solved = null; }
      if (d && game.val[sel] === d) {
        // clear this number from notes in the same row, column and box
        for (var k = 0; k < 81; k++) if (((k / 9) | 0) === ((sel / 9) | 0) || k % 9 === sel % 9 || box(k) === box(sel)) game.notes[k] &= ~(1 << d);
        if (mode === 'play' && game.sol && d !== game.sol[sel]) { game.miss++; if (showBad.checked) status.error('That ' + d + ' does not fit here.'); }
        else status.clear();
      }
    }
    undo.push(before); draw(); save(); won();
  }
  function won() {
    if (mode !== 'play' || game.done) return;
    for (var k = 0; k < 81; k++) if (game.val[k] !== game.sol[k]) return;
    game.done = true; save();
    var best = T.store.get('sudoku-best-' + level, 0);
    if (!best || game.time < best) T.store.set('sudoku-best-' + level, game.time);
    out.textContent = '🎉 Solved in ' + fmt(game.time) + ' with ' + game.miss + (game.miss === 1 ? ' mistake' : ' mistakes') + (best && game.time >= best ? ' · your best ' + level + ' time is ' + fmt(best) : ' · new best for ' + level + '!');
    status.ok('Well done!');
  }
  function hint() {
    if (!game || mode !== 'play' || game.done) return;
    var k = !game.puz[sel] && game.val[sel] !== game.sol[sel] ? sel : -1;
    if (k < 0) for (var j = 0; j < 81; j++) if (game.val[j] !== game.sol[j]) { k = j; break; }
    if (k < 0) return;
    sel = k; undo.push({ i: k, v: game.val[k], n: game.notes[k] }); game.val[k] = game.sol[k]; game.notes[k] = 0; game.time += 15;
    status.info('Hint: row ' + (((k / 9) | 0) + 1) + ', column ' + (k % 9 + 1) + ' is ' + game.sol[k] + ' (+15 seconds).');
    draw(); save(); won();
  }
  function runSolver() {
    var g = game.val.slice(), outG = [], n;
    for (var k = 0; k < 81; k++) if (g[k] && clash(g, k)) { status.error('Two of the same number share a row, column or box (shown in red). Fix them first.'); draw(); return; }
    var given = g.filter(Boolean).length;
    if (given < 17) { status.error('Type at least 17 numbers: no sudoku with fewer clues has only one answer.'); return; }
    n = solve(g, 2, outG);
    if (!n) { status.error('This puzzle has no solution. Check the numbers you typed.'); out.textContent = ''; return; }
    game.solved = g.map(function (v) { return !v; }); game.val = outG; game.puz = g;
    out.textContent = n > 1 ? 'Solved, but this puzzle has more than one answer: here is one of them.' : 'Solved: the green numbers are the answer (' + given + ' clues given).';
    status.ok(n > 1 ? 'More than one answer exists.' : 'Unique solution found.');
    draw();
  }
  function setMode(m) {
    mode = m; status.clear(); out.textContent = '';
    playBox.hidden = m !== 'play'; solveBox.hidden = m !== 'solve';
    if (m === 'solve') { var z = []; for (var k = 0; k < 81; k++) z.push(0); game = fresh(z, null); }
    else { game = T.store.get('sudoku-game', null); if (!game || !game.sol) newGame(); else { if (game.done) out.textContent = 'You solved this one. Press New game for another.'; start(); } }
    undo = []; draw();
  }
  function loadText(txt) {
    try { var g = parse(txt); game = fresh(g, null); setTimeout(runSolver, 0); draw(); }
    catch (e) { status.error(e); }
  }
  board.addEventListener('keydown', function (e) {
    var k = e.key, r = (sel / 9) | 0, c = sel % 9;
    if (k === 'ArrowUp') sel = ((r + 8) % 9) * 9 + c; else if (k === 'ArrowDown') sel = ((r + 1) % 9) * 9 + c;
    else if (k === 'ArrowLeft') sel = r * 9 + (c + 8) % 9; else if (k === 'ArrowRight') sel = r * 9 + (c + 1) % 9;
    else if (/^[1-9]$/.test(k)) { put(+k); e.preventDefault(); return; }
    else if (k === '0' || k === 'Backspace' || k === 'Delete') { if (game.val[sel]) put(game.val[sel]); else if (game.notes[sel]) { game.notes[sel] = 0; draw(); } e.preventDefault(); return; }
    else if (k === 'n' || k === 'N') { notesBtn.click(); return; }
    else if (k === 'h' || k === 'H') { hint(); return; }
    else return;
    e.preventDefault(); draw();
  });
  showBad.addEventListener('change', function () { T.store.set('sudoku-showbad', showBad.checked); draw(); });
  levelSel.addEventListener('change', function () { level = levelSel.value; T.store.set('sudoku-level', level); });
  var playBox = h('div', { style: 'display:grid;gap:10px' }, [
    T.row([T.field('Level', levelSel), T.button('New game', { primary: true, onclick: newGame })]),
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [clock, h('span', { text: 'Time' })]), h('div', { 'class': 'tstat' }, [miss, h('span', { text: 'Mistakes' })]), h('div', { 'class': 'tstat' }, [filled, h('span', { text: 'Filled' })])])]);
  var solveBox = h('div', { style: 'display:grid;gap:10px', hidden: true }, [
    h('p', { 'class': 'tstatus', text: 'Tap a square and type the numbers from your newspaper or book, then press Solve. Or paste the puzzle as text.' }),
    T.row([T.button('Solve', { primary: true, onclick: function () { runSolver(); } }), T.button('Try a sample', { small: true, onclick: function () { if (mode !== 'solve') seg.children[1].click(); paste.value = SAMPLE; loadText(SAMPLE); } }),
      T.button('Clear', { small: true, onclick: function () { setMode('solve'); } })]),
    T.field('Paste a puzzle (optional)', paste), T.row([T.button('Load text', { small: true, onclick: function () { loadText(paste.value); } })])]);
  var SAMPLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
  var seg = T.seg([['play', 'Play'], ['solve', 'Solve my puzzle']], 'play', setMode);
  spot.appendChild(T.card([seg, playBox, solveBox, board, pad,
    T.row([notesBtn, T.button('Erase', { small: true, onclick: function () { if (game.val[sel]) put(game.val[sel]); else { game.notes[sel] = 0; draw(); } } }),
      T.button('Undo', { small: true, onclick: function () { var u = undo.pop(); if (!u) return; game.val[u.i] = u.v; game.notes[u.i] = u.n; sel = u.i; if (mode === 'solve') { game.puz = game.val.slice(); game.solved = null; } draw(); save(); } }),
      T.button('Hint', { small: true, onclick: hint })]),
    h('label', { 'class': 'tcheck' }, [showBad, ' Show my mistakes in red as I play']), status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  setMode('play');

  T.tests['sudoku'] = function () {
    var f = [], g = parse(SAMPLE), o = [];
    if (solve(g, 2, o) !== 1) f.push('sample not unique');
    if (o.join('') !== '534678912672195348198342567859761423426853791713924856961537284287419635345286179') f.push('wrong answer ' + o.join(''));
    var m = make('medium'), clues = m.puz.filter(Boolean).length;
    if (solve(m.puz, 2) !== 1) f.push('generated puzzle not unique');
    if (clues < 32 || clues > 40) f.push('medium clues ' + clues);
    for (var k = 0; k < 81; k++) if (m.puz[k] && m.puz[k] !== m.sol[k]) { f.push('clue differs from answer'); break; }
    var bad = g.slice(); bad[2] = 5;
    if (solve(bad, 2) !== 0) f.push('impossible grid solved');
    try { parse('123'); f.push('short text accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
