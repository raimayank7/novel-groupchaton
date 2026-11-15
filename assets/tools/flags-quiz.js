/* Infinity by GroupChatOn — flags-quiz. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* World flags and capitals: 61 flags drawn as simple pictures (they work on every device), a searchable list and four quiz types by continent. */
GCOTools.register('flags-quiz', function (spot, T) {
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
  // code, country, capital, continent, flag drawing (a 60 × 40 picture: h/v stripes, r rect, c circle, s star, S star outline, w ring, t hoist triangle, x Nordic cross, X saltire, p polygon, m crescent, e emoji, uk, ukc, us, kr)
  var C = [
    ['IN', 'India', 'New Delhi', 'Asia', 'h:#FF9933,#fff,#138808;w:30,20,5,#000080'], ['JP', 'Japan', 'Tokyo', 'Asia', 'r:0,0,60,40,#fff;c:30,20,12,#BC002D'],
    ['BD', 'Bangladesh', 'Dhaka', 'Asia', 'r:0,0,60,40,#006A4E;c:27,20,12,#F42A41'], ['PK', 'Pakistan', 'Islamabad', 'Asia', 'r:0,0,60,40,#01411C;r:0,0,15,40,#fff;m:38,21,10,#fff,3,-3,#01411C,8.5;s:43,15,3.5,#fff'],
    ['CN', 'China', 'Beijing', 'Asia', 'r:0,0,60,40,#DE2910;s:10,10,6,#FFDE00;s:20,4,2,#FFDE00;s:24,8,2,#FFDE00;s:24,14,2,#FFDE00;s:20,18,2,#FFDE00'],
    ['VN', 'Vietnam', 'Hanoi', 'Asia', 'r:0,0,60,40,#DA251D;s:30,20,10,#FFFF00'], ['ID', 'Indonesia', 'Jakarta', 'Asia', 'h:#CE1126,#fff'],
    ['TH', 'Thailand', 'Bangkok', 'Asia', 'h:#A51931,#F4F5F8,#2D2A4A,#2D2A4A,#F4F5F8,#A51931'],
    ['SG', 'Singapore', 'Singapore', 'Asia', 'h:#EF3340,#fff;m:11,10,6,#fff,2.5,0,#EF3340,5.2;s:18,6,1.3,#fff;s:22,9,1.3,#fff;s:20.5,13.5,1.3,#fff;s:15.5,13.5,1.3,#fff;s:14,9,1.3,#fff'],
    ['PH', 'Philippines', 'Manila', 'Asia', 'h:#0038A8,#CE1126;t:#fff,30;c:10,20,4,#FCD116;s:3.5,5,1.6,#FCD116;s:3.5,35,1.6,#FCD116;s:25,20,1.6,#FCD116'],
    ['KR', 'South Korea', 'Seoul', 'Asia', 'kr'], ['TR', 'Turkey', 'Ankara', 'Asia', 'r:0,0,60,40,#E30A17;m:22,20,10,#fff,2.6,0,#E30A17,8;s:33,20,4,#fff'],
    ['AE', 'United Arab Emirates', 'Abu Dhabi', 'Asia', 'h:#00732F,#fff,#000;r:0,0,15,40,#FF0000'], ['LA', 'Laos', 'Vientiane', 'Asia', 'h:#CE1126,#002868,#002868,#CE1126;c:30,20,8,#fff'],
    ['MV', 'Maldives', 'Malé', 'Asia', 'r:0,0,60,40,#D21034;r:10,8,40,24,#007E3A;m:31,20,7,#fff,2.6,0,#007E3A,6'],
    ['EG', 'Egypt', 'Cairo', 'Africa', 'h:#CE1126,#fff,#000;c:30,20,3.5,#C09300'], ['NG', 'Nigeria', 'Abuja', 'Africa', 'v:#008751,#fff,#008751'],
    ['GH', 'Ghana', 'Accra', 'Africa', 'h:#CE1126,#FCD116,#006B3F;s:30,20,6,#000'], ['ET', 'Ethiopia', 'Addis Ababa', 'Africa', 'h:#078930,#FCDD09,#DA121A;c:30,20,9,#0F47AF;S:30,20,6,#FCDD09'],
    ['MA', 'Morocco', 'Rabat', 'Africa', 'r:0,0,60,40,#C1272D;S:30,21,9,#006233'], ['MU', 'Mauritius', 'Port Louis', 'Africa', 'h:#EA2839,#1A206D,#FFD500,#00A551'],
    ['ML', 'Mali', 'Bamako', 'Africa', 'v:#14B53A,#FCD116,#CE1126'], ['GN', 'Guinea', 'Conakry', 'Africa', 'v:#CE1126,#FCD116,#009460'], ['CI', 'Ivory Coast', 'Yamoussoukro', 'Africa', 'v:#F77F00,#fff,#009E60'],
    ['FR', 'France', 'Paris', 'Europe', 'v:#0055A4,#fff,#EF4135'], ['IT', 'Italy', 'Rome', 'Europe', 'v:#009246,#fff,#CE2B37'], ['DE', 'Germany', 'Berlin', 'Europe', 'h:#000,#DD0000,#FFCE00'],
    ['RU', 'Russia', 'Moscow', 'Europe', 'h:#fff,#0039A6,#D52B1E'], ['UA', 'Ukraine', 'Kyiv', 'Europe', 'h:#0057B7,#FFD700'], ['PL', 'Poland', 'Warsaw', 'Europe', 'h:#fff,#DC143C'],
    ['NL', 'Netherlands', 'Amsterdam', 'Europe', 'h:#AE1C28,#fff,#21468B'], ['BE', 'Belgium', 'Brussels', 'Europe', 'v:#000,#FDDA24,#EF3340'], ['IE', 'Ireland', 'Dublin', 'Europe', 'v:#169B62,#fff,#FF883E'],
    ['AT', 'Austria', 'Vienna', 'Europe', 'h:#ED2939,#fff,#ED2939'], ['ES', 'Spain', 'Madrid', 'Europe', 'h:#AA151B,#F1BF00,#F1BF00,#AA151B'],
    ['PT', 'Portugal', 'Lisbon', 'Europe', 'r:0,0,24,40,#006600;r:24,0,36,40,#FF0000;c:24,20,7,#FFCC00'], ['SE', 'Sweden', 'Stockholm', 'Europe', 'r:0,0,60,40,#006AA7;x:#FECC02,6,22'],
    ['NO', 'Norway', 'Oslo', 'Europe', 'r:0,0,60,40,#BA0C2F;x:#fff,9,22;x:#00205B,4,22'], ['DK', 'Denmark', 'Copenhagen', 'Europe', 'r:0,0,60,40,#C8102E;x:#fff,5,21'],
    ['FI', 'Finland', 'Helsinki', 'Europe', 'r:0,0,60,40,#fff;x:#002F6C,9,22'], ['IS', 'Iceland', 'Reykjavík', 'Europe', 'r:0,0,60,40,#02529C;x:#fff,9,22;x:#DC1E35,4,22'],
    ['CH', 'Switzerland', 'Bern', 'Europe', 'r:0,0,60,40,#DA291C;r:26,9,8,22,#fff;r:19,16,22,8,#fff'], ['GB', 'United Kingdom', 'London', 'Europe', 'uk'],
    ['GR', 'Greece', 'Athens', 'Europe', 'h:#0D5EAF,#fff,#0D5EAF,#fff,#0D5EAF,#fff,#0D5EAF,#fff,#0D5EAF;r:0,0,22.2,22.2,#0D5EAF;r:8.9,0,4.4,22.2,#fff;r:0,8.9,22.2,4.4,#fff'],
    ['HU', 'Hungary', 'Budapest', 'Europe', 'h:#CD2A3E,#fff,#436F4D'], ['RO', 'Romania', 'Bucharest', 'Europe', 'v:#002B7F,#FCD116,#CE1126'],
    ['CZ', 'Czechia', 'Prague', 'Europe', 'h:#fff,#D7141A;t:#11457E,30'], ['EE', 'Estonia', 'Tallinn', 'Europe', 'h:#0072CE,#000,#fff'], ['LT', 'Lithuania', 'Vilnius', 'Europe', 'h:#FDB913,#006A44,#C1272D'],
    ['US', 'United States', 'Washington, D.C.', 'Americas', 'us'], ['CA', 'Canada', 'Ottawa', 'Americas', 'r:0,0,60,40,#fff;r:0,0,15,40,#D80621;r:45,0,15,40,#D80621;e:🍁,30,20,17'],
    ['MX', 'Mexico', 'Mexico City', 'Americas', 'v:#006847,#fff,#CE1126;e:🦅,30,20,9'], ['BR', 'Brazil', 'Brasília', 'Americas', 'r:0,0,60,40,#009C3B;p:30 4 56 20 30 36 4 20,#FFDF00;c:30,20,8,#002776'],
    ['AR', 'Argentina', 'Buenos Aires', 'Americas', 'h:#74ACDF,#fff,#74ACDF;c:30,20,4,#F6B40E'], ['CL', 'Chile', 'Santiago', 'Americas', 'h:#fff,#D52B1E;r:0,0,20,20,#0039A6;s:10,10,4,#fff'],
    ['CO', 'Colombia', 'Bogotá', 'Americas', 'h:#FCD116,#FCD116,#003893,#CE1126'], ['PE', 'Peru', 'Lima', 'Americas', 'v:#D91023,#fff,#D91023'],
    ['CU', 'Cuba', 'Havana', 'Americas', 'h:#002A8F,#fff,#002A8F,#fff,#002A8F;t:#CF142B,26;s:9,20,4,#fff'],
    ['JM', 'Jamaica', 'Kingston', 'Americas', 'r:0,0,60,40,#009B3A;p:0 0 30 20 0 40,#000;p:60 0 30 20 60 40,#000;X:#FED100,5'],
    ['AU', 'Australia', 'Canberra', 'Oceania', 'r:0,0,60,40,#012169;ukc;s:15,30,4,#fff;s:45,33,2,#fff;s:45,8,2,#fff;s:39,17,2,#fff;s:51,15,2,#fff'],
    ['NZ', 'New Zealand', 'Wellington', 'Oceania', 'r:0,0,60,40,#012169;ukc;s:45,33,2.6,#CC142B;s:45,9,2.4,#CC142B;s:39,18,2.2,#CC142B;s:51,16,2.4,#CC142B']
  ].map(function (r) { return { code: r[0], name: r[1], capital: r[2], cont: r[3], spec: r[4] }; });
  function starPts(cx, cy, r) { var p = []; for (var k = 0; k < 10; k++) { var rr = k % 2 ? r * 0.4 : r, a = -Math.PI / 2 + k * Math.PI / 5; p.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2)); } return p.join(' '); }
  var UK = '<rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" stroke-width="2.6"/>' +
    '<path d="M30 0V40M0 20H60" stroke="#fff" stroke-width="12"/><path d="M30 0V40M0 20H60" stroke="#C8102E" stroke-width="7"/>';
  function draw(spec) {
    var out = '';
    spec.split(';').forEach(function (cmd) {
      var i = cmd.indexOf(':'), k = i < 0 ? cmd : cmd.slice(0, i), a = i < 0 ? [] : cmd.slice(i + 1).split(','), n = a.map(Number);
      if (k === 'h' || k === 'v') a.forEach(function (col, j) { var s = (k === 'h' ? 40 : 60) / a.length; out += k === 'h' ? '<rect x="0" y="' + (j * s).toFixed(2) + '" width="60" height="' + (s + 0.1).toFixed(2) + '" fill="' + col + '"/>' : '<rect x="' + (j * s).toFixed(2) + '" y="0" width="' + (s + 0.1).toFixed(2) + '" height="40" fill="' + col + '"/>'; });
      if (k === 'r') out += '<rect x="' + n[0] + '" y="' + n[1] + '" width="' + n[2] + '" height="' + n[3] + '" fill="' + a[4] + '"/>';
      if (k === 'c') out += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + n[2] + '" fill="' + a[3] + '"/>';
      if (k === 'w') out += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + n[2] + '" fill="none" stroke="' + a[3] + '" stroke-width="1"/><circle cx="' + n[0] + '" cy="' + n[1] + '" r="0.9" fill="' + a[3] + '"/>' +
        Array.apply(null, Array(12)).map(function (x, j) { var g = j * Math.PI / 6; return '<line x1="' + n[0] + '" y1="' + n[1] + '" x2="' + (n[0] + n[2] * Math.cos(g)).toFixed(2) + '" y2="' + (n[1] + n[2] * Math.sin(g)).toFixed(2) + '" stroke="' + a[3] + '" stroke-width=".4"/>'; }).join('');
      if (k === 's') out += '<polygon points="' + starPts(n[0], n[1], n[2]) + '" fill="' + a[3] + '"/>';
      if (k === 'S') out += '<polygon points="' + starPts(n[0], n[1], n[2]).split(' ').filter(function (x, j) { return j % 2 === 0; }).map(function (x, j, arr) { return arr[(j * 2) % 5]; }).join(' ') + '" fill="none" stroke="' + a[3] + '" stroke-width="1.6"/>';
      if (k === 't') out += '<polygon points="0,0 ' + n[1] + ',20 0,40" fill="' + a[0] + '"/>';
      if (k === 'x') out += '<rect x="' + (n[2] - n[1] / 2) + '" y="0" width="' + n[1] + '" height="40" fill="' + a[0] + '"/><rect x="0" y="' + (20 - n[1] / 2) + '" width="60" height="' + n[1] + '" fill="' + a[0] + '"/>';
      if (k === 'X') out += '<path d="M0 0L60 40M60 0L0 40" stroke="' + a[0] + '" stroke-width="' + n[1] + '"/>';
      if (k === 'p') out += '<polygon points="' + a[0] + '" fill="' + a[1] + '"/>';
      if (k === 'm') out += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + n[2] + '" fill="' + a[3] + '"/><circle cx="' + (n[0] + n[4]) + '" cy="' + (n[1] + n[5]) + '" r="' + n[7] + '" fill="' + a[6] + '"/>';
      if (k === 'e') out += '<text x="' + n[1] + '" y="' + (n[2] + n[3] * 0.36) + '" font-size="' + n[3] + '" text-anchor="middle">' + a[0] + '</text>';
      if (k === 'uk') out += UK;
      if (k === 'ukc') out += '<svg x="0" y="0" width="30" height="20" viewBox="0 0 60 40">' + UK + '</svg>';
      if (k === 'us') { for (var j = 0; j < 13; j++) out += '<rect x="0" y="' + (j * 40 / 13).toFixed(2) + '" width="60" height="' + (40 / 13 + 0.05).toFixed(2) + '" fill="' + (j % 2 ? '#fff' : '#B22234') + '"/>'; out += '<rect width="24" height="21.5" fill="#3C3B6E"/>'; for (var y = 0; y < 9; y++) for (var x = 0; x < (y % 2 ? 5 : 6); x++) out += '<circle cx="' + (2 + x * 4 + (y % 2 ? 2 : 0)) + '" cy="' + (1.8 + y * 2.25).toFixed(2) + '" r=".75" fill="#fff"/>'; }
      if (k === 'kr') out += '<rect width="60" height="40" fill="#fff"/><path d="M20 20a10 10 0 0 1 20 0a5 5 0 0 1 -10 0a5 5 0 0 0 -10 0z" fill="#CD2E3A" transform="rotate(34 30 20)"/><path d="M40 20a10 10 0 0 1 -20 0a5 5 0 0 1 10 0a5 5 0 0 0 10 0z" fill="#0047A0" transform="rotate(34 30 20)"/>' +
        [[10, 7, 34], [50, 33, 34], [50, 7, -34], [10, 33, -34]].map(function (g) { return '<g transform="rotate(' + g[2] + ' ' + g[0] + ' ' + g[1] + ')" fill="#000"><rect x="' + (g[0] - 5) + '" y="' + (g[1] - 3.6) + '" width="10" height="1.6"/><rect x="' + (g[0] - 5) + '" y="' + (g[1] - 0.8) + '" width="10" height="1.6"/><rect x="' + (g[0] - 5) + '" y="' + (g[1] + 2) + '" width="10" height="1.6"/></g>'; }).join('');
    });
    return out;
  }
  function flag(c, w) { return h('span', { 'aria-hidden': 'true', style: 'display:block;line-height:0', html: '<svg viewBox="0 0 60 40" width="' + w + '" style="max-width:100%;height:auto;border-radius:4px;box-shadow:0 0 0 1px rgba(0,0,0,.18)">' + draw(c.spec) + '</svg>' }); }
  function byCode(code) { return C.filter(function (c) { return c.code === code; })[0]; }
  var cont = 'all', mode = 'flag';
  function pool() { return C.filter(function (c) { return cont === 'all' || c.cont === cont; }); }
  var q = K.quiz({ rounds: 10, label: function (v) { return mode === 'pickflag' ? flag(byCode(v), 92) : v; }, next: function () {
    var p = pool(), c = K.pick(p), names = p.map(function (x) { return x.name; });
    if (mode === 'flag') return { q: [flag(c, 200), 'Which country has this flag?'], a: c.name, opts: K.choices(c.name, names, 4), why: 'Capital: ' + c.capital + '.' };
    if (mode === 'capital') return { q: [flag(c, 110), 'What is the capital of ' + c.name + '?'], a: c.capital, opts: K.choices(c.capital, p.map(function (x) { return x.capital; }), 4) };
    if (mode === 'country') return { q: ['🏙️ ' + c.capital, 'is the capital of which country?'], a: c.name, opts: K.choices(c.name, names, 4) };
    return { q: ['Find the flag of ' + c.name], a: c.code, opts: K.choices(c.code, p.map(function (x) { return x.code; }), 4) };
  } });
  var search = h('input', { type: 'search', placeholder: 'Search a country or capital', 'aria-label': 'Search' }), list = h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px' }), count = h('p', { 'class': 'ksub', 'data-out': '' });
  function drawList() {
    var s = search.value.trim().toLowerCase(), shown = pool().filter(function (c) { return !s || (c.name + ' ' + c.capital).toLowerCase().indexOf(s) >= 0; });
    list.innerHTML = '';
    shown.forEach(function (c) { var b = h('button', { type: 'button', 'class': 'ktile', style: 'font-size:15px;padding:8px;gap:4px', 'aria-label': c.name }, [flag(c, 96), h('b', { text: c.name }), h('small', { text: c.capital })]); b.addEventListener('click', function () { K.say(c.name + '. The capital is ' + c.capital + '.'); }); list.appendChild(b); });
    count.textContent = shown.length + ' countries. Flags are simplified drawings.';
  }
  search.addEventListener('input', drawList);
  var learn = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [search, count, list]);
  var quiz = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [T.seg([['flag', 'Flag → country'], ['pickflag', 'Country → flag'], ['capital', 'Capitals'], ['country', 'Capital → country']], 'flag', function (v) { mode = v; q.start(); }), q.el]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [quiz]), tab = 'quiz';
  spot.appendChild(T.card([
    T.seg([['all', 'World'], ['Asia', 'Asia'], ['Europe', 'Europe'], ['Africa', 'Africa'], ['Americas', 'Americas'], ['Oceania', 'Oceania']], 'all', function (v) { cont = v; if (tab === 'quiz') q.start(); else drawList(); }),
    T.seg([['quiz', 'Quiz'], ['learn', 'All flags']], 'quiz', function (v) { tab = v; q.stop(); body.innerHTML = ''; body.appendChild(v === 'quiz' ? quiz : learn); if (v === 'quiz') q.start(); else drawList(); }), body]));
  K.fit(spot);
  q.start();
  T.tests['flags-quiz'] = function () {
    var f = [];
    if (C.length < 60) f.push('only ' + C.length);
    if (K.uniq(C.map(function (c) { return c.code; })).length !== C.length || K.uniq(C.map(function (c) { return c.name; })).length !== C.length) f.push('duplicates');
    C.forEach(function (c) { var s = draw(c.spec); if (!s || /NaN|undefined/.test(s)) f.push('flag ' + c.code); if (!c.capital) f.push('capital ' + c.code); });
    var ops = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania']; C.forEach(function (c) { if (ops.indexOf(c.cont) < 0) f.push('continent ' + c.code); });
    if (byCode('IN').capital !== 'New Delhi' || byCode('AU').capital !== 'Canberra' || byCode('BR').capital !== 'Brasília') f.push('capitals');
    return Promise.resolve({ ok: !f.length, n: C.length * 3 + 2, fails: f });
  };
});
