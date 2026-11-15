/* Infinity by GroupChatOn — phonics. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Phonics: the sound each letter makes, then blending: tap the sound tiles or press “Sound it out” to hear c-a-t become cat. */
GCOTools.register('phonics', function (spot, T) {
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
  // sound → how it is said (a spoken approximation), an example word and its picture
  var SND = { a: ['ah', 'ant', '🐜'], b: ['buh', 'bus', '🚌'], c: ['kuh', 'cup', '☕'], d: ['duh', 'duck', '🦆'], e: ['eh', 'egg', '🥚'], f: ['fff', 'fish', '🐟'], g: ['guh', 'goat', '🐐'],
    h: ['huh', 'hat', '🎩'], i: ['ih', 'insect', '🐛'], j: ['juh', 'jam', '🍯'], k: ['kuh', 'kite', '🪁'], l: ['lll', 'leg', '🦵'], m: ['mmm', 'map', '🗺️'], n: ['nnn', 'nut', '🥜'],
    o: ['aw', 'octopus', '🐙'], p: ['puh', 'pig', '🐷'], q: ['kwuh', 'queen', '👸'], r: ['rrr', 'rat', '🐀'], s: ['sss', 'sun', '☀️'], t: ['tuh', 'ten', '🔟'], u: ['uh', 'umbrella', '☂️'],
    v: ['vvv', 'van', '🚐'], w: ['wuh', 'web', '🕸️'], x: ['ks', 'box', '📦'], y: ['yuh', 'yo-yo', '🪀'], z: ['zzz', 'zebra', '🦓'],
    sh: ['shh', 'ship', '🚢'], ch: ['chuh', 'chick', '🐤'], th: ['thh', 'thumb', '👍'], ng: ['ng', 'ring', '💍'], ck: ['kuh', 'duck', '🦆'], ee: ['ee', 'bee', '🐝'], oo: ['oo', 'moon', '🌙'], ai: ['ay', 'rain', '🌧️'], ar: ['ar', 'car', '🚗'] };
  var TEAMS = ['sh', 'ch', 'th', 'ng', 'ck', 'ee', 'oo', 'ai', 'ar'];
  var WORDS = {
    cvc: [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['hat', '🎩'], ['bed', '🛏️'], ['pig', '🐷'], ['bus', '🚌'], ['cup', '☕'], ['fox', '🦊'], ['hen', '🐔'], ['net', '🥅'], ['map', '🗺️'],
      ['pen', '🖊️'], ['box', '📦'], ['bat', '🦇'], ['jam', '🍯'], ['web', '🕸️'], ['log', '🪵'], ['bug', '🐛'], ['van', '🚐'], ['rat', '🐀'], ['ten', '🔟'], ['leg', '🦵'], ['nut', '🥜'], ['hut', '🛖']],
    team: [['ship', '🚢'], ['fish', '🐟'], ['shop', '🏪'], ['chip', '🍟'], ['chick', '🐤'], ['bath', '🛁'], ['bee', '🐝'], ['moon', '🌙'], ['sheep', '🐑'], ['rain', '🌧️'], ['ring', '💍'],
      ['king', '🤴'], ['duck', '🦆'], ['sock', '🧦'], ['book', '📕'], ['car', '🚗'], ['tail', '🐒'], ['feet', '🦶'], ['boot', '👢'], ['moth', '🦋']],
    blend: [['frog', '🐸'], ['crab', '🦀'], ['drum', '🥁'], ['star', '⭐'], ['clock', '⏰'], ['flag', '🚩'], ['plum', '🍑'], ['snail', '🐌'], ['tree', '🌳'], ['spoon', '🥄'], ['swim', '🏊'], ['truck', '🚚'],
      ['plant', '🌱'], ['nest', '🪺'], ['hand', '✋'], ['tent', '⛺'], ['milk', '🥛'], ['desk', '🪑'], ['sled', '🛷'], ['brush', '🪥']] };
  WORDS.team = WORDS.team.filter(function (w) { return w[0] !== 'moth'; });
  function split(w) { var out = [], i = 0; while (i < w.length) { var two = w.slice(i, i + 2); if (TEAMS.indexOf(two) >= 0) { out.push(two); i += 2; } else { out.push(w[i]); i++; } } return out; }
  var level = 'cvc', idx = 0, deck = K.shuffle(WORDS.cvc), timers = [];
  var tilesBox = h('div', { style: 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center' }), pic = h('div', { 'class': 'kpic', text: '❓' }), word = h('div', { 'class': 'kword', 'data-out': '' });
  function stopT() { timers.forEach(clearTimeout); timers = []; }
  function cur() { return deck[idx % deck.length]; }
  function drawWord() {
    stopT(); var w = cur(); tilesBox.innerHTML = ''; pic.textContent = '❓'; word.textContent = 'Tap each sound, then blend them';
    split(w[0]).forEach(function (s) {
      var b = h('button', { type: 'button', 'class': 'ktile', style: 'min-width:72px;font-size:36px', 'aria-label': 'Sound ' + s }, [s]);
      b.addEventListener('click', function () { K.say(SND[s][0]); K.pop(b); });
      tilesBox.appendChild(b);
    });
  }
  function soundOut() {
    stopT(); var w = cur(), parts = split(w[0]), kids = tilesBox.children, step = 850;
    parts.forEach(function (s, k) { timers.push(setTimeout(function () { K.mark(tilesBox, kids[k]); K.say(SND[s][0]); }, k * step)); });
    timers.push(setTimeout(function () { K.mark(tilesBox, null); pic.textContent = w[1]; word.textContent = w[0]; K.pop(pic); K.say(w[0]); }, parts.length * step + 300));
  }
  var blend = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [
    T.seg([['cvc', 'c-a-t'], ['team', 'sh, ee, oo'], ['blend', 'fr, st, nd']], 'cvc', function (v) { level = v; deck = K.shuffle(WORDS[v]); idx = 0; drawWord(); }),
    h('div', { 'class': 'kstage' }, [tilesBox, pic, word]),
    T.row([T.button('🔊 Sound it out', { primary: true, onclick: soundOut }), T.button('Next word ▶', { onclick: function () { idx++; drawWord(); } }),
      T.button('Try a sample', { small: true, onclick: soundOut })])]);
  var big = h('div', { 'class': 'kbig' }), spic = h('div', { 'class': 'kpic' }), sword = h('div', { 'class': 'kword' }), grid = h('div', { 'class': 'kgrid' });
  function showSound(k) { var s = SND[k]; big.textContent = k; spic.textContent = s[2]; sword.textContent = '“' + s[0] + '” as in ' + s[1]; K.pop(big); K.say(s[0] + '. ' + s[0] + '. ' + s[1]); }
  Object.keys(SND).forEach(function (k) { if (k === 'ck') return; var b = K.tile(k, SND[k][2], function () { showSound(k); K.mark(grid, b); }, 'Sound ' + k); grid.appendChild(b); });
  var sounds = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [h('div', { 'class': 'kstage' }, [big, spic, sword]), grid]);
  big.textContent = 'a'; spic.textContent = SND.a[2]; sword.textContent = '“ah” as in ant';
  var q = K.quiz({ rounds: 8, next: function () {
    var pool = WORDS[level], w = K.pick(pool), parts = split(w[0]);
    function play() { stopT(); parts.forEach(function (s, k) { timers.push(setTimeout(function () { K.say(SND[s][0]); }, k * 850)); }); }
    return { q: [h('div', { 'class': 'kpic', text: '👂' }), 'Listen to the sounds. Which picture is it?', T.button('Hear again', { small: true, onclick: play })],
      a: w[1], opts: K.choices(w[1], pool.map(function (x) { return x[1]; }), 3), say: play };
  } });
  var body = h('div', { style: 'display:grid;min-width:0' }, [blend]);
  spot.appendChild(T.card([T.seg([['blend', 'Blend words'], ['sounds', 'Letter sounds'], ['quiz', 'Listen game']], 'blend', function (v) {
    stopT(); q.stop(); body.innerHTML = ''; body.appendChild(v === 'blend' ? blend : v === 'sounds' ? sounds : q.el); if (v === 'quiz') q.start();
  }), body]));
  K.fit(spot);
  drawWord();
  T.tests['phonics'] = function () {
    var f = [];
    [['sheep', 'sh ee p'], ['clock', 'c l o ck'], ['star', 's t ar'], ['cat', 'c a t'], ['rain', 'r ai n'], ['brush', 'b r u sh']].forEach(function (c) { if (split(c[0]).join(' ') !== c[1]) f.push(c[0] + ' → ' + split(c[0]).join(' ')); });
    Object.keys(WORDS).forEach(function (k) { WORDS[k].forEach(function (w) { split(w[0]).forEach(function (s) { if (!SND[s]) f.push('no sound for ' + s + ' in ' + w[0]); }); }); });
    'abcdefghijklmnopqrstuvwxyz'.split('').forEach(function (c) { if (!SND[c]) f.push('missing ' + c); });
    return Promise.resolve({ ok: !f.length, n: 60, fails: f });
  };
});
