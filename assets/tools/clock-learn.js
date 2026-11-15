/* Infinity by GroupChatOn — clock-learn. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Learn to read a clock: a big analogue clock with words and digital time; read-the-clock and set-the-clock games at five levels. */
GCOTools.register('clock-learn', function (spot, T) {
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
  var NUM = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'quarter', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
    'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine'];
  function hr(x) { return NUM[((x % 12) + 12) % 12]; }
  function words(h12, m) {
    if (m === 0) return hr(h12) + " o'clock";
    if (m === 30) return 'half past ' + hr(h12);
    if (m === 15) return 'quarter past ' + hr(h12);
    if (m === 45) return 'quarter to ' + hr(h12 + 1);
    var mins = function (x) { return x % 5 ? (x === 1 ? 'one minute' : NUM[x] + ' minutes') : NUM[x]; };
    return m < 30 ? mins(m) + ' past ' + hr(h12) : mins(60 - m) + ' to ' + hr(h12 + 1);
  }
  function digital(h12, m) { var hh = h12 % 12 || 12; return hh + ':' + (m < 10 ? '0' : '') + m; }
  function angles(h12, m) { return { hour: (h12 % 12) * 30 + m * 0.5, minute: m * 6 }; }
  function face(h12, m, size) {
    var a = angles(h12, m), s = '<svg viewBox="0 0 200 200" width="' + size + '" height="' + size + '" style="max-width:100%" role="img" aria-label="Clock showing ' + words(h12, m) + '">' +
      '<circle cx="100" cy="100" r="94" fill="#fff" stroke="#334155" stroke-width="6"/>', k;
    for (k = 0; k < 60; k++) { var ang = k * 6 * Math.PI / 180, r1 = k % 5 ? 86 : 80; s += '<line x1="' + (100 + r1 * Math.sin(ang)).toFixed(1) + '" y1="' + (100 - r1 * Math.cos(ang)).toFixed(1) + '" x2="' + (100 + 90 * Math.sin(ang)).toFixed(1) + '" y2="' + (100 - 90 * Math.cos(ang)).toFixed(1) + '" stroke="#64748b" stroke-width="' + (k % 5 ? 1.5 : 3) + '"/>'; }
    for (k = 1; k <= 12; k++) { var g = k * 30 * Math.PI / 180; s += '<text x="' + (100 + 66 * Math.sin(g)).toFixed(1) + '" y="' + (100 - 66 * Math.cos(g) + 7).toFixed(1) + '" text-anchor="middle" font-size="20" font-weight="700" font-family="system-ui,sans-serif" fill="#0f172a">' + k + '</text>'; }
    s += '<line x1="100" y1="100" x2="100" y2="52" stroke="#2563eb" stroke-width="9" stroke-linecap="round" transform="rotate(' + a.hour + ' 100 100)"/>';
    s += '<line x1="100" y1="100" x2="100" y2="26" stroke="#dc2626" stroke-width="5" stroke-linecap="round" transform="rotate(' + a.minute + ' 100 100)"/>';
    return s + '<circle cx="100" cy="100" r="6" fill="#0f172a"/></svg>';
  }
  var LV = [[0], [0, 30], [0, 15, 30, 45], [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], null];
  var lv = 1, hh = 3, mm = 0;
  function randTime() { var mins = LV[lv] || null; return [1 + K.rnd(12), mins ? K.pick(mins) : K.rnd(60)]; }
  var clock = h('div', { style: 'line-height:0' }), wordsEl = h('div', { 'class': 'kword', 'data-out': '' }), dig = h('div', { style: 'font:800 28px var(--ui)' });
  function draw(speak) { clock.innerHTML = face(hh, mm, 230); wordsEl.textContent = words(hh, mm); dig.textContent = digital(hh, mm); if (speak) K.say(words(hh, mm)); }
  function shift(d) { var t = ((hh % 12) * 60 + mm + d + 7200) % 720; hh = Math.floor(t / 60) || 12; mm = t % 60; }
  var explore = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [h('div', { 'class': 'kstage' }, [clock, wordsEl, dig]),
    T.row([T.button('−1 hour', { small: true, onclick: function () { shift(-60); draw(false); } }), T.button('+1 hour', { small: true, onclick: function () { shift(60); draw(false); } }),
      T.button('−5 min', { small: true, onclick: function () { shift(-5); draw(false); } }), T.button('+5 min', { small: true, onclick: function () { shift(5); draw(false); } }), T.button('+1 min', { small: true, onclick: function () { shift(1); draw(false); } })]),
    T.row([T.button('🔊 Say the time', { primary: true, onclick: function () { draw(true); } }), T.button('🕐 Time now', { onclick: function () { var d = new Date(); hh = d.getHours() % 12 || 12; mm = d.getMinutes(); draw(true); } }),
      T.button('Try a sample', { small: true, onclick: function () { var t = randTime(); hh = t[0]; mm = t[1]; draw(true); } })]),
    h('p', { 'class': 'ksub', text: 'The short blue hand shows the hour. The long red hand shows the minutes.' })]);
  var read = K.quiz({ rounds: 8, next: function () {
    var t = randTime(), ans = words(t[0], t[1]), pool = [words(t[0] % 12 + 1, t[1]), words(t[0], (t[1] + 30) % 60), words((t[0] + 10) % 12 + 1, t[1])];
    for (var k = 0; k < 12; k++) { var o = randTime(); pool.push(words(o[0], o[1])); }
    return { q: [h('div', { style: 'line-height:0', html: face(t[0], t[1], 200) }), 'What time is it?'], a: ans, opts: K.choices(ans, pool, 4) };
  } });
  var target = null, setFb = h('p', { 'class': 'kscore', 'aria-live': 'polite' }), setClock = h('div', { style: 'line-height:0' }), setScore = 0;
  function drawSet() { setClock.innerHTML = face(hh, mm, 220); }
  function newTarget() { target = randTime(); hh = 12; mm = 0; drawSet(); setFb.textContent = 'Set the clock to: ' + words(target[0], target[1]) + ' (' + digital(target[0], target[1]) + ')'; K.say('Show me ' + words(target[0], target[1])); }
  var setBox = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [h('div', { 'class': 'kstage' }, [setClock, setFb]),
    T.row([T.button('−1 h', { onclick: function () { shift(-60); drawSet(); } }), T.button('+1 h', { onclick: function () { shift(60); drawSet(); } }), T.button('−5 m', { onclick: function () { shift(-5); drawSet(); } }),
      T.button('+5 m', { onclick: function () { shift(5); drawSet(); } }), T.button('+1 m', { onclick: function () { shift(1); drawSet(); } })]),
    T.row([T.button('✓ Check', { primary: true, onclick: function () {
      if (hh % 12 === target[0] % 12 && mm === target[1]) { setScore++; setFb.textContent = K.praise() + ' That is ' + words(hh, mm) + '. Score ' + setScore; K.say('Yes! ' + words(hh, mm)); setTimeout(newTarget, 1800); }
      else setFb.textContent = 'Not yet: your clock says ' + words(hh, mm) + '. You need ' + words(target[0], target[1]) + '.';
    } }), T.button('New time', { onclick: newTarget })])]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [explore]);
  spot.appendChild(T.card([
    T.seg([['explore', 'Explore'], ['read', 'Read it'], ['set', 'Set it']], 'explore', function (v) {
      read.stop(); body.innerHTML = ''; body.appendChild(v === 'explore' ? explore : v === 'read' ? read.el : setBox);
      if (v === 'read') read.start(); if (v === 'set') newTarget(); if (v === 'explore') draw(false);
    }),
    T.seg([[0, "o'clock"], [1, 'half past'], [2, 'quarters'], [3, '5 minutes'], [4, 'any minute']], 1, function (v) { lv = v; }), body]));
  K.fit(spot);
  draw(false);
  T.tests['clock-learn'] = function () {
    var f = [], C = [[3, 15, 'quarter past three'], [3, 45, 'quarter to four'], [12, 0, "twelve o'clock"], [11, 55, 'five to twelve'], [3, 7, 'seven minutes past three'], [6, 30, 'half past six'],
      [9, 59, 'one minute to ten'], [12, 20, 'twenty past twelve'], [4, 35, 'twenty-five to five'], [1, 1, 'one minute past one'], [12, 50, 'ten to one']];
    C.forEach(function (c) { if (words(c[0], c[1]) !== c[2]) f.push(c[0] + ':' + c[1] + ' → ' + words(c[0], c[1])); });
    var a = angles(3, 30); if (a.hour !== 105 || a.minute !== 180) f.push('angles');
    if (digital(12, 5) !== '12:05' || digital(0, 0) !== '12:00') f.push('digital');
    hh = 12; mm = 0; shift(-5); if (hh !== 11 || mm !== 55) f.push('shift back ' + hh + ':' + mm); hh = 3; mm = 0; draw(false);
    if (/NaN/.test(face(7, 41, 100))) f.push('svg');
    return Promise.resolve({ ok: !f.length, n: 16, fails: f });
  };
});
