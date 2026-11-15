/* Infinity by GroupChatOn — count-123. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Counting 1–100: count pictures by tapping them, a “how many?” game, and a 1–100 chart with skip counting. */
GCOTools.register('count-123', function (spot, T) {
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
  var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function words(n) { return n === 100 ? 'one hundred' : n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); }
  function rows(n) { var r = []; while (n > 0) { r.push(Math.min(10, n)); n -= 10; } return r; }
  // picture, plural, singular
  var THINGS = [['🍎', 'apples', 'apple'], ['⭐', 'stars', 'star'], ['🐟', 'fish', 'fish'], ['🎈', 'balloons', 'balloon'], ['🚗', 'cars', 'car'], ['🐤', 'chicks', 'chick'],
    ['🌸', 'flowers', 'flower'], ['🍪', 'cookies', 'cookie'], ['⚽', 'balls', 'ball'], ['🦋', 'butterflies', 'butterfly']];
  var n = 5, thing = THINGS[0], tapped = 0;
  var num = h('div', { 'class': 'kbig', 'data-out': '' }), word = h('div', { 'class': 'kword' }), field = h('div', { style: 'display:grid;gap:4px;justify-items:center' }), tapInfo = h('p', { 'class': 'kscore' });
  function draw(speak) {
    num.textContent = String(n); word.textContent = words(n) + ' ' + (n === 1 ? thing[2] : thing[1]);
    field.innerHTML = ''; tapped = 0; tapInfo.textContent = 'Tap each one to count it';
    rows(n).forEach(function (len) {
      var row = h('div', { style: 'display:flex;flex-wrap:wrap;justify-content:center;gap:2px' });
      for (var k = 0; k < len; k++) {
        var b = h('button', { type: 'button', 'aria-label': 'Count', style: 'font-size:' + (n > 50 ? 20 : n > 20 ? 26 : 34) + 'px;line-height:1.1;padding:2px;border:2px solid transparent;border-radius:10px;background:none;cursor:pointer;min-width:32px;min-height:32px', text: thing[0] });
        b.addEventListener('click', function () {
          if (this.__c) return; this.__c = 1; tapped++; this.style.borderColor = 'var(--accent)'; this.style.background = 'var(--accent-soft)';
          tapInfo.textContent = String(tapped) + (tapped === n ? ' 🎉 All counted!' : ''); K.say(tapped === n ? words(tapped) + '! Well done!' : words(tapped), 'en-US', { rate: 1 });
        });
        row.appendChild(b);
      }
      field.appendChild(row);
    });
    K.pop(num); if (speak) K.say(word.textContent);
  }
  var slider = h('input', { type: 'range', min: '1', max: '100', value: '5', 'aria-label': 'How many', style: 'width:100%' });
  slider.addEventListener('input', function () { n = +slider.value; draw(false); });
  function setN(v) { n = Math.max(1, Math.min(100, v)); slider.value = String(n); draw(true); }
  var count = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [h('div', { 'class': 'kstage' }, [num, word, field, tapInfo]),
    T.row([T.button('−', { onclick: function () { setN(n - 1); } }), T.button('🔊', { primary: true, onclick: function () { K.say(word.textContent); } }), T.button('+', { onclick: function () { setN(n + 1); } }),
      T.button('🎲 New', { onclick: function () { thing = K.pick(THINGS); setN(1 + K.rnd(20)); } })]), T.field('Choose a number (1 to 100)', slider)]);
  var max = 10;
  var q = K.quiz({ rounds: 10, next: function () {
    var c = 1 + K.rnd(max), t = K.pick(THINGS), pool = []; for (var k = Math.max(1, c - 4); k <= c + 4; k++) pool.push(k);
    var box = h('div', { style: 'display:grid;gap:2px;justify-items:center' });
    rows(c).forEach(function (len) { box.appendChild(h('div', { style: 'font-size:' + (c > 20 ? 24 : 32) + 'px;line-height:1.15', text: new Array(len + 1).join(t[0]) })); });
    return { q: [box, 'How many ' + t[1] + '?'], a: c, opts: K.choices(c, pool, 4) };
  } });
  var lvSeg = T.seg([[10, 'Up to 10'], [20, 'Up to 20'], [50, 'Up to 50']], 10, function (v) { max = v; q.start(); });
  var skip = 1, chart = h('div', { style: 'display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:3px' }), sayEl = h('p', { 'class': 'kscore', 'aria-live': 'polite' }), playT = 0;
  function drawChart() {
    chart.innerHTML = '';
    for (var k = 1; k <= 100; k++) (function (k) {
      chart.appendChild(h('button', { type: 'button', 'class': 'ktile' + (k % skip === 0 && skip > 1 ? ' is-on' : ''), style: 'min-height:34px;font-size:15px;padding:2px;border-width:1px;border-radius:8px', text: String(k),
        onclick: function () { sayEl.textContent = k + ' · ' + words(k); K.say(words(k)); } }));
    })(k);
  }
  function countAloud() {
    clearInterval(playT); var k = 0, step = skip;
    playT = setInterval(function () {
      k += step; if (k > 100) { clearInterval(playT); return; }
      Array.prototype.forEach.call(chart.children, function (x, i) { x.style.outline = i + 1 === k ? '3px solid var(--accent)' : ''; });
      sayEl.textContent = String(k); K.say(String(k), 'en-US', { rate: 1.1 });
    }, skip === 1 ? 700 : 950);
  }
  var chartBox = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [T.seg([[1, 'Ones'], [2, 'Twos'], [5, 'Fives'], [10, 'Tens']], 1, function (v) { skip = v; drawChart(); }), chart, sayEl,
    T.row([T.button('▶ Count aloud', { primary: true, onclick: countAloud }), T.button('Stop', { onclick: function () { clearInterval(playT); } })])]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [count]);
  spot.appendChild(T.card([T.seg([['count', 'Count'], ['quiz', 'How many?'], ['chart', '1–100 chart']], 'count', function (v) {
    q.stop(); clearInterval(playT); body.innerHTML = '';
    if (v === 'count') body.appendChild(count);
    if (v === 'quiz') { body.appendChild(h('div', { style: 'display:grid;gap:12px;min-width:0' }, [lvSeg, q.el])); q.start(); }
    if (v === 'chart') { body.appendChild(chartBox); drawChart(); }
  }), body]));
  K.fit(spot);
  draw(false);
  T.tests['count-123'] = function () {
    var f = [];
    [[0, 'zero'], [7, 'seven'], [13, 'thirteen'], [21, 'twenty-one'], [40, 'forty'], [99, 'ninety-nine'], [100, 'one hundred']].forEach(function (c) { if (words(c[0]) !== c[1]) f.push(c[0] + ' → ' + words(c[0])); });
    if (rows(23).join(',') !== '10,10,3' || rows(100).length !== 10) f.push('rows');
    n = 1; thing = THINGS[9]; draw(false); if (word.textContent !== 'one butterfly') f.push('singular ' + word.textContent);
    n = 12; draw(false); if (field.querySelectorAll('button').length !== 12) f.push('12 pictures');
    n = 5; thing = THINGS[0]; draw(false);
    return Promise.resolve({ ok: !f.length, n: 10, fails: f });
  };
});
