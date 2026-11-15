/* Infinity by GroupChatOn — ludo. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Ludo for 2–4 players on one device: roll a 6 to come out, capture, safe star squares, exact roll home; any player can be the computer. */
GCOTools.register('ludo', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  // the 52 shared squares, clockwise from Red's start; [row, column] on a 15 × 15 board
  var TRACK = (function () {
    var t = [], i;
    for (i = 1; i <= 5; i++) t.push([6, i]);
    for (i = 5; i >= 0; i--) t.push([i, 6]);
    t.push([0, 7], [0, 8]);
    for (i = 1; i <= 5; i++) t.push([i, 8]);
    for (i = 9; i <= 14; i++) t.push([6, i]);
    t.push([7, 14], [8, 14]);
    for (i = 13; i >= 9; i--) t.push([8, i]);
    for (i = 9; i <= 14; i++) t.push([i, 8]);
    t.push([14, 7], [14, 6]);
    for (i = 13; i >= 9; i--) t.push([i, 6]);
    for (i = 5; i >= 0; i--) t.push([8, i]);
    t.push([7, 0], [6, 0]);
    return t;
  })();
  var COLORS = [['Red', '#ef4444', '#fecaca'], ['Green', '#16a34a', '#bbf7d0'], ['Yellow', '#eab308', '#fef08a'], ['Blue', '#2563eb', '#bfdbfe']];
  var START = [0, 13, 26, 39], SAFE = [0, 8, 13, 21, 26, 34, 39, 47], HOME = 56;
  var LANE = [function (k) { return [7, k]; }, function (k) { return [k, 7]; }, function (k) { return [7, 14 - k]; }, function (k) { return [14 - k, 7]; }];
  var YARD = [[0, 0], [0, 9], [9, 9], [9, 0]];
  // relative step (0–56) for player p → board square; null in the yard
  function square(p, rel) {
    if (rel < 0) return null;
    if (rel <= 50) return { track: (START[p] + rel) % 52, rc: TRACK[(START[p] + rel) % 52] };
    if (rel < HOME) return { lane: true, rc: LANE[p](rel - 50) };
    return { home: true };
  }
  function movable(G, p, d) {
    return G.tok[p].map(function (rel, i) { return (rel < 0 && d === 6) || (rel >= 0 && rel + d <= HOME) ? i : -1; }).filter(function (i) { return i >= 0; });
  }
  // applies a move; returns { captured: [[player, token]], home: bool }
  function apply(G, p, i, d) {
    var rel = G.tok[p][i] < 0 ? 0 : G.tok[p][i] + d, res = { captured: [], home: rel === HOME };
    G.tok[p][i] = rel;
    var sq = square(p, rel);
    if (sq && sq.track !== undefined && SAFE.indexOf(sq.track) < 0) {
      G.players.forEach(function (q) { if (q === p) return; G.tok[q].forEach(function (r, j) { var s2 = square(q, r); if (s2 && s2.track === sq.track) { G.tok[q][j] = -1; res.captured.push([q, j]); } }); });
    }
    return res;
  }
  function danger(G, p, rel) {   // could an opponent reach this square with one roll?
    var sq = square(p, rel); if (!sq || sq.track === undefined || SAFE.indexOf(sq.track) >= 0) return false;
    return G.players.some(function (q) { return q !== p && G.tok[q].some(function (r) { var s2 = square(q, r); return s2 && s2.track !== undefined && ((sq.track - s2.track + 52) % 52) >= 1 && ((sq.track - s2.track + 52) % 52) <= 6 && r + ((sq.track - s2.track + 52) % 52) <= 50; }); });
  }
  function aiPick(G, p, d) {
    var best = -1e9, pick = -1;
    movable(G, p, d).forEach(function (i) {
      var copy = { players: G.players, tok: G.tok.map(function (t) { return t.slice(); }) }, old = G.tok[p][i], r = apply(copy, p, i, d), nw = copy.tok[p][i], sq = square(p, nw);
      var s = (r.home ? 100 : 0) + r.captured.length * 80 + (old < 0 ? 60 : 0) + (sq && sq.track !== undefined && SAFE.indexOf(sq.track) >= 0 ? 25 : 0) + (sq && sq.lane ? 30 : 0)
        - (danger(copy, p, nw) ? 35 : 0) + (old >= 0 && danger(G, p, old) ? 20 : 0) + nw * 0.3 + rnd(10) / 10;
      if (s > best) { best = s; pick = i; }
    });
    return pick;
  }
  var CELL = 40, cv = h('canvas', { width: '600', height: '600', tabindex: '0', 'aria-label': 'Ludo board. Space rolls the dice; 1 to 4 picks a token.', style: 'display:block;width:min(100%,540px);aspect-ratio:1;margin:0 auto;border-radius:12px;touch-action:manipulation' }), g = cv.getContext('2d');
  var G = null, turn = 0, dice = 0, sixes = 0, phase = 'roll', busy = false, over = false;
  var count = T.seg([[2, '2 players'], [3, '3'], [4, '4']], T.store.get('ld-n', 2), function (v) { T.store.set('ld-n', v); kinds(); setup(); });
  var kindBox = h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px' }), who = T.store.get('ld-who', [false, true, true, true]);
  var dieEl = h('div', { 'aria-live': 'polite', style: 'font-size:60px;line-height:1;min-width:64px;text-align:center' }), msg = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:800;text-align:center;min-height:24px' });
  var rollBtn = T.button('Roll', { primary: true, onclick: function () { roll(); } });
  var capBonus = h('input', { type: 'checkbox', checked: T.store.get('ld-bonus', true) });
  function seats() { var n = +count.value(); return n === 2 ? [0, 2] : n === 3 ? [0, 1, 2] : [0, 1, 2, 3]; }
  function kinds() {
    kindBox.innerHTML = '';
    seats().forEach(function (p) {
      var b = T.button(COLORS[p][0] + ': ' + (who[p] ? '🤖 computer' : '🙂 person'), { small: true, onclick: function () { who[p] = !who[p]; T.store.set('ld-who', who); kinds(); if (G) { G.cpu[p] = who[p]; draw(); if (G.players[turn] === p) next(true); } } });
      b.style.borderLeft = '6px solid ' + COLORS[p][1]; kindBox.appendChild(b);
    });
  }
  function setup() {
    var pl = seats();
    G = { players: pl, tok: [[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]], cpu: who.slice() };
    turn = 0; dice = 0; sixes = 0; phase = 'roll'; busy = false; over = false; dieEl.textContent = '🎲';
    msg.textContent = COLORS[pl[0]][0] + ' starts: roll the dice.'; draw(); next(true);
  }
  function tokenXY(p, i) {
    var rel = G.tok[p][i], sq = square(p, rel);
    if (!sq) { var y = YARD[p]; return [(y[1] + 1.5 + (i % 2) * 3) * CELL, (y[0] + 1.5 + Math.floor(i / 2) * 3) * CELL]; }
    if (sq.home) { var c = [[7.5, 6.6], [6.6, 7.5], [7.5, 8.4], [8.4, 7.5]][p]; return [(c[1] + (i - 1.5) * 0.18) * CELL, (c[0] + (i - 1.5) * 0.18) * CELL]; }
    return [(sq.rc[1] + 0.5) * CELL, (sq.rc[0] + 0.5) * CELL];
  }
  function draw() {
    g.fillStyle = '#fff'; g.fillRect(0, 0, 600, 600);
    COLORS.forEach(function (col, p) {
      var y = YARD[p]; g.fillStyle = col[1]; g.fillRect(y[1] * CELL, y[0] * CELL, 6 * CELL, 6 * CELL);
      g.fillStyle = '#fff'; g.fillRect((y[1] + 0.8) * CELL, (y[0] + 0.8) * CELL, 4.4 * CELL, 4.4 * CELL);
      for (var k = 0; k < 4; k++) { g.fillStyle = col[2]; g.beginPath(); g.arc((y[1] + 1.5 + (k % 2) * 3) * CELL, (y[0] + 1.5 + Math.floor(k / 2) * 3) * CELL, CELL * 0.62, 0, 7); g.fill(); }
      for (var j = 1; j <= 5; j++) { var rc = LANE[p](j); g.fillStyle = col[1]; g.fillRect(rc[1] * CELL, rc[0] * CELL, CELL, CELL); }
      var s = TRACK[START[p]]; g.fillStyle = col[1]; g.fillRect(s[1] * CELL, s[0] * CELL, CELL, CELL);
    });
    g.strokeStyle = '#94a3b8'; g.lineWidth = 1;
    TRACK.forEach(function (rc) { g.strokeRect(rc[1] * CELL, rc[0] * CELL, CELL, CELL); });
    COLORS.forEach(function (c, p) { for (var j = 1; j <= 5; j++) { var rc = LANE[p](j); g.strokeRect(rc[1] * CELL, rc[0] * CELL, CELL, CELL); } });
    SAFE.forEach(function (k) { if (START.indexOf(k) >= 0) return; var rc = TRACK[k]; g.fillStyle = '#64748b'; g.font = '26px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', (rc[1] + 0.5) * CELL, (rc[0] + 0.55) * CELL); });
    // the home triangles in the middle
    var cx = 7.5 * CELL, cy = 7.5 * CELL;
    [[0, [[6, 6], [9, 6]]], [1, [[6, 6], [6, 9]]], [2, [[6, 9], [9, 9]]], [3, [[9, 6], [9, 9]]]].forEach(function (x) {
      var a = x[1][0], b = x[1][1]; g.fillStyle = COLORS[x[0]][1]; g.beginPath(); g.moveTo(a[1] * CELL, a[0] * CELL); g.lineTo(b[1] * CELL, b[0] * CELL); g.lineTo(cx, cy); g.closePath(); g.fill();
    });
    var can = phase === 'move' && !G.cpu[G.players[turn]] ? movable(G, G.players[turn], dice) : [], seen = {};
    G.players.forEach(function (p) {
      G.tok[p].forEach(function (rel, i) {
        var xy = tokenXY(p, i), key = Math.round(xy[0]) + ',' + Math.round(xy[1]), k = seen[key] = (seen[key] || 0) + 1;
        if (rel >= 0 && rel < HOME && k > 1) { xy[0] += (k - 1) * 7; xy[1] -= (k - 1) * 7; }
        var mine = p === G.players[turn] && can.indexOf(i) >= 0;
        if (mine) { g.strokeStyle = '#111827'; g.lineWidth = 4; g.setLineDash([5, 4]); g.beginPath(); g.arc(xy[0], xy[1], CELL * 0.48, 0, 7); g.stroke(); g.setLineDash([]); }
        g.fillStyle = COLORS[p][1]; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(xy[0], xy[1], CELL * 0.34, 0, 7); g.fill(); g.stroke();
        g.fillStyle = '#fff'; g.font = 'bold 15px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), xy[0], xy[1] + 1);
      });
    });
    rollBtn.disabled = busy || over || phase !== 'roll' || G.cpu[G.players[turn]];
  }
  function next(fresh) {
    if (over) return;
    var p = G.players[turn];
    if (G.cpu[p] && phase === 'roll') setTimeout(roll, fresh ? 600 : 500);
  }
  function roll() {
    if (busy || over || phase !== 'roll') return;
    busy = true; var p = G.players[turn], d = 1 + rnd(6), spins = 0;
    var spin = setInterval(function () {
      dieEl.textContent = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][1 + rnd(6)];
      if (++spins < 6) return;
      clearInterval(spin); dieEl.textContent = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][d]; dice = d; busy = false;
      sixes = d === 6 ? sixes + 1 : 0;
      if (sixes === 3) { msg.textContent = COLORS[p][0] + ' rolled three 6s in a row: turn lost.'; sixes = 0; pass(); return; }
      var m = movable(G, p, d);
      if (!m.length) { msg.textContent = COLORS[p][0] + ' rolled ' + d + ': no move.'; setTimeout(pass, 700); return; }
      phase = 'move';
      var spots = {}; m.forEach(function (i) { spots[G.tok[p][i] < 0 ? 'yard' : G.tok[p][i]] = 1; });
      if (G.cpu[p]) { draw(); setTimeout(function () { move(aiPick(G, p, d)); }, 500); }
      else if (Object.keys(spots).length === 1) { draw(); setTimeout(function () { move(m[0]); }, 250); }
      else { msg.textContent = COLORS[p][0] + ' rolled ' + d + ': tap a token to move (or press its number).'; draw(); }
    }, 70);
  }
  function move(i) {
    var p = G.players[turn];
    if (phase !== 'move' || movable(G, p, dice).indexOf(i) < 0) return;
    phase = 'anim'; busy = true;
    var d = dice, from = G.tok[p][i], show = from < 0 ? 0 : d - 1, k = 0;
    (function step() {
      // walk the token square by square for show, then make the real move from where it started
      if (k < show) { G.tok[p][i] = from + (++k); draw(); return setTimeout(step, 110); }
      G.tok[p][i] = from;
      var r = apply(G, p, i, d);
      busy = false; phase = 'roll';
      var bonus = d === 6 || (capBonus.checked && (r.captured.length || r.home));
      var text = COLORS[p][0] + ' moved token ' + (i + 1) + (r.captured.length ? ' and captured ' + r.captured.map(function (c) { return COLORS[c[0]][0]; }).join(', ') + '!' : '') + (r.home ? ' Token home! 🏠' : '');
      if (G.tok[p].every(function (x) { return x === HOME; })) { over = true; msg.textContent = '🎉 ' + COLORS[p][0] + ' wins!'; draw(); return; }
      msg.textContent = text + (bonus ? ' Roll again.' : '');
      draw();
      if (bonus) next(); else pass(true);
    })();
  }
  function pass(quiet) {
    phase = 'roll'; sixes = 0; turn = (turn + 1) % G.players.length;
    var p = G.players[turn];
    if (!quiet || !G.cpu[p]) msg.textContent = (quiet ? msg.textContent + '  ' : '') + COLORS[p][0] + (G.cpu[p] ? ' (computer) is rolling…' : ': roll the dice.');
    draw(); next();
  }
  cv.addEventListener('click', function (e) {
    if (phase !== 'move') { if (phase === 'roll' && !G.cpu[G.players[turn]]) roll(); return; }
    var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * 600 / r.width, y = (e.clientY - r.top) * 600 / r.height, p = G.players[turn], best = -1, bd = 1e9;
    movable(G, p, dice).forEach(function (i) { var xy = tokenXY(p, i), dd = Math.hypot(xy[0] - x, xy[1] - y); if (dd < bd) { bd = dd; best = i; } });
    if (best >= 0 && bd < CELL * 1.2) move(best);
  });
  cv.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (phase === 'roll' && !G.cpu[G.players[turn]]) roll(); }
    else if (/^[1-4]$/.test(e.key) && phase === 'move') move(+e.key - 1);
  });
  capBonus.addEventListener('change', function () { T.store.set('ld-bonus', capBonus.checked); });
  spot.appendChild(T.card([count, kindBox, cv, h('div', { style: 'display:flex;gap:14px;align-items:center;justify-content:center' }, [dieEl, rollBtn]), msg,
    T.row([T.button('New game', { small: true, onclick: setup })]),
    h('label', { 'class': 'tcheck' }, [capBonus, ' Extra roll after a capture or getting a token home']),
    h('p', { 'class': 'tstatus', text: 'Roll a 6 to bring a token out. Stars and coloured start squares are safe. You need the exact number to reach home in the middle.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  kinds(); setup();
  T.tests['ludo'] = function () {
    var f = [], seen = {};
    TRACK.forEach(function (rc, i) { var k = rc.join(); if (seen[k]) f.push('square twice ' + k); seen[k] = 1; if (i) { var a = TRACK[i - 1]; if (Math.abs(a[0] - rc[0]) + Math.abs(a[1] - rc[1]) !== 1 && !(Math.abs(a[0] - rc[0]) === 1 && Math.abs(a[1] - rc[1]) === 1)) f.push('gap at ' + i); } });
    if (TRACK.length !== 52) f.push('track length ' + TRACK.length);
    [0, 1, 2, 3].forEach(function (p) {
      var last = square(p, 50).rc, first = square(p, 51).rc;
      if (Math.abs(last[0] - first[0]) + Math.abs(last[1] - first[1]) !== 1) f.push(COLORS[p][0] + ' home lane does not join the track');
      if (!square(p, HOME).home) f.push('home');
    });
    var G2 = { players: [0, 2], tok: [[-1, -1, -1, -1], [-1, -1, -1, -1], [5, -1, -1, -1], [-1, -1, -1, -1]] };
    if (movable(G2, 0, 3).length) f.push('left the yard without a 6');
    if (movable(G2, 0, 6).length !== 4) f.push('6 should free all four');
    // Yellow token at its step 5 sits on track square 31; Red needs step 31 to land there
    var G3 = { players: [0, 2], tok: [[29, -1, -1, -1], [-1, -1, -1, -1], [5, -1, -1, -1], [-1, -1, -1, -1]] }, r = apply(G3, 0, 0, 2);
    if (!r.captured.length || G3.tok[2][0] !== -1) f.push('capture');
    var G4 = { players: [0, 2], tok: [[24, -1, -1, -1], [-1, -1, -1, -1], [0, -1, -1, -1], [-1, -1, -1, -1]] }; r = apply(G4, 0, 0, 2);
    if (r.captured.length) f.push('captured on a safe start square');
    var G5 = { players: [0, 2], tok: [[54, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]] };
    if (movable(G5, 0, 3).length || movable(G5, 0, 2).length !== 1 || !apply(G5, 0, 0, 2).home) f.push('exact roll home');
    return Promise.resolve({ ok: !f.length, n: 13, fails: f });
  };
});
