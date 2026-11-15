/* Infinity by GroupChatOn — riddles-picture. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Picture riddles: spot the odd one out, find the only pair, count the objects and finish the pattern. New pictures every round, made on your device. */
GCOTools.register('riddles-picture', function (spot, T) {
  var h = T.h, R = T.riddles || (T.riddles = (function () {
    // shared by the riddle tools (each tool carries its own copy, so any one can load alone): answer checking, the riddle player, daily picks, fair random
    if (!document.getElementById('gco-riddle-css')) document.head.appendChild(h('style', { id: 'gco-riddle-css', text: [
      '.rd-stage{display:grid;gap:10px;justify-items:center;text-align:center;padding:18px 14px;border-radius:18px;background:var(--bg);border:1px solid var(--line);min-width:0}',
      '.rd-num{font:700 13px/1.3 var(--ui);color:var(--ink-soft)}.rd-q{font:600 clamp(18px,4.8vw,23px)/1.5 var(--ui);overflow-wrap:anywhere;max-width:36em;white-space:pre-line}',
      '.rd-q.rd-emoji{font-size:clamp(40px,12vw,64px);line-height:1.2;letter-spacing:4px}',
      '.rd-hint{margin:0;color:var(--ink-soft);font-size:15px;overflow-wrap:anywhere}.rd-ans{margin:0;padding:10px 14px;border-radius:12px;background:var(--accent-soft);font:700 18px/1.4 var(--ui);overflow-wrap:anywhere}',
      '.rd-ans small{display:block;font-weight:500;font-size:14.5px;color:var(--ink-soft);margin-top:4px}',
      '.rd-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));gap:8px;width:100%}',
      '.rd-opts button{min-height:52px;min-width:0;padding:8px;border-radius:14px;border:2px solid var(--line);background:var(--surface-2);color:var(--ink);font:600 16px/1.3 var(--ui);cursor:pointer;overflow-wrap:anywhere}',
      '.rd-opts button.is-ok{border-color:#16a34a;background:rgba(34,197,94,.2)}.rd-opts button.is-no{border-color:#dc2626;background:rgba(239,68,68,.15)}',
      '.rd-list{display:grid;gap:6px;max-height:440px;overflow:auto;margin-top:8px}.rd-list details{padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--bg)}',
      '.rd-list summary{cursor:pointer;overflow-wrap:anywhere;white-space:pre-line}.rd-list p{margin:6px 0 0;font-weight:700;overflow-wrap:anywhere}',
      '.rd-grid{display:grid;gap:4px;width:100%;max-width:440px;margin:0 auto}.rd-grid button{aspect-ratio:1;min-width:0;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--surface-2);font-size:clamp(17px,5.6vw,30px);line-height:1;cursor:pointer}',
      '.rd-grid button.is-ok{background:rgba(34,197,94,.3);border-color:#16a34a}.rd-grid button.is-no{background:rgba(239,68,68,.2);border-color:#dc2626}.rd-grid button.is-on{outline:3px solid var(--accent)}',
      '.rd-guess{display:flex;gap:8px;width:100%;max-width:520px}.rd-guess input{flex:1;min-width:0}'].join('') }));
    function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function pick(a) { return a[rnd(a.length)]; }
    function item(x) { return { q: x[0], a: x[1], h: x[2] || '', alt: x[3] || [], x: x[4] || '', c: x[5] || '' }; }
    // answers are compared loosely: case, punctuation, “a/the”, plurals, Hindi/Punjabi dots and nasal marks do not matter
    var STOP = { a: 1, an: 1, the: 1, is: 1, it: 1, its: 1, my: 1, answer: 1, think: 1, maybe: 1 };
    function norm(s) {
      return String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').normalize('NFC').toLowerCase()
        .replace(/[़਼]/g, '').replace(/ँ/g, 'ं').replace(/ੰ/g, 'ਂ')
        .replace(/[^\p{L}\p{M}\p{N}.\s]/gu, ' ').replace(/\.(?!\d)/g, ' ').replace(/\s+/g, ' ').trim();
    }
    function words(s) {
      var all = norm(s).split(' ').filter(Boolean), w = all.filter(function (x) { return !STOP[x]; });
      return (w.length ? w : all).map(function (w) { return w.length > 3 && /[a-z]s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w; }); }
    function nums(s) { return (String(s).replace(/,(?=\d{3})/g, '').match(/\d+(\.\d+)?/g) || []).map(Number).sort(function (a, b) { return a - b; }).join(','); }
    function match(guess, it) {
      if (!String(guess || '').trim()) return false;
      var list = [it.a].concat(it.alt || []), g = words(guess), gj = g.join('');
      return list.some(function (a) {
        if (/\d/.test(a) && !/[a-z]{4,}/i.test(a.replace(/\b(kg|km|cm|am|pm|rs|th|seconds?|hours?|years?|days?|minutes?|square|cows?|shirts?|jumps?|socks?|matches?|degrees?|and)\b/gi, ''))) {
          var n = nums(a); if (n && nums(guess) === n) return true;
        }
        var w = words(a), wj = w.join('');
        if (!w.length) return false;
        if (gj === wj) return true;
        return w.every(function (x) { return g.indexOf(x) >= 0; }) || (wj.length >= 5 && gj.indexOf(wj) >= 0);
      });
    }
    var TXT = {
      en: { hint: '💡 Hint', ans: '👀 Answer', next: 'Next ▶', prev: '◀', rand: '🔀 Random', check: 'Check', guess: 'Your answer…', right: 'Correct! 🎉', wrong: 'Not quite. Try again, or take a hint.', solved: 'solved',
        all: 'All', unsolved: 'Not solved', share: 'Share on WhatsApp', copy: 'Copy', list: 'See all riddles with answers', riddle: 'Riddle', ansIs: 'Answer: ', hintIs: 'Hint: ', done: 'You have solved them all! 🏆', ask: 'Can you solve this riddle?' },
      hi: { hint: '💡 संकेत', ans: '👀 उत्तर', next: 'अगली ▶', prev: '◀', rand: '🔀 कोई भी', check: 'जाँचें', guess: 'अपना उत्तर लिखें…', right: 'सही जवाब! 🎉', wrong: 'नहीं, फिर से सोचें या संकेत देखें।', solved: 'हल',
        all: 'सभी', unsolved: 'बिना हल', share: 'WhatsApp पर भेजें', copy: 'कॉपी', list: 'सारी पहेलियाँ उत्तर के साथ', riddle: 'पहेली', ansIs: 'उत्तर: ', hintIs: 'संकेत: ', done: 'आपने सारी पहेलियाँ हल कर लीं! 🏆', ask: 'बूझो तो जानें!' },
      pa: { hint: '💡 ਇਸ਼ਾਰਾ', ans: '👀 ਜਵਾਬ', next: 'ਅਗਲੀ ▶', prev: '◀', rand: '🔀 ਕੋਈ ਵੀ', check: 'ਜਾਂਚੋ', guess: 'ਆਪਣਾ ਜਵਾਬ ਲਿਖੋ…', right: 'ਸਹੀ ਜਵਾਬ! 🎉', wrong: 'ਨਹੀਂ, ਫੇਰ ਸੋਚੋ ਜਾਂ ਇਸ਼ਾਰਾ ਵੇਖੋ।', solved: 'ਹੱਲ',
        all: 'ਸਾਰੀਆਂ', unsolved: 'ਬਿਨਾਂ ਹੱਲ', share: 'WhatsApp ਤੇ ਭੇਜੋ', copy: 'ਕਾਪੀ', list: 'ਸਾਰੀਆਂ ਬੁਝਾਰਤਾਂ ਜਵਾਬਾਂ ਨਾਲ', riddle: 'ਬੁਝਾਰਤ', ansIs: 'ਜਵਾਬ: ', hintIs: 'ਇਸ਼ਾਰਾ: ', done: 'ਤੁਸੀਂ ਸਾਰੀਆਂ ਬੁਝਾਰਤਾਂ ਬੁੱਝ ਲਈਆਂ! 🏆', ask: 'ਬੁੱਝੋ ਤਾਂ ਜਾਣੀਏ!' } };
    function shareText(it, lang) { var t = TXT[lang || 'en']; return '🧩 ' + t.ask + '\n\n' + it.q + '\n\n' + (it.h ? t.hintIs + it.h + '\n' : '') + '🔗 ' + location.href.split('#')[0]; }
    // one riddle at a time: guess, hint, answer, next; solved riddles are remembered on this device
    function player(raw, o) {
      o = o || {};
      var t = TXT[o.lang || 'en'], items = raw.map(item), key = 'riddles-' + o.key;
      var solved = T.store.get(key, []); if (!Array.isArray(solved)) solved = [];
      var only = false, cur = 0;
      var num = h('div', { 'class': 'rd-num' }), q = h('div', { 'class': 'rd-q' + (o.emoji ? ' rd-emoji' : ''), 'data-out': '', lang: o.lang || null });
      var hint = h('p', { 'class': 'rd-hint', 'aria-live': 'polite' }), ans = h('div', { 'class': 'rd-ans', hidden: true, 'aria-live': 'polite' });
      var inp = h('input', { type: 'text', placeholder: t.guess, 'aria-label': t.guess, autocomplete: 'off', lang: o.lang || null });
      var msg = h('p', { 'class': 'tstatus', role: 'status', 'aria-live': 'polite' });
      var wa = h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener' }, [t.share]), copyBtn, opts = h('div', { 'class': 'rd-opts', hidden: true });
      function order() { var all = items.map(function (_, k) { return k; }); return only ? all.filter(function (k) { return solved.indexOf(k) < 0; }) : all; }
      function view(k) {
        cur = k; var it = items[k];
        num.textContent = t.riddle + ' ' + (k + 1) + ' / ' + items.length + ' · ' + solved.length + ' ' + t.solved + (solved.indexOf(k) >= 0 ? ' ✓' : '');
        q.textContent = it.q; hint.textContent = ''; ans.hidden = true; opts.hidden = true; opts.innerHTML = ''; ans.innerHTML = ''; inp.value = ''; msg.textContent = ''; msg.className = 'tstatus';
        wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText(it, o.lang));
        T.store.set(key + '-at', k);
        if (o.onView) o.onView(it, k);
      }
      function move(d) {
        var L = order();
        if (!L.length) { msg.className = 'tstatus is-ok'; msg.textContent = t.done; return; }
        var p = L.indexOf(cur);
        view(p < 0 ? (L.filter(function (k) { return k > cur; })[0] != null ? L.filter(function (k) { return k > cur; })[0] : L[0]) : L[(p + d + L.length) % L.length]);
      }
      function reveal() {
        var it = items[cur]; ans.innerHTML = ''; ans.hidden = false;
        ans.appendChild(document.createTextNode(t.ansIs + it.a)); if (it.x) ans.appendChild(h('small', { text: it.x }));
      }
      function check() {
        var it = items[cur], ok = match(inp.value, it);
        if (ok) {
          if (solved.indexOf(cur) < 0) { solved.push(cur); T.store.set(key, solved); }
          msg.className = 'tstatus is-ok'; msg.textContent = t.right; reveal();
          num.textContent = t.riddle + ' ' + (cur + 1) + ' / ' + items.length + ' · ' + solved.length + ' ' + t.solved + ' ✓';
        } else { msg.className = 'tstatus is-error'; msg.textContent = inp.value.trim() ? t.wrong : t.guess; }
        return ok;
      }
      function showChoices() {
        var it = items[cur], pool = items.filter(function (x) { return !o.sameKind || x.c === it.c; });
        opts.innerHTML = ''; opts.hidden = false;
        choices(it, pool, 4).forEach(function (a) {
          var b = h('button', { type: 'button', text: a, onclick: function () {
            if (a === it.a) { b.className = 'is-ok'; inp.value = a; check(); } else { b.className = 'is-no'; msg.className = 'tstatus is-error'; msg.textContent = t.wrong; }
          } });
          opts.appendChild(b);
        });
      }
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      var filter = T.seg([['all', t.all], ['open', t.unsolved]], 'all', function (v) { only = v === 'open'; move(1); });
      var list = h('div', { 'class': 'rd-list' });
      var more = h('details', {}, [h('summary', { text: t.list + ' (' + items.length + ')' }), list]);
      more.addEventListener('toggle', function () {
        if (!more.open || list.childNodes.length) return;
        items.forEach(function (it, k) { list.appendChild(h('details', { lang: o.lang || null }, [h('summary', { text: (k + 1) + '. ' + it.q }), h('p', { text: it.a + (it.x ? ' — ' + it.x : '') })])); });
      });
      copyBtn = T.button(t.copy, { small: true, onclick: function () { T.copy(shareText(items[cur], o.lang), copyBtn); } });
      var el = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [o.noFilter ? null : filter,
        h('div', { 'class': 'rd-stage' }, [num, q, hint, ans, opts, h('div', { 'class': 'rd-guess' }, [inp, T.button(t.check, { primary: true, onclick: check })]), msg]),
        T.row([T.button(t.hint, { onclick: function () { hint.textContent = t.hintIs + (items[cur].h || '—'); } }), o.choices ? T.button(o.choices, { onclick: showChoices }) : null, T.button(t.ans, { onclick: reveal }),
          T.button(t.prev, { onclick: function () { move(-1); } }), T.button(t.next, { primary: true, onclick: function () { move(1); } }), T.button(t.rand, { onclick: function () { var L = order(); if (L.length) view(pick(L)); } })]),
        T.row([wa, copyBtn]), o.noList ? null : more]);
      var at = +T.store.get(key + '-at', 0) || 0;
      view(at < items.length ? at : 0);
      return { el: el, items: items, view: view, next: function () { move(1); }, guess: function (g) { inp.value = g; return check(); }, current: function () { return cur; }, reveal: reveal, solvedCount: function () { return solved.length; } };
    }
    // local calendar day → a whole number (same for everyone on that date)
    function dayKey(dt) { return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2); }
    function dayNo(key) { var p = key.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000); }
    // the n-th riddle of a cycle that shows every riddle once before any repeats
    function cycle(n, len) {
      var step = 37; while (gcd(step, len) !== 1) step++;
      return ((n % len) * step + 11) % len;
    }
    function gcd(a, b) { return b ? gcd(b, a % b) : a; }
    // the right answer plus wrong ones from the same bank
    function choices(it, pool, n) {
      var seen = {}; seen[norm(it.a)] = 1;
      var wrong = shuffle(pool).map(function (x) { return x.a; }).filter(function (a) { var k = norm(a); if (seen[k]) return false; seen[k] = 1; return true; });
      return shuffle([it.a].concat(wrong.slice(0, (n || 4) - 1)));
    }
    // wrap text into lines that fit a width on a canvas
    function wrap(g, text, max) {
      var out = [];
      String(text).split('\n').forEach(function (para) {
        var line = '';
        para.split(' ').forEach(function (w) {
          var test = line ? line + ' ' + w : w;
          if (g.measureText(test).width > max && line) { out.push(line); line = w; } else line = test;
        });
        out.push(line);
      });
      return out;
    }
    // known-answer checks for a riddle bank: size, hints, no repeats, every answer accepted, other answers rejected
    function checkBank(raw, min) {
      var f = [], seen = {}, items = raw.map(item);
      if (items.length < min) f.push('only ' + items.length + ' riddles');
      items.forEach(function (it, k) {
        if (!it.q || !it.a || !it.h) f.push('riddle ' + (k + 1) + ' is missing a part');
        var key = it.q.trim().toLowerCase(); if (seen[key]) f.push('repeat: ' + it.q.slice(0, 30)); seen[key] = 1;
        if (!match(it.a, it)) f.push('own answer rejected: ' + it.a);
        it.alt.forEach(function (a) { if (!match(a, it)) f.push('alt rejected: ' + a); });
        var other = items[(k + 1) % items.length];
        if (norm(other.a) !== norm(it.a) && match(other.a, it) && !it.alt.some(function (a) { return norm(a) === norm(other.a); })) f.push('“' + other.a + '” accepted for ' + it.a);
        if (match('zzqx', it)) f.push('nonsense accepted for ' + it.a);
      });
      return f;
    }
    return { checkBank: checkBank, rnd: rnd, shuffle: shuffle, pick: pick, item: item, norm: norm, match: match, TXT: TXT, player: player, dayKey: dayKey, dayNo: dayNo, cycle: cycle, choices: choices, wrap: wrap, shareText: shareText };
  })());
  var status = T.status();
  // look-alike pairs for “spot the odd one”
  var ODD = [['😀', '😃'], ['🙂', '🙃'], ['🌕', '🌝'], ['🐟', '🐠'], ['⭐', '🌟'], ['🍏', '🍎'], ['🕐', '🕑'], ['🌲', '🌳'], ['🚗', '🚙'], ['📗', '📘'], ['🐱', '😺'], ['🍊', '🍑'], ['❤️', '🧡'], ['🔵', '🟦'], ['🐻', '🐨'], ['☁️', '⛅'], ['🌼', '🌻'], ['🔒', '🔓']];
  var PICS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥕', '🌽', '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🐔', '🐧', '🐢', '🐙', '🦋', '🐝', '🌸', '🌻', '🍄', '⚽', '🏀', '🎈', '🎁', '🚗', '🚲', '✈️', '🚀', '⏰', '📚', '✏️', '🎸', '🥁', '🧸', '⭐'];
  function oddPuzzle(n) {
    var p = R.pick(ODD), flip = R.rnd(2), a = p[flip], b = p[1 - flip], cells = [], at = R.rnd(n * n);
    for (var i = 0; i < n * n; i++) cells.push(i === at ? b : a);
    return { type: 'odd', n: n, cells: cells, answer: at, ask: 'Tap the one that is different.' };
  }
  function pairPuzzle(n) {
    var pics = R.shuffle(PICS).slice(0, n * n - 1), twin = pics[R.rnd(pics.length)];
    var cells = R.shuffle(pics.concat([twin]));
    return { type: 'pair', n: n, cells: cells, answer: cells.reduce(function (a, c, i) { if (c === twin) a.push(i); return a; }, []), ask: 'Only one picture appears twice. Tap both of them.' };
  }
  function countPuzzle(n) {
    var target = R.pick(PICS), others = R.shuffle(PICS.filter(function (x) { return x !== target; })).slice(0, 3), k = 3 + R.rnd(Math.max(1, n * n - 8)), cells = [];
    for (var i = 0; i < n * n; i++) cells.push(i < k ? target : R.pick(others));
    cells = R.shuffle(cells);
    var opts = R.shuffle([k, k + 1, k - 1, k + 2].filter(function (x) { return x > 0; })).slice(0, 4);
    if (opts.indexOf(k) < 0) opts[0] = k;
    return { type: 'count', n: n, cells: cells, answer: k, opts: opts.sort(function (a, b) { return a - b; }), target: target, ask: 'How many ' + target + ' can you count?' };
  }
  var SHAPES = [[0, 1], [0, 1, 2], [0, 0, 1], [0, 1, 1], [0, 1, 2, 1], [0, 0, 1, 1]];
  function patternPuzzle() {
    var shape = R.pick(SHAPES), pics = R.shuffle(PICS).slice(0, 3), len = shape.length * 2 + 1 + R.rnd(2), seq = [];
    for (var i = 0; i <= len; i++) seq.push(pics[shape[i % shape.length]]);
    var answer = seq.pop(), opts = R.shuffle(pics.concat([R.pick(PICS.filter(function (x) { return pics.indexOf(x) < 0; }))]));
    return { type: 'next', seq: seq, answer: answer, opts: opts, ask: 'What comes next?' };
  }
  var LEVEL = { easy: 4, medium: 5, hard: 6 }, level = T.store.get('riddles-picture-level', 'easy'), round = null;
  var stage = h('div', { 'class': 'rd-stage' }), score = h('p', { 'class': 'rd-num', 'data-out': '' });
  function make(kind) {
    var n = LEVEL[level];
    kind = kind || R.pick(['odd', 'pair', 'count', 'next']);
    return kind === 'odd' ? oddPuzzle(n + 1) : kind === 'pair' ? pairPuzzle(n) : kind === 'count' ? countPuzzle(n) : patternPuzzle();
  }
  function next() {
    if (round.i >= 10) {
      var best = T.store.get('riddles-picture-best', {}); var prev = best[level] || 0;
      if (round.score > prev) { best[level] = round.score; T.store.set('riddles-picture-best', best); }
      status.ok('Round done: ' + round.score + ' / 10 in ' + Math.round((Date.now() - round.t0) / 1000) + ' seconds.' + (round.score > prev ? ' 🏆 New best!' : ''));
      stage.innerHTML = ''; stage.appendChild(T.button('Play again', { primary: true, onclick: start })); return;
    }
    var p = make(); round.p = p; round.i++; round.tries = 0; round.picked = [];
    stage.innerHTML = '';
    stage.appendChild(h('div', { 'class': 'rd-num', text: 'Picture ' + round.i + ' of 10' }));
    stage.appendChild(h('div', { 'class': 'rd-q', text: p.ask }));
    if (p.type === 'next') {
      stage.appendChild(h('div', { style: 'font-size:clamp(26px,8vw,40px);letter-spacing:2px;overflow-wrap:anywhere', text: p.seq.join(' ') + ' ❓' }));
      stage.appendChild(h('div', { 'class': 'rd-opts' }, p.opts.map(function (o) { var b = h('button', { type: 'button', style: 'font-size:30px', text: o, onclick: function () { answer(o === p.answer, b); } }); return b; })));
      return;
    }
    var grid = h('div', { 'class': 'rd-grid', style: 'grid-template-columns:repeat(' + p.n + ',minmax(0,1fr))' });
    p.cells.forEach(function (c, i) {
      var b = h('button', { type: 'button', text: c, 'aria-label': 'Picture ' + (i + 1), onclick: function () {
        if (p.type === 'odd') answer(i === p.answer, b);
        else if (p.type === 'pair') {
          if (round.picked.indexOf(i) >= 0) return;
          round.picked.push(i); b.classList.add('is-on');
          if (round.picked.length === 2) { var ok = p.answer.indexOf(round.picked[0]) >= 0 && p.answer.indexOf(round.picked[1]) >= 0; answer(ok, b); if (!ok) { round.picked = []; [].forEach.call(grid.children, function (x) { x.classList.remove('is-on'); }); } }
        }
      } });
      grid.appendChild(b);
    });
    stage.appendChild(grid);
    if (p.type === 'count') stage.appendChild(h('div', { 'class': 'rd-opts' }, p.opts.map(function (o) { var b = h('button', { type: 'button', text: String(o), onclick: function () { answer(o === p.answer, b); } }); return b; })));
  }
  function answer(ok, btn) {
    var p = round.p;
    if (ok) {
      if (!round.tries) round.score++;
      if (btn) btn.className = (btn.className + ' is-ok').trim();
      status.ok(round.tries ? 'Got it! (no point after a wrong try)' : 'Well spotted! 🎉');
      draw(); setTimeout(next, 700);
    } else {
      round.tries++; if (btn) btn.classList.add('is-no');
      status.error(p.type === 'count' ? 'Count again carefully.' : 'Not that one. Look again!');
      if (round.tries >= 3) { status.info('The answer is shown. On to the next one.'); reveal(); setTimeout(next, 1600); }
    }
    draw();
  }
  function reveal() {
    var p = round.p, grid = stage.querySelector('.rd-grid');
    if (grid && p.type === 'odd') grid.children[p.answer].classList.add('is-ok');
    if (grid && p.type === 'pair') p.answer.forEach(function (i) { grid.children[i].classList.add('is-ok'); });
    [].forEach.call(stage.querySelectorAll('.rd-opts button'), function (b) { if (b.textContent === String(p.answer)) b.classList.add('is-ok'); });
  }
  function draw() { var best = T.store.get('riddles-picture-best', {}); score.textContent = 'Score: ' + round.score + ' · Best (' + level + '): ' + (best[level] || 0) + ' / 10'; }
  function start() { round = { i: 0, score: 0, t0: Date.now() }; status.clear(); next(); draw(); }
  spot.appendChild(T.card([T.field('Difficulty', T.seg([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], level, function (v) { level = v; T.store.set('riddles-picture-level', v); start(); })), score, stage, status.el,
    T.row([T.button('New round', { onclick: start })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  start();
  T.tests['riddles-picture'] = function () {
    var f = [];
    for (var k = 0; k < 40; k++) {
      var o = oddPuzzle(5), odd = o.cells.filter(function (c) { return c !== o.cells[(o.answer + 1) % 25]; });
      if (o.cells.length !== 25 || odd.length !== 1 || o.cells.indexOf(odd[0]) !== o.answer) { f.push('odd one'); break; }
      var p = pairPuzzle(5), cnt = {}; p.cells.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; });
      var twos = Object.keys(cnt).filter(function (c) { return cnt[c] === 2; });
      if (twos.length !== 1 || Object.keys(cnt).some(function (c) { return cnt[c] > 2; }) || p.answer.length !== 2 || p.cells[p.answer[0]] !== twos[0]) { f.push('pair'); break; }
      var c = countPuzzle(5), real = c.cells.filter(function (x) { return x === c.target; }).length;
      if (real !== c.answer || c.opts.indexOf(c.answer) < 0 || c.opts.length < 3) { f.push('count ' + real + '/' + c.answer); break; }
      var n = patternPuzzle(); if (n.opts.indexOf(n.answer) < 0 || new Set(n.opts).size !== 4) { f.push('pattern options'); break; }
    }
    ODD.forEach(function (x) { if (x[0] === x[1]) f.push('same pair ' + x[0]); });
    return Promise.resolve({ ok: !f.length, n: 160, fails: f });
  };
});
