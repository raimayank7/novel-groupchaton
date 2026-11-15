/* Infinity by GroupChatOn — memory-match. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Memory matching game: turn over two cards at a time to find the pairs. Five themes, five sizes, one or two players, best scores kept. */
GCOTools.register('memory-match', function (spot, T) {
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
  var THEMES = { animals: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵', fruit: '🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🥝 🍒 🍑 🥭 🍍 🥥 🍈',
    vehicles: '🚗 🚕 🚌 🚓 🚑 🚒 🚜 🚲 🛵 🚂 ✈️ 🚁 🚀 ⛵ 🚢', space: '🌍 🌙 ⭐ ☀️ 🪐 ☄️ 🚀 🛸 👽 🌈 🔭 🛰️ 🌠 🌕 ⚡', letters: 'A B C D E F G H I J K L M N O' };
  var SIZES = [[6, 3], [8, 4], [10, 4], [12, 4], [15, 5]];
  function deck(theme, pairs) { var faces = K.shuffle(THEMES[theme].split(' ')).slice(0, pairs); return K.shuffle(faces.concat(faces)); }
  var theme = T.store.get('mm-theme', 'animals'), size = 1, players = 1, cards = [], open = [], found = 0, moves = 0, turn = 0, scores = [0, 0], t0 = 0, lock = false;
  var board = h('div', { style: 'display:grid;gap:8px;max-width:520px;width:100%;margin:0 auto' }), info = h('p', { 'class': 'kscore', 'data-out': '', 'aria-live': 'polite' });
  if (!THEMES[theme]) theme = 'animals';
  function start() {
    var s = SIZES[size]; cards = deck(theme, s[0]).map(function (f) { return { face: f, open: false, done: false }; });
    open = []; found = 0; moves = 0; turn = 0; scores = [0, 0]; t0 = 0; lock = false;
    board.style.gridTemplateColumns = 'repeat(' + s[1] + ',minmax(0,1fr))'; draw(); status();
  }
  function draw() {
    board.innerHTML = '';
    cards.forEach(function (c, i) {
      var up = c.open || c.done;
      board.appendChild(h('button', { type: 'button', 'class': 'ktile' + (c.done ? ' is-ok' : ''), 'aria-label': up ? c.face : 'Hidden card ' + (i + 1),
        style: 'aspect-ratio:1;min-height:0;font-size:clamp(22px,7vw,40px);' + (up ? '' : 'background:linear-gradient(135deg,var(--accent),var(--accent-soft));color:transparent'),
        text: up ? c.face : '?', onclick: function () { flip(i); } }));
    });
  }
  function status() {
    var best = T.store.get('mm-best-' + theme + size, 0);
    info.textContent = players === 2 ? 'Player ' + (turn + 1) + '’s turn · Player 1: ' + scores[0] + ' · Player 2: ' + scores[1] : 'Moves: ' + moves + ' · Pairs: ' + found + ' of ' + cards.length / 2 + (best ? ' · Best: ' + best + ' moves' : '');
  }
  function flip(i) {
    var c = cards[i]; if (lock || c.open || c.done) return;
    if (!t0) t0 = Date.now();
    c.open = true; open.push(i); draw();
    if (open.length < 2) return;
    moves++; var a = cards[open[0]], b = cards[open[1]];
    if (a.face === b.face) {
      a.done = b.done = true; a.open = b.open = false; open = []; found++; scores[turn]++; draw();
      if (found === cards.length / 2) return win();
      K.say(players === 2 ? 'A pair! Go again.' : 'A pair!'); status();
    } else {
      lock = true; status();
      setTimeout(function () { a.open = b.open = false; open = []; lock = false; if (players === 2) turn = 1 - turn; draw(); status(); }, 900);
    }
  }
  function win() {
    var secs = Math.round((Date.now() - t0) / 1000), pairs = cards.length / 2;
    if (players === 2) { info.textContent = scores[0] === scores[1] ? 'A draw! ' + scores[0] + ' pairs each 🤝' : 'Player ' + (scores[0] > scores[1] ? 1 : 2) + ' wins ' + Math.max(scores[0], scores[1]) + ' to ' + Math.min(scores[0], scores[1]) + '! 🏆'; K.say(info.textContent.replace(/[^\w !]/g, '')); return; }
    var key = 'mm-best-' + theme + size, best = T.store.get(key, 0); if (!best || moves < best) T.store.set(key, moves);
    info.textContent = K.stars(pairs * 2 - Math.max(0, moves - pairs), pairs * 2) + ' All ' + pairs + ' pairs in ' + moves + ' moves and ' + secs + ' seconds!' + (!best || moves < best ? ' New best! 🏆' : '');
    K.say('You found all the pairs in ' + moves + ' moves!');
  }
  spot.appendChild(T.card([
    T.seg([['animals', '🐶'], ['fruit', '🍎'], ['vehicles', '🚗'], ['space', '🚀'], ['letters', 'ABC']], theme, function (v) { theme = v; T.store.set('mm-theme', v); start(); }),
    T.seg(SIZES.map(function (s, i) { return [i, s[0] + ' pairs']; }), size, function (v) { size = v; start(); }),
    T.seg([[1, '1 player'], [2, '2 players']], 1, function (v) { players = v; start(); }),
    board, info, T.row([T.button('↺ New game', { primary: true, onclick: start })])]));
  K.fit(spot);
  start();
  T.tests['memory-match'] = function () {
    var f = [], d = deck('fruit', 12), cnt = {};
    d.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
    if (d.length !== 24 || Object.keys(cnt).some(function (k) { return cnt[k] !== 2; })) f.push('deck pairs');
    Object.keys(THEMES).forEach(function (k) { if (K.uniq(THEMES[k].split(' ')).length < 15) f.push(k + ' needs 15 faces'); });
    start(); var first = cards[0].face, j = cards.map(function (c) { return c.face; }).lastIndexOf(first);
    flip(0); flip(j); if (!cards[0].done || found !== 1 || moves !== 1) f.push('matching pair not found');
    start();
    return Promise.resolve({ ok: !f.length, n: 8, fails: f });
  };
});
