/* Infinity by GroupChatOn — riddles-punjabi. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Punjabi riddles (ਬੁਝਾਰਤਾਂ): 30+ of our own riddles in Gurmukhi with ਇਸ਼ਾਰਾ (hints) and ਜਵਾਬ, about village life, food and nature. */
GCOTools.register('riddles-punjabi', function (spot, T) {
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
  // our own riddles: [question, answer, hint, other accepted answers, explanation]
  var BANK = {
    PUNJABI: [
      ["ਲਾਲ ਲਾਲ ਗੱਲ੍ਹਾਂ, ਅੰਦਰ ਦਾਣੇ ਹਜ਼ਾਰ,\nਛਿੱਲ ਕੇ ਖਾਓ ਮੈਨੂੰ, ਮਿਲੇ ਸਿਹਤ ਤੇ ਪਿਆਰ।", "ਅਨਾਰ", "ਇੱਕ ਫਲ ਜਿਸਦੇ ਅੰਦਰ ਲਾਲ ਦਾਣੇ ਹੁੰਦੇ ਹਨ।"],
      ["ਦਿਨੇ ਸੌਂਦਾ, ਰਾਤੀਂ ਜਾਗਦਾ,\nਹਨੇਰੇ ਵਿੱਚ ਪੁੱਠਾ ਲਟਕਦਾ।", "ਚਮਗਿੱਦੜ", "ਉੱਡਦਾ ਹੈ ਪਰ ਪੰਛੀ ਨਹੀਂ।"],
      ["ਬਿਨਾਂ ਖੰਭਾਂ ਦੇ ਉੱਡਦੀ ਹਾਂ, ਡੋਰ ਨਾਲ ਬੱਝੀ ਰਹਿੰਦੀ ਹਾਂ,\nਹਵਾ ਚੱਲੇ ਤਾਂ ਨੱਚਦੀ ਹਾਂ, ਬੱਚਿਆਂ ਨੂੰ ਖ਼ੁਸ਼ ਕਰਦੀ ਹਾਂ।", "ਪਤੰਗ", "ਬਸੰਤ ਤੇ ਅਸਮਾਨ ਵਿੱਚ ਦਿਸਦੀ ਹੈ।", ["ਗੁੱਡੀ"]],
      ["ਕਾਲਾ ਰੰਗ, ਮਿੱਠੀ ਬੋਲੀ,\nਅੰਬਾਂ ਦੀ ਟਾਹਣੀ ਤੇ ਬੈਠ ਕੇ ਕੂਕਾਂ।", "ਕੋਇਲ", "ਇਸਦੀ ਆਵਾਜ਼ ਬਹੁਤ ਮਿੱਠੀ ਹੈ।"],
      ["ਸਵੇਰੇ ਸਵੇਰੇ ਸਭ ਨੂੰ ਜਗਾਵੇ,\nਸਿਰ ਤੇ ਲਾਲ ਕਲਗੀ ਸਜਾਵੇ।", "ਕੁੱਕੜ", "ਪਿੰਡ ਦਾ ਅਲਾਰਮ।", ["ਮੁਰਗਾ"]],
      ["ਦੋ ਪਹੀਏ, ਇੱਕ ਟੱਲੀ, ਪੈਰਾਂ ਨਾਲ ਚੱਲਾਂ,\nਨਾ ਤੇਲ ਮੰਗਾਂ ਨਾ ਪਾਣੀ, ਫਿਰ ਵੀ ਦੌੜ ਲਾਵਾਂ।", "ਸਾਈਕਲ", "ਪੈਡਲ ਮਾਰ ਕੇ ਚਲਾਈਦਾ ਹੈ।"],
      ["ਹਰੇ ਕੱਪੜੇ, ਲਾਲ ਚੁੰਝ,\nਜੋ ਸੁਣਾਂ ਉਹੀ ਦੁਹਰਾਵਾਂ।", "ਤੋਤਾ", "ਇੱਕ ਹਰਾ ਪੰਛੀ।", ["ਮਿੱਠੂ"]],
      ["ਰਾਤ ਨੂੰ ਚਮਕਾਂ, ਦਿਨੇ ਲੁਕ ਜਾਵਾਂ,\nਕਦੇ ਗੋਲ ਕਦੇ ਅੱਧਾ ਨਜ਼ਰ ਆਵਾਂ।", "ਚੰਨ", "ਰਾਤ ਦੇ ਅਸਮਾਨ ਵਿੱਚ।", ["ਚੰਦ", "ਚੰਦਰਮਾ", "ਚੰਨ ਮਾਮਾ"]],
      ["ਦੰਦ ਬਹੁਤ ਨੇ ਪਰ ਕੁਝ ਨਾ ਖਾਵਾਂ,\nਵਾਲਾਂ ਵਿੱਚ ਘੁੰਮ ਕੇ ਉਹਨਾਂ ਨੂੰ ਸੁਲਝਾਵਾਂ।", "ਕੰਘੀ", "ਵਾਲ ਵਾਹੁਣ ਦੇ ਕੰਮ ਆਉਂਦੀ ਹੈ।", ["ਕੰਘਾ"]],
      ["ਪੀਲਾ ਰੰਗ, ਖੱਟਾ ਸੁਆਦ,\nਗਰਮੀਆਂ ਵਿੱਚ ਸ਼ਿਕੰਜਵੀ ਬਣਾਵਾਂ।", "ਨਿੰਬੂ", "ਸ਼ਿਕੰਜਵੀ ਇਸੇ ਤੋਂ ਬਣਦੀ ਹੈ।"],
      ["ਨਾ ਪੈਰ ਨਾ ਹੱਥ, ਫਿਰ ਵੀ ਚੱਲਦੀ ਰਹਾਂ,\nਟਿਕ ਟਿਕ ਕਰਕੇ ਸਮਾਂ ਦੱਸਦੀ ਰਹਾਂ।", "ਘੜੀ", "ਸਮਾਂ ਦੱਸਦੀ ਹੈ।", ["ਕੰਧ ਘੜੀ"]],
      ["ਚਿੱਟੀ ਹਾਂ ਪਰ ਦੁੱਧ ਨਹੀਂ, ਮਿੱਠੀ ਹਾਂ ਪਰ ਗੁੜ ਨਹੀਂ,\nਚਾਹ ਵਿੱਚ ਘੁਲ ਜਾਵਾਂ ਮੈਂ।", "ਖੰਡ", "ਮਿਠਾਈ ਵਿੱਚ ਪੈਂਦੀ ਹੈ।", ["ਚੀਨੀ", "ਸ਼ੱਕਰ"]],
      ["ਜਿੰਨਾ ਵਰਤੋ ਓਨਾ ਘਟਦਾ,\nਝੱਗ ਬਣਾਵਾਂ, ਮੈਲ ਹਟਾਵਾਂ।", "ਸਾਬਣ", "ਨਹਾਉਣ ਵੇਲੇ ਕੰਮ ਆਉਂਦਾ ਹੈ।", ["ਸਾਬਨ"]],
      ["ਲੱਕੜ ਦਾ ਕੱਪੜਾ, ਕਾਲਾ ਦਿਲ,\nਲਿਖਾਂ ਮੈਂ, ਮਿਟਾਓ ਤਾਂ ਮਿਟ ਜਾਵਾਂ।", "ਪੈਨਸਿਲ", "ਸਕੂਲ ਦੇ ਬਸਤੇ ਵਿੱਚ ਹੁੰਦੀ ਹੈ।", ["ਪੈਂਸਿਲ"]],
      ["ਛੱਤ ਨਹੀਂ ਪਰ ਸਭ ਦੇ ਉੱਤੇ,\nਦਿਨੇ ਨੀਲਾ, ਰਾਤੀਂ ਤਾਰਿਆਂ ਨਾਲ ਭਰਿਆ।", "ਅਸਮਾਨ", "ਉੱਪਰ ਵੇਖੋ!", ["ਅਕਾਸ਼", "ਆਕਾਸ਼"]],
      ["ਰੇਗਿਸਤਾਨ ਦਾ ਜਹਾਜ਼ ਕਹਾਵਾਂ,\nਪਾਣੀ ਬਿਨਾਂ ਕਈ ਦਿਨ ਲੰਘਾਵਾਂ।", "ਊਠ", "ਇਸਦੀ ਪਿੱਠ ਤੇ ਕੁੱਬ ਹੁੰਦਾ ਹੈ।"],
      ["ਸਿਰ ਤੇ ਕਲਗੀ, ਖੰਭ ਰੰਗੀਲੇ,\nਮੀਂਹ ਵਿੱਚ ਨੱਚਾਂ, ਪੈਲਾਂ ਪਾਵਾਂ।", "ਮੋਰ", "ਭਾਰਤ ਦਾ ਰਾਸ਼ਟਰੀ ਪੰਛੀ।"],
      ["ਅੰਦਰੋਂ ਚਿੱਟਾ, ਬਾਹਰੋਂ ਭੂਰਾ,\nਸਖ਼ਤ ਖੋਲ ਵਿੱਚ ਪਾਣੀ ਪੂਰਾ।", "ਨਾਰੀਅਲ", "ਇਸਦਾ ਪਾਣੀ ਮਿੱਠਾ ਹੁੰਦਾ ਹੈ।", ["ਨਰੇਲ"]],
      ["ਛੋਟੀ ਜਿਹੀ ਡੱਬੀ, ਵਿੱਚ ਬੰਦ ਰੌਸ਼ਨੀ,\nਇੱਕ ਰਗੜ ਨਾਲ ਬਲ ਉੱਠੇ।", "ਮਾਚਿਸ", "ਇਸ ਵਿੱਚ ਤੀਲੀਆਂ ਹੁੰਦੀਆਂ ਹਨ।", ["ਤੀਲੀਆਂ ਦੀ ਡੱਬੀ", "ਡੱਬੀ", "ਤੀਲੀ"]],
      ["ਜੰਗਲ ਦਾ ਰਾਜਾ ਕਹਾਵਾਂ,\nਦਹਾੜ ਨਾਲ ਸਭ ਨੂੰ ਡਰਾਵਾਂ।", "ਸ਼ੇਰ", "ਇਸਦੀ ਧੌਣ ਤੇ ਸੰਘਣੇ ਵਾਲ ਹੁੰਦੇ ਹਨ।", ["ਬੱਬਰ ਸ਼ੇਰ"]],
      ["ਬੋਲਦਾ ਹਾਂ ਪਰ ਮੂੰਹ ਨਹੀਂ, ਜੇਬ ਵਿੱਚ ਰਹਿੰਦਾ ਹਾਂ,\nਦੂਰ ਬੈਠਿਆਂ ਨਾਲ ਪਲ ਵਿੱਚ ਗੱਲ ਕਰਾਵਾਂ।", "ਮੋਬਾਈਲ", "ਤੁਸੀਂ ਸ਼ਾਇਦ ਇਸੇ ਤੇ ਪੜ੍ਹ ਰਹੇ ਹੋ!", ["ਫ਼ੋਨ", "ਫੋਨ", "ਮੋਬਾਈਲ ਫ਼ੋਨ"]],
      ["ਤੀਲਿਆਂ ਤੋਂ ਬਣੀ ਹਾਂ, ਸਵੇਰੇ ਵਿਹੜਾ ਚਮਕਾਵਾਂ,\nਮਿੱਟੀ ਘੱਟਾ ਦੂਰ ਭਜਾਵਾਂ।", "ਝਾੜੂ", "ਸਫ਼ਾਈ ਦੇ ਕੰਮ ਆਉਂਦਾ ਹੈ।", ["ਬੁਹਾਰੀ"]],
      ["ਮਿੱਠਾ ਮਿੱਠਾ, ਪੀਲਾ ਪੀਲਾ, ਫਲਾਂ ਦਾ ਰਾਜਾ,\nਗਰਮੀਆਂ ਵਿੱਚ ਹੀ ਆਵਾਂ।", "ਅੰਬ", "ਫਲਾਂ ਦਾ ਰਾਜਾ।"],
      ["ਚਿੱਟੇ ਚਿੱਟੇ ਰੂੰ ਵਰਗੇ, ਅਸਮਾਨ ਵਿੱਚ ਤੈਰਦੇ,\nਕਦੇ ਵਰ੍ਹਦੇ, ਕਦੇ ਛਾਂ ਕਰਦੇ।", "ਬੱਦਲ", "ਮੀਂਹ ਇਹਨਾਂ ਤੋਂ ਪੈਂਦਾ ਹੈ।"],
      ["ਧੁੱਪ ਵਿੱਚ ਤੇਰੇ ਨਾਲ ਤੁਰਾਂ, ਕਦੇ ਲੰਮਾ ਕਦੇ ਛੋਟਾ,\nਹਨੇਰਾ ਹੁੰਦੇ ਹੀ ਗੁਆਚ ਜਾਵਾਂ।", "ਪਰਛਾਵਾਂ", "ਰੌਸ਼ਨੀ ਦੇ ਉਲਟ ਪਾਸੇ ਬਣਦਾ ਹੈ।", ["ਪਰਛਾਈਂ", "ਛਾਂ"]],
      ["ਖੇਤਾਂ ਵਿੱਚ ਸੋਨੇ ਵਰਗੀ, ਵਿਸਾਖੀ ਨੂੰ ਵੱਢੀ ਜਾਵਾਂ,\nਪੀਹ ਕੇ ਆਟਾ ਬਣਾਂ, ਹਰ ਘਰ ਦੀ ਰੋਟੀ ਬਣਾਂ।", "ਕਣਕ", "ਪੰਜਾਬ ਦੀ ਮੁੱਖ ਫ਼ਸਲ।"],
      ["ਪਿੰਡ ਦੇ ਖੂਹ ਤੋਂ ਪਾਣੀ ਕੱਢਾਂ,\nਬਲਦ ਮੇਰੇ ਦੁਆਲੇ ਗੋਲ ਗੋਲ ਘੁੰਮਣ।", "ਹਲਟ", "ਪੁਰਾਣੇ ਸਮਿਆਂ ਵਿੱਚ ਖੇਤਾਂ ਨੂੰ ਪਾਣੀ ਦੇਣ ਲਈ।", ["ਟਿੰਡਾਂ ਵਾਲਾ ਖੂਹ"]],
      ["ਦੁੱਧ ਤੋਂ ਬਣਾਂ, ਮਧਾਣੀ ਨਾਲ ਰਿੜਕਿਆ ਜਾਵਾਂ,\nਗਰਮ ਪਰੌਂਠੇ ਉੱਤੇ ਖੁਰਦਾ ਜਾਵਾਂ।", "ਮੱਖਣ", "ਲੱਸੀ ਰਿੜਕਣ ਨਾਲ ਨਿਕਲਦਾ ਹੈ।", ["ਮੱਖਣ ਦਾ ਪੇੜਾ"]],
      ["ਪੀਲੀ ਤੇ ਗੋਲ, ਮੱਕੀ ਤੋਂ ਬਣਾਂ,\nਸਰ੍ਹੋਂ ਦੇ ਸਾਗ ਨਾਲ ਖਾਧੀ ਜਾਵਾਂ।", "ਮੱਕੀ ਦੀ ਰੋਟੀ", "ਸਰਦੀਆਂ ਦਾ ਪੰਜਾਬੀ ਖਾਣਾ।", ["ਮੱਕੀ ਦੀ ਰੋਟੀ ਤੇ ਸਰ੍ਹੋਂ ਦਾ ਸਾਗ", "ਰੋਟੀ"]],
      ["ਪੰਜ ਭਰਾ ਇੱਕੋ ਘਰ ਵਿੱਚ ਰਹਿਣ,\nਕੋਈ ਲੰਮਾ ਕੋਈ ਛੋਟਾ।", "ਉਂਗਲਾਂ", "ਇਹ ਤੁਹਾਡੇ ਹੱਥ ਵਿੱਚ ਹਨ।", ["ਉਂਗਲੀਆਂ", "ਉਂਗਲ", "ਹੱਥ"]],
      ["ਕਿਤਾਬਾਂ ਦਾ ਘਰ ਹਾਂ, ਪਰ ਕੋਈ ਰਹਿੰਦਾ ਨਹੀਂ,\nਚੁੱਪ ਕਰਕੇ ਪੜ੍ਹੋ ਇੱਥੇ।", "ਲਾਇਬ੍ਰੇਰੀ", "ਸਕੂਲ ਵਿੱਚ ਵੀ ਹੁੰਦੀ ਹੈ।", ["ਪੁਸਤਕਾਲਾ", "ਲਾਇਬਰੇਰੀ"]],
      ["ਗੋਲ ਗੋਲ ਰੋਟੀ ਵਰਗਾ, ਪਰ ਖਾਧਾ ਨਾ ਜਾਵੇ,\nਸਵੇਰੇ ਚੜ੍ਹਦੇ ਪਾਸਿਓਂ ਆਵੇ।", "ਸੂਰਜ", "ਦਿਨੇ ਚਮਕਦਾ ਹੈ।", ["ਸੂਰਜ ਦੇਵਤਾ"]],
      ["ਖੁੱਲ੍ਹਾਂ ਤਾਂ ਮੀਂਹ ਤੋਂ ਬਚਾਵਾਂ,\nਬੰਦ ਹੋਵਾਂ ਤਾਂ ਸੋਟੀ ਬਣ ਜਾਵਾਂ।", "ਛਤਰੀ", "ਬਰਸਾਤ ਵਿੱਚ ਨਾਲ ਲੈ ਕੇ ਜਾਂਦੇ ਹਾਂ।"]]
  };
  var P = R.player(BANK.PUNJABI, { key: 'punjabi', lang: 'pa' });
  spot.appendChild(T.card([P.el])); spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['riddles-punjabi'] = function () {
    var f = R.checkBank(BANK.PUNJABI, 30), lion = BANK.PUNJABI.map(R.item).filter(function (x) { return x.a === 'ਸ਼ੇਰ'; })[0];
    if (!lion || !R.match('ਸ਼ੇਰ', lion) || !R.match('ਸੇਰ', lion)) f.push('nukta');
    BANK.PUNJABI.forEach(function (x) { if (!/[਀-੿]/.test(x[0] + x[1] + x[2])) f.push('not Gurmukhi: ' + x[1]); });
    return Promise.resolve({ ok: !f.length, n: BANK.PUNJABI.length * 4 + 2, fails: f.slice(0, 8) });
  };
});
