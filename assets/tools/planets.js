/* Infinity by GroupChatOn — planets. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Solar system explorer: planets going round the Sun (not to scale), facts for each, your weight on other worlds and how long sunlight takes to arrive. */
GCOTools.register('planets', function (spot, T) {
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
  // name, colour, size on screen, distance from the Sun (million km), diameter (km), day length, year length (Earth days), gravity (m/s²), moons, type, fact
  var P = [
    ['Mercury', '#9ca3af', 4, 57.9, 4879, '59 Earth days', 88, 3.7, 'no moons', 'rocky', 'The smallest planet and the closest to the Sun. It has almost no air.'],
    ['Venus', '#fbbf24', 6, 108.2, 12104, '243 Earth days', 225, 8.87, 'no moons', 'rocky', 'The hottest planet: its thick clouds trap heat. It spins the opposite way to most planets.'],
    ['Earth', '#3b82f6', 6.5, 149.6, 12756, '24 hours', 365.25, 9.81, '1 moon', 'rocky', 'Our home: the only planet known to have life and liquid water on its surface.'],
    ['Mars', '#ef4444', 5, 227.9, 6792, '24 hours 37 minutes', 687, 3.71, '2 small moons', 'rocky', 'The Red Planet. Its red colour comes from rusty dust. It has the tallest volcano in the solar system.'],
    ['Jupiter', '#d97706', 13, 778.5, 142984, '10 hours', 4333, 24.79, 'more than 90 moons', 'gas giant', 'The biggest planet: more than 1,000 Earths could fit inside. Its Great Red Spot is a giant storm.'],
    ['Saturn', '#eab308', 11, 1432, 120536, '10 hours 40 minutes', 10759, 10.44, 'more than 270 moons', 'gas giant', 'Famous for its wide, bright rings made of ice and rock.'],
    ['Uranus', '#22d3ee', 8.5, 2867, 51118, '17 hours', 30687, 8.69, '28 known moons', 'ice giant', 'It spins on its side, rolling around the Sun like a ball.'],
    ['Neptune', '#6366f1', 8.5, 4515, 49528, '16 hours', 60190, 11.15, '16 known moons', 'ice giant', 'The farthest planet from the Sun, with the fastest winds in the solar system.']];
  var EXTRA = [['Moon', 1.62], ['Sun', 274], ['Pluto (dwarf planet)', 0.62]];
  function lightMinutes(mkm) { return mkm * 1e6 / 299792.458 / 60; }
  function weight(kg, g) { return kg * g / 9.81; }
  function years(days) { return days < 1000 ? Math.round(days) + ' Earth days' : (days / 365.25).toFixed(1).replace(/\.0$/, '') + ' Earth years'; }
  var S = 420, cv = h('canvas', { width: String(S), height: String(S), style: 'display:block;width:min(100%,420px);height:auto;aspect-ratio:1;margin:0 auto;border-radius:18px;background:#0b1026;cursor:pointer', 'aria-label': 'Planets going round the Sun. Tap a planet.' });
  var g = cv.getContext('2d'), ang = P.map(function (p, i) { return i * 0.8; }), last = 0, sel = 2, raf = 0, paused = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STARS = []; for (var k = 0; k < 70; k++) STARS.push([K.rnd(S), K.rnd(S), K.rnd(3) ? 0.6 : 1.2]);
  function orbit(i) { return 34 + i * 22; }
  function pos(i) { return [S / 2 + orbit(i) * Math.cos(ang[i]), S / 2 + orbit(i) * Math.sin(ang[i])]; }
  function paint() {
    g.fillStyle = '#0b1026'; g.fillRect(0, 0, S, S);
    g.fillStyle = '#fff'; STARS.forEach(function (s) { g.globalAlpha = 0.6; g.fillRect(s[0], s[1], s[2], s[2]); }); g.globalAlpha = 1;
    var sun = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, 20); sun.addColorStop(0, '#fff7ae'); sun.addColorStop(1, '#f59e0b');
    g.fillStyle = sun; g.beginPath(); g.arc(S / 2, S / 2, 18, 0, 7); g.fill();
    P.forEach(function (p, i) {
      g.strokeStyle = i === sel ? 'rgba(250,204,21,.7)' : 'rgba(255,255,255,.16)'; g.lineWidth = i === sel ? 2 : 1; g.beginPath(); g.arc(S / 2, S / 2, orbit(i), 0, 7); g.stroke();
      var q = pos(i); g.fillStyle = p[1]; g.beginPath(); g.arc(q[0], q[1], p[2] * 0.85, 0, 7); g.fill();
      if (p[0] === 'Saturn') { g.strokeStyle = '#fde68a'; g.lineWidth = 2; g.beginPath(); g.ellipse(q[0], q[1], p[2] * 1.6, p[2] * 0.55, -0.4, 0, 7); g.stroke(); }
      if (i === sel) { g.fillStyle = '#fff'; g.font = 'bold 13px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(p[0], q[0], q[1] - p[2] - 6); }
    });
  }
  function tick(t) {
    if (!cv.isConnected) return;
    var dt = last ? Math.min(0.1, (t - last) / 1000) : 0; last = t;
    if (!paused && !document.hidden) P.forEach(function (p, i) { ang[i] += dt * 2 * Math.PI / (p[6] / 365.25 * 8); });
    paint(); raf = requestAnimationFrame(tick);
  }
  cv.addEventListener('click', function (e) {
    var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * S / r.width, y = (e.clientY - r.top) * S / r.height, best = -1, bd = 1e9;
    P.forEach(function (p, i) { var q = pos(i), d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = i; } });
    if (bd < 26) show(best, true);
  });
  var info = h('div', { 'class': 'kstage' }), tiles = h('div', { 'class': 'kgrid', style: 'grid-template-columns:repeat(auto-fill,minmax(78px,1fr))' });
  P.forEach(function (p, i) { tiles.appendChild(K.tile('●', p[0], function () { show(i, true); }, p[0])); tiles.lastChild.firstChild.style.color = p[1]; });
  function show(i, speak) {
    sel = i; var p = P[i]; info.innerHTML = '';
    info.appendChild(h('div', { 'class': 'kword', 'data-out': '', text: p[0] + ' · a ' + p[9] + ' planet' }));
    info.appendChild(h('p', { style: 'margin:0', text: p[10] }));
    info.appendChild(h('div', { 'class': 'tkv', style: 'width:100%;text-align:left' }, [['From the Sun', T.num(p[3], 1) + ' million km'], ['Sunlight takes', lightMinutes(p[3]).toFixed(1) + ' minutes to get there'],
      ['Size across', T.num(p[4], 0) + ' km'], ['One day (spin)', p[5]], ['One year (trip round the Sun)', years(p[6])], ['Moons', p[8]]].map(function (r) {
      return h('div', { style: 'grid-template-columns:minmax(0,130px) minmax(0,1fr)' }, [h('span', { text: r[0] }), h('b', { text: r[1] })]); })));
    K.mark(tiles, tiles.children[i]); if (reduce) paint();
    if (speak) K.say(p[0] + '. ' + p[10]);
  }
  var kg = h('input', { type: 'number', min: '1', max: '500', value: String(T.store.get('pl-kg', 30)), 'aria-label': 'Your weight in kilograms' }), wOut = h('div', { 'class': 'tkv', 'data-out': '' });
  function drawW() {
    var w = Math.max(0, +kg.value || 0); T.store.set('pl-kg', w); wOut.innerHTML = '';
    P.map(function (p) { return [p[0], p[7]]; }).concat(EXTRA).forEach(function (r) { wOut.appendChild(h('div', { style: 'grid-template-columns:minmax(0,1fr) auto' }, [h('span', { text: r[0] }), h('b', { text: T.num(weight(w, r[1]), 1) + ' kg' })])); });
  }
  kg.addEventListener('input', drawW);
  var weightBox = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [T.field('Your weight on Earth (kg)', kg), wOut, h('p', { 'class': 'ksub', text: 'Your body stays the same; only the pull of gravity changes. Scientists call this your weight, and your mass stays the same everywhere.' })]);
  var QS = [['Which planet is the biggest?', 'Jupiter'], ['Which planet is closest to the Sun?', 'Mercury'], ['Which planet is famous for its rings?', 'Saturn'], ['Which planet is called the Red Planet?', 'Mars'],
    ['Which planet do we live on?', 'Earth'], ['Which planet is the hottest?', 'Venus'], ['Which planet is farthest from the Sun?', 'Neptune'], ['Which planet spins on its side?', 'Uranus'],
    ['Which planet is the smallest?', 'Mercury'], ['Which planet has the Great Red Spot?', 'Jupiter']];
  var q = K.quiz({ rounds: 6, next: function () { var x = K.pick(QS); return { q: ['🪐', x[0]], a: x[1], opts: K.choices(x[1], P.map(function (p) { return p[0]; }), 4) }; } });
  var explore = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [cv, T.row([T.button('⏯ Pause', { small: true, onclick: function () { paused = !paused; } }), h('span', { 'class': 'ksub', text: 'Not to scale: the real distances are far bigger.' })]), tiles, info]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [explore]);
  spot.appendChild(T.card([T.seg([['explore', 'Explore'], ['weight', 'My weight'], ['quiz', 'Quiz']], 'explore', function (v) { q.stop(); body.innerHTML = ''; body.appendChild(v === 'explore' ? explore : v === 'weight' ? weightBox : q.el); if (v === 'quiz') q.start(); if (v === 'explore' && !reduce) { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(tick); } }), body]));
  K.fit(spot);
  show(2, false); drawW(); paint(); if (!reduce) raf = requestAnimationFrame(tick);
  T.tests['planets'] = function () {
    var f = [], e = lightMinutes(149.6);
    if (Math.abs(e - 8.32) > 0.05) f.push('light to Earth ' + e);
    if (Math.abs(weight(30, 1.62) - 4.95) > 0.02) f.push('moon weight ' + weight(30, 1.62));
    if (years(687) !== '687 Earth days' || years(4333) !== '11.9 Earth years') f.push('years ' + years(4333));
    for (var i = 1; i < P.length; i++) if (P[i][3] <= P[i - 1][3]) f.push('order ' + P[i][0]);
    if (P.reduce(function (a, p) { return p[4] > a[4] ? p : a; })[0] !== 'Jupiter') f.push('biggest');
    return Promise.resolve({ ok: !f.length, n: 11, fails: f });
  };
});
