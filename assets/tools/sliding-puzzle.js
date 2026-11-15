/* Infinity by GroupChatOn — sliding-puzzle. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Sliding tile puzzle: 3 × 3 to 6 × 6, with numbers or your own photo; every shuffle is checked to be solvable. */
GCOTools.register('sliding-puzzle', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  // tiles: array of N*N numbers, 0 = the gap; solved = 1..N*N-1 then 0
  function solvable(t, N) {
    var inv = 0, a = t.filter(Boolean);
    for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++;
    if (N % 2) return inv % 2 === 0;
    return (inv + (N - ((t.indexOf(0) / N) | 0))) % 2 === 1;
  }
  function solved(t) { for (var i = 0; i < t.length - 1; i++) if (t[i] !== i + 1) return false; return true; }
  function shuffled(N) {
    var t;
    do {
      t = []; for (var i = 1; i < N * N; i++) t.push(i); t.push(0);
      for (i = t.length - 1; i > 0; i--) { var j = rnd(i + 1), x = t[i]; t[i] = t[j]; t[j] = x; }
    } while (!solvable(t, N) || solved(t));
    return t;
  }
  // slides every tile between the gap and tile k (same row or column); returns how many moved
  function slide(t, N, k) {
    var z = t.indexOf(0), zr = (z / N) | 0, zc = z % N, kr = (k / N) | 0, kc = k % N, moved = 0;
    if (k === z || (zr !== kr && zc !== kc)) return 0;
    var step = zr === kr ? (kc > zc ? 1 : -1) : (kr > zr ? N : -N);
    while (z !== k) { t[z] = t[z + step]; t[z + step] = 0; z += step; moved++; }
    return moved;
  }
  var N = +T.store.get('sl-n', 4), tiles = [], moves = 0, t0 = 0, timer = null, playing = false, img = null, showNums = true;
  var size = T.seg([[3, '3×3'], [4, '4×4'], [5, '5×5'], [6, '6×6']], N, function (v) { N = v; T.store.set('sl-n', v); start(); });
  var board = h('div', { tabindex: '0', role: 'application', 'aria-label': 'Sliding puzzle. Arrow keys slide a tile into the gap.', style: 'position:relative;width:min(100%,420px);aspect-ratio:1;margin:0 auto;border-radius:14px;background:var(--surface-2);border:2px solid var(--line);touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden' });
  var mv = h('b', { text: '0' }), clock = h('b', { text: '0:00' }), best = h('b', { text: '-' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var nums = h('input', { type: 'checkbox', checked: true });
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function start() {
    tiles = shuffled(N); moves = 0; t0 = 0; playing = true; out.textContent = ''; status.clear();
    board.innerHTML = '';
    for (var v = 1; v < N * N; v++) board.appendChild(h('div', { 'data-v': String(v), style: 'position:absolute;box-sizing:border-box;padding:3px;transition:transform .12s ease;cursor:pointer' }, [h('div', { style: 'width:100%;height:100%;border-radius:10px;display:grid;place-items:center;font:800 ' + Math.round(110 / N) + 'px/1 var(--ui);background:var(--accent);color:var(--accent-ink);box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);background-repeat:no-repeat' })]));
    clearInterval(timer); timer = setInterval(function () { if (playing && moves && !document.hidden) { t0++; clock.textContent = fmt(t0); } }, 1000);
    var b = T.store.get('sl-best-' + N + (img ? 'p' : ''), null); best.textContent = b ? b.m + ' moves' : '-';
    draw();
  }
  function draw() {
    var pct = 100 / N;
    Array.prototype.forEach.call(board.children, function (el) {
      var v = +el.getAttribute('data-v'), i = tiles.indexOf(v), face = el.firstChild;
      el.style.width = el.style.height = pct + '%';
      el.style.transform = 'translate(' + (i % N) * 100 + '%,' + ((i / N) | 0) * 100 + '%)';
      face.textContent = !img || nums.checked ? String(v) : '';
      if (img) {
        var hr = (v - 1) % N, vr = ((v - 1) / N) | 0;
        face.style.backgroundImage = 'url(' + img + ')'; face.style.backgroundSize = N * 100 + '% ' + N * 100 + '%';
        face.style.backgroundPosition = (N > 1 ? hr / (N - 1) * 100 : 0) + '% ' + (N > 1 ? vr / (N - 1) * 100 : 0) + '%';
        face.style.color = '#fff'; face.style.textShadow = '0 1px 3px #000'; face.style.fontSize = Math.round(60 / N) + 'px'; face.style.alignItems = 'start'; face.style.justifyItems = 'start'; face.style.padding = '4px';
      } else { face.style.backgroundImage = ''; face.style.color = ''; face.style.textShadow = ''; face.style.fontSize = Math.round(110 / N) + 'px'; face.style.alignItems = face.style.justifyItems = 'center'; face.style.padding = ''; }
      el.setAttribute('aria-label', 'Tile ' + v);
    });
    mv.textContent = String(moves); clock.textContent = fmt(t0);
  }
  function move(k) {
    if (!playing) return;
    var m = slide(tiles, N, k); if (!m) return;
    moves += m; draw();
    if (solved(tiles)) {
      playing = false;
      var key = 'sl-best-' + N + (img ? 'p' : ''), b = T.store.get(key, null), rec = !b || moves < b.m;
      if (rec) T.store.set(key, { m: moves, t: t0 });
      out.textContent = '🎉 Solved in ' + moves + ' moves and ' + fmt(t0) + (rec ? ' · new best!' : ' · best ' + b.m + ' moves');
      best.textContent = (rec ? moves : b.m) + ' moves'; status.ok('Puzzle solved.');
    }
  }
  function arrow(dr, dc) { var z = tiles.indexOf(0), r = ((z / N) | 0) - dr, c = z % N - dc; if (r >= 0 && r < N && c >= 0 && c < N) move(r * N + c); }
  var downAt = null;
  board.addEventListener('pointerdown', function (e) { downAt = [e.clientX, e.clientY]; });
  board.addEventListener('pointerup', function (e) {
    if (!downAt) return;
    var dx = e.clientX - downAt[0], dy = e.clientY - downAt[1]; downAt = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) { if (Math.abs(dx) > Math.abs(dy)) arrow(0, dx > 0 ? 1 : -1); else arrow(dy > 0 ? 1 : -1, 0); return; }
    var r = board.getBoundingClientRect(), c = Math.floor((e.clientX - r.left) / r.width * N), w = Math.floor((e.clientY - r.top) / r.height * N);
    if (c >= 0 && c < N && w >= 0 && w < N) move(w * N + c);
  });
  board.addEventListener('keydown', function (e) {
    var d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (d) { e.preventDefault(); arrow(d[0], d[1]); }
  });
  function useImage(src) {
    var im = new Image();
    im.onload = function () {
      var s = Math.min(im.width, im.height), cv = h('canvas', { width: '600', height: '600' });
      cv.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 600, 600);
      img = cv.toDataURL('image/jpeg', 0.9); start();
    };
    im.onerror = function () { status.error('That file could not be opened as a picture.'); };
    im.src = src;
  }
  function sample() {
    var cv = h('canvas', { width: '600', height: '600' }), g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 600, 600);
    gr.addColorStop(0, '#0ea5e9'); gr.addColorStop(1, '#a855f7'); g.fillStyle = gr; g.fillRect(0, 0, 600, 600);
    g.fillStyle = '#fde047'; g.beginPath(); g.arc(430, 160, 80, 0, 7); g.fill();
    g.fillStyle = '#166534'; g.beginPath(); g.moveTo(0, 600); g.lineTo(0, 380); g.lineTo(180, 250); g.lineTo(330, 400); g.lineTo(450, 300); g.lineTo(600, 420); g.lineTo(600, 600); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 64px sans-serif'; g.textAlign = 'center'; g.fillText('Infinity', 300, 540);
    img = cv.toDataURL('image/png'); start();
  }
  var drop = T.dropzone({ accept: 'image/*', label: 'Use your own photo', hint: 'or drop a picture here (it stays on your device)', icon: '🖼️', onFiles: function (f) { T.read(f[0], 'dataURL').then(useImage, function (e) { status.error(e); }); } });
  nums.addEventListener('change', draw);
  spot.appendChild(T.card([size, board,
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [mv, h('span', { text: 'Moves' })]), h('div', { 'class': 'tstat' }, [clock, h('span', { text: 'Time' })]), h('div', { 'class': 'tstat' }, [best, h('span', { text: 'Best' })])]),
    T.row([T.button('Shuffle', { primary: true, onclick: start }), T.button('Try a sample', { small: true, onclick: sample }), T.button('Numbers only', { small: true, onclick: function () { img = null; start(); } })]),
    drop, h('label', { 'class': 'tcheck' }, [nums, ' Show numbers on photo tiles']), status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  start();
  T.tests['sliding-puzzle'] = function () {
    var f = [], goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    if (!solvable(goal, 3) || !solved(goal)) f.push('goal');
    if (solvable([2, 1, 3, 4, 5, 6, 7, 8, 0], 3)) f.push('swapped pair should be impossible');
    if (!solvable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0], 4) || solvable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 0], 4)) f.push('4x4 parity');
    for (var n = 3; n <= 6; n++) { var s = shuffled(n); if (!solvable(s, n) || s.length !== n * n) f.push('shuffle ' + n); }
    var t = [1, 2, 3, 4, 0, 5, 6, 7, 8];
    if (slide(t, 3, 3) !== 1 || t.join() !== '1,2,3,0,4,5,6,7,8') f.push('slide one ' + t.join());
    t = [1, 2, 3, 4, 5, 6, 0, 7, 8];
    if (slide(t, 3, 8) !== 2 || !solved(t)) f.push('slide two ' + t.join());
    if (slide(t, 3, 0) !== 0) f.push('diagonal slide allowed');
    return Promise.resolve({ ok: !f.length, n: 9, fails: f });
  };
});
