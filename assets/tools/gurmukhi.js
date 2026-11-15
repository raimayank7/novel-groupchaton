/* Infinity by GroupChatOn — gurmukhi. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Punjabi Gurmukhi: the 35 letters of the ਪੈਂਤੀ with names, picture words and sounds, the 6 dotted letters, ਲਗਾਂ-ਮਾਤਰਾਂ and a quiz. */
GCOTools.register('gurmukhi', function (spot, T) {
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
  // letter, its name, name in Roman letters, word, word in Roman letters, meaning, picture
  var PAINTI = [['ੳ', 'ਊੜਾ', 'oora', 'ਉੱਲੂ', 'ullu', 'owl', '🦉'], ['ਅ', 'ਐੜਾ', 'aira', 'ਅੰਬ', 'amb', 'mango', '🥭'], ['ੲ', 'ਈੜੀ', 'eeri', 'ਇੱਟ', 'itt', 'brick', '🧱'],
    ['ਸ', 'ਸੱਸਾ', 'sassa', 'ਸੇਬ', 'seb', 'apple', '🍎'], ['ਹ', 'ਹਾਹਾ', 'haaha', 'ਹਾਥੀ', 'haathi', 'elephant', '🐘'],
    ['ਕ', 'ਕੱਕਾ', 'kakka', 'ਕਬੂਤਰ', 'kabootar', 'pigeon', '🕊️'], ['ਖ', 'ਖੱਖਾ', 'khakha', 'ਖਰਗੋਸ਼', 'khargosh', 'rabbit', '🐇'], ['ਗ', 'ਗੱਗਾ', 'gagga', 'ਗਾਂ', 'gaan', 'cow', '🐄'],
    ['ਘ', 'ਘੱਗਾ', 'ghagga', 'ਘਰ', 'ghar', 'house', '🏠'], ['ਙ', 'ਙੰਙਾ', 'nganga', '', '', 'no common word starts with ਙ', '🔤'],
    ['ਚ', 'ਚੱਚਾ', 'chachcha', 'ਚਿੜੀ', 'chiri', 'sparrow', '🐦'], ['ਛ', 'ਛੱਛਾ', 'chhachha', 'ਛੱਤਰੀ', 'chhattri', 'umbrella', '☂️'], ['ਜ', 'ਜੱਜਾ', 'jajja', 'ਜਹਾਜ਼', 'jahaaz', 'ship', '🚢'],
    ['ਝ', 'ਝੱਜਾ', 'jhajja', 'ਝੰਡਾ', 'jhanda', 'flag', '🚩'], ['ਞ', 'ਞੰਞਾ', 'nyanya', '', '', 'no common word starts with ਞ', '🔤'],
    ['ਟ', 'ਟੈਂਕਾ', 'tainka', 'ਟਮਾਟਰ', 'tamaatar', 'tomato', '🍅'], ['ਠ', 'ਠੱਠਾ', 'thattha', 'ਠੇਲਾ', 'thela', 'hand cart', '🛒'], ['ਡ', 'ਡੱਡਾ', 'dadda', 'ਡੱਡੂ', 'daddu', 'frog', '🐸'],
    ['ਢ', 'ਢੱਡਾ', 'dhadda', 'ਢੋਲ', 'dhol', 'drum', '🪘'], ['ਣ', 'ਣਾਣਾ', 'naana', '', '', 'no word starts with ਣ', '🔤'],
    ['ਤ', 'ਤੱਤਾ', 'tatta', 'ਤਿੱਤਲੀ', 'tittli', 'butterfly', '🦋'], ['ਥ', 'ਥੱਥਾ', 'thattha', 'ਥਾਲੀ', 'thaali', 'plate', '🍽️'], ['ਦ', 'ਦੱਦਾ', 'dadda', 'ਦੰਦ', 'dand', 'tooth', '🦷'],
    ['ਧ', 'ਧੱਦਾ', 'dhadda', 'ਧੁੱਪ', 'dhupp', 'sunshine', '☀️'], ['ਨ', 'ਨੰਨਾ', 'nanna', 'ਨਲਕਾ', 'nalka', 'hand pump', '🚰'],
    ['ਪ', 'ਪੱਪਾ', 'pappa', 'ਪਤੰਗ', 'patang', 'kite', '🪁'], ['ਫ', 'ਫੱਫਾ', 'phaphpha', 'ਫੁੱਲ', 'phull', 'flower', '🌸'], ['ਬ', 'ਬੱਬਾ', 'babba', 'ਬਿੱਲੀ', 'billi', 'cat', '🐱'],
    ['ਭ', 'ਭੱਬਾ', 'bhabba', 'ਭਾਲੂ', 'bhaalu', 'bear', '🐻'], ['ਮ', 'ਮੱਮਾ', 'mamma', 'ਮੋਰ', 'mor', 'peacock', '🦚'],
    ['ਯ', 'ਯੱਯਾ', 'yayya', 'ਯੋਗ', 'yog', 'yoga', '🧘'], ['ਰ', 'ਰਾਰਾ', 'raara', 'ਰੇਲ', 'rel', 'train', '🚆'], ['ਲ', 'ਲੱਲਾ', 'lalla', 'ਲੂਣ', 'loon', 'salt', '🧂'],
    ['ਵ', 'ਵਾਵਾ', 'vaava', 'ਵਾਜਾ', 'vaaja', 'harmonium', '🪗'], ['ੜ', 'ੜਾੜਾ', 'rhaarha', '', '', 'no word starts with ੜ', '🔤']];
  var BINDI = [['ਸ਼', 'sh'], ['ਖ਼', 'kh (from the throat)'], ['ਗ਼', 'gh'], ['ਜ਼', 'z'], ['ਫ਼', 'f'], ['ਲ਼', 'ḷ (a heavy l)']];
  var LAGAN = [['', 'ਮੁਕਤਾ', 'mukta', 'a'], ['ਾ', 'ਕੰਨਾ', 'kanna', 'aa'], ['ਿ', 'ਸਿਹਾਰੀ', 'sihaari', 'i'], ['ੀ', 'ਬਿਹਾਰੀ', 'bihaari', 'ee'], ['ੁ', 'ਔਂਕੜ', 'aunkar', 'u'],
    ['ੂ', 'ਦੁਲੈਂਕੜ', 'dulainkar', 'oo'], ['ੇ', 'ਲਾਂਵ', 'laanv', 'e'], ['ੈ', 'ਦੁਲਾਵਾਂ', 'dulaavaan', 'ai'], ['ੋ', 'ਹੋੜਾ', 'hora', 'o'], ['ੌ', 'ਕਨੌੜਾ', 'kanaura', 'au']];
  function lagan(c) { return LAGAN.map(function (m) { return c + m[0]; }); }
  var big = h('div', { 'class': 'kbig', 'data-out': '' }), pic = h('div', { 'class': 'kpic', 'aria-hidden': 'true' }), word = h('div', { 'class': 'kword' }), sub = h('div', { 'class': 'ksub' });
  var grid = h('div', { 'class': 'kgrid' }), tab = 'painti', cur = PAINTI[0], cons = 'ਕ';
  function speak(a) { K.say(a[3] ? a[1] + ', ' + a[3] : a[1], 'pa-IN', { fallback: a[2] + (a[4] ? ', as in ' + a[4] : '') }); }
  function show(a, s) {
    cur = a; big.textContent = a[0]; pic.textContent = a[6]; word.textContent = a[1] + (a[3] ? ' · ' + a[3] : '');
    sub.textContent = '“' + a[2] + '”' + (a[4] ? ' · ' + a[4] + ' = ' + a[5] : ' · ' + a[5]);
    K.mark(grid, grid.children[PAINTI.indexOf(a)]); K.pop(big); if (s) speak(a);
  }
  function plain(text, note, idx) { big.textContent = text; pic.textContent = ''; word.textContent = text; sub.textContent = note; K.mark(grid, grid.children[idx]); K.pop(big); }
  function draw() {
    grid.innerHTML = '';
    if (tab === 'painti') { PAINTI.forEach(function (a) { grid.appendChild(K.tile(a[0], a[2], function () { show(a, true); }, a[1])); }); show(PAINTI[0], false); }
    if (tab === 'bindi') {
      BINDI.forEach(function (b, k) { grid.appendChild(K.tile(b[0], b[1].split(' ')[0], function () { plain(b[0], 'A dot (ਪੈਰ ਬਿੰਦੀ) under the letter gives the sound “' + b[1] + '”', k); K.say(b[0], 'pa-IN', { fallback: b[1].split(' ')[0] }); })); });
      plain(BINDI[0][0], 'A dot (ਪੈਰ ਬਿੰਦੀ) under the letter gives the sound “' + BINDI[0][1] + '”', 0);
    }
    if (tab === 'lagan') {
      lagan(cons).forEach(function (s, k) { var m = LAGAN[k]; grid.appendChild(K.tile(s, m[3], function () { plain(s, m[1] + ' (' + m[2] + ') · “' + cons + '” + “' + m[3] + '”', k); K.say(s, 'pa-IN', { fallback: '' }); })); });
      plain(cons, 'Tap each sound to see the vowel sign (ਲਗ) and its name', -1);
    }
  }
  var pickCons = T.select(PAINTI.slice(3).map(function (v) { return [v[0], v[0] + '  ' + v[1]]; }), 'ਕ');
  pickCons.addEventListener('change', function () { cons = pickCons.value; draw(); });
  var consRow = T.field('Letter', pickCons);
  var learn = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [h('div', { 'class': 'kstage' }, [big, pic, word, sub,
    T.button('🔊 Hear it', { primary: true, onclick: function () { if (tab === 'painti') speak(cur); else K.say(big.textContent, 'pa-IN', { fallback: '' }); } })]), consRow, grid,
    h('p', { 'class': 'ksub', text: 'Sounds use your device’s Punjabi voice. If it has none, the letter name is read in English letters.' })]);
  var q = K.quiz({ rounds: 10, next: function () {
    var all = PAINTI.filter(function (a) { return a[3]; }), a = K.pick(all), letters = PAINTI.map(function (x) { return x[0]; });
    if (K.rnd(2)) return { q: [h('div', { 'class': 'kpic', text: a[6] }), a[3] + ' (' + a[5] + ')', 'Which letter does it start with?'], a: a[0], opts: K.choices(a[0], letters, 4) };
    return { q: [h('div', { 'class': 'kbig', text: a[0] }), 'What is this letter called?'], a: a[1], opts: K.choices(a[1], PAINTI.map(function (x) { return x[1]; }), 4) };
  } });
  var body = h('div', { style: 'display:grid;min-width:0' }, [learn]);
  spot.appendChild(T.card([T.seg([['painti', 'ਪੈਂਤੀ'], ['bindi', 'ਬਿੰਦੀ'], ['lagan', 'ਲਗਾਂ'], ['quiz', 'Quiz']], 'painti', function (v) {
    tab = v; q.stop(); body.innerHTML = '';
    if (v === 'quiz') { body.appendChild(q.el); q.start(); return; }
    body.appendChild(learn); consRow.hidden = v !== 'lagan'; draw();
  }), body]));
  K.fit(spot);
  consRow.hidden = true; draw();
  T.tests['gurmukhi'] = function () {
    var f = [];
    if (PAINTI.length !== 35) f.push('painti ' + PAINTI.length);
    if (BINDI.length !== 6) f.push('bindi');
    PAINTI.forEach(function (a) { if (a.length !== 7) f.push('row ' + a[0]); if (a[3] && a[3].indexOf(a[0]) !== 0 && !(a[0] === 'ੳ' || a[0] === 'ੲ' || a[0] === 'ਅ')) f.push(a[3] + ' vs ' + a[0]); });
    if (lagan('ਕ').join(' ') !== 'ਕ ਕਾ ਕਿ ਕੀ ਕੁ ਕੂ ਕੇ ਕੈ ਕੋ ਕੌ') f.push('lagan ' + lagan('ਕ').join(' '));
    if (K.uniq(PAINTI.map(function (a) { return a[0]; })).length !== 35) f.push('duplicate letters');
    return Promise.resolve({ ok: !f.length, n: 40, fails: f });
  };
});
