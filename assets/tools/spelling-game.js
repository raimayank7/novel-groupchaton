/* Infinity by GroupChatOn — spelling-game. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Spelling game: hear a word, type it, and see which letters were right. Three levels or your own spelling list. */
GCOTools.register('spelling-game', function (spot, T) {
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
  var LV = {
    easy: 'cat:🐱 dog:🐶 sun:☀️ hat:🎩 pig:🐷 bus:🚌 cup:☕ fox:🦊 bed:🛏️ egg:🥚 ant:🐜 box:📦 map:🗺️ pen:🖊️ car:🚗 bee:🐝 owl:🦉 cow:🐄 hen:🐔 jam:🍯',
    mid: 'fish:🐟 frog:🐸 duck:🦆 milk:🥛 ship:🚢 tree:🌳 star:⭐ moon:🌙 cake:🎂 book:📕 rain:🌧️ bird:🐦 ball:⚽ kite:🪁 lion:🦁 bear:🐻 apple:🍎 bread:🍞 chair:🪑 train:🚆 house:🏠 mouse:🐭 shoe:👟 clock:⏰ snake:🐍',
    hard: 'rabbit:🐰 monkey:🐒 banana:🍌 pencil:✏️ window:🪟 flower:🌸 orange:🍊 school:🏫 garden:🏡 yellow:💛 purple:💜 elephant:🐘 butterfly:🦋 umbrella:☂️ rainbow:🌈 computer:💻 dinosaur:🦕 penguin:🐧 giraffe:🦒 kitchen:🍳 teacher:🧑‍🏫 doctor:🧑‍⚕️ bicycle:🚲 carrot:🥕 turtle:🐢' };
  function list(k) {
    if (k === 'own') return own.value.split(/[\n,]+/).map(function (s) { return [s.trim(), '📝']; }).filter(function (w) { return /^[\p{L}' -]{1,30}$/u.test(w[0]); });
    return LV[k].split(' ').map(function (p) { var i = p.indexOf(':'); return [p.slice(0, i), p.slice(i + 1)]; });
  }
  function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function check(typed, word) { return norm(typed) === norm(word); }
  function marks(typed, word) { var a = norm(typed), b = norm(word), out = []; for (var i = 0; i < Math.max(a.length, b.length); i++) out.push([b[i] || '', a[i] === b[i]]); return out; }
  var lv = 'easy', deck = [], pos = 0, score = 0, tries = 0, hint = 0, showPic = true;
  var own = h('textarea', { rows: '4', placeholder: 'Type your spelling list: one word per line (or separated by commas)', 'aria-label': 'Your spelling words' });
  own.value = T.store.get('spell-own', 'because\nfriend\nthrough\nbeautiful');
  own.addEventListener('input', function () { T.store.set('spell-own', own.value.slice(0, 5000)); });
  var pic = h('div', { 'class': 'kpic' }), input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Type the word', style: 'font:700 28px var(--ui);text-align:center;letter-spacing:2px' });
  var fb = h('div', { 'class': 'kword', 'data-out': '', 'aria-live': 'polite' }), info = h('p', { 'class': 'kscore' });
  function cur() { return deck[pos % deck.length]; }
  function next(quiet) {
    if (!deck.length) { fb.textContent = 'Add some words to your list first.'; return; }
    hint = 0; input.value = ''; fb.textContent = 'Listen and type the word'; pic.textContent = showPic ? cur()[1] : '🎧'; info.textContent = 'Score ' + score + ' of ' + tries;
    if (!quiet) { hear(); try { input.focus({ preventScroll: true }); } catch (e) {} }
  }
  function hear() { if (deck.length) K.say(cur()[0]); }
  function go() {
    if (!deck.length || !input.value.trim()) return;
    var w = cur()[0]; tries++;
    if (check(input.value, w)) { score++; fb.textContent = K.praise() + ' “' + w + '”'; K.say('Yes! ' + w); pos++; info.textContent = 'Score ' + score + ' of ' + tries; setTimeout(next, 1500); return; }
    fb.innerHTML = '';
    marks(input.value, w).forEach(function (m) { fb.appendChild(h('span', { style: 'display:inline-block;min-width:.7em;margin:0 1px;padding:0 3px;border-radius:6px;background:' + (m[1] ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.22)'), text: m[0] || '·' })); });
    fb.appendChild(h('div', { 'class': 'ksub', text: 'Green letters are right. The word was “' + w + '”. Try typing it again!' }));
    info.textContent = 'Score ' + score + ' of ' + tries;
  }
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  function start(quiet) { deck = K.shuffle(list(lv)); pos = 0; next(quiet); }
  var ownBox = T.field('Your words', own); ownBox.hidden = true;
  spot.appendChild(T.card([
    T.seg([['easy', 'Easy'], ['mid', 'Medium'], ['hard', 'Hard'], ['own', 'My list']], 'easy', function (v) { lv = v; ownBox.hidden = v !== 'own'; start(); }), ownBox,
    h('div', { 'class': 'kstage' }, [pic, T.button('🔊 Hear the word', { primary: true, onclick: hear }), input, fb]),
    T.row([T.button('✓ Check', { primary: true, onclick: go }), T.button('💡 Hint', { onclick: function () { if (!deck.length) return; var w = cur()[0]; hint = Math.min(w.length, hint + 1); input.value = w.slice(0, hint); fb.textContent = 'It starts with “' + w.slice(0, hint) + '”'; } }),
      T.button('Skip ▶', { onclick: function () { pos++; next(); } })]),
    T.row([h('label', { 'class': 'tcheck' }, [h('input', { type: 'checkbox', checked: true, onchange: function () { showPic = this.checked; pic.textContent = showPic && deck.length ? cur()[1] : '🎧'; } }), ' Show a picture clue']),
      T.button('Use my list now', { small: true, onclick: function () { lv = 'own'; ownBox.hidden = false; start(); } })]), info]));
  K.fit(spot);
  start(true);
  T.tests['spelling-game'] = function () {
    var f = [];
    if (!check(' Cat ', 'cat')) f.push('case/space');
    if (check('cta', 'cat')) f.push('wrong accepted');
    if (marks('cta', 'cat').map(function (m) { return m[1] ? 1 : 0; }).join('') !== '100') f.push('marks');
    if (marks('ca', 'cat').length !== 3) f.push('short');
    ['easy', 'mid', 'hard'].forEach(function (k) { var l = list(k); if (l.length < 20) f.push(k + ' size'); l.forEach(function (w) { if (!/^[a-z]+$/.test(w[0]) || !w[1]) f.push('bad ' + w[0]); }); });
    if (list('own').length !== 4) f.push('own list');
    return Promise.resolve({ ok: !f.length, n: 9, fails: f });
  };
});
