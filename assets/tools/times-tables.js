/* Infinity by GroupChatOn — times-tables. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Times tables: read and hear any table from 1 to 20, then a quiz on the tables you choose, which remembers the facts you find tricky. */
GCOTools.register('times-tables', function (spot, T) {
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
  function table(n, upto) { var out = []; for (var k = 1; k <= (upto || 10); k++) out.push([n, k, n * k]); return out; }
  function wrongs(a, b) { var c = a * b; return K.uniq([c + a, c - a, c + b, c - b, c + 1, c - 1, (a + 1) * (b + 1), c + 10, c - 10, c + 2].filter(function (x) { return x > 0 && x !== c; })); }
  var n = T.store.get('tt-n', 2), upto = 10, tricky = T.store.get('tt-tricky', {});
  var list = h('div', { 'data-out': '', style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px' });
  var pickN = T.select(Array.apply(null, Array(20)).map(function (x, i) { return [i + 1, 'Table of ' + (i + 1)]; }), n);
  function drawTable() {
    list.innerHTML = '';
    table(n, upto).forEach(function (r) {
      var b = h('button', { type: 'button', 'class': 'ktile', style: 'font-size:22px;min-height:52px', text: r[0] + ' × ' + r[1] + ' = ' + r[2] });
      b.addEventListener('click', function () { K.say(r[0] + ' times ' + r[1] + ' is ' + r[2]); K.mark(list, b); });
      list.appendChild(b);
    });
  }
  pickN.addEventListener('change', function () { n = +pickN.value; T.store.set('tt-n', n); drawTable(); });
  var quick = h('div', { 'class': 'trow' });
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(function (k) { quick.appendChild(T.button(String(k), { small: true, onclick: function () { n = k; pickN.value = String(k); T.store.set('tt-n', n); drawTable(); } })); });
  var readT = 0;
  function readAll() {
    clearTimeout(readT); var rows = table(n, upto), k = 0;
    (function nxt() { if (k >= rows.length) return; var r = rows[k]; K.mark(list, list.children[k]); K.say(r[0] + ' times ' + r[1] + ' is ' + r[2], 'en-US', { rate: 0.95 }); k++; readT = setTimeout(nxt, 2300); })();
  }
  var learn = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [T.field('Table', pickN), quick, T.seg([[10, 'Up to ×10'], [12, '×12'], [20, '×20']], 10, function (v) { upto = v; drawTable(); }), list,
    T.row([T.button('🔊 Read it aloud', { primary: true, onclick: readAll }), T.button('Stop', { onclick: function () { clearTimeout(readT); } })])]);
  var chosen = T.store.get('tt-chosen', [2, 3, 4, 5]);
  var chips = h('div', { 'class': 'trow' });
  function drawChips() {
    chips.innerHTML = '';
    for (var k = 2; k <= 12; k++) (function (k) {
      var on = chosen.indexOf(k) >= 0;
      chips.appendChild(h('button', { type: 'button', 'class': 'tbtn tbtn-sm' + (on ? ' tbtn-primary' : ''), 'aria-pressed': String(on), text: '×' + k,
        onclick: function () { var i = chosen.indexOf(k); if (i >= 0) { if (chosen.length > 1) chosen.splice(i, 1); } else chosen.push(k); T.store.set('tt-chosen', chosen); drawChips(); } }));
    })(k);
  }
  function question() {
    var keys = Object.keys(tricky).filter(function (k) { return chosen.indexOf(+k.split('x')[0]) >= 0; }), a, b;
    if (keys.length && K.rnd(3) === 0) { var p = K.pick(keys).split('x'); a = +p[0]; b = +p[1]; } else { a = K.pick(chosen); b = 1 + K.rnd(12); }
    return { a: a, b: b, ans: a * b, opts: K.choices(a * b, wrongs(a, b), 4) };
  }
  var cur = null;
  var q = K.quiz({ rounds: 10, next: function () { cur = question(); return { q: [h('div', { 'class': 'kbig', style: 'font-size:clamp(44px,13vw,80px)', text: cur.a + ' × ' + cur.b }), 'What is the answer?'], a: cur.ans, opts: cur.opts }; } });
  // remember facts answered wrongly, forget them after a right answer
  q.el.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-v]'); if (!b || !cur || b.parentNode.querySelector('.is-ok,.is-no')) return;
    var key = cur.a + 'x' + cur.b; if (+b.getAttribute('data-v') === cur.ans) delete tricky[key]; else tricky[key] = 1; T.store.set('tt-tricky', tricky);
  }, true);
  var quiz = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [h('p', { 'class': 'ksub', text: 'Choose the tables to practise, then press Start:' }), chips, T.button('Start the quiz', { primary: true, onclick: function () { q.start(); } }), q.el]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [learn]);
  spot.appendChild(T.card([T.seg([['learn', 'Learn'], ['quiz', 'Quiz']], 'learn', function (v) { q.stop(); clearTimeout(readT); body.innerHTML = ''; body.appendChild(v === 'quiz' ? quiz : learn); if (v === 'quiz') { drawChips(); q.start(); } }), body]));
  K.fit(spot);
  drawTable();
  T.tests['times-tables'] = function () {
    var f = [], t = table(7, 12);
    if (t.length !== 12 || t[11][2] !== 84 || t[0][2] !== 7) f.push('table of 7');
    for (var k = 0; k < 300; k++) { var x = question(); if (x.ans !== x.a * x.b || x.opts.length !== 4 || x.opts.indexOf(x.ans) < 0 || K.uniq(x.opts).length !== 4 || x.opts.some(function (o) { return o <= 0; })) { f.push('question ' + JSON.stringify(x)); break; } }
    if (wrongs(1, 1).indexOf(1) >= 0) f.push('wrong includes answer');
    return Promise.resolve({ ok: !f.length, n: 303, fails: f });
  };
});
