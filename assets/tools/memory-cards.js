/* Infinity by GroupChatOn — memory-cards. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Memory card match: turn over two cards at a time and find the pairs; themes, three sizes, one or two players. */
GCOTools.register('memory-cards', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var THEMES = {
    animals: ['Animals', '🐶 🐱 🐭 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🦉 🐢'],
    fruits: ['Fruit & food', '🍎 🍌 🍇 🍉 🍓 🍒 🍍 🥭 🥝 🍑 🍋 🥥 🌽 🥕 🍕 🍩 🧁 🍪'],
    travel: ['Travel', '🚗 🚕 🚌 🚑 🚒 🚲 🛵 🚂 ✈️ 🚀 🚁 ⛵ 🚢 🏍️ 🛺 🚜 🛸 🚠'],
    sports: ['Sports', '⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🏓 🏸 🏏 🏑 🥊 ⛳ 🎳 🏹 🛹 🥏 ♟️'],
    numbers: ['Numbers', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18'],
    letters: ['Letters', 'A B C D E F G H I J K L M N O P Q R']
  };
  var SIZES = { s: [4, 3], m: [4, 4], l: [6, 4], xl: [6, 6] };
  function deck(theme, pairs) { var s = shuffle(THEMES[theme][1].split(' ')).slice(0, pairs); return shuffle(s.concat(s)); }
  var cards = [], open = [], matched = {}, moves = 0, t0 = 0, timer = null, lock = false, players = 1, turn = 0, pts = [0, 0];
  var theme = T.select(Object.keys(THEMES).map(function (k) { return [k, THEMES[k][0]]; }), T.store.get('mem-theme', 'animals'));
  var size = T.select([['s', '12 cards (easy)'], ['m', '16 cards'], ['l', '24 cards'], ['xl', '36 cards (hard)']], T.store.get('mem-size', 'm'));
  var who = T.seg([[1, '1 player'], [2, '2 players']], 1, function (v) { players = v; start(); });
  var grid = h('div', { style: 'display:grid;gap:8px;width:min(100%,520px);margin:0 auto;perspective:800px;touch-action:manipulation' });
  var stats = h('div', { 'class': 'tstats' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function start() {
    T.store.set('mem-theme', theme.value); T.store.set('mem-size', size.value);
    var S = SIZES[size.value]; cards = deck(theme.value, S[0] * S[1] / 2); open = []; matched = {}; moves = 0; t0 = 0; lock = false; turn = 0; pts = [0, 0]; out.textContent = '';
    grid.style.gridTemplateColumns = 'repeat(' + S[0] + ',minmax(0,1fr))'; grid.innerHTML = '';
    cards.forEach(function (c, i) {
      grid.appendChild(h('button', { type: 'button', 'aria-label': 'Card ' + (i + 1) + ', face down', onclick: function () { flip(i); },
        style: 'aspect-ratio:3/4;border:0;padding:0;border-radius:12px;cursor:pointer;font:400 clamp(22px,' + (S[0] > 4 ? 7 : 9) + 'vw,44px)/1 var(--ui);transition:transform .25s,background .25s;color:#111;font-weight:800' }));
    });
    clearInterval(timer); timer = setInterval(function () { if (moves && Object.keys(matched).length < cards.length && !document.hidden) { t0++; draw(); } }, 1000);
    draw();
  }
  function draw() {
    Array.prototype.forEach.call(grid.children, function (b, i) {
      var up = matched[i] || open.indexOf(i) >= 0;
      b.textContent = up ? cards[i] : '';
      b.style.background = matched[i] ? '#bbf7d0' : up ? '#fff' : 'linear-gradient(135deg,#8b5cf6,#ec4899)';
      b.style.transform = up ? 'rotateY(0deg)' : 'rotateY(180deg)';
      b.style.opacity = matched[i] ? '.75' : '1';
      b.setAttribute('aria-label', 'Card ' + (i + 1) + (up ? ': ' + cards[i] : ', face down'));
    });
    stats.innerHTML = '';
    var list = players === 1 ? [[String(moves), 'Moves'], [fmt(t0), 'Time'], [Object.keys(matched).length / 2 + '/' + cards.length / 2, 'Pairs']] : [[String(pts[0]), (turn === 0 ? '▶ ' : '') + 'Player 1'], [String(pts[1]), (turn === 1 ? '▶ ' : '') + 'Player 2'], [Object.keys(matched).length / 2 + '/' + cards.length / 2, 'Pairs']];
    list.forEach(function (x) { stats.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: x[0] }), h('span', { text: x[1] })])); });
  }
  function flip(i) {
    if (lock || matched[i] || open.indexOf(i) >= 0) return;
    open.push(i); draw();
    if (open.length < 2) return;
    moves++;
    var a = open[0], b = open[1];
    if (cards[a] === cards[b]) {
      matched[a] = matched[b] = true; open = []; pts[turn]++;
      if (Object.keys(matched).length === cards.length) finish();
      draw();
    } else {
      lock = true;
      setTimeout(function () { open = []; lock = false; if (players === 2) turn = 1 - turn; draw(); }, 900);
    }
  }
  function finish() {
    clearInterval(timer);
    if (players === 2) { out.textContent = pts[0] === pts[1] ? 'It’s a tie, ' + pts[0] + ' pairs each!' : '🎉 Player ' + (pts[0] > pts[1] ? 1 : 2) + ' wins ' + Math.max(pts[0], pts[1]) + ' to ' + Math.min(pts[0], pts[1]) + '!'; return; }
    var key = 'mem-best-' + size.value, best = T.store.get(key, 0), rec = !best || moves < best;
    if (rec) T.store.set(key, moves);
    out.textContent = '🎉 All pairs found in ' + moves + ' moves and ' + fmt(t0) + (rec ? ' · new best!' : ' · best: ' + best + ' moves');
  }
  theme.addEventListener('change', start); size.addEventListener('change', start);
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Pictures', theme), T.field('Size', size)]), who, stats, grid,
    T.row([T.button('New game', { primary: true, onclick: start })]), out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  start();
  T.tests['memory-cards'] = function () {
    var f = [];
    Object.keys(THEMES).forEach(function (k) {
      var items = THEMES[k][1].split(' ');
      if (items.length < 18) f.push(k + ' has only ' + items.length);
      if (items.some(function (x, i) { return items.indexOf(x) !== i; })) f.push(k + ' has a repeat');
      var d = deck(k, 18), count = {};
      d.forEach(function (x) { count[x] = (count[x] || 0) + 1; });
      if (d.length !== 36 || Object.keys(count).some(function (x) { return count[x] !== 2; })) f.push(k + ' deck not in pairs');
    });
    return Promise.resolve({ ok: !f.length, n: 18, fails: f });
  };
});
