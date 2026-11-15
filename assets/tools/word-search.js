/* Infinity by GroupChatOn — word-search. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Word search maker: themes or your own words, 8×8 to 15×15, three levels; play on screen (tap the first and last letter) or print with an answer key. */
GCOTools.register('word-search', function (spot, T) {
  var h = T.h, K = T.kids || (T.kids = (function () {
    // shared by the kids tools (each tool carries its own copy, so any one can load alone): big tap tiles, a picture stage, speech, fair random picks, a quiz
    if (!document.getElementById('gco-kids-css')) document.head.appendChild(h('style', { id: 'gco-kids-css', text: [
      '.kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px}',
      '.ktile{display:grid;place-items:center;gap:2px;min-height:64px;min-width:0;padding:6px 4px;border-radius:16px;border:2px solid var(--line);background:var(--surface-2);color:var(--ink);font:700 26px/1.15 var(--ui);cursor:pointer;touch-action:manipulation;overflow-wrap:anywhere}',
      '.ktile small{font:600 12px/1.2 var(--ui);color:var(--ink-soft)}.ktile:hover{border-color:var(--accent)}.ktile.is-on{border-color:var(--accent);background:var(--accent-soft)}',
      '.ktile.is-ok,.kchoices button.is-ok{border-color:#16a34a;background:rgba(34,197,94,.22)}.ktile.is-no,.kchoices button.is-no{border-color:#dc2626;background:rgba(239,68,68,.16)}',
      '.kstage{display:grid;justify-items:center;gap:6px;min-width:0;padding:16px 10px;border-radius:20px;background:var(--bg);border:1px solid var(--line);text-align:center}',
      '.kbig{font:800 clamp(56px,17vw,112px)/1.1 var(--ui)}.kpic{font-size:clamp(46px,13vw,84px);line-height:1.15}',
      '.kword{font:700 clamp(20px,6vw,30px)/1.3 var(--ui);overflow-wrap:anywhere}.ksub{color:var(--ink-soft);font-size:15px;overflow-wrap:anywhere}',
      '.kchoices{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(130px,100%),1fr));gap:10px}',
      '.kchoices button{min-height:64px;min-width:0;padding:8px;border-radius:16px;border:2px solid var(--line);background:var(--surface-2);color:var(--ink);font:700 24px/1.2 var(--ui);cursor:pointer;touch-action:manipulation;overflow-wrap:anywhere}',
      '.kscore{margin:0;font:700 17px/1.4 var(--ui);text-align:center}.kswatch{width:44px;height:44px;border-radius:50%;border:3px solid var(--line);cursor:pointer}.kswatch[aria-pressed=true]{border-color:var(--ink);transform:scale(1.1)}',
      '.kcanvas{display:block;width:min(100%,420px);height:auto;aspect-ratio:1;margin:0 auto;border-radius:18px;border:2px solid var(--line);background:#fff;touch-action:none;cursor:crosshair}',
      '@media (prefers-reduced-motion:no-preference){.kpop{animation:kpop .35s ease}@keyframes kpop{0%{transform:scale(.7)}70%{transform:scale(1.08)}100%{transform:scale(1)}}}'].join('') }));
    function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    var synth = window.speechSynthesis;
    function voices() { try { return synth ? synth.getVoices() : []; } catch (e) { return []; } }
    voices();
    function voice(lang) {
      var l = String(lang || 'en-US').toLowerCase(), vs = voices();
      function f(test) { return vs.filter(function (v) { return test(String(v.lang).toLowerCase().replace('_', '-')); })[0]; }
      return f(function (x) { return x === l; }) || f(function (x) { return x.slice(0, 2) === l.slice(0, 2); }) || null;
    }
    // say(text, 'hi-IN', { fallback: 'said in English when the device has no voice for that language', rate, onend, onboundary, queue })
    function say(text, lang, o) {
      o = o || {};
      if (!synth || !window.SpeechSynthesisUtterance || !text) return null;
      try {
        if (!o.queue) synth.cancel();
        lang = lang || 'en-US';
        var v = voice(lang);
        if (!v && o.fallback != null && voices().length) { if (!o.fallback) return null; text = o.fallback; lang = 'en-US'; v = voice(lang); }
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang; if (v) u.voice = v; u.rate = o.rate || 0.85; u.pitch = o.pitch || 1.05;
        if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
        if (o.onboundary) u.onboundary = o.onboundary;
        synth.speak(u); return u;
      } catch (e) { return null; }
    }
    function uniq(a) { var seen = {}; return a.filter(function (x) { var k = String(x); if (seen[k]) return false; seen[k] = 1; return true; }); }
    // the right answer plus n-1 different wrong ones, shuffled
    function choices(answer, pool, n) { return shuffle([answer].concat(shuffle(uniq(pool).filter(function (x) { return String(x) !== String(answer); })).slice(0, (n || 4) - 1))); }
    var PRAISE = ['Well done! 🎉', 'Great job! ⭐', 'Super! 🌟', 'You got it! 👏', 'Brilliant! 🏆', 'Yay! 🎈'];
    function stars(score, n) { var r = n ? score / n : 0; return r >= 0.9 ? '⭐⭐⭐' : r >= 0.6 ? '⭐⭐' : r >= 0.3 ? '⭐' : '🌱'; }
    /* quiz({ rounds, next() → { q: [nodes], a: answer, opts: [answers], say: fn }, label(v) → text or node, done(score, n) })
       first tap counts; a wrong tap shows the right answer, then the next question comes */
    function quiz(o) {
      var n = o.rounds || 10, score = 0, asked = 0, cur = null, locked = false, timer = 0;
      var head = h('div', { 'class': 'kstage' }), grid = h('div', { 'class': 'kchoices' }), info = h('p', { 'class': 'kscore', 'data-out': '', 'aria-live': 'polite' });
      var box = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [head, grid, info]);
      function next() {
        clearTimeout(timer);
        if (asked >= n) return finish();
        cur = o.next(); locked = false; head.innerHTML = ''; grid.innerHTML = '';
        cur.q.forEach(function (x) { head.appendChild(typeof x === 'string' ? h('div', { 'class': 'kword', text: x }) : x); });
        cur.opts.forEach(function (v) {
          var lab = o.label ? o.label(v) : String(v), b = h('button', { type: 'button', 'data-v': String(v) }, [lab]);
          b.addEventListener('click', function () { pick(b, v); });
          grid.appendChild(b);
        });
        info.textContent = 'Question ' + (asked + 1) + ' of ' + n + ' · Score ' + score;
        if (cur.say) cur.say();
      }
      function pick(b, v) {
        if (locked) return;
        locked = true; asked++;
        var ok = String(v) === String(cur.a), p = K.praise(), why = cur.why ? ' ' + cur.why : '';
        if (ok) { score++; b.classList.add('is-ok'); info.textContent = p + why + ' Score ' + score + ' of ' + asked; say(p.replace(/[^A-Za-z! ]/g, '') + why); }
        else {
          b.classList.add('is-no');
          Array.prototype.forEach.call(grid.children, function (x) { if (x.getAttribute('data-v') === String(cur.a)) x.classList.add('is-ok'); });
          info.textContent = 'Not quite: the answer is shown in green.' + why + ' Score ' + score + ' of ' + asked;
          if (why) say(why);
        }
        timer = setTimeout(next, (ok ? 1100 : 2200) + (why ? 1600 : 0));
      }
      function finish() {
        head.innerHTML = ''; grid.innerHTML = '';
        head.appendChild(h('div', { 'class': 'kpic', text: stars(score, n) }));
        head.appendChild(h('div', { 'class': 'kword', text: 'You got ' + score + ' out of ' + n + '!' }));
        head.appendChild(T.button('Play again', { primary: true, onclick: start }));
        info.textContent = score === n ? 'Perfect score! 🏆' : 'Keep practising and you will get them all.';
        say('You got ' + score + ' out of ' + n);
        if (o.done) o.done(score, n);
      }
      function start() { score = 0; asked = 0; next(); }
      return { el: box, start: start, stop: function () { clearTimeout(timer); } };
    }
    var K = { rnd: rnd, shuffle: shuffle, pick: function (a) { return a[rnd(a.length)]; }, say: say, voice: voice, choices: choices, uniq: uniq, stars: stars, quiz: quiz,
      praise: function () { return PRAISE[rnd(PRAISE.length)]; },
      pop: function (el) { el.classList.remove('kpop'); void el.offsetWidth; el.classList.add('kpop'); },
      tile: function (big, small, onclick, label) { return h('button', { type: 'button', 'class': 'ktile', onclick: onclick, 'aria-label': label || null }, [h('b', { text: big }), small ? h('small', { text: small }) : null]); },
      mark: function (box, el) { Array.prototype.forEach.call(box.children, function (x) { x.classList.toggle('is-on', x === el); }); },
      fit: function (spot) { var c = spot.lastChild; if (c) c.style.gridTemplateColumns = 'minmax(0, 1fr)'; } };
    return K;
  })());
  var THEMES = { animals: 'LION TIGER ZEBRA MONKEY RABBIT HORSE CAMEL SHEEP PANDA SNAKE EAGLE WHALE', fruits: 'APPLE MANGO BANANA GRAPES ORANGE LEMON CHERRY PEACH MELON PEAR GUAVA KIWI',
    colours: 'RED BLUE GREEN YELLOW PURPLE ORANGE PINK BROWN BLACK WHITE GREY GOLD', space: 'SUN MOON STAR EARTH MARS VENUS COMET ROCKET ORBIT PLANET SATURN GALAXY',
    body: 'HEAD HAND KNEE NOSE EYES EARS TEETH ELBOW HEART BRAIN TOES CHIN', school: 'BOOK PENCIL RULER TEACHER DESK CHALK CLASS LUNCH PAPER CRAYON BELL MATHS' };
  var LEVELS = { easy: [[0, 1], [1, 0]], medium: [[0, 1], [1, 0], [1, 1], [-1, 1]], hard: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]] };
  function clean(list) { return K.uniq(list.map(function (w) { return w.toUpperCase().replace(/[^A-Z]/g, ''); }).filter(function (w) { return w.length >= 2; })); }
  // place each word (longest first) at a random spot and direction; fill the rest with random letters
  function make(words, size, level) {
    var g = [], placed = [], skipped = [], dirs = LEVELS[level], ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var y = 0; y < size; y++) g.push(new Array(size).fill(''));
    clean(words).sort(function (a, b) { return b.length - a.length; }).forEach(function (w) {
      for (var t = 0; t < 400; t++) {
        var d = K.pick(dirs), x0 = K.rnd(size), y0 = K.rnd(size), ok = true;
        for (var i = 0; i < w.length; i++) { var x = x0 + d[0] * i, yy = y0 + d[1] * i; if (x < 0 || yy < 0 || x >= size || yy >= size || (g[yy][x] && g[yy][x] !== w[i])) { ok = false; break; } }
        if (!ok) continue;
        for (i = 0; i < w.length; i++) g[y0 + d[1] * i][x0 + d[0] * i] = w[i];
        placed.push({ w: w, x: x0, y: y0, dx: d[0], dy: d[1] }); return;
      }
      skipped.push(w);
    });
    var fill = g.map(function (row) { return row.map(function (c) { return c || ABC[K.rnd(26)]; }); });
    return { grid: fill, placed: placed, skipped: skipped, size: size };
  }
  var theme = 'animals', size = 10, level = 'easy', P = null, found = {}, start = null;
  var own = h('textarea', { rows: '3', placeholder: 'Your words, separated by spaces, commas or new lines', 'aria-label': 'Your words' }); own.value = T.store.get('ws-own', 'FAMILY FRIEND HAPPY GARDEN');
  own.addEventListener('input', function () { T.store.set('ws-own', own.value.slice(0, 3000)); });
  var board = h('div', { style: 'display:grid;gap:2px;max-width:560px;width:100%;margin:0 auto;user-select:none;-webkit-user-select:none;touch-action:none' }), list = h('div', { 'class': 'trow', 'data-out': '', style: 'gap:6px 14px;justify-content:center' }), msg = h('p', { 'class': 'kscore', 'aria-live': 'polite' });
  function words() { return theme === 'own' ? own.value.split(/[\s,;]+/) : THEMES[theme].split(' '); }
  function build() {
    P = make(words(), size, level); found = {}; start = null;
    board.style.gridTemplateColumns = 'repeat(' + size + ',minmax(0,1fr))'; board.innerHTML = '';
    P.grid.forEach(function (row, y) { row.forEach(function (c, x) { board.appendChild(h('button', { type: 'button', 'data-x': String(x), 'data-y': String(y), 'aria-label': c + ' row ' + (y + 1) + ' column ' + (x + 1),
      style: 'aspect-ratio:1;min-width:0;padding:0;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink);font:700 clamp(12px,' + (size > 12 ? 3.4 : 4.2) + 'vw,22px) var(--ui);cursor:pointer', text: c })); }); });
    drawList();
    msg.textContent = P.skipped.length ? 'These did not fit, try a bigger grid: ' + P.skipped.join(', ') : 'Find ' + P.placed.length + ' words. Tap the first letter, then the last letter (or drag).';
  }
  function drawList() { list.innerHTML = ''; P.placed.slice().sort(function (a, b) { return a.w < b.w ? -1 : 1; }).forEach(function (p) { list.appendChild(h('span', { style: 'font:700 16px var(--ui);' + (found[p.w] ? 'text-decoration:line-through;opacity:.55' : ''), text: (found[p.w] ? '✓ ' : '') + p.w })); }); }
  function cell(x, y) { return board.children[y * size + x]; }
  var COL = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe', '#fed7aa'];
  // a selection from (x1,y1) to (x2,y2) must be a straight line; it matches a word read either way
  function trySel(x1, y1, x2, y2) {
    var dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1), n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) + 1;
    if (!(x1 === x2 || y1 === y2 || Math.abs(x2 - x1) === Math.abs(y2 - y1))) return null;
    var s = ''; for (var i = 0; i < n; i++) s += P.grid[y1 + dy * i][x1 + dx * i];
    var hit = P.placed.filter(function (p) { return !found[p.w] && (p.w === s || p.w === s.split('').reverse().join('')) && ((p.x === x1 && p.y === y1) || (p.x === x2 && p.y === y2)); })[0];
    if (!hit) return null;
    found[hit.w] = 1; var c = COL[Object.keys(found).length % COL.length];
    for (i = 0; i < n; i++) { var el = cell(x1 + dx * i, y1 + dy * i); el.style.background = c; el.style.color = '#111'; }
    drawList(); K.say(hit.w.toLowerCase());
    if (Object.keys(found).length === P.placed.length) { msg.textContent = '🎉 You found all ' + P.placed.length + ' words!'; K.say('You found them all!'); } else msg.textContent = K.praise() + ' ' + hit.w + ' · ' + (P.placed.length - Object.keys(found).length) + ' to go';
    return hit;
  }
  function at(e) { var el = document.elementFromPoint(e.clientX, e.clientY); return el && el.parentNode === board ? [+el.getAttribute('data-x'), +el.getAttribute('data-y')] : null; }
  var down = null;
  board.addEventListener('pointerdown', function (e) { var p = at(e); if (!p) return; e.preventDefault(); down = p; });
  board.addEventListener('pointerup', function (e) {
    var p = at(e); if (!p || !down) { down = null; return; }
    if (p[0] !== down[0] || p[1] !== down[1]) { if (start) cell(start[0], start[1]).style.outline = ''; start = null; if (!trySel(down[0], down[1], p[0], p[1])) msg.textContent = 'Not a word in the list. Try again!'; }
    else if (!start) { start = p; cell(p[0], p[1]).style.outline = '3px solid var(--accent)'; }
    else { cell(start[0], start[1]).style.outline = ''; if (!trySel(start[0], start[1], p[0], p[1]) && (start[0] !== p[0] || start[1] !== p[1])) msg.textContent = 'Not a word in the list. Try again!'; start = null; }
    down = null;
  });
  function printIt(withKey) {
    var css = 'body{font-family:system-ui,sans-serif;text-align:center;color:#000}table{border-collapse:collapse;margin:12px auto}td{width:34px;height:34px;border:1px solid #999;font:700 20px monospace;text-align:center}.k{background:#ddd}ul{columns:3;list-style:none;padding:0;font:600 16px system-ui;max-width:520px;margin:10px auto}h2{margin:24px 0 4px}';
    function table(key) { var on = {}; if (key) P.placed.forEach(function (p) { for (var i = 0; i < p.w.length; i++) on[(p.x + p.dx * i) + ',' + (p.y + p.dy * i)] = 1; }); return '<table>' + P.grid.map(function (row, y) { return '<tr>' + row.map(function (c, x) { return '<td' + (on[x + ',' + y] ? ' class="k"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>'; }
    var html = '<!doctype html><meta charset="utf-8"><title>Word search</title><style>' + css + '</style><h1>Word Search</h1><p>Name: ____________________</p>' + table(false) + '<ul>' + P.placed.map(function (p) { return '<li>' + p.w + '</li>'; }).join('') + '</ul>' +
      (withKey ? '<h2 style="page-break-before:always">Answers</h2>' + table(true) : '');
    var fr = h('iframe', { style: 'position:fixed;right:0;bottom:0;width:0;height:0;border:0', title: 'print' }); document.body.appendChild(fr);
    fr.contentDocument.open(); fr.contentDocument.write(html); fr.contentDocument.close();
    setTimeout(function () { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) {} setTimeout(function () { fr.remove(); }, 60000); }, 300);
  }
  var ownBox = T.field('Your words', own); ownBox.hidden = true;
  var themeSel = T.select([['animals', 'Animals'], ['fruits', 'Fruits'], ['colours', 'Colours'], ['space', 'Space'], ['body', 'Body'], ['school', 'School'], ['own', 'My own words']], theme);
  themeSel.addEventListener('change', function () { theme = themeSel.value; ownBox.hidden = theme !== 'own'; build(); });
  spot.appendChild(T.card([T.field('Words', themeSel), ownBox,
    T.seg([[8, '8×8'], [10, '10×10'], [12, '12×12'], [15, '15×15']], size, function (v) { size = v; build(); }),
    T.seg([['easy', 'Easy → ↓'], ['medium', 'Medium ↘'], ['hard', 'Hard (backwards too)']], level, function (v) { level = v; build(); }),
    board, msg, list,
    T.row([T.button('New puzzle', { primary: true, onclick: build }), T.button('🖨 Print', { onclick: function () { printIt(false); } }), T.button('Print with answers', { onclick: function () { printIt(true); } }),
      T.button('Try a sample', { small: true, onclick: function () { theme = 'space'; themeSel.value = 'space'; ownBox.hidden = true; build(); } })])]));
  K.fit(spot);
  build();
  T.tests['word-search'] = function () {
    var f = [];
    ['easy', 'medium', 'hard'].forEach(function (lv) { for (var t = 0; t < 30; t++) {
      var p = make(THEMES.animals.split(' '), 12, lv);
      p.placed.forEach(function (q) { var s = ''; for (var i = 0; i < q.w.length; i++) s += p.grid[q.y + q.dy * i][q.x + q.dx * i]; if (s !== q.w) f.push(lv + ' ' + q.w + ' reads ' + s); if (LEVELS[lv].every(function (d) { return d[0] !== q.dx || d[1] !== q.dy; })) f.push('wrong direction'); });
      if (p.grid.some(function (row) { return row.some(function (c) { return !/^[A-Z]$/.test(c); }); })) f.push('empty cell');
      if (p.placed.length + p.skipped.length !== 12) f.push('lost words');
    } });
    if (make(['ABCDEFGHIJK'], 8, 'hard').skipped.length !== 1) f.push('too long not skipped');
    level = 'easy'; size = 10; theme = 'animals'; build();
    var w = P.placed[0], end = [w.x + w.dx * (w.w.length - 1), w.y + w.dy * (w.w.length - 1)];
    if (!trySel(end[0], end[1], w.x, w.y)) f.push('select backwards'); build();
    return Promise.resolve({ ok: !f.length, n: 92, fails: f.slice(0, 5) });
  };
});
