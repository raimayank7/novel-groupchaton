/* Infinity by GroupChatOn — odd-one-out. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Odd one out: four (or five) pictures, one does not belong. Tap it and hear why. Thirteen groups from fruit to musical instruments. */
GCOTools.register('odd-one-out', function (spot, T) {
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
  var G = {
    fruits: ['fruits', '🍎 apple|🍌 banana|🍇 grapes|🍊 orange|🍓 strawberry|🍍 pineapple|🍉 watermelon|🥭 mango|🍐 pear|🍒 cherries'],
    veg: ['vegetables', '🥕 carrot|🥦 broccoli|🌽 corn|🥔 potato|🍆 aubergine|🧅 onion|🫑 pepper|🥒 cucumber|🥬 cabbage|🧄 garlic'],
    animals: ['animals with fur', '🐶 dog|🐱 cat|🐮 cow|🐷 pig|🐴 horse|🐑 sheep|🐘 elephant|🦁 lion|🐒 monkey|🦒 giraffe'],
    birds: ['birds', '🦜 parrot|🦆 duck|🦉 owl|🐧 penguin|🦅 eagle|🦚 peacock|🦢 swan|🐓 rooster|🦩 flamingo|🐦 sparrow'],
    sea: ['sea creatures', '🐙 octopus|🦀 crab|🐳 whale|🐬 dolphin|🦈 shark|🐠 fish|🦑 squid|🦞 lobster|🪼 jellyfish|🐡 pufferfish'],
    vehicles: ['vehicles', '🚗 car|🚌 bus|🚲 bicycle|🚂 train|✈️ aeroplane|🚢 ship|🚁 helicopter|🛵 scooter|🚜 tractor|🚒 fire engine'],
    clothes: ['clothes', '👕 T-shirt|👖 jeans|👗 dress|🧦 socks|🧢 cap|🧣 scarf|🧤 gloves|👟 trainers|🥾 boots|🩳 shorts'],
    weather: ['weather', '☀️ sun|🌧️ rain|❄️ snow|⛈️ storm|🌈 rainbow|☁️ cloud|🌪️ tornado|🌫️ fog'],
    music: ['musical instruments', '🎸 guitar|🎹 piano|🥁 drum|🎺 trumpet|🎻 violin|🪕 banjo|🎷 saxophone|🪘 dholak'],
    sports: ['sports balls', '⚽ football|🏀 basketball|⚾ baseball|🎾 tennis ball|🏐 volleyball|🏈 American football|🎱 pool ball|🏉 rugby ball'],
    sweets: ['sweet treats', '🍰 cake|🍦 ice cream|🍩 doughnut|🍪 cookie|🍫 chocolate|🍬 sweet|🍭 lollipop|🧁 cupcake'],
    school: ['school things', '✏️ pencil|📏 ruler|✂️ scissors|📚 books|🎒 school bag|🖍️ crayon|📐 set square|🖊️ pen'],
    numbers: ['numbers', '1|2|3|4|5|6|7|8|9'], letters: ['letters', 'A|B|C|D|E|F|G|H|K|M|R|T'] };
  // groups that are too alike to mix (every bird and sea creature is an animal too)
  var NOPE = ['animals+birds', 'animals+sea', 'birds+sea', 'fruits+veg', 'fruits+sweets'];
  function items(k) { return G[k][1].split('|').map(function (s) { var p = s.split(' '); return { pic: p[0], name: p.slice(1).join(' ') || p[0] }; }); }
  function round(n) {
    var keys = Object.keys(G), a = K.pick(keys), b;
    do b = K.pick(keys); while (b === a || NOPE.indexOf([a, b].sort().join('+')) >= 0);
    var same = K.shuffle(items(a)).slice(0, n - 1), odd = K.pick(items(b));
    return { all: K.shuffle(same.concat([odd])), odd: odd, group: G[a][0], same: same };
  }
  var n = 4, cur = null;
  var q = K.quiz({ rounds: 10, label: function (v) { return h('span', { style: 'font-size:clamp(40px,12vw,64px);line-height:1.1', text: v }); }, next: function () {
    cur = round(n);
    return { q: ['Which one does not belong?'], a: cur.odd.pic, opts: cur.all.map(function (x) { return x.pic; }),
      why: cur.same.map(function (x) { return x.name; }).join(', ') + (cur.same.length > 1 ? ' are ' : ' is ') + cur.group + '; ' + cur.odd.name + ' is not.' };
  } });
  spot.appendChild(T.card([T.seg([[4, 'Easy (4)'], [5, 'Harder (5)']], 4, function (v) { n = v; q.start(); }), q.el,
    h('p', { 'class': 'ksub', text: 'There can be more than one clever answer! After each turn the tool says which group it was thinking of.' })]));
  K.fit(spot);
  q.start();
  T.tests['odd-one-out'] = function () {
    var f = [];
    for (var k = 0; k < 300; k++) {
      var r = round(k % 2 ? 4 : 5), pics = r.all.map(function (x) { return x.pic; });
      if (K.uniq(pics).length !== pics.length) { f.push('duplicate pictures ' + pics.join(' ')); break; }
      if (pics.indexOf(r.odd.pic) < 0 || r.same.some(function (x) { return x.pic === r.odd.pic; })) { f.push('odd item mixed up'); break; }
    }
    var seen = {}; Object.keys(G).forEach(function (g) { items(g).forEach(function (x) { if (seen[x.pic] && seen[x.pic] !== g) f.push(x.pic + ' in ' + seen[x.pic] + ' and ' + g); seen[x.pic] = g; }); });
    return Promise.resolve({ ok: !f.length, n: 301, fails: f });
  };
});
