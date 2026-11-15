/* Infinity by GroupChatOn — opposites. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Opposites and pairs: learn opposites (big and small) and things that go together (lock and key) with pictures, then match them up or play a quiz. */
GCOTools.register('opposites', function (spot, T) {
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
  var SETS = {
    opp: 'big:🐘:small:🐭|hot:🔥:cold:🧊|up:⬆️:down:⬇️|day:☀️:night:🌙|happy:😀:sad:😢|fast:🐇:slow:🐢|open:📖:closed:📕|wet:💦:dry:🏜️|tall:🦒:short:🐕|old:👴:young:👶|loud:🔊:quiet:🔇|left:⬅️:right:➡️|heavy:🏋️:light:🪶|hard:🪨:soft:🧸|sweet:🍬:sour:🍋|laugh:😂:cry:😭|awake:😃:asleep:😴|clean:🛁:dirty:🐖|stop:🛑:go:🟢|win:🏆:lose:😞|full:🍕:empty:🍽️|in:📥:out:📤|near:🏠:far:🏔️|thick:📚:thin:📄',
    pair: 'sock:🧦:shoe:👟|lock:🔒:key:🔑|bread:🍞:butter:🧈|needle:🪡:thread:🧵|rain:🌧️:umbrella:☂️|bee:🐝:honey:🍯|dog:🐕:bone:🦴|cow:🐄:milk:🥛|paint:🎨:brush:🖌️|moon:🌙:stars:⭐|spider:🕷️:web:🕸️|hen:🐔:egg:🥚|train:🚂:track:🛤️|football:⚽:goal:🥅|pencil:✏️:paper:📄|fork:🍴:knife:🔪|letter:✉️:postbox:📮|cup:☕:tea:🫖' };
  function pairs(k) { return SETS[k].split('|').map(function (s) { var p = s.split(':'); return { a: p[0], ap: p[1], b: p[2], bp: p[3] }; }); }
  function partner(k, w) { var r = null; pairs(k).forEach(function (p) { if (p.a === w) r = p.b; if (p.b === w) r = p.a; }); return r; }
  var kind = 'opp', learn = h('div', { 'class': 'kgrid', style: 'grid-template-columns:repeat(auto-fill,minmax(150px,1fr))' });
  function line(p) { return kind === 'opp' ? p.a + ' is the opposite of ' + p.b : p.a + ' goes with ' + p.b; }
  function drawLearn() {
    learn.innerHTML = '';
    pairs(kind).forEach(function (p) { var b = h('button', { type: 'button', 'class': 'ktile', style: 'font-size:17px;padding:8px' }, [h('span', { style: 'font-size:34px', text: p.ap + ' ' + p.bp }), h('b', { text: p.a + (kind === 'opp' ? ' ↔ ' : ' + ') + p.b })]);
      b.addEventListener('click', function () { K.say(line(p)); K.mark(learn, b); }); learn.appendChild(b); });
  }
  // match game: tap a word on the left, then its partner on the right
  var mLeft = h('div', { style: 'display:grid;gap:8px' }), mRight = h('div', { style: 'display:grid;gap:8px' }), mMsg = h('p', { 'class': 'kscore', 'data-out': '', 'aria-live': 'polite' }), sel = null, done = 0, slips = 0, round = [];
  function match() {
    round = K.shuffle(pairs(kind)).slice(0, 6); sel = null; done = 0; slips = 0; mLeft.innerHTML = ''; mRight.innerHTML = '';
    function btn(word, pic, side) {
      var b = h('button', { type: 'button', 'class': 'ktile', 'data-w': word, style: 'grid-template-columns:auto minmax(0,1fr);justify-items:start;font-size:19px;min-height:56px;padding:6px 10px' }, [h('span', { style: 'font-size:28px', text: pic }), h('span', { text: word })]);
      b.addEventListener('click', function () { tap(b, word, side); }); return b;
    }
    round.forEach(function (p) { mLeft.appendChild(btn(p.a, p.ap, 'L')); });
    K.shuffle(round).forEach(function (p) { mRight.appendChild(btn(p.b, p.bp, 'R')); });
    mMsg.textContent = 'Tap a word on the left, then its ' + (kind === 'opp' ? 'opposite' : 'partner') + ' on the right.';
  }
  function tap(b, w, side) {
    if (b.disabled) return;
    if (side === 'L') { sel = { b: b, w: w }; Array.prototype.forEach.call(mLeft.children, function (x) { x.classList.toggle('is-on', x === b); }); K.say(w); return; }
    if (!sel) { mMsg.textContent = 'First tap a word on the left.'; return; }
    if (partner(kind, sel.w) === w) {
      [sel.b, b].forEach(function (x) { x.classList.remove('is-on'); x.classList.add('is-ok'); x.disabled = true; }); done++;
      K.say(kind === 'opp' ? sel.w + ' and ' + w + '. Opposites!' : sel.w + ' and ' + w + '!'); sel = null;
      mMsg.textContent = done === round.length ? '🎉 All matched with ' + slips + (slips === 1 ? ' slip!' : ' slips!') : K.praise() + ' ' + (round.length - done) + ' to go';
    } else { slips++; b.classList.add('is-no'); setTimeout(function () { b.classList.remove('is-no'); }, 600); mMsg.textContent = 'Not that one, try again!'; }
  }
  var matchBox = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [h('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px' }, [mLeft, mRight]), mMsg, T.row([T.button('New round', { primary: true, onclick: match })])]);
  var q = K.quiz({ rounds: 8, next: function () {
    var all = pairs(kind), p = K.pick(all), flip = K.rnd(2), ask = flip ? p.b : p.a, ans = flip ? p.a : p.b, pics = {};
    all.forEach(function (x) { pics[x.a] = x.ap; pics[x.b] = x.bp; });
    return { q: [h('div', { 'class': 'kpic', text: pics[ask] }), (kind === 'opp' ? 'What is the opposite of “' : 'What goes with “') + ask + '”?'], a: ans,
      opts: K.choices(ans, all.map(function (x) { return flip ? x.a : x.b; }), 4), say: function () { K.say((kind === 'opp' ? 'What is the opposite of ' : 'What goes with ') + ask + '?'); } };
  } });
  var body = h('div', { style: 'display:grid;min-width:0' }, [learn]), tab = 'learn';
  function refresh() { if (tab === 'learn') drawLearn(); if (tab === 'match') match(); if (tab === 'quiz') q.start(); }
  spot.appendChild(T.card([T.seg([['opp', 'Opposites'], ['pair', 'Go together']], 'opp', function (v) { kind = v; refresh(); }),
    T.seg([['learn', 'Learn'], ['match', 'Match up'], ['quiz', 'Quiz']], 'learn', function (v) { tab = v; q.stop(); body.innerHTML = ''; body.appendChild(v === 'learn' ? learn : v === 'match' ? matchBox : q.el); refresh(); }), body]));
  K.fit(spot);
  drawLearn();
  T.tests['opposites'] = function () {
    var f = [];
    ['opp', 'pair'].forEach(function (k) {
      var ps = pairs(k), words = []; ps.forEach(function (p) { words.push(p.a, p.b); if (!p.ap || !p.bp) f.push('picture ' + p.a); });
      if (K.uniq(words).length !== words.length) f.push(k + ' word used twice');
      ps.forEach(function (p) { if (partner(k, p.a) !== p.b || partner(k, p.b) !== p.a) f.push('partner ' + p.a); });
    });
    var keepK = kind; kind = 'opp'; match();
    var L0 = mLeft.children[0], w = L0.getAttribute('data-w'), R = Array.prototype.filter.call(mRight.children, function (x) { return x.getAttribute('data-w') === partner('opp', w); })[0];
    L0.click(); R.click(); if (done !== 1 || !R.disabled) f.push('match game');
    kind = keepK; tab = 'learn';
    return Promise.resolve({ ok: !f.length, n: 50, fails: f });
  };
});
