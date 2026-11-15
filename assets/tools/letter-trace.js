/* Infinity by GroupChatOn — letter-trace. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Letter tracing: write over a dotted letter with a finger or mouse, then get stars for how well it is covered. A–Z, a–z, Hindi and Gurmukhi. */
GCOTools.register('letter-trace', function (spot, T) {
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
  /* a tracing pad: a faint dotted letter to write over with a finger, stylus or mouse.
     score() compares the ink with the letter's shape: how much of the letter is covered, and how much ink stayed near it */
  function tracer(label) {
    var S = 400, cv = h('canvas', { width: String(S), height: String(S), 'class': 'kcanvas', 'aria-label': label }), g = cv.getContext('2d');
    function layer() { var c = document.createElement('canvas'); c.width = c.height = S; return c; }
    var shape = layer(), near = layer(), ink = layer(), ch = '', pos = null, color = '#2563eb', last = null, anim = 0;
    var FONT = 'system-ui, "Segoe UI", "Nirmala UI", "Noto Sans", sans-serif';
    function place(x) {   // the biggest size that fits, centred on the glyph's real ink box
      var size = 330, m;
      x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      for (; size > 40; size -= 10) {
        x.font = '700 ' + size + 'px ' + FONT; m = x.measureText(ch);
        if ((m.actualBoundingBoxLeft + m.actualBoundingBoxRight) <= S * 0.74 && (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) <= S * 0.74) break;
      }
      return { size: size, x: S / 2 + (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2, y: S / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 };
    }
    function set(c) {
      ch = c;
      [shape, near].forEach(function (cnv, k) {
        var x = cnv.getContext('2d'); x.clearRect(0, 0, S, S); pos = place(x);
        x.fillStyle = x.strokeStyle = '#000'; x.fillText(ch, pos.x, pos.y);
        if (k) { x.lineWidth = 40; x.lineJoin = 'round'; x.strokeText(ch, pos.x, pos.y); }
      });
      clear();
    }
    function draw() {
      g.setLineDash([]); g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
      g.strokeStyle = '#e2e8f0'; g.lineWidth = 2;
      [0.18, 0.82].forEach(function (f) { g.beginPath(); g.moveTo(14, S * f); g.lineTo(S - 14, S * f); g.stroke(); });
      g.globalAlpha = 0.13; g.drawImage(shape, 0, 0); g.globalAlpha = 1;
      if (pos) {
        g.font = '700 ' + pos.size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.setLineDash([9, 9]); g.strokeStyle = '#94a3b8'; g.lineWidth = 3; g.strokeText(ch, pos.x, pos.y); g.setLineDash([]);
      }
      g.drawImage(ink, 0, 0);
    }
    function clear() { cancelAnimationFrame(anim); ink.getContext('2d').clearRect(0, 0, S, S); draw(); }
    function pt(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * S / r.width, (e.clientY - r.top) * S / r.height]; }
    function line(a, b) {
      var x = ink.getContext('2d'); x.strokeStyle = color; x.lineWidth = 26; x.lineCap = x.lineJoin = 'round';
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0] + 0.01, b[1]); x.stroke(); draw();
    }
    cv.addEventListener('pointerdown', function (e) { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) {} last = pt(e); line(last, last); });
    cv.addEventListener('pointermove', function (e) { if (!last) return; e.preventDefault(); var p = pt(e); line(last, p); last = p; });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { cv.addEventListener(ev, function () { last = null; }); });
    function score() {
      var a = shape.getContext('2d').getImageData(0, 0, S, S).data, b = near.getContext('2d').getImageData(0, 0, S, S).data, c = ink.getContext('2d').getImageData(0, 0, S, S).data;
      var G = 0, hit = 0, inkN = 0, out = 0;
      for (var i = 3; i < a.length; i += 12) {   // every third pixel is plenty
        var s = a[i] > 100, k = c[i] > 40;
        if (s) { G++; if (k) hit++; }
        if (k) { inkN++; if (b[i] < 60) out++; }
      }
      var cover = G ? hit / G : 0, neat = inkN ? 1 - out / inkN : 0;
      return { cover: cover, neat: neat, empty: !inkN, stars: cover >= 0.7 && neat >= 0.8 ? 3 : cover >= 0.45 && neat >= 0.65 ? 2 : cover >= 0.2 && neat >= 0.5 ? 1 : 0 };
    }
    // "show me": the letter fills in with colour from left to right (instantly when asked, or for people who prefer less motion)
    function demo(now) {
      cancelAnimationFrame(anim);
      var x = ink.getContext('2d'), t0 = performance.now(), reduce = now || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
      function paint(f) {
        x.clearRect(0, 0, S, S); x.save(); x.beginPath(); x.rect(0, 0, S * f, S); x.clip();
        x.drawImage(shape, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, S, S); x.restore(); draw();
      }
      if (reduce) return paint(1);
      (function step(t) { var f = Math.min(1, (t - t0) / 1100); paint(f); if (f < 1) anim = requestAnimationFrame(step); })(t0);
    }
    return { el: cv, set: set, clear: clear, score: score, demo: demo, line: line, color: function (c) { color = c; }, png: function () { return cv; } };
  }
  function swatches(onPick) {
    var COLS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0f172a'], box = h('div', { 'class': 'trow', role: 'group', 'aria-label': 'Pen colour' });
    COLS.forEach(function (c, i) {
      var b = h('button', { type: 'button', 'class': 'kswatch', style: 'background:' + c, 'aria-label': 'Colour ' + (i + 1), 'aria-pressed': String(!i) });
      b.addEventListener('click', function () { Array.prototype.forEach.call(box.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); onPick(c); });
      box.appendChild(b);
    });
    return box;
  }
  var SETS = {
    up: { list: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), lang: 'en-US' },
    low: { list: 'abcdefghijklmnopqrstuvwxyz'.split(''), lang: 'en-US' },
    hi: { list: 'अ आ इ ई उ ऊ ए ऐ ओ औ क ख ग घ च छ ज झ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह'.split(' '), lang: 'hi-IN' },
    pa: { list: 'ੳ ਅ ੲ ਸ ਹ ਕ ਖ ਗ ਘ ਙ ਚ ਛ ਜ ਝ ਞ ਟ ਠ ਡ ਢ ਣ ਤ ਥ ਦ ਧ ਨ ਪ ਫ ਬ ਭ ਮ ਯ ਰ ਲ ਵ ੜ'.split(' '), lang: 'pa-IN' } };
  var set = 'up', i = 0, pad = tracer('Tracing pad: write over the dotted letter');
  var label = h('div', { 'class': 'kword', 'data-out': '' }), result = h('p', { 'class': 'kscore', 'aria-live': 'polite' }), grid = h('div', { 'class': 'kgrid' });
  function cur() { return SETS[set].list[i]; }
  function tiles() { grid.innerHTML = ''; SETS[set].list.forEach(function (c, k) { grid.appendChild(K.tile(c, '', function () { go(k, true); }, 'Trace ' + c)); }); }
  function go(k, speak) {
    var n = SETS[set].list.length; i = (k + n) % n;
    pad.set(cur()); label.textContent = 'Trace: ' + cur(); result.textContent = 'Start at the top and follow the dots.';
    K.mark(grid, grid.children[i]);
    if (speak) K.say(cur(), SETS[set].lang, { fallback: '' });
  }
  function check() {
    var s = pad.score();
    if (s.empty) { result.textContent = 'Write over the dotted letter first ✏️'; return s; }
    var msg = ['Try again: go over the dotted lines 🙂', 'Good start! Cover more of the letter ⭐', 'Nice tracing! ⭐⭐', 'Perfect! ⭐⭐⭐'][s.stars];
    result.textContent = msg + '  (' + Math.round(s.cover * 100) + '% covered, ' + Math.round(s.neat * 100) + '% neat)';
    K.say(s.stars === 3 ? 'Perfect!' : s.stars === 2 ? 'Nice tracing!' : s.stars === 1 ? 'Good start!' : 'Try again');
    return s;
  }
  spot.appendChild(T.card([
    T.seg([['up', 'A–Z'], ['low', 'a–z'], ['hi', 'अ–ह'], ['pa', 'ੳ–ੜ']], 'up', function (v) { set = v; tiles(); go(0, false); }),
    h('div', { 'class': 'kstage' }, [label, pad.el, result]),
    T.row([T.button('◀', { onclick: function () { go(i - 1, true); } }), T.button('✓ Check', { primary: true, onclick: check }),
      T.button('Clear', { onclick: function () { pad.clear(); result.textContent = 'Start at the top and follow the dots.'; } }), T.button('▶', { onclick: function () { go(i + 1, true); } })]),
    T.row([T.button('Try a sample', { small: true, onclick: function () { pad.demo(); result.textContent = 'Watch how the letter fills in, then press Clear and try it yourself.'; } }),
      T.button('🔊 Hear it', { small: true, onclick: function () { K.say(cur(), SETS[set].lang, { fallback: '' }); } })]),
    swatches(function (c) { pad.color(c); }), grid]));
  K.fit(spot);
  tiles(); go(0, false);
  T.tests['letter-trace'] = function () {
    var f = [];
    pad.set('A'); if (!pad.score().empty) f.push('fresh pad not empty');
    pad.demo(true); var s = pad.score(); if (s.stars !== 3) f.push('demo stars ' + s.stars + ' cover ' + s.cover.toFixed(2));
    pad.clear(); pad.line([5, 5], [60, 5]); s = pad.score(); if (s.stars !== 0 || s.neat > 0.2) f.push('corner scribble scored ' + s.stars);
    ['ਙ', 'क', 'g'].forEach(function (c) { pad.set(c); pad.demo(true); if (pad.score().cover < 0.95) f.push('demo cover ' + c); });
    if (SETS.hi.list.length !== 41 || SETS.pa.list.length !== 35) f.push('set sizes');
    go(0, false);
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
