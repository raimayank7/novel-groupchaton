/* Infinity by GroupChatOn — nonogram. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Picture logic puzzles: number clues say how many filled squares run in each row and column; every puzzle here can be solved by logic alone. */
GCOTools.register('nonogram', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var PICS = {
    Heart: ['.##...##..', '####.####.', '#########.', '#########.', '.#######..', '..#####...', '...###....', '....#.....', '..........', '..........'],
    Tree: ['....##....', '...####...', '..######..', '.########.', '...####...', '..######..', '.########.', '##########', '....##....', '...####...'],
    Mug: ['..........', '########..', '#######.##', '#######..#', '#######..#', '#######.##', '#######...', '.#####....', '..###.....', '##########'],
    Fish: ['..........', '...####...', '.#######.#', '##.#######', '##########', '.#######.#', '...####...', '..........', '..........', '..........'],
    Key: ['..........', '.###......', '##.##.....', '#...######', '##.##.#.##', '.###..#.#.', '..........', '..........', '..........', '..........'],
    Umbrella: ['....##....', '..######..', '.########.', '##########', '#.#.##.#.#', '....##....', '....##....', '....##....', '.#..##....', '.####.....'],
    Arrow: ['....#.....', '...###....', '..#####...', '.#######..', '#########.', '...###....', '...###....', '...###....', '...###....', '...###....'],
    Boat: ['....#.....', '....##....', '....###...', '....####..', '....#####.', '....#.....', '##########', '.########.', '..######..', '..........'],
    Cat: ['#........#', '##......##', '###....###', '##########', '#.##..##.#', '##########', '####..####', '###.##.###', '.########.', '..######..'],
    House: ['....##....', '...####...', '..######..', '.########.', '##########', '.########.', '.##....##.', '.##.##.##.', '.##.##.##.', '.########.']
  };
  function clues(line) { var out = [], run = 0; line.forEach(function (v) { if (v === 1) run++; else if (run) { out.push(run); run = 0; } }); if (run) out.push(run); return out.length ? out : [0]; }
  function rowsOf(g, n) { var r = []; for (var i = 0; i < n; i++) r.push(g.slice(i * n, i * n + n)); return r; }
  function colsOf(g, n) { var c = []; for (var j = 0; j < n; j++) { var col = []; for (var i = 0; i < n; i++) col.push(g[i * n + j]); c.push(col); } return c; }
  // one line: which cells are certainly filled (1) / empty (0) given the clue and what is already known (-1 = unknown)
  function solveLine(clue, known) {
    var n = known.length, canF = [], canE = [], blocks = clue[0] === 0 ? [] : clue, any = false, cur = [];
    for (var i = 0; i < n; i++) { canF.push(false); canE.push(false); cur.push(0); }
    (function place(b, from) {
      if (b === blocks.length) {
        for (var k = from; k < n; k++) if (known[k] === 1) return;
        any = true;
        for (k = 0; k < n; k++) { if (k < from ? cur[k] : 0) canF[k] = true; else canE[k] = true; }
        return;
      }
      var len = blocks[b], rest = 0;
      for (var q = b + 1; q < blocks.length; q++) rest += blocks[q] + 1;
      for (var s = from; s + len + rest <= n; s++) {
        var ok = true;
        for (k = from; k < s && ok; k++) if (known[k] === 1) ok = false;
        if (!ok) break;
        for (k = s; k < s + len && ok; k++) if (known[k] === 0) ok = false;
        if (ok && s + len < n && known[s + len] === 1) ok = false;
        if (!ok) continue;
        for (k = from; k < s; k++) cur[k] = 0;
        for (k = s; k < s + len; k++) cur[k] = 1;
        if (s + len < n) cur[s + len] = 0;
        place(b + 1, Math.min(n, s + len + 1));
      }
    })(0, 0);
    if (!any) return null;
    return known.map(function (v, k) { return canF[k] && !canE[k] ? 1 : canE[k] && !canF[k] ? 0 : v; });
  }
  // solves by line logic only; returns the grid or null when logic alone is not enough
  function solve(rc, cc) {
    var n = rc.length, g = [], changed = true, i, j;
    for (i = 0; i < n * n; i++) g.push(-1);
    while (changed) {
      changed = false;
      for (i = 0; i < n; i++) {
        var row = solveLine(rc[i], g.slice(i * n, i * n + n)); if (!row) return null;
        for (j = 0; j < n; j++) if (g[i * n + j] !== row[j]) { g[i * n + j] = row[j]; changed = true; }
      }
      for (j = 0; j < n; j++) {
        var col = []; for (i = 0; i < n; i++) col.push(g[i * n + j]);
        col = solveLine(cc[j], col); if (!col) return null;
        for (i = 0; i < n; i++) if (g[i * n + j] !== col[i]) { g[i * n + j] = col[i]; changed = true; }
      }
    }
    return g.indexOf(-1) < 0 ? g : null;
  }
  function fromPic(name) { var p = PICS[name], g = []; p.forEach(function (r) { r.split('').forEach(function (ch) { g.push(ch === '#' ? 1 : 0); }); }); return { n: 10, sol: g, name: name }; }
  function random(n) {
    for (var t = 0; t < 400; t++) {
      var g = [], dens = n === 5 ? 60 : 62;
      for (var i = 0; i < n * n; i++) g.push(rnd(100) < dens ? 1 : 0);
      var rc = rowsOf(g, n).map(clues), cc = colsOf(g, n).map(clues), s = solve(rc, cc);
      if (s) return { n: n, sol: s, name: n + ' × ' + n };
    }
    return fromPic('Heart');
  }
  function css(id, s) { if (!document.getElementById(id)) document.head.appendChild(h('style', { id: id, text: s })); }
  css('tng-css', '.tng-wrap{overflow-x:auto;overflow-y:hidden;padding:1px;max-width:100%}.tng{display:grid;margin:0 auto;touch-action:none;user-select:none;-webkit-user-select:none;width:max-content}.tng:focus-visible{outline:3px solid var(--accent);outline-offset:3px}' +
    '.tng .q{display:grid;place-items:center;border:1px solid var(--line);margin:-.5px;background:var(--surface);cursor:pointer;font:700 14px/1 var(--ui);color:var(--muted)}.tng .q.on{background:var(--ink)}.tng .q.k{box-shadow:inset 0 0 0 3px var(--accent)}' +
    '.tng .q.b5{border-right:2px solid var(--ink)}.tng .q.d5{border-bottom:2px solid var(--ink)}.tng .q.bad{background:#dc2626}' +
    '.tng .cr{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font:700 12px/1.25 var(--ui);color:var(--ink);padding-bottom:3px}.tng .rr{display:flex;justify-content:flex-end;align-items:center;gap:5px;font:700 12px/1 var(--ui);color:var(--ink);padding-right:5px;white-space:nowrap}' +
    '.tng .ok{color:var(--muted);opacity:.5}');
  var wrapEl = h('div', { 'class': 'tng-wrap' }), P, state = [], cursor = 0, drag = null, done = false, t0 = 0, timer = null, mode = 'fill';
  var size = T.select([['pic', '10 × 10 pictures'], ['5', '5 × 5 (quick)'], ['10', '10 × 10 random'], ['15', '15 × 15 (hard)']], T.store.get('ng-size', 'pic'));
  var gridEl = h('div', { 'class': 'tng', tabindex: '0', role: 'grid', 'aria-label': 'Nonogram grid. Arrow keys move, Space fills, X marks a square as empty.' });
  var modeSeg = T.seg([['fill', '■ Fill'], ['cross', '✕ Mark empty']], 'fill', function (v) { mode = v; });
  var out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' }), clock = h('span', { text: '0:00' }), picN = 0;
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function newGame() {
    var s = size.value; T.store.set('ng-size', s);
    if (s === 'pic') { var names = Object.keys(PICS); P = fromPic(names[picN++ % names.length]); } else P = random(+s);
    P.rc = rowsOf(P.sol, P.n).map(clues); P.cc = colsOf(P.sol, P.n).map(clues);
    state = P.sol.map(function () { return 0; }); done = false; t0 = 0; out.textContent = ''; status.clear(); cursor = 0;
    gridEl.innerHTML = ''; gridEl.appendChild(h('div'));
    P.cc.forEach(function (c) { gridEl.appendChild(h('div', { 'class': 'cr' }, c.map(function (x) { return h('span', { text: String(x) }); }))); });
    for (var i = 0; i < P.n; i++) {
      gridEl.appendChild(h('div', { 'class': 'rr' }, P.rc[i].map(function (x) { return h('span', { text: String(x) }); })));
      for (var j = 0; j < P.n; j++) gridEl.appendChild(h('div', { 'class': 'q' + (j % 5 === 4 && j < P.n - 1 ? ' b5' : '') + (i % 5 === 4 && i < P.n - 1 ? ' d5' : ''), 'data-i': String(i * P.n + j) }));
    }
    clearInterval(timer); timer = setInterval(function () { if (!done && !document.hidden) { t0++; clock.textContent = fmt(t0); } }, 1000);
    fit(); setTimeout(fit, 60); paint();
  }
  // fit the grid to the screen: room for the row clues, then share the rest between the squares
  function fit() {
    if (!P) return;
    var most = Math.max.apply(null, P.rc.map(function (c) { return c.length; })), avail = (wrapEl.clientWidth || 300) - (most * 13 + 12);
    var cell = Math.max(14, Math.min(P.n === 5 ? 44 : 32, Math.floor(avail / P.n)));
    gridEl.style.gridTemplateColumns = 'auto repeat(' + P.n + ',' + cell + 'px)'; gridEl.style.gridAutoRows = cell + 'px'; gridEl.style.gridTemplateRows = 'auto';
  }
  window.addEventListener('resize', fit);
  function paint() {
    var q = gridEl.querySelectorAll('.q');
    Array.prototype.forEach.call(q, function (el, i) {
      el.className = el.className.replace(/\s*(on|k|bad)\b/g, '') + (state[i] === 1 ? ' on' : '') + (i === cursor && document.activeElement === gridEl ? ' k' : '');
      el.textContent = state[i] === 2 ? '✕' : '';
    });
    var fill = state.map(function (v) { return v === 1 ? 1 : 0; });
    var rr = gridEl.querySelectorAll('.rr'), cr = gridEl.querySelectorAll('.cr');
    rowsOf(fill, P.n).forEach(function (r, i) { rr[i].classList.toggle('ok', clues(r).join() === P.rc[i].join()); });
    colsOf(fill, P.n).forEach(function (c, i) { cr[i].classList.toggle('ok', clues(c).join() === P.cc[i].join()); });
    if (!done && rowsOf(fill, P.n).every(function (r, i) { return clues(r).join() === P.rc[i].join(); }) && colsOf(fill, P.n).every(function (c, i) { return clues(c).join() === P.cc[i].join(); })) {
      done = true; out.textContent = '🎉 Solved' + (P.n === 10 && PICS[P.name] ? ': it’s a ' + P.name.toLowerCase() + '!' : '!') + ' Time ' + fmt(t0) + '.';
      status.ok('Every clue is satisfied.');
    }
  }
  function apply(i, v) { if (done || i < 0) return; state[i] = v; paint(); }
  function idx(e) { var el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList && el.classList.contains('q') && el.parentNode === gridEl ? +el.getAttribute('data-i') : -1; }
  gridEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  gridEl.addEventListener('pointerdown', function (e) {
    var i = idx(e); if (i < 0) return; e.preventDefault(); cursor = i;
    var want = e.button === 2 || mode === 'cross' ? 2 : 1;
    drag = state[i] === want ? 0 : want; apply(i, drag);
  });
  gridEl.addEventListener('pointermove', function (e) { if (drag === null) return; var i = idx(e); if (i >= 0 && state[i] !== drag) apply(i, drag); });
  window.addEventListener('pointerup', function () { drag = null; });
  gridEl.addEventListener('keydown', function (e) {
    var n = P.n, r = (cursor / n) | 0, c = cursor % n, k = e.key;
    if (k === 'ArrowUp') r = (r + n - 1) % n; else if (k === 'ArrowDown') r = (r + 1) % n; else if (k === 'ArrowLeft') c = (c + n - 1) % n; else if (k === 'ArrowRight') c = (c + 1) % n;
    else if (k === ' ' || k === 'Enter') { e.preventDefault(); apply(cursor, state[cursor] === 1 ? 0 : 1); return; }
    else if (k === 'x' || k === 'X') { apply(cursor, state[cursor] === 2 ? 0 : 2); return; }
    else if (k === 'Backspace' || k === 'Delete') { apply(cursor, 0); return; }
    else return;
    e.preventDefault(); cursor = r * n + c; paint();
  });
  gridEl.addEventListener('focus', paint); gridEl.addEventListener('blur', paint);
  function check() {
    var bad = 0, q = gridEl.querySelectorAll('.q');
    state.forEach(function (v, i) { if ((v === 1 && P.sol[i] !== 1) || (v === 2 && P.sol[i] === 1)) { bad++; q[i].classList.add('bad'); } });
    if (bad) status.error(bad + (bad === 1 ? ' square is' : ' squares are') + ' wrong (flashing red).'); else status.info('No mistakes so far.');
    setTimeout(paint, 1500);
  }
  function hint() {
    if (done) return;
    var wrong = []; state.forEach(function (v, i) { if ((v === 1) !== (P.sol[i] === 1)) wrong.push(i); });
    if (!wrong.length) return;
    var i = wrong[rnd(wrong.length)]; state[i] = P.sol[i] ? 1 : 2; cursor = i; t0 += 10; status.info('Hint: row ' + (((i / P.n) | 0) + 1) + ', column ' + (i % P.n + 1) + ' (+10 seconds).'); paint();
  }
  spot.appendChild(T.card([T.row([T.field('Puzzle', size), T.button('New puzzle', { primary: true, onclick: newGame })]),
    h('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap' }, [modeSeg, h('span', {}, ['⏱ ', clock])]),
    wrapEl,
    T.row([T.button('Check', { small: true, onclick: check }), T.button('Hint', { small: true, onclick: hint }), T.button('Clear', { small: true, onclick: function () { state = state.map(function () { return 0; }); done = false; out.textContent = ''; paint(); } }),
      T.button('Show answer', { small: true, onclick: function () { state = P.sol.map(function (v) { return v ? 1 : 2; }); done = true; out.textContent = 'Here is the answer.'; paint(); } })]),
    status.el, out]));
  wrapEl.appendChild(gridEl);
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  newGame();
  T.tests['nonogram'] = function () {
    var f = [];
    if (clues([1, 1, 0, 1, 0, 0, 1, 1, 1]).join() !== '2,1,3' || clues([0, 0]).join() !== '0') f.push('clues');
    var l = solveLine([3], [-1, -1, -1, -1]);
    if (l.join() !== '-1,1,1,-1') f.push('overlap rule ' + l.join());
    if (solveLine([2, 2], [-1, -1, -1, -1, -1]).join() !== '1,1,0,1,1') f.push('exact fit');
    if (solveLine([3], [1, 0, -1, -1]) !== null) f.push('impossible line accepted');
    Object.keys(PICS).forEach(function (k) {
      var p = fromPic(k), s = solve(rowsOf(p.sol, 10).map(clues), colsOf(p.sol, 10).map(clues));
      if (!s || s.join() !== p.sol.join()) f.push('picture ' + k + ' not solvable by logic');
    });
    var r = random(10); if (!solve(rowsOf(r.sol, 10).map(clues), colsOf(r.sol, 10).map(clues))) f.push('random puzzle not solvable');
    return Promise.resolve({ ok: !f.length, n: 5 + Object.keys(PICS).length, fails: f });
  };
});
