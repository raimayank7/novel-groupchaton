/* Infinity by GroupChatOn — mines. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Mines: clear the field without opening a hidden mine; numbers count the mines around a square. First tap is always safe. */
GCOTools.register('mines', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function around(R, C, k) { var r = (k / C) | 0, c = k % C, out = []; for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) { var rr = r + dr, cc = c + dc; if ((dr || dc) && rr >= 0 && rr < R && cc >= 0 && cc < C) out.push(rr * C + cc); } return out; }
  // mines placed after the first tap, never on it or next to it
  function lay(R, C, count, safe) {
    var mine = [], no = {}, i; no[safe] = 1; around(R, C, safe).forEach(function (k) { no[k] = 1; });
    for (i = 0; i < R * C; i++) mine.push(false);
    var free = []; for (i = 0; i < R * C; i++) if (!no[i]) free.push(i);
    for (i = 0; i < count && free.length; i++) { var j = rnd(free.length); mine[free[j]] = true; free.splice(j, 1); }
    var num = mine.map(function (m, k) { return around(R, C, k).filter(function (x) { return mine[x]; }).length; });
    return { mine: mine, num: num };
  }
  // opens k; empty squares (0) open their neighbours too
  function open(G, k) {
    var q = [k], opened = 0;
    while (q.length) {
      var x = q.pop();
      if (G.open[x] || G.flag[x]) continue;
      G.open[x] = true; opened++;
      if (!G.mine[x] && G.num[x] === 0) around(G.R, G.C, x).forEach(function (y) { if (!G.open[y]) q.push(y); });
    }
    return opened;
  }
  var LV = { easy: [9, 9, 10], medium: [12, 12, 24], hard: [16, 16, 40] };
  var COL = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280'];
  function css(id, s) { if (!document.getElementById(id)) document.head.appendChild(h('style', { id: id, text: s })); }
  css('tmn-css', '.tmn{display:grid;gap:3px;margin:0 auto;padding:6px;border-radius:14px;background:var(--surface-2);touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}.tmn:focus-visible{outline:3px solid var(--accent);outline-offset:3px}' +
    '.tmn div{aspect-ratio:1;min-width:0;border-radius:7px;display:grid;place-items:center;font:800 clamp(12px,3.6vw,19px)/1 var(--ui);cursor:pointer;background:linear-gradient(145deg,#a78bfa,#7c3aed);box-shadow:inset 0 -2px 0 rgba(0,0,0,.2)}' +
    '.tmn div.o{background:var(--surface);box-shadow:none;cursor:default}.tmn div.b{background:#fecaca}.tmn div.k{outline:3px solid var(--accent);outline-offset:-1px}');
  var G = null, level = T.store.get('mn-level', 'easy'), flagMode = false, cursor = 0, t0 = 0, timer = null, press = null;
  var lvSel = T.select([['easy', 'Easy: 9 × 9, 10 mines'], ['medium', 'Medium: 12 × 12, 24 mines'], ['hard', 'Hard: 16 × 16, 40 mines']], level);
  var board = h('div', { 'class': 'tmn', tabindex: '0', role: 'grid', 'aria-label': 'Mine field. Arrow keys move, Space opens, F places a flag.' });
  var left = h('b', { text: '0' }), clock = h('b', { text: '0' }), best = h('b', { text: '-' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var flagBtn = T.button('🚩 Flag mode: off', { small: true, onclick: function () { flagMode = !flagMode; flagBtn.textContent = '🚩 Flag mode: ' + (flagMode ? 'on' : 'off'); flagBtn.setAttribute('aria-pressed', String(flagMode)); } });
  function reset() {
    level = lvSel.value; T.store.set('mn-level', level);
    var L = LV[level]; G = { R: L[0], C: L[1], M: L[2], mine: null, num: null, open: [], flag: [], over: false, won: false };
    for (var i = 0; i < G.R * G.C; i++) { G.open.push(false); G.flag.push(false); }
    t0 = 0; cursor = 0; out.textContent = ''; status.clear(); clearInterval(timer); timer = null;
    board.style.gridTemplateColumns = 'repeat(' + G.C + ',minmax(0,1fr))'; board.style.width = 'min(100%,' + G.C * 40 + 'px)';
    board.innerHTML = '';
    for (i = 0; i < G.R * G.C; i++) board.appendChild(h('div', { 'data-k': String(i), role: 'gridcell' }));
    var b = T.store.get('mn-best-' + level, 0); best.textContent = b ? b + ' s' : '-';
    draw();
  }
  function draw() {
    var flags = 0;
    Array.prototype.forEach.call(board.children, function (el, k) {
      var o = G.open[k], txt = '', cls = '';
      if (G.flag[k]) flags++;
      if (o) { cls = 'o'; if (G.mine[k]) { txt = '💣'; cls += ' b'; } else if (G.num[k]) txt = String(G.num[k]); }
      else if (G.flag[k]) txt = G.over && G.mine && !G.mine[k] ? '❌' : '🚩';
      else if (G.over && G.mine && G.mine[k]) { txt = '💣'; cls = 'o'; }
      if (k === cursor && document.activeElement === board) cls += ' k';
      el.className = cls; el.textContent = txt; el.style.color = o && !G.mine[k] ? COL[G.num[k]] : '';
      el.setAttribute('aria-label', o ? (G.mine[k] ? 'mine' : G.num[k] ? G.num[k] + ' mines around' : 'empty') : G.flag[k] ? 'flagged' : 'hidden');
    });
    left.textContent = String(G.M - flags);
  }
  function reveal(k) {
    if (G.over || G.flag[k]) return;
    if (!G.mine) { var L = lay(G.R, G.C, G.M, k); G.mine = L.mine; G.num = L.num; t0 = 0; timer = setInterval(function () { if (!G.over && !document.hidden) { t0++; clock.textContent = String(t0); } }, 1000); }
    if (G.open[k]) {   // tapping an opened number with all its flags placed opens the rest around it
      var nb = around(G.R, G.C, k);
      if (G.num[k] && nb.filter(function (x) { return G.flag[x]; }).length === G.num[k]) nb.forEach(function (x) { if (!G.open[x] && !G.flag[x]) hit(x); });
    } else hit(k);
    draw(); finish();
  }
  function hit(k) { if (G.mine[k]) { G.open[k] = true; G.over = true; G.boom = k; } else open(G, k); }
  function flag(k) { if (G.over || G.open[k]) return; G.flag[k] = !G.flag[k]; if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) {} draw(); }
  function finish() {
    if (G.over && !G.won) { clearInterval(timer); out.textContent = '💥 Boom! You opened a mine. Press New game to try again.'; status.error('Game over.'); draw(); return; }
    if (G.mine && G.open.filter(function (o, k) { return o && !G.mine[k]; }).length === G.R * G.C - G.M) {
      G.over = G.won = true; clearInterval(timer);
      G.mine.forEach(function (m, k) { if (m) G.flag[k] = true; });
      var b = T.store.get('mn-best-' + level, 0), rec = !b || t0 < b; if (rec) T.store.set('mn-best-' + level, t0);
      out.textContent = '🎉 Field cleared in ' + t0 + ' seconds' + (rec ? ': a new best!' : '.'); best.textContent = (rec ? t0 : b) + ' s'; status.ok('You win!'); draw();
    }
  }
  function cellOf(e) { var el = e.target.closest && e.target.closest('[data-k]'); return el && el.parentNode === board ? +el.getAttribute('data-k') : -1; }
  board.addEventListener('contextmenu', function (e) { e.preventDefault(); var k = cellOf(e); if (k >= 0) flag(k); });
  board.addEventListener('pointerdown', function (e) {
    if (e.button === 2) return;
    var k = cellOf(e); if (k < 0) return; cursor = k;
    press = { k: k, long: false, t: setTimeout(function () { press.long = true; flag(k); }, 450) };
  });
  board.addEventListener('pointerup', function (e) {
    if (!press) return; clearTimeout(press.t);
    var k = cellOf(e), p = press; press = null;
    if (p.long || k !== p.k) return;
    if (flagMode && !G.open[k]) flag(k); else reveal(k);
  });
  board.addEventListener('pointercancel', function () { if (press) clearTimeout(press.t); press = null; });
  board.addEventListener('keydown', function (e) {
    var r = (cursor / G.C) | 0, c = cursor % G.C, k = e.key;
    if (k === 'ArrowUp') r = Math.max(0, r - 1); else if (k === 'ArrowDown') r = Math.min(G.R - 1, r + 1); else if (k === 'ArrowLeft') c = Math.max(0, c - 1); else if (k === 'ArrowRight') c = Math.min(G.C - 1, c + 1);
    else if (k === ' ' || k === 'Enter') { e.preventDefault(); reveal(cursor); return; }
    else if (k === 'f' || k === 'F') { flag(cursor); return; }
    else return;
    e.preventDefault(); cursor = r * G.C + c; draw();
  });
  board.addEventListener('focus', function () { if (G) draw(); }); board.addEventListener('blur', function () { if (G) draw(); });
  lvSel.addEventListener('change', reset);
  spot.appendChild(T.card([T.row([T.field('Level', lvSel), T.button('New game', { primary: true, onclick: reset })]),
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [left, h('span', { text: 'Mines left' })]), h('div', { 'class': 'tstat' }, [clock, h('span', { text: 'Seconds' })]), h('div', { 'class': 'tstat' }, [best, h('span', { text: 'Best' })])]),
    board, T.row([flagBtn]), h('p', { 'class': 'tstatus', text: 'Tap to open a square. Long-press, right-click or use Flag mode to mark a mine. Tap a number whose mines are all flagged to open the squares around it.' }), status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  reset();
  T.tests['mines'] = function () {
    var f = [];
    for (var t = 0; t < 20; t++) {
      var L = lay(9, 9, 10, 40), n = L.mine.filter(Boolean).length;
      if (n !== 10) f.push('mines ' + n);
      if (L.mine[40] || around(9, 9, 40).some(function (k) { return L.mine[k]; })) f.push('first tap not safe');
      if (L.num[40] !== 0) f.push('first square not empty');
    }
    var g = { R: 3, C: 3, mine: [false, false, false, false, false, false, false, false, true], open: [], flag: [] };
    g.num = g.mine.map(function (m, k) { return around(3, 3, k).filter(function (x) { return g.mine[x]; }).length; });
    for (var i = 0; i < 9; i++) { g.open.push(false); g.flag.push(false); }
    if (g.num.join() !== '0,0,0,0,1,1,0,1,0') f.push('numbers ' + g.num.join());
    if (open(g, 0) !== 8 || g.open[8]) f.push('flood fill');
    if (around(9, 9, 0).length !== 3 || around(9, 9, 40).length !== 8) f.push('neighbours');
    return Promise.resolve({ ok: !f.length, n: 63, fails: f.slice(0, 5) });
  };
});
