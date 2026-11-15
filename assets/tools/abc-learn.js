/* Infinity by GroupChatOn — abc-learn. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Learn the alphabet: A–Z tiles, each with a picture word, read aloud; play-all; and a listen-and-tap quiz. */
GCOTools.register('abc-learn', function (spot, T) {
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
  var ABC = [['A', 'Apple', '🍎'], ['B', 'Ball', '⚽'], ['C', 'Cat', '🐱'], ['D', 'Dog', '🐶'], ['E', 'Elephant', '🐘'], ['F', 'Fish', '🐟'], ['G', 'Grapes', '🍇'],
    ['H', 'House', '🏠'], ['I', 'Ice cream', '🍦'], ['J', 'Jellyfish', '🪼'], ['K', 'Kite', '🪁'], ['L', 'Lion', '🦁'], ['M', 'Moon', '🌙'], ['N', 'Nest', '🪺'],
    ['O', 'Orange', '🍊'], ['P', 'Parrot', '🦜'], ['Q', 'Queen', '👸'], ['R', 'Rabbit', '🐰'], ['S', 'Sun', '☀️'], ['T', 'Tree', '🌳'], ['U', 'Umbrella', '☂️'],
    ['V', 'Violin', '🎻'], ['W', 'Watch', '⌚'], ['X', 'Fox', '🦊', 'X is at the end of fox'], ['Y', 'Yo-yo', '🪀'], ['Z', 'Zebra', '🦓']];
  var i = 0, lower = false, play = 0, mode = 'learn';
  function phrase(a) { return a[3] || a[0] + ' is for ' + a[1]; }
  var big = h('div', { 'class': 'kbig', 'data-out': '' }), pic = h('div', { 'class': 'kpic', 'aria-hidden': 'true' }), word = h('div', { 'class': 'kword' });
  var grid = h('div', { 'class': 'kgrid' });
  function tiles() {
    grid.innerHTML = '';
    ABC.forEach(function (a, k) { grid.appendChild(K.tile(lower ? a[0].toLowerCase() : a[0], a[2], function () { show(k, true); }, a[0] + ' for ' + a[1])); });
    K.mark(grid, grid.children[i]);
  }
  function show(k, speak) {
    i = (k + 26) % 26; var a = ABC[i];
    big.textContent = a[0] + ' ' + a[0].toLowerCase(); pic.textContent = a[2]; word.textContent = phrase(a);
    K.mark(grid, grid.children[i]); K.pop(big);
    if (speak) K.say(a[0] + '. ' + phrase(a) + '.');
  }
  var playBtn = T.button('▶ Play all', { onclick: function () {
    if (play) return stopPlay();
    playBtn.textContent = '⏸ Stop'; show(i, true);
    play = setInterval(function () { if (i === 25) return stopPlay(); show(i + 1, true); }, 2800);
  } });
  function stopPlay() { clearInterval(play); play = 0; playBtn.textContent = '▶ Play all'; }
  var learn = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [
    h('div', { 'class': 'kstage' }, [big, pic, word, T.row([T.button('◀', { onclick: function () { show(i - 1, true); } }), T.button('🔊 Hear it', { primary: true, onclick: function () { show(i, true); } }),
      T.button('▶', { onclick: function () { show(i + 1, true); } })])]),
    T.row([playBtn, T.seg([['up', 'ABC'], ['low', 'abc']], 'up', function (v) { lower = v === 'low'; tiles(); })]), grid]);
  var q = K.quiz({ rounds: 10, next: function () {
    var a = K.pick(ABC), letters = ABC.map(function (x) { return x[0]; });
    if (K.rnd(2)) return { q: [h('div', { 'class': 'kpic', text: a[2] }), 'Which letter does ' + a[1].toLowerCase() + (a[3] ? ' end with?' : ' start with?')], a: a[0], opts: K.choices(a[0], letters, 4) };
    return { q: [h('div', { 'class': 'kpic', text: '🔊' }), 'Listen, then tap the letter you hear', T.button('Hear again', { small: true, onclick: function () { K.say(a[0]); } })],
      a: a[0], opts: K.choices(a[0], letters, 4), say: function () { K.say(a[0]); } };
  } });
  var body = h('div', { style: 'display:grid;min-width:0' }, [learn]);
  spot.appendChild(T.card([T.seg([['learn', 'Learn A–Z'], ['quiz', 'Quiz']], 'learn', function (v) {
    mode = v; stopPlay(); q.stop(); body.innerHTML = ''; body.appendChild(v === 'learn' ? learn : q.el); if (v === 'quiz') q.start();
  }), body]));
  K.fit(spot);
  tiles(); show(0, false);
  T.tests['abc-learn'] = function () {
    var f = [];
    if (ABC.length !== 26) f.push('count ' + ABC.length);
    ABC.forEach(function (a, k) {
      if (a[0] !== String.fromCharCode(65 + k)) f.push('order ' + a[0]);
      if (!a[3] && a[1][0] !== a[0]) f.push(a[1] + ' does not start with ' + a[0]);
      if (a[3] && a[1].toUpperCase().indexOf(a[0]) < 0) f.push(a[1] + ' has no ' + a[0]);
    });
    var c = K.choices('B', ABC.map(function (x) { return x[0]; }), 4);
    if (c.length !== 4 || c.indexOf('B') < 0 || K.uniq(c).length !== 4) f.push('choices ' + c);
    show(25, false); if (big.textContent !== 'Z z') f.push('show Z ' + big.textContent);
    show(0, false);
    return Promise.resolve({ ok: !f.length, n: 29, fails: f });
  };
});
