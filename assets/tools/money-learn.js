/* Infinity by GroupChatOn — money-learn. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Learn money: the coins and notes of 14 currencies (drawn simply, not copied), make an amount by tapping them, and count a handful of money. */
GCOTools.register('money-learn', function (spot, T) {
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
  // amounts in the smallest unit (cents, paise, fils…); minor = how many make one main unit; sub = the small unit's short name
  var CUR = {
    INR: { coins: [100, 200, 500, 1000, 2000], notes: [1000, 2000, 5000, 10000, 20000, 50000], minor: 100, sub: 'p' },
    USD: { coins: [1, 5, 10, 25], notes: [100, 500, 1000, 2000, 5000, 10000], minor: 100, sub: '¢' },
    EUR: { coins: [1, 2, 5, 10, 20, 50, 100, 200], notes: [500, 1000, 2000, 5000, 10000, 20000], minor: 100, sub: 'c' },
    GBP: { coins: [1, 2, 5, 10, 20, 50, 100, 200], notes: [500, 1000, 2000, 5000], minor: 100, sub: 'p' },
    AED: { coins: [25, 50, 100], notes: [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000], minor: 100, sub: ' fils' },
    SAR: { coins: [25, 50, 100, 200], notes: [500, 1000, 5000, 10000, 50000], minor: 100, sub: ' halala' },
    PKR: { coins: [100, 200, 500, 1000], notes: [1000, 2000, 5000, 10000, 50000, 100000, 500000], minor: 100, sub: 'p' },
    CAD: { coins: [5, 10, 25, 100, 200], notes: [500, 1000, 2000, 5000, 10000], minor: 100, sub: '¢' },
    AUD: { coins: [5, 10, 20, 50, 100, 200], notes: [500, 1000, 2000, 5000, 10000], minor: 100, sub: 'c' },
    NZD: { coins: [10, 20, 50, 100, 200], notes: [500, 1000, 2000, 5000, 10000], minor: 100, sub: 'c' },
    SGD: { coins: [5, 10, 20, 50, 100], notes: [200, 500, 1000, 5000, 10000], minor: 100, sub: '¢' },
    ZAR: { coins: [10, 20, 50, 100, 200, 500], notes: [1000, 2000, 5000, 10000, 20000], minor: 100, sub: 'c' },
    JPY: { coins: [1, 5, 10, 50, 100, 500], notes: [1000, 5000, 10000], minor: 1, sub: '' },
    NGN: { coins: [], notes: [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000], minor: 100, sub: 'k' } };
  var cur = T.currency(); if (!CUR[cur]) cur = 'USD';
  function fmt(v, c) {
    c = c || cur; var m = CUR[c].minor;
    if (v < m && CUR[c].sub) return v + CUR[c].sub;
    try { return new Intl.NumberFormat(c === 'INR' ? 'en-IN' : 'en', { style: 'currency', currency: c, minimumFractionDigits: v % m ? 2 : 0, maximumFractionDigits: v % m ? 2 : 0 }).format(v / m); }
    catch (e) { return c + ' ' + (v / m); }
  }
  // every coin and note as [amount, is it a coin?] (₹10 and ₹20 come as both); all() = the different amounts, smallest first
  function items(c) { var x = CUR[c || cur]; return x.coins.map(function (v) { return [v, 1]; }).concat(x.notes.map(function (v) { return [v, 0]; })); }
  function all(c) { return K.uniq(items(c).map(function (i) { return i[0]; })).sort(function (a, b) { return a - b; }); }
  // the fewest coins and notes for an amount (greedy works for every set here)
  function change(amount, c) { var out = [], d = all(c).slice().sort(function (a, b) { return b - a; }); d.forEach(function (x) { while (amount >= x) { out.push(x); amount -= x; } }); return amount ? null : out; }
  var NOTE_COL = ['#86efac', '#93c5fd', '#fcd34d', '#f9a8d4', '#c4b5fd', '#fdba74', '#5eead4', '#fca5a5'];
  function piece(it, big) {
    var c = CUR[cur], v = it[0], isCoin = it[1], k = isCoin ? c.coins.indexOf(v) : c.coins.length + c.notes.indexOf(v), s = big ? 1.4 : 1;
    if (isCoin) return h('span', { 'aria-hidden': 'true', style: 'display:inline-grid;place-items:center;width:' + (46 + Math.min(k, 6) * 3) * s + 'px;aspect-ratio:1;border-radius:50%;' +
      'background:radial-gradient(circle at 35% 30%,' + (k % 2 ? '#fef9c3,#eab308' : '#f1f5f9,#94a3b8') + ');border:3px solid ' + (k % 2 ? '#a16207' : '#64748b') + ';font:800 ' + 13 * s + 'px var(--ui);color:#1e293b;box-shadow:inset 0 -3px 0 rgba(0,0,0,.15)', text: fmt(v) });
    return h('span', { 'aria-hidden': 'true', style: 'display:inline-grid;place-items:center;width:' + 96 * s + 'px;height:' + 50 * s + 'px;border-radius:8px;background:' + NOTE_COL[(k - c.coins.length) % NOTE_COL.length] +
      ';border:2px solid rgba(0,0,0,.25);font:800 ' + 16 * s + 'px var(--ui);color:#1e293b;box-shadow:inset 0 0 0 4px rgba(255,255,255,.45)', text: fmt(v) });
  }
  var pick = T.select(Object.keys(CUR).map(function (k) { return [k, k + ' · ' + fmt(CUR[k].notes[0], k)]; }), cur);
  var learnBox = h('div', { style: 'display:grid;gap:12px;min-width:0' });
  function drawLearn() {
    learnBox.innerHTML = ''; var c = CUR[cur];
    [['Coins', c.coins, 1], ['Notes', c.notes, 0]].forEach(function (g) {
      if (!g[1].length) return;
      learnBox.appendChild(h('b', { text: g[0] }));
      var row = h('div', { 'class': 'trow', style: 'gap:10px;align-items:center' });
      g[1].forEach(function (v) { var b = h('button', { type: 'button', 'aria-label': fmt(v), style: 'border:0;background:none;padding:2px;cursor:pointer' }, [piece([v, g[2]])]); b.addEventListener('click', function () { K.say(fmt(v)); }); row.appendChild(b); });
      learnBox.appendChild(row);
    });
    learnBox.appendChild(h('p', { 'class': 'ksub', text: 'Simple drawings to learn the values, not pictures of the real money. Tap one to hear it.' }));
  }
  // make the amount: tap coins and notes until the total matches
  var target = 0, tray = [], trayEl = h('div', { 'class': 'trow', style: 'min-height:60px;gap:6px;align-items:center;justify-content:center' }), makeMsg = h('div', { 'class': 'kword', 'data-out': '', 'aria-live': 'polite' }), palette = h('div', { 'class': 'trow', style: 'gap:8px;justify-content:center' });
  function newTarget() {
    var d = all().slice(0, Math.max(3, all().length - 2)), n = 1 + K.rnd(4), t = 0;
    for (var k = 0; k < n; k++) t += K.pick(d);
    target = t; tray = []; drawMake(); K.say('Make ' + fmt(target));
  }
  function total() { return tray.reduce(function (a, b) { return a + b[0]; }, 0); }
  function drawMake() {
    trayEl.innerHTML = '';
    tray.forEach(function (it, i) { var b = h('button', { type: 'button', 'aria-label': 'Take back ' + fmt(it[0]), style: 'border:0;background:none;padding:0;cursor:pointer' }, [piece(it)]); b.addEventListener('click', function () { tray.splice(i, 1); drawMake(); }); trayEl.appendChild(b); });
    if (!tray.length) trayEl.appendChild(h('span', { 'class': 'ksub', text: 'Tap coins and notes below to put them here' }));
    var t = total();
    makeMsg.textContent = 'Make ' + fmt(target) + ' · You have ' + fmt(t);
    if (t === target) { var best = change(target); makeMsg.textContent = K.praise() + ' That is ' + fmt(target) + '.' + (best && best.length < tray.length ? ' Fewest pieces: ' + best.map(function (x) { return fmt(x); }).join(' + ') : ''); K.say('Well done! ' + fmt(target)); }
    else if (t > target) makeMsg.textContent = 'Too much! ' + fmt(t) + ' is more than ' + fmt(target) + '. Tap a piece to take it back.';
  }
  function drawPalette() { palette.innerHTML = ''; items().forEach(function (it) { var b = h('button', { type: 'button', 'aria-label': 'Add ' + fmt(it[0]) + (it[1] ? ' coin' : ' note'), style: 'border:0;background:none;padding:2px;cursor:pointer' }, [piece(it)]); b.addEventListener('click', function () { tray.push(it); drawMake(); }); palette.appendChild(b); }); }
  var makeBox = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [h('div', { 'class': 'kstage' }, [makeMsg, trayEl]), palette, T.row([T.button('New amount', { primary: true, onclick: newTarget }), T.button('Empty', { onclick: function () { tray = []; drawMake(); } })])]);
  var q = K.quiz({ rounds: 8, label: function (v) { return fmt(+v); }, next: function () {
    var d = all(), its = items().slice(0, 8), n = 2 + K.rnd(4), got = [];
    for (var k = 0; k < n; k++) got.push(K.pick(its));
    var t = got.reduce(function (a, b) { return a + b[0]; }, 0), pool = [t + d[0], t - d[0], t + d[1], t - d[1], t + d[2], t * 2, Math.round(t / 2)].filter(function (x) { return x > 0; });
    return { q: [h('div', { 'class': 'trow', style: 'gap:6px;justify-content:center;align-items:center' }, got.map(function (it) { return piece(it); })), 'How much money is this?'], a: t, opts: K.choices(t, pool, 4) };
  } });
  var body = h('div', { style: 'display:grid;min-width:0' }, [learnBox]), tab = 'learn';
  function redraw() { drawLearn(); drawPalette(); if (tab === 'make') newTarget(); if (tab === 'count') q.start(); }
  pick.addEventListener('change', function () { cur = pick.value; redraw(); });
  spot.appendChild(T.card([T.field('Currency', pick), T.seg([['learn', 'Coins and notes'], ['make', 'Make it'], ['count', 'Count it']], 'learn', function (v) {
    tab = v; q.stop(); body.innerHTML = ''; body.appendChild(v === 'learn' ? learnBox : v === 'make' ? makeBox : q.el); if (v === 'make') newTarget(); if (v === 'count') q.start();
  }), body]));
  K.fit(spot);
  drawLearn(); drawPalette();
  T.tests['money-learn'] = function () {
    var f = [], c = change(3700, 'INR');
    if (!c || c.join(',') !== '2000,1000,500,200') f.push('change 37 rupees ' + c);
    if (change(41, 'USD').join(',') !== '25,10,5,1') f.push('change 41 cents');
    if (fmt(25, 'USD') !== '25¢' || fmt(500, 'GBP') !== '£5' || fmt(150, 'EUR') !== '€1.50') f.push('format ' + fmt(25, 'USD') + ' ' + fmt(500, 'GBP') + ' ' + fmt(150, 'EUR'));
    if (fmt(1000, 'JPY') !== '¥1,000') f.push('yen ' + fmt(1000, 'JPY'));
    Object.keys(CUR).forEach(function (k) { ['coins', 'notes'].forEach(function (g) { var a = CUR[k][g]; if (a.slice().sort(function (x, y) { return x - y; }).join() !== a.join()) f.push(k + ' ' + g + ' not in order'); }); });
    if (all('INR').join() !== '100,200,500,1000,2000,5000,10000,20000,50000') f.push('INR amounts ' + all('INR'));
    var keep = cur; cur = 'INR'; newTarget(); if (!(target > 0) || !change(target)) f.push('target ' + target); cur = keep; tray = []; target = 0;
    return Promise.resolve({ ok: !f.length, n: 20, fails: f });
  };
});
