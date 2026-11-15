/* Infinity by GroupChatOn — word-search-play. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Word search: themed or your own words hidden in a letter grid; swipe or tap first and last letter to find them; printable. */
GCOTools.register('word-search-play', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var THEMES = {
    animals: ['Animals', 'TIGER LION ZEBRA MONKEY GIRAFFE ELEPHANT RABBIT TURTLE PARROT DOLPHIN CAMEL KANGAROO PANDA WOLF HORSE SHEEP'],
    fruits: ['Fruits', 'APPLE MANGO BANANA ORANGE GRAPE CHERRY LEMON PAPAYA GUAVA PEACH PLUM KIWI MELON PEAR LITCHI APRICOT'],
    space: ['Space', 'PLANET COMET GALAXY ORBIT ROCKET METEOR NEBULA SATURN JUPITER MARS VENUS MOON STAR ASTEROID ECLIPSE GRAVITY'],
    countries: ['Countries', 'INDIA CHINA JAPAN BRAZIL CANADA FRANCE EGYPT KENYA MEXICO NEPAL PERU SPAIN ITALY GHANA CHILE NORWAY'],
    sports: ['Sports', 'CRICKET HOCKEY TENNIS FOOTBALL KABADDI CHESS BOXING ROWING ARCHERY CYCLING GOLF RUGBY KARATE SKATING DIVING SWIMMING'],
    colours: ['Colours', 'RED BLUE GREEN YELLOW PURPLE ORANGE PINK BROWN BLACK WHITE VIOLET INDIGO MAROON CYAN SILVER GOLDEN'],
    kitchen: ['Kitchen', 'SPOON KNIFE PLATE BOWL KETTLE OVEN TAWA LADLE GRATER CUP FORK PAN JUG MIXER TOASTER SIEVE'],
    body: ['Human body', 'HEART BRAIN LUNGS KIDNEY ELBOW KNEE ANKLE WRIST SHOULDER FINGER THUMB SPINE LIVER STOMACH TOOTH EYEBROW']
  };
  var LEVELS = { easy: [9, 8, [[0, 1], [1, 0]]], medium: [11, 10, [[0, 1], [1, 0], [1, 1], [-1, 1]]], hard: [13, 12, [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]] };
  var AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', COLORS = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe', '#fed7aa', '#a5f3fc', '#d9f99d', '#fecaca', '#e9d5ff', '#c7d2fe', '#fef08a'];
  function make(words, level) {
    var L = LEVELS[level], n = L[0], g = [], placed = [];
    for (var i = 0; i < n * n; i++) g.push('');
    words = words.filter(function (w) { return w.length >= 2 && w.length <= n; }).sort(function (a, b) { return b.length - a.length; });
    words.forEach(function (w) {
      for (var tries = 0; tries < 300; tries++) {
        var d = L[2][rnd(L[2].length)], r = rnd(n), c = rnd(n), er = r + d[0] * (w.length - 1), ec = c + d[1] * (w.length - 1), ok = er >= 0 && er < n && ec >= 0 && ec < n;
        for (var k = 0; ok && k < w.length; k++) { var x = g[(r + d[0] * k) * n + c + d[1] * k]; if (x && x !== w[k]) ok = false; }
        if (!ok) continue;
        for (k = 0; k < w.length; k++) g[(r + d[0] * k) * n + c + d[1] * k] = w[k];
        placed.push({ w: w, r: r, c: c, dr: d[0], dc: d[1] }); return;
      }
    });
    for (i = 0; i < n * n; i++) if (!g[i]) g[i] = AZ[rnd(26)];
    return { n: n, g: g, words: placed };
  }
  // the straight line of cells from a to b, or null if a and b are not in a row, column or diagonal
  function line(n, a, b) {
    var r1 = (a / n) | 0, c1 = a % n, r2 = (b / n) | 0, c2 = b % n, dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1), len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
    if (r1 !== r2 && c1 !== c2 && Math.abs(r2 - r1) !== Math.abs(c2 - c1)) return null;
    var out = []; for (var k = 0; k <= len; k++) out.push((r1 + dr * k) * n + c1 + dc * k);
    return out;
  }
  function css(id, s) { if (!document.getElementById(id)) document.head.appendChild(h('style', { id: id, text: s })); }
  css('tws-css', '.tws{display:grid;margin:0 auto;border:2px solid var(--line);border-radius:12px;padding:4px;background:var(--surface);touch-action:none;user-select:none;-webkit-user-select:none}' +
    '.tws:focus-visible{outline:3px solid var(--accent);outline-offset:3px}.tws span{display:grid;place-items:center;aspect-ratio:1;min-width:0;border-radius:50%;font:700 clamp(14px,4.2vw,21px)/1 var(--ui);color:var(--ink);cursor:pointer}' +
    '.tws span.f{color:#111}.tws span.s{background:var(--accent);color:var(--accent-ink)}.tws span.k{box-shadow:inset 0 0 0 2px var(--accent)}.tws span.p{background:var(--accent-soft)}' +
    '.tws-list{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;font:600 15px/1.4 var(--ui)}.tws-list .f{text-decoration:line-through;color:var(--muted)}');
  var P, found = {}, start = -1, pending = -1, cursor = 0, t0 = 0, timer = null, done = false;
  var gridEl = h('div', { 'class': 'tws', tabindex: '0', role: 'grid', 'aria-label': 'Word search grid. Arrow keys move, Space marks the first and last letter.' });
  var listEl = h('div', { 'class': 'tws-list', 'aria-live': 'polite' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var theme = T.select(Object.keys(THEMES).map(function (k) { return [k, THEMES[k][0]]; }).concat([['own', 'My own words']]), 'animals');
  var level = T.select([['easy', 'Easy: across and down'], ['medium', 'Medium: + diagonals'], ['hard', 'Hard: any direction, backwards too']], 'medium');
  var own = h('textarea', { rows: '3', placeholder: 'Type your words, separated by commas or new lines (2 to 13 letters each)', 'aria-label': 'Your own words' });
  var ownBox = T.field('Your words', own); ownBox.hidden = true;
  var clock = h('span', { text: '0:00' }), count = h('span', { text: '' });
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  theme.addEventListener('change', function () { ownBox.hidden = theme.value !== 'own'; });
  function newGame() {
    var words;
    if (theme.value === 'own') {
      words = own.value.toUpperCase().split(/[\s,;]+/).map(function (w) { return w.replace(/[^A-Z]/g, ''); }).filter(Boolean);
      words = words.filter(function (w, i) { return words.indexOf(w) === i; });
      if (words.length < 2) { status.error('Type at least two words for your own puzzle.'); return; }
    } else words = shuffle(THEMES[theme.value][1].split(' ')).slice(0, LEVELS[level.value][1]);
    P = make(words.slice(0, 20), level.value);
    var skipped = words.length - P.words.length;
    found = {}; start = pending = -1; done = false; t0 = 0; out.textContent = '';
    if (skipped > 0) status.info(skipped + (skipped === 1 ? ' word did' : ' words did') + ' not fit (too long or too many for this grid size). Try a harder level for a bigger grid.'); else status.clear();
    gridEl.style.gridTemplateColumns = 'repeat(' + P.n + ',minmax(0,1fr))'; gridEl.style.width = 'min(100%,' + P.n * 42 + 'px)';
    gridEl.innerHTML = '';
    P.g.forEach(function (ch, i) { gridEl.appendChild(h('span', { 'data-i': String(i), text: ch })); });
    clearInterval(timer); timer = setInterval(function () { if (!done && !document.hidden) { t0++; clock.textContent = fmt(t0); } }, 1000);
    paint();
  }
  function paint(sel) {
    var on = {}; (sel || []).forEach(function (i) { on[i] = 1; });
    var color = {};
    P.words.forEach(function (w, k) { if (found[w.w]) for (var j = 0; j < w.w.length; j++) color[(w.r + w.dr * j) * P.n + w.c + w.dc * j] = COLORS[k % COLORS.length]; });
    Array.prototype.forEach.call(gridEl.children, function (el, i) {
      el.className = (on[i] ? 's' : color[i] ? 'f' : '') + (i === cursor && gridEl === document.activeElement ? ' k' : '') + (i === pending && !on[i] ? ' p' : '');
      el.style.background = !on[i] && color[i] ? color[i] : '';
    });
    listEl.innerHTML = '';
    P.words.forEach(function (w) { listEl.appendChild(h('span', { 'class': found[w.w] ? 'f' : '', text: w.w })); });
    var f = Object.keys(found).length; count.textContent = f + ' of ' + P.words.length + ' found';
  }
  function tryLine(a, b) {
    var cells = line(P.n, a, b); if (!cells) return false;
    var s = cells.map(function (i) { return P.g[i]; }).join(''), rev = s.split('').reverse().join('');
    var hit = P.words.filter(function (w) { return !found[w.w] && (w.w === s || w.w === rev); })[0];
    if (hit) {   // credit the word where the player found it (it may also appear by chance somewhere else)
      var a0 = hit.w === s ? cells[0] : cells[cells.length - 1], a1 = hit.w === s ? cells[cells.length - 1] : cells[0];
      hit.r = (a0 / P.n) | 0; hit.c = a0 % P.n; hit.dr = Math.sign(((a1 / P.n) | 0) - hit.r); hit.dc = Math.sign(a1 % P.n - hit.c);
    }
    if (!hit) return false;
    found[hit.w] = 1; paint();
    if (Object.keys(found).length === P.words.length) { done = true; out.textContent = '🎉 All ' + P.words.length + ' words found in ' + fmt(t0) + '!'; status.ok('Puzzle complete.'); }
    else status.info('Found ' + hit.w + '!');
    return true;
  }
  function cellAt(e) { var el = document.elementFromPoint(e.clientX, e.clientY); return el && el.parentNode === gridEl ? +el.getAttribute('data-i') : -1; }
  gridEl.addEventListener('pointerdown', function (e) { var i = cellAt(e); if (i < 0) return; e.preventDefault(); start = i; cursor = i; paint([i]); });
  gridEl.addEventListener('pointermove', function (e) { if (start < 0) return; var i = cellAt(e); if (i >= 0) paint(line(P.n, start, i) || [start]); });
  window.addEventListener('pointerup', function (e) {
    if (start < 0) return;
    var i = cellAt(e), s = start; start = -1;
    if (i < 0) { paint(); return; }
    if (i !== s) { pending = -1; if (!tryLine(s, i)) { status.info('Not a word from the list. Try again.'); paint(); } return; }
    if (pending >= 0 && pending !== i) { var p = pending; pending = -1; if (!tryLine(p, i)) { status.info('Not a word from the list. Try again.'); paint(); } }
    else { pending = pending === i ? -1 : i; paint(); }
  });
  gridEl.addEventListener('keydown', function (e) {
    var n = P.n, r = (cursor / n) | 0, c = cursor % n, k = e.key;
    if (k === 'ArrowUp') r = Math.max(0, r - 1); else if (k === 'ArrowDown') r = Math.min(n - 1, r + 1); else if (k === 'ArrowLeft') c = Math.max(0, c - 1); else if (k === 'ArrowRight') c = Math.min(n - 1, c + 1);
    else if (k === ' ' || k === 'Enter') { e.preventDefault(); if (pending >= 0 && pending !== cursor) { var p = pending; pending = -1; if (!tryLine(p, cursor)) { status.info('Not a word from the list. Try again.'); paint(); } } else { pending = pending === cursor ? -1 : cursor; paint(); } return; }
    else return;
    e.preventDefault(); cursor = r * n + c; paint(pending >= 0 ? line(n, pending, cursor) || [] : null);
  });
  gridEl.addEventListener('focus', function () { paint(); }); gridEl.addEventListener('blur', function () { paint(); });
  function print() {
    var w = window.open('', '_blank');
    if (!w) { status.error('Allow pop-ups to print.'); return; }
    var name = theme.value === 'own' ? 'Word search' : 'Word search: ' + THEMES[theme.value][0];
    w.document.write('<!doctype html><title>' + name + '</title><style>body{font:16px Arial,sans-serif;text-align:center;margin:30px}table{border-collapse:collapse;margin:20px auto}td{width:36px;height:36px;font:700 22px Arial;text-align:center}ul{columns:3;max-width:560px;margin:0 auto;text-align:left;font-size:18px}</style>' +
      '<h1>' + name + '</h1><table>' + P.g.reduce(function (acc, ch, i) { return acc + (i % P.n ? '' : (i ? '</tr>' : '') + '<tr>') + '<td>' + ch + '</td>'; }, '') + '</tr></table><ul>' +
      P.words.map(function (x) { return '<li>' + x.w + '</li>'; }).join('') + '</ul><p style="color:#888;margin-top:30px">infinity.groupchaton.com</p>');
    w.document.close(); setTimeout(function () { w.print(); }, 300);
  }
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Theme', theme), T.field('Level', level)]), ownBox,
    T.row([T.button('New puzzle', { primary: true, onclick: newGame }), T.button('Show answers', { small: true, onclick: function () { P.words.forEach(function (w) { found[w.w] = 1; }); done = true; paint(); status.info('All the words are shown.'); } }), T.button('Print', { small: true, onclick: print })]),
    h('div', { style: 'display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px' }, [count, h('span', {}, ['⏱ ', clock])]), gridEl, listEl, status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  newGame();
  T.tests['word-search-play'] = function () {
    var f = [];
    ['easy', 'medium', 'hard'].forEach(function (lv) {
      for (var t = 0; t < 10; t++) {
        var p = make(THEMES.space[1].split(' ').slice(0, LEVELS[lv][1]), lv);
        if (p.words.length < LEVELS[lv][1] - 1) f.push(lv + ' placed ' + p.words.length);
        p.words.forEach(function (w) {
          var cells = line(p.n, w.r * p.n + w.c, (w.r + w.dr * (w.w.length - 1)) * p.n + w.c + w.dc * (w.w.length - 1));
          if (cells.map(function (i) { return p.g[i]; }).join('') !== w.w) f.push('word not in grid ' + w.w);
          if (lv === 'easy' && (w.dr < 0 || w.dc < 0 || (w.dr && w.dc))) f.push('easy used a hard direction');
        });
        if (p.g.some(function (ch) { return !/^[A-Z]$/.test(ch); })) f.push('empty cell');
      }
    });
    if (line(9, 0, 10).join() !== '0,10') f.push('diagonal line');
    if (line(9, 0, 11) !== null) f.push('crooked line accepted');
    return Promise.resolve({ ok: !f.length, n: 32, fails: f.slice(0, 5) });
  };
});
