/* Infinity by GroupChatOn — kakuro. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Kakuro: fill the white squares with 1–9 so each run adds up to its clue with no number repeated; new puzzles in three sizes. */
GCOTools.register('kakuro', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // white = true for squares you fill in; row 0 and column 0 are always clue squares
  function mask(N) {
    for (var tries = 0; tries < 200; tries++) {
      var W = [], i, r, c;
      for (i = 0; i < N * N; i++) W.push(i >= N && i % N > 0);
      var black = function (r, c) { W[r * N + c] = false; W[(N - r) * N + (N - c)] = false; };   // keeps the pattern symmetric
      for (i = 0; i < Math.round((N - 1) * (N - 1) * 0.2); i++) black(1 + rnd(N - 1), 1 + rnd(N - 1));
      for (var changed = true, guard = 0; changed && guard < 50; guard++) {
        changed = false;
        for (r = 1; r < N; r++) for (c = 1; c < N; c++) if (W[r * N + c]) {
          var a = runOf(W, N, r * N + c, false), d = runOf(W, N, r * N + c, true);
          if (a.length < 2 || d.length < 2) { black(r, c); changed = true; }
          else if (a.length > 6) { black(r, a[3] % N); changed = true; }
          else if (d.length > 6) { black((d[3] / N) | 0, c); changed = true; }
        }
      }
      var whites = W.map(function (w, k) { return w ? k : -1; }).filter(function (k) { return k >= 0; });
      if (whites.length < (N - 1) * (N - 1) * 0.55) continue;
      var seen = {}, stack = [whites[0]]; seen[whites[0]] = 1;
      while (stack.length) { var k = stack.pop(); [k - 1, k + 1, k - N, k + N].forEach(function (x) { if (x >= 0 && x < N * N && W[x] && !seen[x] && (x % N === k % N || ((x / N) | 0) === ((k / N) | 0))) { seen[x] = 1; stack.push(x); } }); }
      if (Object.keys(seen).length === whites.length) return W;
    }
    return null;
  }
  function runOf(W, N, k, down) {
    var st = down ? N : 1, a = k; while (W[a - st] && (down || a % N > 0)) a -= st;
    var out = []; for (var x = a; x < N * N && W[x] && (down || ((x / N) | 0) === ((a / N) | 0)); x += st) out.push(x);
    return out;
  }
  function runs(W, N) {
    var list = [], seen = {};
    W.forEach(function (w, k) { if (!w) return; [false, true].forEach(function (down) { var r = runOf(W, N, k, down); var key = down + ':' + r[0]; if (!seen[key]) { seen[key] = 1; list.push({ cells: r, down: down, clue: r[0] - (down ? N : 1) }); } }); });
    return list;
  }
  // fills or solves: counts solutions up to `limit`; with random=true it is used to make a fresh filling
  function search(N, W, R, sums, limit, random, out) {
    var val = W.map(function () { return 0; }), byCell = {}, count = 0;
    R.forEach(function (run, i) { run.cells.forEach(function (k) { (byCell[k] = byCell[k] || []).push(i); }); });
    var whites = W.map(function (w, k) { return w ? k : -1; }).filter(function (k) { return k >= 0; });
    function ok(ri, d) {
      var run = R[ri], used = 0, s = 0, empty = 0;
      run.cells.forEach(function (k) { if (val[k]) { used |= 1 << val[k]; s += val[k]; } else empty++; });
      if (used & (1 << d)) return false;
      if (!sums) return true;
      s += d; empty--; used |= 1 << d;
      var lo = 0, hi = 0, m = 0, x;
      for (x = 1; x <= 9 && m < empty; x++) if (!(used & (1 << x))) { lo += x; m++; }
      for (m = 0, x = 9; x >= 1 && m < empty; x--) if (!(used & (1 << x))) { hi += x; m++; }
      return s + lo <= sums[ri] && s + hi >= sums[ri];
    }
    function go() {
      var best = -1, cands = null;
      for (var i = 0; i < whites.length; i++) {
        var k = whites[i]; if (val[k]) continue;
        var c = [];
        for (var d = 1; d <= 9; d++) if (byCell[k].every(function (ri) { return ok(ri, d); })) c.push(d);
        if (!cands || c.length < cands.length) { best = k; cands = c; if (c.length < 2) break; }
      }
      if (best < 0) { count++; if (out && count === 1) for (var j = 0; j < val.length; j++) out[j] = val[j]; return count >= limit; }
      if (random) shuffle(cands);
      for (var q = 0; q < cands.length; q++) { val[best] = cands[q]; if (go()) return true; }
      val[best] = 0;
      return false;
    }
    go();
    return count;
  }
  var SIZES = { s: 6, m: 8, l: 10 };
  function make(N) {
    var W = mask(N), R = runs(W, N), last = null;
    for (var t = 0; t < 40; t++) {
      var sol = [];
      if (!search(N, W, R, null, 1, true, sol)) { W = mask(N); R = runs(W, N); continue; }
      var sums = R.map(function (run) { return run.cells.reduce(function (s, k) { return s + sol[k]; }, 0); });
      last = { N: N, W: W, R: R, sums: sums, sol: sol };
      if (search(N, W, R, sums, 2, false) === 1) { last.unique = true; return last; }
    }
    return last;
  }
  function css(id, s) { if (!document.getElementById(id)) document.head.appendChild(h('style', { id: id, text: s })); }
  css('tkk-css', '.tkk{display:grid;width:min(100%,480px);margin:0 auto;aspect-ratio:1;border:2px solid #52525b;background:#52525b;gap:1px;touch-action:manipulation;user-select:none;-webkit-user-select:none}.tkk:focus-visible{outline:3px solid var(--accent);outline-offset:3px}' +
    '.tkk>div{position:relative;min-width:0;display:grid;place-items:center}.tkk .bk{background:#3f3f46;color:#fff;background-image:linear-gradient(to top right,transparent calc(50% - 1px),#a1a1aa,transparent calc(50% + 1px))}' +
    '.tkk .bk b{position:absolute;font:700 clamp(9px,2.6vw,13px)/1 var(--ui)}.tkk .bk .a{right:3px;top:3px}.tkk .bk .d{left:3px;bottom:3px}.tkk .bk.x{background:#27272a}' +
    '.tkk .wt{background:#fff;font:700 clamp(16px,5vw,26px)/1 var(--ui);color:#4338ca;cursor:pointer}.tkk .wt.sel{background:#6d28d9;color:#fff}.tkk .wt.run{background:#e0e7ff}.tkk .wt.bad{color:#dc2626}.tkk .wt.rv{color:#2563eb}');
  var P, val = [], sel = -1, across = true, done = false, t0 = 0, timer = null;
  var size = T.select([['s', 'Small (5 × 5)'], ['m', 'Medium (7 × 7)'], ['l', 'Large (9 × 9)']], T.store.get('kk-size', 's'));
  var board = h('div', { 'class': 'tkk', tabindex: '0', role: 'grid', 'aria-label': 'Kakuro board. Arrow keys move, 1 to 9 fill.' });
  var pad = h('div', { style: 'display:grid;grid-template-columns:repeat(5,1fr);gap:5px;width:min(100%,480px);margin:0 auto' });
  var out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' }), clock = h('span', { text: '0:00' }), help = h('div', { 'class': 'tstatus', 'aria-live': 'polite' });
  for (var d = 1; d <= 9; d++) (function (d) { pad.appendChild(T.button(String(d), { onclick: function () { put(d); } })); })(d);
  pad.appendChild(T.button('⌫', { onclick: function () { put(0); } }));
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function newGame() {
    T.store.set('kk-size', size.value); status.info('Making a puzzle…');
    setTimeout(function () {
      P = make(SIZES[size.value]); val = P.W.map(function () { return 0; }); done = false; t0 = 0; out.textContent = ''; status.clear();
      sel = P.W.indexOf(true);
      board.style.gridTemplateColumns = board.style.gridTemplateRows = 'repeat(' + P.N + ',minmax(0,1fr))'; board.innerHTML = '';
      var clueA = {}, clueD = {};
      P.R.forEach(function (run, i) { (run.down ? clueD : clueA)[run.clue] = P.sums[i]; });
      P.W.forEach(function (w, k) {
        if (w) board.appendChild(h('div', { 'class': 'wt', 'data-k': String(k), onclick: function () { if (sel === k) across = !across; sel = k; paint(); board.focus({ preventScroll: true }); } }));
        else board.appendChild(h('div', { 'class': 'bk' + (clueA[k] || clueD[k] ? '' : ' x') }, [clueA[k] ? h('b', { 'class': 'a', text: String(clueA[k]) }) : null, clueD[k] ? h('b', { 'class': 'd', text: String(clueD[k]) }) : null]));
      });
      clearInterval(timer); timer = setInterval(function () { if (!done && !document.hidden) { t0++; clock.textContent = fmt(t0); } }, 1000);
      paint();
    }, 20);
  }
  function runFor(k, down) { return P.R.filter(function (r) { return r.down === down && r.cells.indexOf(k) >= 0; })[0]; }
  function badCells() {
    var bad = {};
    P.R.forEach(function (run, i) {
      var vs = run.cells.map(function (k) { return val[k]; }), filled = vs.filter(Boolean), s = filled.reduce(function (a, b) { return a + b; }, 0);
      run.cells.forEach(function (k) { if (val[k] && vs.filter(function (v) { return v === val[k]; }).length > 1) bad[k] = 1; });
      if (s > P.sums[i] || (filled.length === vs.length && s !== P.sums[i])) run.cells.forEach(function (k) { if (val[k]) bad[k] = 1; });
    });
    return bad;
  }
  function paint() {
    var ra = runFor(sel, !across ? true : false) || runFor(sel, across ? false : true), on = {}, bad = badCells();
    if (ra) ra.cells.forEach(function (k) { on[k] = 1; });
    Array.prototype.forEach.call(board.querySelectorAll('.wt'), function (el) {
      var k = +el.getAttribute('data-k');
      el.className = 'wt' + (k === sel ? ' sel' : on[k] ? ' run' : '') + (bad[k] ? ' bad' : '') + (P.rev && P.rev[k] ? ' rv' : '');
      el.textContent = val[k] ? String(val[k]) : '';
    });
    if (ra) {
      var i = P.R.indexOf(ra), used = ra.cells.map(function (k) { return val[k]; }).filter(Boolean), s = used.reduce(function (a, b) { return a + b; }, 0);
      help.textContent = (ra.down ? 'Down' : 'Across') + ' run: ' + ra.cells.length + ' squares must add up to ' + P.sums[i] + '. So far ' + s + (used.length < ra.cells.length ? ', ' + (P.sums[i] - s) + ' still needed.' : '.');
    }
    if (!done && P.W.every(function (w, k) { return !w || val[k]; }) && !Object.keys(bad).length) {
      done = true; out.textContent = '🎉 Solved in ' + fmt(t0) + '!'; status.ok('Every run adds up and no number repeats.');
    }
  }
  function put(d) { if (done || sel < 0) return; val[sel] = val[sel] === d ? 0 : d; if (P.rev) P.rev[sel] = 0; paint(); if (d && !done) { var run = runFor(sel, !across), next = run && run.cells[run.cells.indexOf(sel) + 1]; if (next !== undefined && !val[next]) { sel = next; paint(); } } }
  board.addEventListener('keydown', function (e) {
    var N = P.N, k = e.key, dir = { ArrowUp: -N, ArrowDown: N, ArrowLeft: -1, ArrowRight: 1 }[k];
    if (dir) {
      e.preventDefault(); across = Math.abs(dir) === 1;
      var same = function (x) { return x >= 0 && x < N * N && (Math.abs(dir) === N || ((x / N) | 0) === ((sel / N) | 0)); }, x = sel + dir;
      while (same(x) && !P.W[x]) x += dir;
      if (same(x) && P.W[x]) sel = x;
      paint();
    }
    else if (/^[1-9]$/.test(k)) put(+k);
    else if (k === 'Backspace' || k === 'Delete' || k === '0') { e.preventDefault(); put(0); }
    else if (k === ' ') { e.preventDefault(); across = !across; paint(); }
  });
  function reveal(all) {
    P.rev = P.rev || {};
    (all ? P.W.map(function (w, k) { return w ? k : -1; }).filter(function (k) { return k >= 0; }) : [sel]).forEach(function (k) { if (val[k] !== P.sol[k]) { val[k] = P.sol[k]; P.rev[k] = 1; } });
    if (!all) t0 += 10;
    paint();
  }
  spot.appendChild(T.card([T.row([T.field('Size', size), T.button('New puzzle', { primary: true, onclick: newGame })]),
    h('div', { style: 'text-align:right' }, ['⏱ ', clock]), board, help, pad,
    T.row([T.button('Reveal square', { small: true, onclick: function () { reveal(false); } }), T.button('Clear', { small: true, onclick: function () { val = val.map(function () { return 0; }); P.rev = {}; done = false; out.textContent = ''; paint(); } }),
      T.button('Show answer', { small: true, onclick: function () { reveal(true); out.textContent = 'Here is the answer.'; done = true; } })]),
    status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  newGame();
  T.tests['kakuro'] = function () {
    var f = [];
    [6, 8].forEach(function (N) {
      for (var t = 0; t < 3; t++) {
        var p = make(N);
        if (!p) { f.push('no puzzle ' + N); continue; }
        p.R.forEach(function (run, i) {
          if (run.cells.length < 2 || run.cells.length > 9) f.push('run length ' + run.cells.length);
          var vs = run.cells.map(function (k) { return p.sol[k]; });
          if (vs.reduce(function (a, b) { return a + b; }, 0) !== p.sums[i]) f.push('sum');
          if (vs.some(function (v, j) { return vs.indexOf(v) !== j; })) f.push('repeat in run');
          if (p.W[run.clue]) f.push('clue on a white square');
        });
        var o = []; if (!search(N, p.W, p.R, p.sums, 1, false, o)) f.push('solver failed');
      }
    });
    return Promise.resolve({ ok: !f.length, n: 6, fails: f.slice(0, 5) });
  };
});
