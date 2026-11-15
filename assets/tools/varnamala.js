/* Infinity by GroupChatOn — varnamala. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Hindi varnamala: स्वर and व्यंजन with a picture word and sound for each, बारहखड़ी (क का कि की…) and a quiz. */
GCOTools.register('varnamala', function (spot, T) {
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
  // letter, sound in Roman letters, word, word in Roman letters, meaning, picture
  var SWAR = [['अ', 'a', 'अनानास', 'anaanaas', 'pineapple', '🍍'], ['आ', 'aa', 'आम', 'aam', 'mango', '🥭'], ['इ', 'i', 'इमारत', 'imaarat', 'building', '🏢'],
    ['ई', 'ee', 'ईंट', 'eent', 'brick', '🧱'], ['उ', 'u', 'उल्लू', 'ulloo', 'owl', '🦉'], ['ऊ', 'oo', 'ऊन', 'oon', 'wool', '🧶'], ['ऋ', 'ri', 'ऋषि', 'rishi', 'sage', '🧘'],
    ['ए', 'e', 'एड़ी', 'edee', 'heel', '🦶'], ['ऐ', 'ai', 'ऐनक', 'ainak', 'spectacles', '👓'], ['ओ', 'o', 'ओस', 'os', 'dew', '💧'], ['औ', 'au', 'औरत', 'aurat', 'woman', '👩'],
    ['अं', 'an', 'अंगूर', 'angoor', 'grapes', '🍇'], ['अः', 'ah', 'प्रातः', 'praatah', 'morning (the sound comes at the end)', '🌅']];
  var VYAN = [['क', 'ka', 'कबूतर', 'kabootar', 'pigeon', '🕊️'], ['ख', 'kha', 'खरगोश', 'khargosh', 'rabbit', '🐇'], ['ग', 'ga', 'गमला', 'gamlaa', 'flower pot', '🪴'],
    ['घ', 'gha', 'घड़ी', 'ghadee', 'clock', '⏰'], ['ङ', 'nga', '', '', 'no common word starts with ङ', '🔤'], ['च', 'cha', 'चम्मच', 'chammach', 'spoon', '🥄'],
    ['छ', 'chha', 'छतरी', 'chhatree', 'umbrella', '☂️'], ['ज', 'ja', 'जहाज़', 'jahaaz', 'ship', '🚢'], ['झ', 'jha', 'झंडा', 'jhandaa', 'flag', '🚩'],
    ['ञ', 'nya', '', '', 'no common word starts with ञ', '🔤'], ['ट', 'ta', 'टमाटर', 'tamaatar', 'tomato', '🍅'], ['ठ', 'tha', 'ठेला', 'thelaa', 'hand cart', '🛒'],
    ['ड', 'da', 'डमरू', 'damroo', 'small drum', '🥁'], ['ढ', 'dha', 'ढोल', 'dhol', 'drum', '🪘'], ['ण', 'na', 'बाण', 'baan', 'arrow (ण comes at the end)', '🏹'],
    ['त', 'ta', 'तरबूज़', 'tarbooz', 'watermelon', '🍉'], ['थ', 'tha', 'थैला', 'thailaa', 'bag', '👜'], ['द', 'da', 'दरवाज़ा', 'darvaazaa', 'door', '🚪'],
    ['ध', 'dha', 'धागा', 'dhaagaa', 'thread', '🧵'], ['न', 'na', 'नल', 'nal', 'tap', '🚰'], ['प', 'pa', 'पतंग', 'patang', 'kite', '🪁'], ['फ', 'pha', 'फूल', 'phool', 'flower', '🌸'],
    ['ब', 'ba', 'बतख', 'batakh', 'duck', '🦆'], ['भ', 'bha', 'भालू', 'bhaaloo', 'bear', '🐻'], ['म', 'ma', 'मछली', 'machhlee', 'fish', '🐟'], ['य', 'ya', 'यान', 'yaan', 'spacecraft', '🚀'],
    ['र', 'ra', 'रेल', 'rel', 'train', '🚆'], ['ल', 'la', 'लालटेन', 'laalten', 'lantern', '🏮'], ['व', 'va', 'वन', 'van', 'forest', '🌲'], ['श', 'sha', 'शेर', 'sher', 'lion', '🦁'],
    ['ष', 'sha', 'षट्कोण', 'shatkon', 'hexagon', '⬡'], ['स', 'sa', 'सेब', 'seb', 'apple', '🍎'], ['ह', 'ha', 'हाथी', 'haathee', 'elephant', '🐘'],
    ['क्ष', 'ksha', 'क्षत्रिय', 'kshatriya', 'warrior', '⚔️'], ['त्र', 'tra', 'त्रिशूल', 'trishool', 'trident', '🔱'], ['ज्ञ', 'gya', 'ज्ञानी', 'gyaanee', 'wise person', '📚']];
  var MATRA = [['', 'a'], ['ा', 'aa'], ['ि', 'i'], ['ी', 'ee'], ['ु', 'u'], ['ू', 'oo'], ['े', 'e'], ['ै', 'ai'], ['ो', 'o'], ['ौ', 'au'], ['ं', 'an'], ['ः', 'ah']];
  function barah(c) { var base = c.length > 1 ? c : c; return MATRA.map(function (m) { return base + m[0]; }); }
  function roman(c, k) { var r = (VYAN.filter(function (v) { return v[0] === c; })[0] || ['', 'ka'])[1]; return r.replace(/a$/, '') + MATRA[k][1]; }
  var big = h('div', { 'class': 'kbig', 'data-out': '' }), pic = h('div', { 'class': 'kpic', 'aria-hidden': 'true' }), word = h('div', { 'class': 'kword' }), sub = h('div', { 'class': 'ksub' });
  var grid = h('div', { 'class': 'kgrid' }), list = SWAR, cur = SWAR[0], tab = 'swar', cons = 'क';
  function line(a) { return a[2] ? a[0] + ' से ' + a[2] : a[0]; }
  function speak(a) { K.say(a[2] ? line(a) : a[0], 'hi-IN', { fallback: a[1] + (a[3] ? ', as in ' + a[3] : '') }); }
  function show(a, s) {
    cur = a; big.textContent = a[0]; pic.textContent = a[5]; word.textContent = line(a);
    sub.textContent = '“' + a[1] + '”' + (a[3] ? ' · ' + a[3] + ' = ' + a[4] : ' · ' + a[4]);
    K.mark(grid, grid.children[list.indexOf(a)]); K.pop(big); if (s) speak(a);
  }
  function draw() {
    grid.innerHTML = '';
    if (tab === 'barah') {
      barah(cons).forEach(function (s, k) { grid.appendChild(K.tile(s, roman(cons, k), function () {
        big.textContent = s; pic.textContent = ''; word.textContent = s; sub.textContent = '“' + roman(cons, k) + '”'; K.mark(grid, grid.children[k]); K.pop(big);
        K.say(s, 'hi-IN', { fallback: roman(cons, k) });
      })); });
      return;
    }
    list.forEach(function (a) { grid.appendChild(K.tile(a[0], a[1], function () { show(a, true); }, a[0] + ' ' + a[1])); });
    show(list[0], false);
  }
  var pickCons = T.select(VYAN.map(function (v) { return [v[0], v[0] + '  (' + v[1] + ')']; }), 'क');
  pickCons.addEventListener('change', function () { cons = pickCons.value; draw(); big.textContent = cons; word.textContent = 'बारहखड़ी: ' + cons; sub.textContent = 'Tap each sound to hear it'; });
  var consRow = T.field('Letter for बारहखड़ी', pickCons);
  var stage = h('div', { 'class': 'kstage' }, [big, pic, word, sub, T.button('🔊 Hear it', { primary: true, onclick: function () { if (tab !== 'barah') speak(cur); else K.say(word.textContent.replace('बारहखड़ी: ', ''), 'hi-IN'); } })]);
  var learn = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [stage, consRow, grid]);
  var q = K.quiz({ rounds: 10, next: function () {
    var all = SWAR.concat(VYAN).filter(function (a) { return a[2]; }), a = K.pick(all), letters = all.map(function (x) { return x[0]; });
    if (K.voice('hi-IN') && K.rnd(2)) return { q: [h('div', { 'class': 'kpic', text: '🔊' }), 'Listen, then tap the letter', T.button('Hear again', { small: true, onclick: function () { K.say(a[0], 'hi-IN'); } })],
      a: a[0], opts: K.choices(a[0], letters, 4), say: function () { K.say(a[0], 'hi-IN'); } };
    return { q: [h('div', { 'class': 'kpic', text: a[5] }), a[2] + ' (' + a[4] + ')', 'Which letter does it start with?'], a: a[0], opts: K.choices(a[0], letters, 4) };
  } });
  var body = h('div', { style: 'display:grid;min-width:0' }, [learn]);
  spot.appendChild(T.card([T.seg([['swar', 'स्वर'], ['vyan', 'व्यंजन'], ['barah', 'बारहखड़ी'], ['quiz', 'Quiz']], 'swar', function (v) {
    tab = v; q.stop(); body.innerHTML = '';
    if (v === 'quiz') { body.appendChild(q.el); q.start(); return; }
    body.appendChild(learn); consRow.hidden = v !== 'barah'; list = v === 'vyan' ? VYAN : SWAR; draw();
    if (v === 'barah') { big.textContent = cons; pic.textContent = ''; word.textContent = 'बारहखड़ी: ' + cons; sub.textContent = 'Tap each sound to hear it'; }
  }), body]));
  K.fit(spot);
  consRow.hidden = true; draw();
  T.tests['varnamala'] = function () {
    var f = [];
    if (SWAR.length !== 13) f.push('swar ' + SWAR.length);
    if (VYAN.length !== 36) f.push('vyanjan ' + VYAN.length);
    SWAR.concat(VYAN).forEach(function (a) { if (a.length !== 6 || !a[5]) f.push('row ' + a[0]); if (a[2] && a[2].indexOf(a[0]) !== 0 && !/end/.test(a[4])) f.push(a[2] + ' vs ' + a[0]); });
    var b = barah('क'); if (b.join(' ') !== 'क का कि की कु कू के कै को कौ कं कः') f.push('barahkhadi ' + b.join(' '));
    if (roman('ख', 1) !== 'khaa') f.push('roman ' + roman('ख', 1));
    return Promise.resolve({ ok: !f.length, n: 52, fails: f });
  };
});
