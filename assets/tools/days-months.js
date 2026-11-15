/* Infinity by GroupChatOn — days-months. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Days, months and seasons: today and the week in English and Hindi, months with their days, seasons for both halves of the world and India's six ritus, and a quiz. */
GCOTools.register('days-months', function (spot, T) {
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
  var DAYS = [['Sunday', 'रविवार'], ['Monday', 'सोमवार'], ['Tuesday', 'मंगलवार'], ['Wednesday', 'बुधवार'], ['Thursday', 'गुरुवार'], ['Friday', 'शुक्रवार'], ['Saturday', 'शनिवार']];
  var MONTHS = [['January', 'जनवरी', '⛄'], ['February', 'फ़रवरी', '💝'], ['March', 'मार्च', '🌷'], ['April', 'अप्रैल', '🌦️'], ['May', 'मई', '🌼'], ['June', 'जून', '☀️'], ['July', 'जुलाई', '🌧️'],
    ['August', 'अगस्त', '🌻'], ['September', 'सितंबर', '🍎'], ['October', 'अक्टूबर', '🍂'], ['November', 'नवंबर', '🍁'], ['December', 'दिसंबर', '❄️']];
  var RITU = [['वसंत', 'Vasant', 'spring', 'about mid-March to mid-May', '🌸'], ['ग्रीष्म', 'Grishma', 'summer', 'about mid-May to mid-July', '☀️'], ['वर्षा', 'Varsha', 'monsoon', 'about mid-July to mid-September', '🌧️'],
    ['शरद', 'Sharad', 'autumn', 'about mid-September to mid-November', '🍂'], ['हेमंत', 'Hemant', 'pre-winter', 'about mid-November to mid-January', '🌫️'], ['शिशिर', 'Shishir', 'winter', 'about mid-January to mid-March', '❄️']];
  function daysIn(y, m) { return new Date(y, m, 0).getDate(); }
  function after(d) { var i = DAYS.map(function (x) { return x[0]; }).indexOf(d); return DAYS[(i + 1) % 7][0]; }
  function before(d) { var i = DAYS.map(function (x) { return x[0]; }).indexOf(d); return DAYS[(i + 6) % 7][0]; }
  // meteorological seasons: north Mar–May spring …; south is the other way round
  function season(m, half) { var s = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'][m - 1]; if (half === 'S') s = { winter: 'summer', summer: 'winter', spring: 'autumn', autumn: 'spring' }[s]; return s; }
  var now = new Date(), Y = now.getFullYear(), half = T.store.get('dm-half', 'N');
  var dayBox = h('div', { style: 'display:grid;gap:8px;min-width:0' }), monthBox = h('div', { style: 'display:grid;gap:8px;min-width:0' }), seasonBox = h('div', { style: 'display:grid;gap:12px;min-width:0' });
  function drawDays() {
    var t = now.getDay(); dayBox.innerHTML = '';
    dayBox.appendChild(h('div', { 'class': 'kstage' }, [h('div', { 'class': 'kword', 'data-out': '', text: 'Today is ' + DAYS[t][0] + ' · ' + DAYS[t][1] }),
      h('div', { 'class': 'ksub', text: 'Yesterday was ' + DAYS[(t + 6) % 7][0] + '. Tomorrow will be ' + DAYS[(t + 1) % 7][0] + '.' })]));
    [1, 2, 3, 4, 5, 6, 0].forEach(function (i) {
      var tag = i === t ? ' · today' : i === (t + 6) % 7 ? ' · yesterday' : i === (t + 1) % 7 ? ' · tomorrow' : '';
      var b = h('button', { type: 'button', 'class': 'ktile' + (i === t ? ' is-on' : ''), style: 'grid-template-columns:minmax(0,1fr) auto;justify-items:start;font-size:21px;padding:8px 14px;min-height:52px' }, [h('span', { text: DAYS[i][0] + tag }), h('small', { text: DAYS[i][1] })]);
      b.addEventListener('click', function () { K.say(DAYS[i][0]); }); dayBox.appendChild(b);
    });
    dayBox.appendChild(h('p', { 'class': 'ksub', text: 'Weeks here start on Monday. In many countries Saturday and Sunday are the weekend; some countries rest on Friday instead.' }));
    dayBox.appendChild(T.button('🔊 Say the days', { onclick: function () { K.say(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].join(', ')); } }));
  }
  function drawMonths() {
    monthBox.innerHTML = '';
    var grid = h('div', { 'class': 'kgrid', style: 'grid-template-columns:repeat(auto-fill,minmax(130px,1fr))' });
    MONTHS.forEach(function (m, i) {
      var b = h('button', { type: 'button', 'class': 'ktile' + (i === now.getMonth() ? ' is-on' : ''), style: 'font-size:18px;padding:8px' }, [h('span', { style: 'font-size:28px', text: m[2] }), h('b', { text: (i + 1) + '. ' + m[0] }), h('small', { text: daysIn(Y, i + 1) + ' days · ' + m[1] })]);
      b.addEventListener('click', function () { K.say(m[0] + ' has ' + daysIn(Y, i + 1) + ' days.'); }); grid.appendChild(b);
    });
    monthBox.appendChild(h('div', { 'class': 'kword', 'data-out': '', text: 'This month is ' + MONTHS[now.getMonth()][0] + ' ' + Y }));
    monthBox.appendChild(grid);
    monthBox.appendChild(h('p', { style: 'margin:0', text: 'February has ' + daysIn(Y, 2) + ' days in ' + Y + (daysIn(Y, 2) === 29 ? ' because it is a leap year.' : '. In a leap year (every 4 years, like 2028) it has 29.') }));
    monthBox.appendChild(h('p', { 'class': 'ksub', text: 'Knuckle trick: make two fists. Count the months along your knuckles and the dips between them. Months on a knuckle have 31 days; months in a dip have 30 (or February’s 28 or 29).' }));
    monthBox.appendChild(h('blockquote', { style: 'margin:0;padding:10px 14px;border-left:4px solid var(--accent);background:var(--bg);border-radius:8px', html: 'Thirty days hath September,<br>April, June and November;<br>All the rest have thirty-one,<br>Except February alone,<br>Which has twenty-eight days clear,<br>And twenty-nine in each leap year.<br><small>(traditional rhyme)</small>' }));
  }
  function drawSeasons() {
    seasonBox.innerHTML = '';
    var cur = season(now.getMonth() + 1, half);
    seasonBox.appendChild(T.seg([['N', 'North of the equator'], ['S', 'South of the equator']], half, function (v) { half = v; T.store.set('dm-half', v); drawSeasons(); }));
    seasonBox.appendChild(h('div', { 'class': 'kword', 'data-out': '', text: 'It is ' + cur + ' now (' + (half === 'N' ? 'northern' : 'southern') + ' half of the world)' }));
    var PIC = { spring: '🌷', summer: '☀️', autumn: '🍂', winter: '❄️' }, grid = h('div', { 'class': 'tkv' });
    ['spring', 'summer', 'autumn', 'winter'].forEach(function (s) {
      var ms = MONTHS.filter(function (m, i) { return season(i + 1, half) === s; }).map(function (m) { return m[0]; });
      grid.appendChild(h('div', { style: 'grid-template-columns:44px minmax(0,1fr)' + (s === cur ? ';border-color:var(--accent)' : '') }, [h('span', { style: 'font-size:28px', text: PIC[s] }), h('span', {}, [h('b', { text: s[0].toUpperCase() + s.slice(1) }), ' · ' + ms.join(', ')])]));
    });
    seasonBox.appendChild(grid);
    seasonBox.appendChild(h('b', { text: 'India’s six seasons (ऋतुएँ)' }));
    seasonBox.appendChild(h('div', { 'class': 'tkv' }, RITU.map(function (r) { return h('div', { style: 'grid-template-columns:44px minmax(0,1fr)' }, [h('span', { style: 'font-size:28px', text: r[4] }), h('span', {}, [h('b', { text: r[0] + ' (' + r[1] + ')' }), ' · ' + r[2] + ', ' + r[3]])]); })));
    seasonBox.appendChild(h('p', { 'class': 'ksub', text: 'Near the equator many places have just a wet season and a dry season. The ritu dates follow the Hindu calendar, so they move a little each year.' }));
  }
  var q = K.quiz({ rounds: 10, next: function () {
    var kind = K.rnd(4), d = K.pick(DAYS)[0], m = K.rnd(12), names = DAYS.map(function (x) { return x[0]; });
    if (kind === 0) return { q: ['📅', 'Which day comes after ' + d + '?'], a: after(d), opts: K.choices(after(d), names, 4) };
    if (kind === 1) return { q: ['📅', 'Which day comes before ' + d + '?'], a: before(d), opts: K.choices(before(d), names, 4) };
    if (kind === 2 && m !== 1) return { q: [MONTHS[m][2], 'How many days are there in ' + MONTHS[m][0] + '?'], a: daysIn(2023, m + 1), opts: K.shuffle([28, 30, 31]), why: MONTHS[m][0] + ' has ' + daysIn(2023, m + 1) + ' days.' };
    return { q: ['🗓️', 'Which month comes after ' + MONTHS[m][0] + '?'], a: MONTHS[(m + 1) % 12][0], opts: K.choices(MONTHS[(m + 1) % 12][0], MONTHS.map(function (x) { return x[0]; }), 4) };
  } });
  var body = h('div', { style: 'display:grid;min-width:0' }, [dayBox]);
  spot.appendChild(T.card([T.seg([['days', 'Days'], ['months', 'Months'], ['seasons', 'Seasons'], ['quiz', 'Quiz']], 'days', function (v) {
    q.stop(); body.innerHTML = ''; body.appendChild({ days: dayBox, months: monthBox, seasons: seasonBox, quiz: q.el }[v]);
    if (v === 'days') drawDays(); if (v === 'months') drawMonths(); if (v === 'seasons') drawSeasons(); if (v === 'quiz') q.start();
  }), body]));
  K.fit(spot);
  drawDays();
  T.tests['days-months'] = function () {
    var f = [];
    if (daysIn(2024, 2) !== 29 || daysIn(2023, 2) !== 28 || daysIn(2100, 2) !== 28 || daysIn(2000, 2) !== 29 || daysIn(2025, 9) !== 30 || daysIn(2025, 12) !== 31) f.push('days in month');
    if (after('Sunday') !== 'Monday' || after('Saturday') !== 'Sunday' || before('Monday') !== 'Sunday') f.push('after/before');
    if (season(7, 'N') !== 'summer' || season(7, 'S') !== 'winter' || season(12, 'N') !== 'winter' || season(4, 'S') !== 'autumn') f.push('seasons');
    if (MONTHS.length !== 12 || RITU.length !== 6) f.push('lists');
    return Promise.resolve({ ok: !f.length, n: 14, fails: f });
  };
});
