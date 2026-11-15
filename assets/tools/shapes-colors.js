/* Infinity by GroupChatOn — shapes-colors. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Shapes and colours: 12 shapes with sides and corners, 11 colours with everyday examples, colour mixing and a “tap the blue triangle” game. */
GCOTools.register('shapes-colors', function (spot, T) {
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
  function poly(n, r, rot) { var p = []; for (var k = 0; k < n; k++) { var a = (rot == null ? -90 : rot) * Math.PI / 180 + k * 2 * Math.PI / n; p.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1)); } return p; }
  function star(r1, r2) { var p = []; for (var k = 0; k < 10; k++) { var r = k % 2 ? r2 : r1, a = -Math.PI / 2 + k * Math.PI / 5; p.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1)); } return p; }
  // name, sides, corners, svg body, a thing with this shape, a fact
  var SHAPES = [
    ['circle', 0, 0, '<circle cx="50" cy="50" r="40"/>', '⚽ a ball, 🕐 a clock', 'A circle is perfectly round: every point on its edge is the same distance from the middle.'],
    ['oval', 0, 0, '<ellipse cx="50" cy="50" rx="44" ry="30"/>', '🥚 an egg', 'An oval is like a stretched circle.'],
    ['square', 4, 4, '<rect x="14" y="14" width="72" height="72"/>', '🧇 a waffle, 🪟 a window', 'A square has 4 sides that are all the same length and 4 square corners.'],
    ['rectangle', 4, 4, '<rect x="6" y="24" width="88" height="52"/>', '🚪 a door, 📱 a phone', 'A rectangle has 4 square corners; its opposite sides are the same length.'],
    ['triangle', 3, 3, '<polygon points="' + poly(3, 46, -90).join(' ') + '" transform="translate(0 8)"/>', '🍕 a slice of pizza, ⛺ a tent', 'A triangle has 3 sides and 3 corners. “Tri” means three.'],
    ['diamond', 4, 4, '<polygon points="50,6 86,50 50,94 14,50"/>', '🪁 a kite, ♦️ a playing card', 'A diamond (rhombus) has 4 sides of the same length, standing on one corner.'],
    ['pentagon', 5, 5, '<polygon points="' + poly(5, 44).join(' ') + '"/>', '🏠 the front of a house', 'A pentagon has 5 sides. “Penta” means five.'],
    ['hexagon', 6, 6, '<polygon points="' + poly(6, 44, 0).join(' ') + '"/>', '🐝 a honeycomb cell, 🔩 a nut', 'A hexagon has 6 sides. Bees build their honeycomb from hexagons.'],
    ['octagon', 8, 8, '<polygon points="' + poly(8, 44, 22.5).join(' ') + '"/>', '🛑 a stop sign', 'An octagon has 8 sides, like an octopus has 8 arms.'],
    ['star', 10, 10, '<polygon points="' + star(46, 19).join(' ') + '"/>', '⭐ a star sticker', 'This star has 5 points, 10 sides and 10 corners.'],
    ['heart', 0, 1, '<path d="M50 88 C20 66 6 48 6 32 C6 18 17 8 30 8 C40 8 47 14 50 22 C53 14 60 8 70 8 C83 8 94 18 94 32 C94 48 80 66 50 88 Z"/>', '💌 a valentine card', 'A heart has curved sides and one point at the bottom.'],
    ['semicircle', 1, 2, '<path d="M8 70 A42 42 0 0 1 92 70 Z"/>', '🌈 a rainbow, 🍉 a slice of melon', 'A semicircle is half a circle: one curved side and one straight side.']];
  var COLORS = [['red', '#ef4444', '🍎 🍓 🚒'], ['orange', '#f97316', '🍊 🥕 🦊'], ['yellow', '#facc15', '🍌 🌻 🐤'], ['green', '#22c55e', '🐸 🥦 🌳'], ['blue', '#3b82f6', '🐳 💧 🫐'],
    ['purple', '#a855f7', '🍇 🍆 🔮'], ['pink', '#ec4899', '🌸 🦩 🐷'], ['brown', '#92400e', '🐻 🍫 🪵'], ['black', '#111827', '🎱 🐜 🕷️'], ['white', '#ffffff', '⛄ 🥛 🐑'], ['grey', '#9ca3af', '🐘 🐭 🪨']];
  var MIX = { 'red+yellow': 'orange', 'blue+yellow': 'green', 'blue+red': 'purple', 'red+white': 'pink', 'black+white': 'grey', 'black+orange': 'brown' };
  function mix(a, b) { return MIX[[a, b].sort().join('+')] || null; }
  function hex(name) { return (COLORS.filter(function (c) { return c[0] === name; })[0] || ['', '#888'])[1]; }
  function svg(shape, fill, size) {
    var s = SHAPES.filter(function (x) { return x[0] === shape; })[0];
    return h('span', { 'aria-hidden': 'true', style: 'display:block;line-height:0', html: '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" style="max-width:100%" fill="' + fill + '" stroke="#334155" stroke-width="3" stroke-linejoin="round">' + s[3] + '</svg>' });
  }
  function about(s) { return s[0] === 'circle' || s[0] === 'oval' ? 'No straight sides, no corners' : s[0] === 'heart' ? 'Curved sides and 1 point' : s[0] === 'semicircle' ? '1 curved side, 1 straight side, 2 corners' : s[1] + ' sides · ' + s[2] + ' corners'; }
  var stage = h('div', { 'class': 'kstage' }), grid = h('div', { 'class': 'kgrid', style: 'grid-template-columns:repeat(auto-fill,minmax(84px,1fr))' });
  function showShape(s) {
    stage.innerHTML = ''; stage.appendChild(svg(s[0], '#60a5fa', 150));
    stage.appendChild(h('div', { 'class': 'kword', 'data-out': '', text: s[0] }));
    stage.appendChild(h('div', { 'class': 'ksub', text: about(s) + ' · like ' + s[4] }));
    stage.appendChild(h('p', { style: 'margin:0', text: s[5] })); K.pop(stage.firstChild); K.say('A ' + s[0] + '. ' + s[5]);
  }
  function showColor(c) {
    stage.innerHTML = ''; stage.appendChild(h('div', { style: 'width:120px;height:120px;border-radius:50%;border:3px solid var(--line);background:' + c[1] }));
    stage.appendChild(h('div', { 'class': 'kword', 'data-out': '', text: c[0] })); stage.appendChild(h('div', { 'class': 'kpic', style: 'font-size:44px', text: c[2] }));
    K.pop(stage.firstChild); K.say(c[0] + '!');
  }
  function shapesTab(quiet) {
    grid.innerHTML = '';
    SHAPES.forEach(function (s) { var b = h('button', { type: 'button', 'class': 'ktile', 'aria-label': s[0] }, [svg(s[0], '#93c5fd', 46), h('small', { text: s[0] })]); b.addEventListener('click', function () { showShape(s); K.mark(grid, b); }); grid.appendChild(b); });
    if (quiet) { var keep = K.say; K.say = function () {}; showShape(SHAPES[0]); K.say = keep; } else showShape(SHAPES[0]);
  }
  function colorsTab() {
    grid.innerHTML = '';
    COLORS.forEach(function (c) { var b = h('button', { type: 'button', 'class': 'ktile', 'aria-label': c[0] }, [h('span', { style: 'width:40px;height:40px;border-radius:50%;border:2px solid var(--line);background:' + c[1] }), h('small', { text: c[0] })]); b.addEventListener('click', function () { showColor(c); K.mark(grid, b); }); grid.appendChild(b); });
    showColor(COLORS[0]);
  }
  var mixA = 'red', mixB = 'yellow', mixOut = h('div', { 'class': 'kstage' });
  function mixPick(which) { return T.seg(['red', 'yellow', 'blue', 'white', 'black', 'orange'].map(function (c) { return [c, c]; }), which ? mixB : mixA, function (v) { if (which) mixB = v; else mixA = v; drawMix(); }); }
  function dot(c, s) { return h('span', { style: 'display:inline-block;width:' + s + 'px;height:' + s + 'px;border-radius:50%;border:2px solid var(--line);background:' + c }); }
  function drawMix() {
    var r = mix(mixA, mixB); mixOut.innerHTML = '';
    mixOut.appendChild(h('div', { style: 'display:flex;gap:10px;align-items:center;font-size:32px;font-weight:800' }, [dot(hex(mixA), 56), '+', dot(hex(mixB), 56), '=', dot(r ? hex(r) : 'conic-gradient(' + hex(mixA) + ' 0 50%,' + hex(mixB) + ' 0)', 68)]));
    mixOut.appendChild(h('div', { 'class': 'kword', 'data-out': '', text: mixA === mixB ? 'Same colour: still ' + mixA : r ? mixA + ' + ' + mixB + ' = ' + r : 'Try red, yellow or blue together' }));
    if (r) K.say(mixA + ' and ' + mixB + ' make ' + r);
  }
  var mixBox = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [mixPick(0), mixPick(1), mixOut, h('p', { 'class': 'ksub', text: 'Paints mix like this. Light from a screen mixes differently: red and green light make yellow!' })]);
  function game() {
    var shapes = SHAPES.slice(0, 10), cols = COLORS.slice(0, 7), tgtS = K.pick(shapes)[0], tgtC = K.pick(cols)[0], items = [[tgtS, tgtC]];
    while (items.length < 6) {
      var s = K.pick(shapes)[0], c = K.pick(cols)[0];
      if (items.some(function (x) { return x[0] === s && x[1] === c; })) continue;
      items.push([s, c]);
    }
    return { shape: tgtS, color: tgtC, items: K.shuffle(items) };
  }
  var q = K.quiz({ rounds: 8, label: function (v) { var p = v.split('|'); return svg(p[0], hex(p[1]), 64); }, next: function () {
    var g = game();
    return { q: ['Tap the ' + g.color + ' ' + g.shape], a: g.shape + '|' + g.color, opts: g.items.map(function (x) { return x.join('|'); }), say: function () { K.say('Tap the ' + g.color + ' ' + g.shape); } };
  } });
  var learn = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [stage, grid]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [learn]);
  spot.appendChild(T.card([T.seg([['shapes', 'Shapes'], ['colors', 'Colours'], ['mix', 'Mix'], ['game', 'Game']], 'shapes', function (v) {
    q.stop(); body.innerHTML = '';
    if (v === 'shapes' || v === 'colors') { body.appendChild(learn); if (v === 'shapes') shapesTab(); else colorsTab(); }
    if (v === 'mix') { body.appendChild(mixBox); drawMix(); }
    if (v === 'game') { body.appendChild(q.el); q.start(); }
  }), body]));
  K.fit(spot);
  shapesTab(true);
  T.tests['shapes-colors'] = function () {
    var f = [];
    if (poly(6, 40).length !== 6 || star(40, 20).length !== 10) f.push('points');
    if (mix('yellow', 'blue') !== 'green' || mix('red', 'blue') !== 'purple' || mix('red', 'red') !== null) f.push('mixing');
    for (var k = 0; k < 200; k++) { var g = game(), hits = g.items.filter(function (x) { return x[0] === g.shape && x[1] === g.color; }).length; if (hits !== 1 || g.items.length !== 6) { f.push('game target appears ' + hits); break; } }
    SHAPES.forEach(function (s) { if (s.length !== 6 || /NaN/.test(s[3])) f.push('shape ' + s[0]); });
    return Promise.resolve({ ok: !f.length, n: 205, fails: f });
  };
});
