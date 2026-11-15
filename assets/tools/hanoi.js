/* Infinity by GroupChatOn — hanoi. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Tower of Hanoi: move the tower to the last peg, one disc at a time, never a big disc on a small one; with a step-by-step solver. */
GCOTools.register('hanoi', function (spot, T) {
  var h = T.h, status = T.status();
  var COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#78716c'];
  function startPegs(n) { var a = []; for (var d = n; d >= 1; d--) a.push(d); return [a, [], []]; }
  function legal(pegs, from, to) { var a = pegs[from], b = pegs[to]; return from !== to && a.length > 0 && (!b.length || b[b.length - 1] > a[a.length - 1]); }
  // shortest list of moves from any legal position to everything on peg `target`
  function plan(pegs, target) {
    var where = {}, moves = [];
    pegs.forEach(function (p, i) { p.forEach(function (d) { where[d] = i; }); });
    function put(k, t) {
      if (k < 1) return;
      if (where[k] === t) { put(k - 1, t); return; }
      var spare = 3 - where[k] - t;
      put(k - 1, spare); moves.push([where[k], t]); where[k] = t; put(k - 1, t);
    }
    var n = 0; pegs.forEach(function (p) { n += p.length; });
    put(n, target);
    return moves;
  }
  var n = +T.store.get('hanoi-n', 4), pegs = startPegs(n), held = -1, moves = 0, cursor = 0, auto = null, t0 = 0, timer = null, finished = false;
  var discs = T.select([3, 4, 5, 6, 7, 8, 9, 10].map(function (x) { return [x, x + ' discs']; }), n);
  var stageEl = h('div', { tabindex: '0', role: 'application', 'aria-label': 'Tower of Hanoi. Press 1, 2 or 3 (or arrows and Enter) to pick up and drop discs.', style: 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px;border-radius:14px;background:var(--surface-2);touch-action:manipulation;user-select:none;-webkit-user-select:none' });
  var mv = h('b', { text: '0' }), min = h('b', { text: '' }), clock = h('b', { text: '0:00' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var speed = T.select([[700, 'Slow'], [350, 'Normal'], [120, 'Fast']], 350);
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function reset() {
    stop(); n = +discs.value; T.store.set('hanoi-n', n); pegs = startPegs(n); held = -1; moves = 0; t0 = 0; finished = false; out.textContent = ''; status.clear();
    min.textContent = String(Math.pow(2, n) - 1);
    clearInterval(timer); timer = setInterval(function () { if (moves && !finished && !document.hidden) { t0++; clock.textContent = fmt(t0); } }, 1000);
    draw();
  }
  function draw() {
    stageEl.innerHTML = ''; stageEl.style.height = (n * 20 + 100) + 'px';
    pegs.forEach(function (p, i) {
      var col = h('div', { 'aria-label': 'Peg ' + (i + 1), style: 'position:relative;display:flex;flex-direction:column-reverse;align-items:center;justify-content:flex-start;padding-bottom:10px;cursor:pointer;border-radius:10px;' + (i === cursor && document.activeElement === stageEl ? 'box-shadow:inset 0 0 0 2px var(--accent);' : '') , onclick: function () { tap(i); } });
      col.appendChild(h('div', { 'aria-hidden': 'true', style: 'position:absolute;bottom:0;left:6%;right:6%;height:10px;border-radius:5px;background:var(--ink-soft,var(--muted))' }));
      col.appendChild(h('div', { 'aria-hidden': 'true', style: 'position:absolute;bottom:10px;left:calc(50% - 4px);width:8px;height:' + (n * 20 + 30) + 'px;border-radius:4px 4px 0 0;background:var(--ink-soft,var(--muted))' }));
      p.forEach(function (d, k) {
        var up = i === held && k === p.length - 1;
        col.appendChild(h('div', { style: 'position:relative;z-index:1;height:18px;margin-top:2px;border-radius:9px;background:' + COLORS[(d - 1) % 10] + ';width:' + (22 + 76 * d / Math.max(n, 1)) + '%;transition:transform .15s;' + (up ? 'transform:translateY(-' + (n * 20 + 35 - k * 20) + 'px);box-shadow:0 6px 12px rgba(0,0,0,.25)' : ''), title: 'Disc ' + d }));
      });
      col.appendChild(h('span', { style: 'position:absolute;top:2px;font:700 12px/1 var(--ui);color:var(--muted)', text: String(i + 1) }));
      stageEl.appendChild(col);
    });
    mv.textContent = String(moves);
  }
  function tap(i) {
    if (auto || finished) return;
    if (held < 0) { if (pegs[i].length) { held = i; status.clear(); } }
    else if (held === i) held = -1;
    else if (legal(pegs, held, i)) { pegs[i].push(pegs[held].pop()); held = -1; moves++; check(); }
    else { status.error('A bigger disc cannot go on a smaller one.'); held = -1; }
    draw();
  }
  function check() {
    if (pegs[2].length === n) {
      finished = true; var best = Math.pow(2, n) - 1;
      out.textContent = '🎉 Done in ' + moves + ' moves' + (moves === best ? ': perfect, the fewest possible!' : ' (the fewest possible is ' + best + ').');
      status.ok('Tower moved.');
    }
  }
  function stop() { clearInterval(auto); auto = null; }
  function solve() {
    if (auto) { stop(); status.info('Solver paused.'); return; }
    held = -1;
    var list = plan(pegs, 2);
    if (!list.length) return;
    status.info('Solving: ' + list.length + ' moves to go…');
    auto = setInterval(function () {
      var m = list.shift(); if (!m) { stop(); return; }
      pegs[m[1]].push(pegs[m[0]].pop()); moves++; draw();
      if (!list.length) { stop(); check(); }
    }, +speed.value);
  }
  stageEl.addEventListener('keydown', function (e) {
    if (/^[123]$/.test(e.key)) { cursor = +e.key - 1; tap(cursor); return; }
    if (e.key === 'ArrowLeft') cursor = (cursor + 2) % 3; else if (e.key === 'ArrowRight') cursor = (cursor + 1) % 3;
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(cursor); return; } else return;
    e.preventDefault(); draw();
  });
  stageEl.addEventListener('focus', draw); stageEl.addEventListener('blur', draw);
  discs.addEventListener('change', reset);
  spot.appendChild(T.card([T.row([T.field('Discs', discs), T.button('Restart', { primary: true, onclick: reset })]), stageEl,
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [mv, h('span', { text: 'Moves' })]), h('div', { 'class': 'tstat' }, [min, h('span', { text: 'Fewest possible' })]), h('div', { 'class': 'tstat' }, [clock, h('span', { text: 'Time' })])]),
    T.row([T.button('Show me the solution', { small: true, onclick: solve }), T.field('Speed', speed)]),
    h('p', { 'class': 'tstatus', text: 'Tap a peg to pick up its top disc, then tap where it should go.' }), status.el, out]));
  reset();
  T.tests['hanoi'] = function () {
    var f = [];
    for (var k = 1; k <= 8; k++) {
      var p = startPegs(k), m = plan(p, 2);
      if (m.length !== Math.pow(2, k) - 1) f.push(k + ' discs took ' + m.length);
      m.forEach(function (x) { if (!legal(p, x[0], x[1])) f.push('illegal move'); else p[x[1]].push(p[x[0]].pop()); });
      if (p[2].length !== k) f.push('not finished ' + k);
    }
    var q = [[5, 2], [4, 1], [3]], mq = plan(q, 2);
    mq.forEach(function (x) { if (!legal(q, x[0], x[1])) f.push('illegal from middle'); else q[x[1]].push(q[x[0]].pop()); });
    if (q[2].join() !== '5,4,3,2,1') f.push('middle position ' + JSON.stringify(q));
    if (legal([[1], [], [2]], 2, 0)) f.push('big on small allowed');
    return Promise.resolve({ ok: !f.length, n: 11, fails: f.slice(0, 5) });
  };
});
