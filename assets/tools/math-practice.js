/* Infinity by GroupChatOn — math-practice. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Maths practice: add, subtract, multiply and divide at four levels, with a big number pad, a timer, stars and a list of mistakes to review. */
GCOTools.register('math-practice', function (spot, T) {
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
  function r(a, b) { return a + K.rnd(b - a + 1); }
  // level 1: within 10 · 2: within 20 · 3: two digits · 4: three digits
  function make(op, lv) {
    if (op === 'mix') op = K.pick(['+', '−', '×', '÷']);
    var a, b, q;
    if (op === '+') { var top = [10, 20, 99, 999][lv - 1], lo = [0, 0, 10, 100][lv - 1]; a = r(lo, top - Math.max(1, lo)); b = r(Math.max(lv > 2 ? 1 : 0, 0), Math.max(lv > 2 ? 1 : 0, top - a)); return { a: a, b: b, op: op, ans: a + b }; }
    if (op === '−') { a = r([1, 5, 10, 100][lv - 1], [10, 20, 99, 999][lv - 1]); b = r(0, a); return { a: a, b: b, op: op, ans: a - b }; }
    if (op === '×') {
      if (lv === 1) { a = r(1, 5); b = r(1, 5); } else if (lv === 2) { a = r(1, 10); b = r(1, 10); } else if (lv === 3) { a = r(11, 99); b = r(2, 9); } else { a = r(11, 99); b = r(11, 99); }
      return { a: a, b: b, op: op, ans: a * b };
    }
    if (lv === 1) { b = r(1, 5); q = r(1, 5); } else if (lv === 2) { b = r(1, 10); q = r(1, 10); } else if (lv === 3) { b = r(2, 9); q = r(2, 12); } else { b = r(2, 9); q = r(12, 111); }
    return { a: b * q, b: b, op: '÷', ans: q };
  }
  var op = T.store.get('mp-op', '+'), lv = T.store.get('mp-lv', 1), N = 10, cur = null, typed = '', done = 0, right = 0, wrong = [], t0 = 0, firstTry = true;
  var qEl = h('div', { 'class': 'kbig', 'data-out': '', style: 'font-size:clamp(40px,12vw,76px)' }), ans = h('div', { 'class': 'kword', 'aria-live': 'polite', style: 'min-height:44px;font-size:40px' });
  var fb = h('p', { 'class': 'kscore', 'aria-live': 'polite' }), bar = h('div', { 'class': 'tprogress' }, [h('span')]), stage = h('div', { 'class': 'kstage' }, [qEl, ans, fb]);
  function ask() { cur = make(op, lv); typed = ''; firstTry = true; qEl.textContent = cur.a + ' ' + cur.op + ' ' + cur.b + ' = ?'; ans.textContent = '_'; K.pop(qEl); bar.firstChild.style.width = Math.round(done / N * 100) + '%'; }
  function start() { done = 0; right = 0; wrong = []; t0 = Date.now(); fb.textContent = 'Question 1 of ' + N; pad.hidden = false; ask(); }
  function press(k) {
    if (!cur) return;
    if (k === '⌫') typed = typed.slice(0, -1); else if (k === '✓') return submit(); else if (typed.length < 7) typed += k;
    ans.textContent = typed || '_';
  }
  function submit() {
    if (!typed || !cur) return;
    if (+typed === cur.ans) {
      if (firstTry) right++; done++; fb.textContent = K.praise(); ans.textContent = String(cur.ans) + ' ✓';
      cur = null;
      if (done >= N) return setTimeout(finish, 700);
      setTimeout(function () { if (cur) return; fb.textContent = 'Question ' + (done + 1) + ' of ' + N + ' · ' + right + ' right'; ask(); }, 700);
    } else {
      if (firstTry) wrong.push(cur.a + ' ' + cur.op + ' ' + cur.b + ' = ' + cur.ans + ' (you wrote ' + typed + ')');
      firstTry = false; typed = ''; ans.textContent = '_'; fb.textContent = 'Not quite, try again! 🙂';
    }
  }
  function finish() {
    var secs = Math.round((Date.now() - t0) / 1000); cur = null; pad.hidden = true; bar.firstChild.style.width = '100%';
    qEl.textContent = K.stars(right, N); ans.textContent = right + ' out of ' + N + ' right first time';
    fb.textContent = 'Time: ' + Math.floor(secs / 60) + ' min ' + (secs % 60) + ' s' + (wrong.length ? ' · Practise these: ' + wrong.join(' · ') : ' · No mistakes! 🏆');
    K.say('You got ' + right + ' out of ' + N + ' right first time.');
  }
  var pad = h('div', { style: 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;max-width:340px;width:100%;margin:0 auto' });
  ['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', '✓'].forEach(function (k) {
    pad.appendChild(h('button', { type: 'button', 'class': 'ktile', style: 'min-height:60px;font-size:28px' + (k === '✓' ? ';background:var(--accent);color:var(--accent-ink,#fff);border-color:var(--accent)' : ''),
      'aria-label': k === '⌫' ? 'Delete' : k === '✓' ? 'Check answer' : k, text: k, onclick: function () { press(k); } }));
  });
  function onKey(e) {
    if (!spot.isConnected) return document.removeEventListener('keydown', onKey);
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('⌫'); else if (e.key === 'Enter' && cur) { e.preventDefault(); press('✓'); }
  }
  document.addEventListener('keydown', onKey);
  spot.appendChild(T.card([
    T.seg([['+', '+ Add'], ['−', '− Take away'], ['×', '× Times'], ['÷', '÷ Share'], ['mix', 'Mix']], op, function (v) { op = v; T.store.set('mp-op', v); start(); }),
    T.seg([[1, 'Level 1'], [2, 'Level 2'], [3, 'Level 3'], [4, 'Level 4']], lv, function (v) { lv = v; T.store.set('mp-lv', v); start(); }),
    T.seg([[10, '10 questions'], [20, '20']], 10, function (v) { N = v; start(); }),
    stage, pad, bar, T.row([T.button('↺ New round', { onclick: start })]),
    h('p', { 'class': 'ksub', text: 'Level 1: numbers up to 10 · Level 2: up to 20 · Level 3: two-digit numbers · Level 4: three-digit numbers. On a computer you can type the answer and press Enter.' })]));
  K.fit(spot);
  start();
  T.tests['math-practice'] = function () {
    var f = [];
    ['+', '−', '×', '÷'].forEach(function (o) { [1, 2, 3, 4].forEach(function (l) { for (var k = 0; k < 300; k++) {
      var p = make(o, l), real = o === '+' ? p.a + p.b : o === '−' ? p.a - p.b : o === '×' ? p.a * p.b : p.a / p.b;
      if (p.ans !== real || p.ans < 0 || p.ans % 1 || !isFinite(p.ans)) { f.push(o + l + ' ' + JSON.stringify(p)); return; }
      if (l === 1 && (o === '+' && p.ans > 10 || o === '−' && p.a > 10)) { f.push('L1 too big ' + JSON.stringify(p)); return; }
      if (l === 2 && o === '+' && p.ans > 20) { f.push('L2 too big ' + JSON.stringify(p)); return; }
      if (l === 4 && o === '+' && p.ans > 999) { f.push('L4 too big ' + JSON.stringify(p)); return; }
      if (o === '÷' && p.b === 0) { f.push('divide by 0'); return; }
    } }); });
    start(); typed = String(cur.ans); submit(); if (right !== 1) f.push('right answer not counted');
    start();
    return Promise.resolve({ ok: !f.length, n: 4802, fails: f });
  };
});
