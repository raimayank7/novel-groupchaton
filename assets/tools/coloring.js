/* Infinity by GroupChatOn — coloring. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Colouring pages and a drawing pad: tap any part of ten original pictures to fill it, or draw freely; save your art as a picture. */
GCOTools.register('coloring', function (spot, T) {
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
  // ten simple original line drawings (200 × 200); every shape with f is a colourable area
  var PAGES = [
    ['🏠', 'House', '<rect f x="0" y="160" width="200" height="40"/><circle f cx="166" cy="34" r="20"/><rect f x="128" y="46" width="16" height="30"/><rect f x="40" y="90" width="120" height="74"/><polygon f points="30,92 100,40 170,92"/><rect f x="88" y="118" width="26" height="46"/><rect f x="50" y="104" width="28" height="24"/><rect f x="122" y="104" width="28" height="24"/>'],
    ['🐟', 'Fish', '<rect f x="0" y="0" width="200" height="200"/><ellipse f cx="92" cy="96" rx="60" ry="36"/><polygon f points="146,96 186,66 186,126"/><polygon f points="80,62 104,40 116,66"/><circle f cx="62" cy="88" r="8"/><circle f cx="40" cy="44" r="6"/><circle f cx="26" cy="24" r="4"/><path f d="M30 200 Q22 170 34 150 Q44 172 38 200 Z"/><path f d="M160 200 Q150 166 166 146 Q176 170 170 200 Z"/>'],
    ['🌻', 'Flower', '<rect f x="94" y="104" width="12" height="70"/><ellipse f cx="76" cy="146" rx="20" ry="9" transform="rotate(-30 76 146)"/><ellipse f cx="124" cy="132" rx="20" ry="9" transform="rotate(30 124 132)"/>' +
      [0, 60, 120, 180, 240, 300].map(function (a) { return '<ellipse f cx="100" cy="52" rx="15" ry="26" transform="rotate(' + a + ' 100 80)"/>'; }).join('') + '<circle f cx="100" cy="80" r="18"/><polygon f points="64,170 136,170 126,198 74,198"/>'],
    ['🦋', 'Butterfly', '<ellipse f cx="62" cy="70" rx="44" ry="38"/><ellipse f cx="138" cy="70" rx="44" ry="38"/><ellipse f cx="70" cy="136" rx="32" ry="30"/><ellipse f cx="130" cy="136" rx="32" ry="30"/><circle f cx="60" cy="66" r="12"/><circle f cx="140" cy="66" r="12"/><circle f cx="70" cy="138" r="9"/><circle f cx="130" cy="138" r="9"/><ellipse f cx="100" cy="104" rx="9" ry="56"/><path d="M96 50 Q84 26 72 22 M104 50 Q116 26 128 22" fill="none"/>'],
    ['🚀', 'Rocket', '<rect f x="0" y="0" width="200" height="200"/><path f d="M100 14 C124 40 130 80 126 140 L74 140 C70 80 76 40 100 14 Z"/><circle f cx="100" cy="74" r="14"/><polygon f points="74,108 46,148 74,140"/><polygon f points="126,108 154,148 126,140"/><path f d="M80 140 L120 140 L110 176 L100 160 L90 176 Z"/><polygon f points="30,40 34,50 44,50 36,56 39,66 30,60 21,66 24,56 16,50 26,50"/><circle f cx="166" cy="40" r="10"/>'],
    ['🚗', 'Car', '<rect f x="0" y="150" width="200" height="50"/><path f d="M20 140 L20 110 Q22 96 40 94 L60 94 L78 66 L134 66 L156 94 L170 96 Q182 98 182 112 L182 140 Z"/><polygon f points="84,72 104,72 104,94 68,94"/><polygon f points="112,72 130,72 146,94 112,94"/><circle f cx="58" cy="142" r="20"/><circle f cx="146" cy="142" r="20"/><circle f cx="58" cy="142" r="8"/><circle f cx="146" cy="142" r="8"/>'],
    ['🐱', 'Cat', '<polygon f points="44,70 56,16 92,52"/><polygon f points="156,70 144,16 108,52"/><circle f cx="100" cy="100" r="66"/><ellipse f cx="74" cy="92" rx="11" ry="15"/><ellipse f cx="126" cy="92" rx="11" ry="15"/><polygon f points="92,116 108,116 100,126"/><ellipse f cx="100" cy="140" rx="26" ry="16"/><path d="M80 134 L30 126 M80 140 L30 146 M120 134 L170 126 M120 140 L170 146" fill="none"/>'],
    ['🌳', 'Tree', '<rect f x="0" y="0" width="200" height="200"/><rect f x="0" y="170" width="200" height="30"/><rect f x="88" y="110" width="24" height="64"/><circle f cx="100" cy="72" r="46"/><circle f cx="62" cy="96" r="28"/><circle f cx="138" cy="96" r="28"/><circle f cx="84" cy="62" r="8"/><circle f cx="118" cy="84" r="8"/><circle f cx="70" cy="104" r="7"/><circle f cx="170" cy="30" r="16"/>'],
    ['🍦', 'Ice cream', '<polygon f points="62,104 138,104 100,194"/><circle f cx="72" cy="94" r="26"/><circle f cx="128" cy="94" r="26"/><circle f cx="100" cy="64" r="30"/><circle f cx="100" cy="30" r="10"/><circle f cx="88" cy="56" r="4"/><circle f cx="114" cy="70" r="4"/><path d="M76 120 L118 150 M124 120 L82 150" fill="none"/>'],
    ['🎈', 'Balloons', '<ellipse f cx="62" cy="62" rx="32" ry="40"/><ellipse f cx="138" cy="58" rx="32" ry="40"/><ellipse f cx="100" cy="94" rx="32" ry="40"/><path d="M62 102 Q70 140 96 186 M138 98 Q128 140 104 186 M100 134 Q96 160 100 186" fill="none"/><polygon f points="58,102 66,102 62,109"/><polygon f points="134,98 142,98 138,105"/><polygon f points="96,134 104,134 100,141"/><polygon f points="84,184 116,184 110,198 90,198"/>']];
  var COLS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#16a34a', '#06b6d4', '#3b82f6', '#1e3a8a', '#a855f7', '#ec4899', '#f9a8d4', '#92400e', '#d6a77a', '#9ca3af', '#111827', '#ffffff'];
  var color = COLS[0], page = 0, undo = [];
  var art = h('div', { style: 'line-height:0;display:grid;justify-items:center' }), msg = h('p', { 'class': 'kscore', 'data-out': '', 'aria-live': 'polite' });
  function svgFor(i) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400" style="width:min(100%,420px);height:auto;background:#fff;border-radius:16px;border:2px solid #cbd5e1;touch-action:manipulation" role="img" aria-label="' + PAGES[i][1] + ' colouring page">' +
    '<g fill="#fff" stroke="#1f2937" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">' + PAGES[i][2].replace(/ f /g, ' data-f="1" ') + '</g></svg>'; }
  function load(i) { page = i; undo = []; art.innerHTML = svgFor(i); msg.textContent = 'Pick a colour, then tap a part of the ' + PAGES[i][1].toLowerCase() + '.'; K.mark(pages, pages.children[i]); }
  art.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-f]'); if (!el) return;
    undo.push([el, el.getAttribute('fill') || '']); el.setAttribute('fill', color);
  });
  var pal = h('div', { 'class': 'trow', role: 'group', 'aria-label': 'Colours', style: 'gap:6px;justify-content:center' });
  function palette(onPick) {
    var box = h('div', { 'class': 'trow', role: 'group', 'aria-label': 'Colours', style: 'gap:6px;justify-content:center' });
    COLS.forEach(function (c, i) { var b = h('button', { type: 'button', 'class': 'kswatch', style: 'background:' + c, 'aria-label': 'Colour ' + (i + 1), 'aria-pressed': String(!i) }); b.addEventListener('click', function () { Array.prototype.forEach.call(box.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); onPick(c); }); box.appendChild(b); });
    return box;
  }
  pal = palette(function (c) { color = c; });
  var pages = h('div', { 'class': 'kgrid' });
  PAGES.forEach(function (p, i) { pages.appendChild(K.tile(p[0], p[1], function () { load(i); }, p[1])); });
  // the picture → a PNG (the SVG is drawn on a canvas)
  function toPng(svgText, size) {
    return new Promise(function (ok, fail) {
      var img = new Image(), url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
      img.onload = function () { var c = h('canvas', { width: String(size), height: String(size) }), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); x.drawImage(img, 0, 0, size, size); URL.revokeObjectURL(url); T.canvasBlob(c).then(ok); };
      img.onerror = function () { URL.revokeObjectURL(url); fail(new Error('Could not save the picture.')); };
      img.src = url;
    });
  }
  function save() { var svg = art.querySelector('svg').cloneNode(true); svg.setAttribute('width', '800'); svg.setAttribute('height', '800'); svg.removeAttribute('style'); return toPng(new XMLSerializer().serializeToString(svg), 800).then(function (b) { T.download(b, 'my-' + PAGES[page][1].toLowerCase().replace(/ /g, '-') + '.png'); return b; }); }
  var fill = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [art, pal, T.row([T.button('↶ Undo', { onclick: function () { var u = undo.pop(); if (u) u[0].setAttribute('fill', u[1] || '#fff'); } }),
    T.button('Start again', { onclick: function () { load(page); } }), T.button('💾 Save picture', { primary: true, onclick: function () { save().catch(function (e) { msg.textContent = e.message; }); } }),
    T.button('Try a sample', { small: true, onclick: function () { Array.prototype.forEach.call(art.querySelectorAll('[data-f]'), function (el) { el.setAttribute('fill', K.pick(COLS.slice(0, 13))); }); msg.textContent = 'A rainbow of colours! Press Start again to colour it yourself.'; } })]), msg, h('b', { text: 'Pick a picture' }), pages]);
  // free drawing pad
  var S = 800, pad = h('canvas', { width: String(S), height: String(S), 'class': 'kcanvas', 'aria-label': 'Drawing pad' }), pg = pad.getContext('2d'), brush = 12, dcol = COLS[6], last = null, erase = false;
  function clearPad() { pg.fillStyle = '#fff'; pg.fillRect(0, 0, S, S); }
  function pt(e) { var r = pad.getBoundingClientRect(); return [(e.clientX - r.left) * S / r.width, (e.clientY - r.top) * S / r.height]; }
  function stroke(a, b) { pg.strokeStyle = erase ? '#fff' : dcol; pg.lineWidth = brush * 2; pg.lineCap = pg.lineJoin = 'round'; pg.beginPath(); pg.moveTo(a[0], a[1]); pg.lineTo(b[0] + 0.01, b[1]); pg.stroke(); }
  pad.addEventListener('pointerdown', function (e) { e.preventDefault(); try { pad.setPointerCapture(e.pointerId); } catch (er) {} last = pt(e); stroke(last, last); });
  pad.addEventListener('pointermove', function (e) { if (!last) return; var p = pt(e); stroke(last, p); last = p; });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { pad.addEventListener(ev, function () { last = null; }); });
  var draw = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [pad, palette(function (c) { dcol = c; erase = false; }),
    T.seg([[5, 'Thin'], [12, 'Medium'], [26, 'Thick']], 12, function (v) { brush = v; }),
    T.row([T.button('🧽 Eraser', { onclick: function () { erase = true; } }), T.button('Clear', { onclick: clearPad }), T.button('💾 Save drawing', { primary: true, onclick: function () { T.canvasBlob(pad).then(function (b) { T.download(b, 'my-drawing.png'); }); } })])]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [fill]);
  spot.appendChild(T.card([T.seg([['fill', 'Colouring pages'], ['draw', 'Drawing pad']], 'fill', function (v) { body.innerHTML = ''; body.appendChild(v === 'fill' ? fill : draw); }), body]));
  K.fit(spot);
  load(0); clearPad();
  T.tests['coloring'] = function () {
    var f = [];
    PAGES.forEach(function (p, i) { var d = h('div', { html: svgFor(i) }), n = d.querySelectorAll('[data-f]').length; if (n < 6) f.push(p[1] + ' has ' + n + ' areas'); if (!d.querySelector('svg')) f.push(p[1] + ' svg'); });
    load(1); var el = art.querySelector('[data-f]'); color = '#ef4444'; el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    if (el.getAttribute('fill') !== '#ef4444') f.push('fill on tap');
    var svg = art.querySelector('svg').cloneNode(true); svg.setAttribute('width', '200'); svg.setAttribute('height', '200');
    return toPng(new XMLSerializer().serializeToString(svg), 200).then(function (b) { if (!b || b.size < 500) f.push('png ' + (b && b.size)); load(0); color = COLS[0]; return { ok: !f.length, n: 13, fails: f }; },
      function (e) { f.push(e.message); load(0); return { ok: false, n: 13, fails: f }; });
  };
});
