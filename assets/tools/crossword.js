/* Infinity by GroupChatOn — crossword. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Crossword maker: themed puzzles with clues written for kids, or your own words and clues; solve on screen with Check and Reveal, or print. */
GCOTools.register('crossword', function (spot, T) {
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
  var SETS = {
    animals: 'CAT:A pet that says meow|DOG:A pet that barks and wags its tail|COW:A farm animal that gives us milk|LION:A big cat with a shaggy mane|ZEBRA:A horse-like animal with black and white stripes|HORSE:You can ride this animal; it says neigh|MONKEY:It swings from trees and loves bananas|TIGER:A big orange cat with black stripes|RABBIT:It has long ears and hops|ELEPHANT:The biggest land animal, with a long trunk',
    fruits: 'APPLE:A crunchy red or green fruit|BANANA:A long yellow fruit you peel|MANGO:A sweet, juicy summer fruit with a big stone|GRAPES:Small round fruits that grow in bunches|ORANGE:A round fruit that is also a colour|LEMON:A sour yellow fruit|CHERRY:A small red fruit on a long stalk|PEAR:A green fruit shaped like a bell|PLUM:A small purple fruit with a stone inside|MELON:A big juicy fruit with lots of seeds',
    space: 'SUN:The star at the centre of our solar system|MOON:It goes round the Earth and shines at night|EARTH:The planet we live on|MARS:The red planet|STAR:It twinkles in the night sky|ROCKET:It blasts off into space|COMET:An icy ball with a long glowing tail|SATURN:The planet with big bright rings|ORBIT:The path a planet takes around the Sun|JUPITER:The biggest planet',
    body: 'EYE:You see with it|EAR:You hear with it|NOSE:You smell with it|HAND:It has five fingers|KNEE:It bends in the middle of your leg|TEETH:You brush them twice a day|HEART:It pumps blood round your body|BRAIN:You think with it|TONGUE:It helps you taste|ELBOW:It bends in the middle of your arm',
    colours: 'RED:The colour of a fire engine|BLUE:The colour of a clear sky|GREEN:The colour of grass|YELLOW:The colour of a banana|PURPLE:Mix red and blue to get this|ORANGE:Mix red and yellow to get this|PINK:Mix red and white to get this|BROWN:The colour of chocolate|BLACK:The colour of the night sky|WHITE:The colour of snow' };
  function parse(text) {
    return text.split(/\n|\|/).map(function (l) { var m = l.match(/^\s*([A-Za-z]{2,15})\s*[:\-–=]\s*(.+?)\s*$/); return m ? { w: m[1].toUpperCase(), clue: m[2] } : null; }).filter(Boolean)
      .filter(function (x, i, a) { return a.map(function (y) { return y.w; }).indexOf(x.w) === i; }).slice(0, 16);
  }
  // lay the words out: each new word must cross a placed one, never touch it side by side; the most crossings wins
  function layout(items) {
    var N = 45, g = {}, D = {}, placed = [], skipped = [];
    function get(x, y) { return g[x + ',' + y] || ''; }
    function fits(w, x, y, dx, dy) {
      var cross = 0;
      if (get(x - dx, y - dy) || get(x + dx * w.length, y + dy * w.length)) return -1;
      for (var i = 0; i < w.length; i++) {
        var cx = x + dx * i, cy = y + dy * i, c = get(cx, cy);
        if (c) { if (c !== w[i] || D[cx + ',' + cy] === (dx ? 'h' : 'v')) return -1; cross++; continue; }
        if (get(cx + dy, cy + dx) || get(cx - dy, cy - dx)) return -1;
      }
      return cross;
    }
    function put(it, x, y, dx, dy) { for (var i = 0; i < it.w.length; i++) { g[(x + dx * i) + ',' + (y + dy * i)] = it.w[i]; D[(x + dx * i) + ',' + (y + dy * i)] = dx ? 'h' : 'v'; } placed.push({ w: it.w, clue: it.clue, x: x, y: y, dx: dx, dy: dy }); }
    var list = items.slice().sort(function (a, b) { return b.w.length - a.w.length; });
    if (!list.length) return { placed: [], skipped: [] };
    put(list[0], Math.floor(N / 2 - list[0].w.length / 2), Math.floor(N / 2), 1, 0);
    var rest = list.slice(1), progress = true;
    while (rest.length && progress) {
      progress = false;
      for (var r = 0; r < rest.length; r++) {
        var it = rest[r], best = null;
        placed.forEach(function (p) {
          for (var i = 0; i < p.w.length; i++) for (var j = 0; j < it.w.length; j++) {
            if (p.w[i] !== it.w[j]) continue;
            var dx = p.dy, dy = p.dx, x = p.x + p.dx * i - dx * j, y = p.y + p.dy * i - dy * j, c = fits(it.w, x, y, dx, dy);
            if (c > 0 && (!best || c > best.c)) best = { x: x, y: y, dx: dx, dy: dy, c: c };
          }
        });
        if (best) { put(it, best.x, best.y, best.dx, best.dy); rest.splice(r, 1); r--; progress = true; }
      }
    }
    skipped = rest.map(function (x) { return x.w; });
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    placed.forEach(function (p) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x + p.dx * (p.w.length - 1)); maxY = Math.max(maxY, p.y + p.dy * (p.w.length - 1)); });
    placed.forEach(function (p) { p.x -= minX; p.y -= minY; });
    var W = maxX - minX + 1, H = maxY - minY + 1, cells = [];
    for (var y = 0; y < H; y++) { cells.push([]); for (var x = 0; x < W; x++) cells[y].push(get(x + minX, y + minY)); }
    // number the start of each word, left to right, top to bottom
    var starts = {}; placed.forEach(function (p) { starts[p.x + ',' + p.y] = 1; });
    var n = 0, num = {};
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (starts[x + ',' + y]) num[x + ',' + y] = ++n;
    placed.forEach(function (p) { p.n = num[p.x + ',' + p.y]; });
    placed.sort(function (a, b) { return a.n - b.n; });
    return { placed: placed, skipped: skipped, W: W, H: H, cells: cells, num: num };
  }
  // the best of a few shuffled tries: fewest words left out, then the smallest grid
  function best(items) { var b = null; for (var t = 0; t < 40 && !(t >= 12 && !b.skipped.length); t++) { var l = layout(K.shuffle(items)); if (!b || l.skipped.length < b.skipped.length || (l.skipped.length === b.skipped.length && l.W * l.H < b.W * b.H)) b = l; } return b; }
  var set = 'animals', L = null, inputs = {};
  var own = h('textarea', { rows: '5', placeholder: 'One per line: WORD - clue\nSUN - It shines in the day', 'aria-label': 'Your words and clues' });
  own.value = T.store.get('cw-own', 'SUN - It shines in the day\nRAIN - Water falling from clouds\nSNOW - Cold white flakes in winter\nWIND - Moving air that flies kites');
  own.addEventListener('input', function () { T.store.set('cw-own', own.value.slice(0, 4000)); });
  var board = h('div', { style: 'display:grid;gap:2px;margin:0 auto;width:100%' }), clues = h('div', { 'class': 'tgrid2', 'data-out': '' }), msg = h('p', { 'class': 'kscore', 'aria-live': 'polite' }), dir = [1, 0];
  function build() {
    var items = set === 'own' ? parse(own.value) : parse(SETS[set]);
    if (items.length < 2) { msg.textContent = 'Add at least two words, one per line, like: SUN - It shines in the day'; board.innerHTML = ''; clues.innerHTML = ''; return; }
    L = best(items); inputs = {};
    board.style.gridTemplateColumns = 'repeat(' + L.W + ',minmax(0,1fr))'; board.style.maxWidth = (L.W * 42) + 'px'; board.innerHTML = '';
    for (var y = 0; y < L.H; y++) for (var x = 0; x < L.W; x++) (function (x, y) {
      var c = L.cells[y][x];
      if (!c) { board.appendChild(h('span', { style: 'aspect-ratio:1' })); return; }
      var inp = h('input', { type: 'text', maxlength: '1', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'Row ' + (y + 1) + ' column ' + (x + 1),
        style: 'width:100%;height:100%;min-height:0;padding:0;border:0;background:transparent;text-align:center;font:700 clamp(13px,4.4vw,22px) var(--ui);text-transform:uppercase;color:var(--ink)' });
      inp.addEventListener('focus', function () { inp.select(); });
      inp.addEventListener('input', function () { inp.value = inp.value.replace(/[^A-Za-z]/g, '').slice(-1).toUpperCase(); inp.parentNode.style.background = ''; if (inp.value) move(x, y, 1); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !inp.value) { move(x, y, -1); } if (e.key === 'ArrowRight') { dir = [1, 0]; move(x, y, 1); } if (e.key === 'ArrowDown') { dir = [0, 1]; move(x, y, 1); } });
      inp.addEventListener('click', function () { var a = inputs[(x - 1) + ',' + y] || inputs[(x + 1) + ',' + y], d = inputs[x + ',' + (y - 1)] || inputs[x + ',' + (y + 1)]; if (a && !d) dir = [1, 0]; else if (d && !a) dir = [0, 1]; });
      inputs[x + ',' + y] = inp;
      board.appendChild(h('span', { style: 'position:relative;aspect-ratio:1;border:2px solid #334155;border-radius:4px;background:var(--bg);display:block' }, [L.num[x + ',' + y] ? h('small', { style: 'position:absolute;left:2px;top:0;font:700 9px var(--ui);color:var(--ink-soft);pointer-events:none', text: String(L.num[x + ',' + y]) }) : null, inp]));
    })(x, y);
    clues.innerHTML = '';
    [['Across →', 1], ['Down ↓', 0]].forEach(function (g) {
      var box = h('div', {}, [h('b', { text: g[0] })]);
      L.placed.filter(function (p) { return p.dx === g[1]; }).forEach(function (p) { var b = h('button', { type: 'button', 'class': 'tbtn tbtn-sm', style: 'display:flex;width:100%;justify-content:flex-start;text-align:left;height:auto;padding:6px 10px;margin-top:6px;white-space:normal', text: p.n + '. ' + p.clue + ' (' + p.w.length + ')' });
        b.addEventListener('click', function () { dir = [p.dx, p.dy]; inputs[p.x + ',' + p.y].focus(); K.say(p.clue); }); box.appendChild(b); });
      clues.appendChild(box);
    });
    msg.textContent = (L.skipped.length ? 'Could not fit: ' + L.skipped.join(', ') + '. ' : '') + 'Tap a clue or a square and type the answer.';
  }
  function move(x, y, s) { var n = inputs[(x + dir[0] * s) + ',' + (y + dir[1] * s)]; if (n) n.focus(); }
  function check() {
    var right = 0, total = 0, empty = 0;
    Object.keys(inputs).forEach(function (k) { var p = k.split(','), want = L.cells[+p[1]][+p[0]], inp = inputs[k]; total++; if (!inp.value) { empty++; inp.parentNode.style.background = ''; return; } var ok = inp.value === want; if (ok) right++; inp.parentNode.style.background = ok ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'; });
    msg.textContent = right === total ? '🎉 All correct! Well done!' : right + ' of ' + total + ' squares right' + (empty ? ', ' + empty + ' still empty' : '') + '.';
    if (right === total) K.say('All correct! Well done!');
    return right === total;
  }
  function reveal() { Object.keys(inputs).forEach(function (k) { var p = k.split(','); inputs[k].value = L.cells[+p[1]][+p[0]]; inputs[k].parentNode.style.background = ''; }); msg.textContent = 'Here are the answers.'; }
  function printIt(withKey) {
    var css = 'body{font-family:system-ui,sans-serif;color:#000}table{border-collapse:collapse;margin:10px 0}td{width:32px;height:32px;position:relative;text-align:center;font:700 18px system-ui}td.c{border:1.5px solid #000}td small{position:absolute;left:2px;top:1px;font-size:9px}.cols{display:flex;gap:30px}';
    function table(ans) { return '<table>' + L.cells.map(function (row, y) { return '<tr>' + row.map(function (c, x) { return c ? '<td class="c">' + (L.num[x + ',' + y] ? '<small>' + L.num[x + ',' + y] + '</small>' : '') + (ans ? c : '') + '</td>' : '<td></td>'; }).join('') + '</tr>'; }).join('') + '</table>'; }
    function list(d) { return L.placed.filter(function (p) { return p.dx === d; }).map(function (p) { return '<li>' + p.n + '. ' + p.clue.replace(/</g, '&lt;') + ' (' + p.w.length + ')</li>'; }).join(''); }
    var html = '<!doctype html><meta charset="utf-8"><title>Crossword</title><style>' + css + '</style><h1>Crossword</h1><p>Name: ____________________</p>' + table(false) +
      '<div class="cols"><div><h3>Across</h3><ol style="list-style:none;padding:0">' + list(1) + '</ol></div><div><h3>Down</h3><ol style="list-style:none;padding:0">' + list(0) + '</ol></div></div>' + (withKey ? '<h2 style="page-break-before:always">Answers</h2>' + table(true) : '');
    var fr = h('iframe', { style: 'position:fixed;right:0;bottom:0;width:0;height:0;border:0', title: 'print' }); document.body.appendChild(fr);
    fr.contentDocument.open(); fr.contentDocument.write(html); fr.contentDocument.close();
    setTimeout(function () { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) {} setTimeout(function () { fr.remove(); }, 60000); }, 300);
  }
  var ownBox = T.field('Your words and clues', own); ownBox.hidden = true;
  var pick = T.select([['animals', 'Animals'], ['fruits', 'Fruits'], ['space', 'Space'], ['body', 'My body'], ['colours', 'Colours'], ['own', 'My own words']], set);
  pick.addEventListener('change', function () { set = pick.value; ownBox.hidden = set !== 'own'; build(); });
  spot.appendChild(T.card([T.field('Puzzle', pick), ownBox, board, msg, clues,
    T.row([T.button('✓ Check', { primary: true, onclick: check }), T.button('Reveal', { onclick: reveal }), T.button('New layout', { onclick: build }),
      T.button('🖨 Print', { onclick: function () { printIt(false); } }), T.button('Print with answers', { small: true, onclick: function () { printIt(true); } }),
      T.button('Try a sample', { small: true, onclick: function () { set = 'space'; pick.value = 'space'; ownBox.hidden = true; build(); } })])]));
  K.fit(spot);
  build();
  T.tests['crossword'] = function () {
    var f = [];
    Object.keys(SETS).forEach(function (k) { for (var t = 0; t < 5; t++) {
      var items = parse(SETS[k]), l = best(items);
      if (l.placed.length < items.length - 1) f.push(k + ' placed only ' + l.placed.length);
      l.placed.forEach(function (p) { for (var i = 0; i < p.w.length; i++) if (l.cells[p.y + p.dy * i][p.x + p.dx * i] !== p.w[i]) f.push(k + ' ' + p.w + ' broken'); if (!p.n) f.push('no number'); });
      var count = 0; l.cells.forEach(function (row) { row.forEach(function (c) { if (c) count++; }); });
      // every run of 2+ letters in a row or column must be one of the placed words (no accidental words)
      [[1, 0], [0, 1]].forEach(function (d) {
        var lines = d[0] ? l.cells : l.cells[0].map(function (x, c) { return l.cells.map(function (row) { return row[c]; }); });
        lines.forEach(function (line, li) { var run = '', st = 0; line.concat(['']).forEach(function (c, i) {
          if (c) { if (!run) st = i; run += c; return; }
          if (run.length > 1 && !l.placed.some(function (p) { return p.w === run && p.dx === d[0] && (d[0] ? p.x === st && p.y === li : p.y === st && p.x === li); })) f.push(k + ' accidental word ' + run);
          run = '';
        }); });
      });
      if (!count) f.push('empty');
    } });
    if (parse('SUN - hot\nbad line\nSUN: again\nMOON = night').length !== 2) f.push('parse');
    set = 'animals'; build(); reveal(); if (!check()) f.push('reveal then check'); build();
    return Promise.resolve({ ok: !f.length, n: 54, fails: K.uniq(f).slice(0, 6) });
  };
});
