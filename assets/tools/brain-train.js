/* Infinity by GroupChatOn — brain-train. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Brain training: three short games for memory (pattern recall), focus (colour-word test) and speed (quick maths), with best scores saved. */
GCOTools.register('brain-train', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var INKS = [['RED', '#dc2626'], ['BLUE', '#2563eb'], ['GREEN', '#16a34a'], ['YELLOW', '#ca8a04']];
  function pattern(cells, k) { var all = []; for (var i = 0; i < cells; i++) all.push(i); return shuffle(all).slice(0, k).sort(function (a, b) { return a - b; }); }
  function stroop() { var w = rnd(4), ink = rnd(100) < 75 ? (w + 1 + rnd(3)) % 4 : w; return { word: INKS[w][0], ink: ink }; }
  function sum(level) {
    var op = rnd(level > 6 ? 4 : level > 2 ? 3 : 2), a, b, ans, txt, big = 10 + level * 4;
    if (op === 0) { a = 2 + rnd(big); b = 2 + rnd(big); ans = a + b; txt = a + ' + ' + b; }
    else if (op === 1) { a = 5 + rnd(big); b = 1 + rnd(a - 1); ans = a - b; txt = a + ' − ' + b; }
    else if (op === 2) { a = 2 + rnd(Math.min(12, 3 + level)); b = 2 + rnd(9); ans = a * b; txt = a + ' × ' + b; }
    else { b = 2 + rnd(9); ans = 2 + rnd(10); a = ans * b; txt = a + ' ÷ ' + b; }
    var opts = [ans], guard = 0;
    while (opts.length < 4 && guard++ < 50) { var x = ans + (rnd(2) ? 1 : -1) * (1 + rnd(Math.max(3, Math.round(ans * 0.2)))); if (x >= 0 && opts.indexOf(x) < 0) opts.push(x); }
    for (var y = ans + 1; opts.length < 4; y++) if (opts.indexOf(y) < 0) opts.push(y);
    return { text: txt, answer: ans, options: shuffle(opts) };
  }
  var game = 'memory', stage = h('div', { style: 'display:grid;gap:12px;min-height:300px;align-content:start' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var bestRow = h('div', { 'class': 'tstats' }), timer = null, keyHandler = null;
  function bests() {
    bestRow.innerHTML = '';
    [['memory', 'Memory best'], ['focus', 'Focus best'], ['speed', 'Speed best']].forEach(function (x) { var b = T.store.get('bt-' + x[0], 0); bestRow.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: b ? String(b) : '-' }), h('span', { text: x[1] })])); });
  }
  function record(g, score) { var b = T.store.get('bt-' + g, 0); if (score > b) { T.store.set('bt-' + g, score); bests(); return true; } return false; }
  function stop() { clearInterval(timer); timer = null; keyHandler = null; }
  function intro(text, startFn) { stop(); stage.innerHTML = ''; stage.appendChild(h('p', { text: text })); stage.appendChild(T.button('Start', { primary: true, onclick: startFn })); }
  // ---- memory: remember which squares lit up ----
  function memory() {
    var k = 3, lives = 3, size = 4, want = [], got = [], locked = true;
    var info = h('div', { style: 'display:flex;justify-content:space-between;font-weight:700' }), grid = h('div', { style: 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:min(100%,340px);margin:0 auto;touch-action:manipulation' });
    stop(); stage.innerHTML = ''; stage.appendChild(info); stage.appendChild(grid); out.textContent = '';
    for (var i = 0; i < 16; i++) (function (i) { grid.appendChild(h('button', { type: 'button', 'aria-label': 'Square ' + (i + 1), style: 'aspect-ratio:1;border:0;border-radius:12px;background:var(--surface-2);cursor:pointer', onclick: function () { pick(i); } })); })(i);
    function paint(lit, color) { Array.prototype.forEach.call(grid.children, function (b, j) { b.style.background = lit.indexOf(j) >= 0 ? color : 'var(--surface-2)'; }); }
    function next() {
      info.textContent = ''; info.appendChild(h('span', { text: 'Squares: ' + k })); info.appendChild(h('span', { text: '❤️'.repeat(lives) }));
      want = pattern(size * size, k); got = []; locked = true; paint(want, '#8b5cf6');
      setTimeout(function () { paint([], ''); locked = false; out.textContent = 'Now tap the ' + k + ' squares that lit up.'; }, 700 + k * 250);
      out.textContent = 'Remember these ' + k + ' squares…';
    }
    function pick(i) {
      if (locked || got.indexOf(i) >= 0) return;
      if (want.indexOf(i) < 0) {
        lives--; locked = true; paint(want, '#8b5cf6'); grid.children[i].style.background = '#dc2626';
        if (!lives) { var rec = record('memory', k - 1); out.textContent = 'Game over: you remembered ' + (k - 1) + ' squares' + (rec ? ' · new best!' : '.'); return; }
        out.textContent = 'Not that one. ' + lives + (lives === 1 ? ' life' : ' lives') + ' left.'; setTimeout(next, 1300); return;
      }
      got.push(i); grid.children[i].style.background = '#16a34a';
      if (got.length === want.length) { k = Math.min(15, k + 1); locked = true; out.textContent = '✓ Well done!'; setTimeout(next, 700); }
    }
    next();
  }
  // ---- focus: tap the INK colour, not the word ----
  function focus() {
    var left = 30, right = 0, wrong = 0, cur = null;
    var word = h('div', { style: 'font:900 clamp(40px,14vw,64px)/1 var(--ui);text-align:center;min-height:70px' }), info = h('div', { style: 'display:flex;justify-content:space-between;font-weight:700' });
    var btns = h('div', { style: 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px' });
    stop(); stage.innerHTML = ''; stage.appendChild(info); stage.appendChild(word); stage.appendChild(btns); out.textContent = 'Tap the colour of the ink, not the word.';
    INKS.forEach(function (c, i) { btns.appendChild(h('button', { type: 'button', 'class': 'tbtn', style: 'font-weight:800;color:#fff;background:' + c[1] + ';border-color:' + c[1], onclick: function () { answer(i); } }, [(i + 1) + ' · ' + c[0].charAt(0) + c[0].slice(1).toLowerCase()])); });
    function show() { cur = stroop(); word.textContent = cur.word; word.style.color = INKS[cur.ink][1]; info.innerHTML = ''; info.appendChild(h('span', { text: '⏱ ' + left + ' s' })); info.appendChild(h('span', { text: '✓ ' + right + '   ✕ ' + wrong })); }
    function answer(i) { if (!timer) return; if (i === cur.ink) right++; else wrong++; show(); }
    keyHandler = function (e) { if (/^[1-4]$/.test(e.key)) answer(+e.key - 1); };
    show();
    timer = setInterval(function () {
      left--; show();
      if (left <= 0) { stop(); var score = Math.max(0, right - wrong), rec = record('focus', score); word.textContent = ''; btns.innerHTML = ''; out.textContent = 'Time! ' + right + ' right, ' + wrong + ' wrong: score ' + score + (rec ? ' · new best!' : '.'); stage.appendChild(T.button('Play again', { primary: true, onclick: focus })); }
    }, 1000);
  }
  // ---- speed: quick sums against the clock ----
  function speed() {
    var left = 60, score = 0, streak = 0, level = 1, q = null;
    var qEl = h('div', { style: 'font:900 clamp(34px,11vw,52px)/1 var(--ui);text-align:center;min-height:60px' }), info = h('div', { style: 'display:flex;justify-content:space-between;font-weight:700' });
    var btns = h('div', { style: 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px' });
    stop(); stage.innerHTML = ''; stage.appendChild(info); stage.appendChild(qEl); stage.appendChild(btns); out.textContent = 'Pick the right answer. Correct answers in a row make it harder (and worth more).';
    function show() {
      q = sum(level); qEl.textContent = q.text + ' = ?'; btns.innerHTML = '';
      q.options.forEach(function (o, i) { btns.appendChild(h('button', { type: 'button', 'class': 'tbtn', style: 'font:800 24px/1 var(--ui);padding:14px 0', onclick: function () { answer(o); } }, [String(o)])); });
      top();
    }
    function top() { info.innerHTML = ''; info.appendChild(h('span', { text: '⏱ ' + left + ' s' })); info.appendChild(h('span', { text: 'Score ' + score + ' · level ' + level })); }
    function answer(v) {
      if (!timer) return;
      if (v === q.answer) { streak++; score += level; if (streak % 3 === 0) level = Math.min(10, level + 1); }
      else { streak = 0; level = Math.max(1, level - 1); left = Math.max(0, left - 3); out.textContent = q.text + ' = ' + q.answer + ' (−3 seconds)'; }
      show();
    }
    keyHandler = function (e) { if (/^[1-4]$/.test(e.key)) answer(q.options[+e.key - 1]); };
    show();
    timer = setInterval(function () {
      left--; top();
      if (left <= 0) { stop(); var rec = record('speed', score); qEl.textContent = ''; btns.innerHTML = ''; out.textContent = 'Time! Score ' + score + (rec ? ' · new best!' : '.'); stage.appendChild(T.button('Play again', { primary: true, onclick: speed })); }
    }, 1000);
  }
  document.addEventListener('keydown', function (e) { if (keyHandler && (document.activeElement === document.body || spot.contains(document.activeElement))) keyHandler(e); });
  var INTRO = {
    memory: ['Memory: some squares light up for a moment. Tap the same squares from memory. Each round adds one more square; you have three lives.', memory],
    focus: ['Focus: a colour word appears in a different colour ink. Tap the INK colour as fast as you can for 30 seconds. Keys 1–4 work too.', focus],
    speed: ['Speed: answer as many quick sums as you can in 60 seconds. Wrong answers cost 3 seconds. Keys 1–4 pick an answer.', speed]
  };
  function choose(g) { game = g; out.textContent = ''; intro(INTRO[g][0], INTRO[g][1]); }
  spot.appendChild(T.card([T.seg([['memory', '🧠 Memory'], ['focus', '🎯 Focus'], ['speed', '⚡ Speed']], 'memory', choose), stage, out, bestRow]));
  bests(); choose('memory');
  T.tests['brain-train'] = function () {
    var f = [], p = pattern(16, 6);
    if (p.length !== 6 || p.some(function (x, i) { return p.indexOf(x) !== i || x < 0 || x > 15; })) f.push('pattern');
    var mismatch = 0; for (var i = 0; i < 400; i++) { var s = stroop(); if (INKS[s.ink][0] !== s.word) mismatch++; }
    if (mismatch < 240 || mismatch > 360) f.push('colour words mismatched ' + mismatch + '/400');
    for (var lv = 1; lv <= 10; lv++) for (var k = 0; k < 30; k++) {
      var q = sum(lv), parts = q.text.split(' '), a = +parts[0], b = +parts[2], v = { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[parts[1]];
      if (v !== q.answer || q.options.indexOf(q.answer) < 0 || q.options.length !== 4 || q.answer < 0 || q.answer % 1) { f.push('sum ' + q.text + ' ' + q.answer); break; }
      if (q.options.some(function (x, i) { return q.options.indexOf(x) !== i; })) { f.push('repeated option'); break; }
    }
    return Promise.resolve({ ok: !f.length, n: 302, fails: f.slice(0, 5) });
  };
});
