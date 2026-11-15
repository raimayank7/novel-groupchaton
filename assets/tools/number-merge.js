/* Infinity by GroupChatOn — number-merge. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Number merge: place numbered tiles; three or more equal tiles touching merge into one tile worth one more, and merges can chain. */
GCOTools.register('number-merge', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var N = 5, COLORS = ['', '#fde68a', '#fdba74', '#fca5a5', '#f9a8d4', '#d8b4fe', '#a5b4fc', '#93c5fd', '#67e8f9', '#6ee7b7', '#bef264', '#facc15', '#f97316'];
  function group(b, k) {   // the cells joined to k with the same number
    var v = b[k], seen = {}, st = [k], out = []; seen[k] = 1;
    while (st.length) {
      var x = st.pop(); out.push(x);
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) { var r = ((x / N) | 0) + d[0], c = x % N + d[1], y = r * N + c; if (r >= 0 && r < N && c >= 0 && c < N && !seen[y] && b[y] === v) { seen[y] = 1; st.push(y); } });
    }
    return out;
  }
  // places v at k and resolves merges; returns { board, gained, merges }
  function place(board, k, v) {
    var b = board.slice(), gained = 0, merges = 0; b[k] = v;
    for (;;) {
      var g = group(b, k);
      if (g.length < 3) break;
      g.forEach(function (x) { b[x] = 0; });
      gained += g.length * v * 10; v++; b[k] = v; merges++;
    }
    return { board: b, gained: gained, merges: merges };
  }
  function nextValue(b) { var top = Math.max.apply(null, b.concat([1])), r = rnd(100), cap = Math.min(3, Math.max(1, top - 1)); return r < 55 ? 1 : r < 85 ? Math.min(2, cap) : cap; }
  var b, next, score, cursor = 12, over = false, undoState = null, best = T.store.get('nm-best', 0);
  var grid = h('div', { tabindex: '0', role: 'grid', 'aria-label': 'Number merge board. Arrow keys move, Enter places the next tile.', style: 'display:grid;grid-template-columns:repeat(5,1fr);gap:7px;width:min(100%,400px);aspect-ratio:1;margin:0 auto;padding:8px;border-radius:16px;background:var(--surface-2);touch-action:manipulation;user-select:none;-webkit-user-select:none' });
  var nextEl = h('span', { style: 'display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;font:900 24px/1 var(--ui);color:#1f2937;vertical-align:middle' });
  var scoreEl = h('b', { text: '0' }), bestEl = h('b', { text: String(best) }), topEl = h('b', { text: '1' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  for (var i = 0; i < N * N; i++) (function (i) { grid.appendChild(h('div', { style: 'display:grid;place-items:center;border-radius:12px;font:900 clamp(20px,7vw,34px)/1 var(--ui);color:#1f2937;cursor:pointer;transition:transform .12s', onclick: function () { cursor = i; tap(i); } })); })(i);
  function draw(pop) {
    Array.prototype.forEach.call(grid.children, function (el, k) {
      var v = b[k];
      el.textContent = v ? String(v) : '';
      el.style.background = v ? COLORS[Math.min(v, COLORS.length - 1)] : 'var(--surface)';
      el.style.outline = k === cursor && document.activeElement === grid ? '3px solid var(--accent)' : '';
      el.style.transform = pop === k ? 'scale(1.12)' : '';
      el.setAttribute('aria-label', v ? 'Tile ' + v : 'Empty');
    });
    if (pop !== undefined) setTimeout(function () { grid.children[pop].style.transform = ''; }, 160);
    nextEl.textContent = String(next); nextEl.style.background = COLORS[next];
    scoreEl.textContent = String(score); bestEl.textContent = String(best); topEl.textContent = String(Math.max.apply(null, b.concat([1])));
  }
  function reset() {
    b = []; for (var k = 0; k < N * N; k++) b.push(0);
    for (var t = 0; t < 5; t++) { var x = rnd(N * N); if (!b[x]) b[x] = 1 + rnd(2); }
    // never start with a ready-made group of three
    for (k = 0; k < N * N; k++) if (b[k] && group(b, k).length >= 3) b[k] = 0;
    next = nextValue(b); score = 0; over = false; undoState = null; out.textContent = ''; draw();
  }
  function tap(k) {
    if (over || b[k]) { draw(); return; }
    undoState = { b: b.slice(), next: next, score: score };
    var r = place(b, k, next);
    b = r.board; score += r.gained;
    if (score > best) { best = score; T.store.set('nm-best', best); }
    out.textContent = r.merges > 1 ? '✨ Chain of ' + r.merges + ' merges! +' + r.gained : r.merges ? 'Merged! +' + r.gained : '';
    next = nextValue(b);
    if (b.indexOf(0) < 0) { over = true; out.textContent = 'Board full: game over. Score ' + score + (score >= best ? ' · new best!' : '') + '. Press New game.'; }
    draw(k);
  }
  grid.addEventListener('keydown', function (e) {
    var r = (cursor / N) | 0, c = cursor % N, d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (d) { e.preventDefault(); cursor = Math.max(0, Math.min(N - 1, r + d[0])) * N + Math.max(0, Math.min(N - 1, c + d[1])); draw(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(cursor); }
  });
  grid.addEventListener('focus', function () { draw(); }); grid.addEventListener('blur', function () { draw(); });
  spot.appendChild(T.card([h('div', { style: 'display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700' }, ['Next tile:', nextEl]), grid,
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [scoreEl, h('span', { text: 'Score' })]), h('div', { 'class': 'tstat' }, [topEl, h('span', { text: 'Biggest tile' })]), h('div', { 'class': 'tstat' }, [bestEl, h('span', { text: 'Best score' })])]),
    T.row([T.button('New game', { primary: true, onclick: reset }), T.button('Undo last tile', { small: true, onclick: function () { if (undoState && !over) { b = undoState.b; next = undoState.next; score = undoState.score; undoState = null; out.textContent = 'Undone (one undo per tile).'; draw(); } } })]),
    h('p', { 'class': 'tstatus', text: 'Tap an empty square to place the next tile. Three or more equal numbers touching side by side merge into one bigger number where you placed the tile.' }), out]));
  reset();
  T.tests['number-merge'] = function () {
    var f = [], z = function () { var a = []; for (var k = 0; k < 25; k++) a.push(0); return a; };
    var t = z(); t[0] = 1; t[1] = 1;
    var r = place(t, 2, 1);
    if (r.board[2] !== 2 || r.board[0] || r.board[1] || r.merges !== 1 || r.gained !== 30) f.push('simple merge ' + JSON.stringify(r));
    t = z(); t[0] = 1; t[5] = 1; t[2] = 2; t[3] = 2;
    r = place(t, 1, 1);   // 1s merge into a 2 at square 1, which then joins the 2s at 2 and 3
    if (r.board[1] !== 3 || r.merges !== 2 || r.board[2] || r.board[3]) f.push('chain ' + r.board.slice(0, 6).join());
    t = z(); t[0] = 1; r = place(t, 1, 1);
    if (r.merges || r.board[1] !== 1) f.push('pair should not merge');
    if (group([1, 1, 0, 0, 0, 1].concat(z().slice(6)), 0).length !== 3) f.push('group');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
