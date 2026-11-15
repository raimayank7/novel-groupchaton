/* Infinity by GroupChatOn — snake-ladders. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Snakes and ladders for 2–4 players on one device (any of them can be the computer), with a fair dice, animated moves and house-rule options. */
GCOTools.register('snake-ladders', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var LADDERS = { 4: 25, 13: 46, 33: 49, 42: 63, 50: 69, 62: 81, 74: 92 }, SNAKES = { 27: 5, 40: 3, 43: 18, 54: 31, 66: 45, 76: 58, 89: 53, 99: 41 };
  var COLORS = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b'], FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  // square n (1–100) → column and row on screen; row 0 is the top, square 1 is bottom-left and rows snake back and forth
  function cell(n) { var r = Math.floor((n - 1) / 10), c = (n - 1) % 10; if (r % 2) c = 9 - c; return { c: c, r: 9 - r }; }
  // where a roll takes a token: { path: squares stepped on, end, jump: 'ladder' | 'snake' | null }
  function moveBy(pos, roll, exact) {
    var path = [], p = pos;
    for (var i = 0; i < roll; i++) { if (p === 100 && exact) break; p = p < 100 ? p + 1 : 100; path.push(p); }
    if (exact && pos + roll > 100) { var back = pos + roll - 100; path = []; p = pos; for (i = 0; i < roll; i++) { p = i < roll - back ? p + 1 : p - 1; path.push(p); } }
    if (!exact && pos + roll > 100) p = 100;
    var end = p, jump = null;
    if (LADDERS[end]) { end = LADDERS[end]; jump = 'ladder'; } else if (SNAKES[end]) { end = SNAKES[end]; jump = 'snake'; }
    return { path: path, landed: p, end: end, jump: jump };
  }
  var cv = h('canvas', { width: '800', height: '800', 'aria-label': 'Snakes and ladders board', style: 'display:block;width:min(100%,520px);aspect-ratio:1;margin:0 auto;border-radius:12px' }), g = cv.getContext('2d');
  var P = [], turn = 0, busy = false, over = false, sixAgain = h('input', { type: 'checkbox', checked: T.store.get('sl-six', false) }), exact = h('input', { type: 'checkbox', checked: T.store.get('sl-exact', true) });
  var count = T.seg([[2, '2 players'], [3, '3'], [4, '4']], T.store.get('sl-n', 2), function (v) { T.store.set('sl-n', v); setup(); });
  var cpuSel = T.select([[0, 'All players are people'], [1, 'Last player is the computer'], [9, 'Everyone except Player 1 is the computer']], T.store.get('sl-cpu', 1));
  var dieEl = h('div', { 'aria-live': 'polite', style: 'font-size:64px;line-height:1;text-align:center;min-height:64px' }), msg = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:800;text-align:center;min-height:24px' });
  var rollBtn = T.button('Roll the dice', { primary: true, onclick: function () { roll(); } }), pl = h('div', { 'class': 'tstats' });
  function setup() {
    var n = +count.value(), cpu = +cpuSel.value; T.store.set('sl-cpu', cpu);
    P = []; for (var i = 0; i < n; i++) P.push({ name: 'Player ' + (i + 1), pos: 0, cpu: cpu === 9 ? i > 0 : cpu === 1 ? i === n - 1 : false });
    P.forEach(function (p) { if (p.cpu) p.name = 'Computer' + (P.filter(function (x) { return x.cpu; }).length > 1 ? ' ' + (P.indexOf(p) + 1) : ''); });
    turn = 0; busy = false; over = false; dieEl.textContent = '🎲'; msg.textContent = P[0].name + ': roll the dice to start.'; render(); maybeCpu();
  }
  function render() {
    var S = 80;
    for (var n = 1; n <= 100; n++) {
      var c = cell(n), x = c.c * S, y = c.r * S;
      g.fillStyle = (c.c + c.r) % 2 ? '#fef3c7' : '#fde68a'; if (n === 100) g.fillStyle = '#86efac'; if (n === 1) g.fillStyle = '#bfdbfe';
      g.fillRect(x, y, S, S); g.fillStyle = '#78350f'; g.font = 'bold 20px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(String(n), x + 5, y + 4);
    }
    var mid = function (n) { var c = cell(n); return [c.c * S + S / 2, c.r * S + S / 2]; };
    Object.keys(LADDERS).forEach(function (a) {
      var p = mid(+a), q = mid(LADDERS[a]), dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L * 12, ny = dx / L * 12;
      g.strokeStyle = '#92400e'; g.lineWidth = 6; g.lineCap = 'round';
      [[1], [-1]].forEach(function (s) { g.beginPath(); g.moveTo(p[0] + nx * s[0], p[1] + ny * s[0]); g.lineTo(q[0] + nx * s[0], q[1] + ny * s[0]); g.stroke(); });
      g.lineWidth = 4; for (var k = 1; k < L / 24; k++) { var t = k * 24 / L; g.beginPath(); g.moveTo(p[0] + dx * t + nx, p[1] + dy * t + ny); g.lineTo(p[0] + dx * t - nx, p[1] + dy * t - ny); g.stroke(); }
    });
    Object.keys(SNAKES).forEach(function (a, i) {
      var p = mid(+a), q = mid(SNAKES[a]), dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L * 50, ny = dx / L * 50;
      var col = ['#16a34a', '#7c3aed', '#db2777', '#0891b2'][i % 4];
      g.strokeStyle = col; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0], p[1]);
      g.bezierCurveTo(p[0] + dx * 0.33 + nx, p[1] + dy * 0.33 + ny, p[0] + dx * 0.66 - nx, p[1] + dy * 0.66 - ny, q[0], q[1]); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(p[0], p[1], 14, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(p[0] - 5, p[1] - 3, 3.5, 0, 7); g.arc(p[0] + 5, p[1] - 3, 3.5, 0, 7); g.fill();
    });
    P.forEach(function (pl2, i) {
      if (!pl2.pos) return;
      var c = cell(pl2.pos), same = P.filter(function (q, j) { return q.pos === pl2.pos && j < i; }).length, x = c.c * S + 22 + (same % 2) * 34, y = c.r * S + 30 + Math.floor(same / 2) * 30;
      g.fillStyle = COLORS[i]; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(x + 6, y + 10, 15, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.font = 'bold 16px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), x + 6, y + 11);
    });
    pl.innerHTML = '';
    P.forEach(function (p, i) { pl.appendChild(h('div', { 'class': 'tstat', style: 'border-left:6px solid ' + COLORS[i] + (i === turn && !over ? ';outline:2px solid var(--accent)' : '') }, [h('b', { text: p.pos ? 'Square ' + p.pos : 'Start' }), h('span', { text: p.name })])); });
    rollBtn.disabled = busy || over || P[turn].cpu;
  }
  function roll() {
    if (busy || over) return;
    busy = true; render();
    var n = 1 + rnd(6), spins = 0, me = P[turn];
    var spin = setInterval(function () {
      dieEl.textContent = FACES[1 + rnd(6)];
      if (++spins >= 6) {
        clearInterval(spin); dieEl.textContent = FACES[n];
        var m = moveBy(me.pos, n, exact.checked), steps = m.path.slice();
        msg.textContent = me.name + ' rolled ' + n + '.';
        (function step() {
          if (steps.length) { me.pos = steps.shift(); render(); return setTimeout(step, 160); }
          if (m.jump) setTimeout(function () { me.pos = m.end; msg.textContent = me.name + ' rolled ' + n + (m.jump === 'ladder' ? ': 🪜 up the ladder to ' : ': 🐍 down the snake to ') + m.end + '!'; render(); finish(n); }, 300);
          else finish(n);
        })();
      }
    }, 70);
  }
  function finish(n) {
    var me = P[turn];
    if (me.pos === 100) { over = true; busy = false; msg.textContent = '🎉 ' + me.name + ' wins!'; render(); return; }
    if (!(sixAgain.checked && n === 6)) turn = (turn + 1) % P.length; else msg.textContent += ' Rolled a 6: go again!';
    busy = false; render(); maybeCpu();
    if (!P[turn].cpu) msg.textContent += '  ' + P[turn].name + ', your turn.';
  }
  function maybeCpu() { if (!over && P[turn] && P[turn].cpu) setTimeout(roll, 700); }
  document.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && document.activeElement === document.body && !P[turn].cpu) { e.preventDefault(); roll(); } });
  sixAgain.addEventListener('change', function () { T.store.set('sl-six', sixAgain.checked); });
  exact.addEventListener('change', function () { T.store.set('sl-exact', exact.checked); });
  cpuSel.addEventListener('change', setup);
  spot.appendChild(T.card([count, T.field('Who plays', cpuSel), cv, h('div', { style: 'display:flex;gap:14px;align-items:center;justify-content:center' }, [dieEl, rollBtn]), msg, pl,
    T.row([T.button('New game', { small: true, onclick: setup })]),
    h('label', { 'class': 'tcheck' }, [exact, ' Need the exact number to land on 100 (bounce back if too high)']),
    h('label', { 'class': 'tcheck' }, [sixAgain, ' Rolling a 6 gives another turn'])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  setup();
  T.tests['snake-ladders'] = function () {
    var f = [];
    if (cell(1).c !== 0 || cell(1).r !== 9 || cell(10).c !== 9 || cell(11).c !== 9 || cell(11).r !== 8 || cell(100).c !== 0 || cell(100).r !== 0) f.push('board numbering');
    var m = moveBy(0, 4, true); if (m.end !== 25 || m.jump !== 'ladder') f.push('ladder at 4');
    m = moveBy(23, 4, true); if (m.end !== 5 || m.jump !== 'snake') f.push('snake at 27');
    m = moveBy(97, 5, true); if (m.landed !== 98 || m.path.join() !== '98,99,100,99,98') f.push('bounce ' + m.path.join());
    m = moveBy(97, 5, false); if (m.end !== 100) f.push('no-bounce rule');
    Object.keys(LADDERS).concat(Object.keys(SNAKES)).forEach(function (k) {
      var to = LADDERS[k] || SNAKES[k];
      if (LADDERS[to] || SNAKES[to]) f.push('chain at ' + k);
      if (LADDERS[k] && SNAKES[k]) f.push('both at ' + k);
      if (LADDERS[k] && to <= +k || SNAKES[k] && to >= +k) f.push('wrong way ' + k);
    });
    var c = {}; for (var i = 0; i < 6000; i++) { var d = 1 + rnd(6); c[d] = (c[d] || 0) + 1; }
    if (Object.keys(c).some(function (k) { return c[k] < 850 || c[k] > 1150; })) f.push('dice not fair ' + JSON.stringify(c));
    return Promise.resolve({ ok: !f.length, n: 20, fails: f });
  };
});
