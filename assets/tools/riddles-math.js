/* Infinity by GroupChatOn — riddles-math. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Maths riddles and number puzzles: 35+ of our own, from easy to clever, with hints and worked answers. Numbers are checked however you write them. */
GCOTools.register('riddles-math', function (spot, T) {
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
    MATH: [
      ["I am a two-digit number. My digits add up to 9, and my tens digit is twice my units digit. What am I?", "63", "Try tens digits 2, 4, 6, 8.", [], "6 + 3 = 9 and 6 is twice 3."],
      ["Asha has 12 mangoes. She gives a third to her brother and then half of what is left to her friend. How many does she keep?", "4", "A third of 12 is 4.", [], "12 − 4 = 8, and half of 8 is 4."],
      ["How many cuts do you need to cut a rope into 5 equal pieces?", "4", "Draw it.", [], "Each cut makes one more piece: 4 cuts give 5 pieces."],
      ["What positive number, when you add it to its own square, gives 30?", "5", "Try small numbers.", [], "5 × 5 = 25, and 25 + 5 = 30."],
      ["A melon weighs 3 kg plus a quarter of the melon. How much does the whole melon weigh?", "4 kg", "The 3 kg must be three quarters.", ["4"], "If 3 kg is ¾ of the melon, the whole melon is 4 kg."],
      ["I am thinking of a number. Double it and add 7, and you get 31. What is my number?", "12", "Work backwards.", [], "31 − 7 = 24, and 24 ÷ 2 = 12."],
      ["How many times does the digit 1 appear when you write all the numbers from 1 to 20?", "12", "Do not forget 11 has two.", [], "1, 10, 11 (twice) and 12 to 19 (8 times): 1 + 1 + 2 + 8 = 12."],
      ["A shop sells pencils at 3 for ₹10. How much do 15 pencils cost?", "₹50", "How many threes make 15?", ["50", "rs 50", "50 rupees"], "15 pencils are 5 sets of 3, so 5 × ₹10 = ₹50."],
      ["Four friends each shake hands once with every other friend. How many handshakes is that?", "6", "Count pairs.", [], "The pairs are AB, AC, AD, BC, BD, CD: 6."],
      ["A clock strikes 3 times at 3 o’clock, and it takes 2 seconds from the first strike to the last. How long does it take at 6 o’clock?", "5 seconds", "Count the gaps, not the strikes.", ["5"], "3 strikes have 2 gaps of 1 second each. 6 strikes have 5 gaps: 5 seconds."],
      ["Ravi is 3 times as old as his son. In 12 years he will be only twice as old. How old is the son now?", "12", "Try the son at 10, 11, 12…", ["12 years"], "Son 12, Ravi 36. In 12 years: 24 and 48, and 48 is twice 24."],
      ["A snail is at the bottom of a 10 m wall. Each day it climbs 3 m and each night it slips back 2 m. On which day does it reach the top?", "Day 8", "On the last day it does not slip back.", ["8", "8th", "eighth"], "After 7 days and nights it is at 7 m. On day 8 it climbs 3 m and reaches 10 m."],
      ["Draw a triangle, then one straight line from a corner to the opposite side. How many triangles can you see now?", "3", "Count the big one too.", ["three"], "Two small triangles plus the big one."],
      ["Three whole numbers in a row add up to 48. What is the largest of them?", "17", "The middle number is 48 ÷ 3.", [], "15 + 16 + 17 = 48."],
      ["Which number under 100 can be divided exactly by 2, 3, 4, 5 and 6?", "60", "Find the smallest number all of them divide.", [], "60 is the lowest common multiple of 2, 3, 4, 5 and 6, and 120 is too big."],
      ["If you write every number from 1 to 100, how many times do you write the digit 9?", "20", "Count 9 as a units digit and as a tens digit.", [], "10 times in the units place (9, 19 … 99) and 10 times in the tens place (90 … 99)."],
      ["Meera reads 15 pages on Monday and each day after that 5 more pages than the day before. How many pages has she read by Thursday night?", "90", "Monday 15, Tuesday 20…", [], "15 + 20 + 25 + 30 = 90."],
      ["A train 200 metres long passes a pole in 10 seconds. What is its speed in km/h?", "72 km/h", "First find metres per second.", ["72"], "200 ÷ 10 = 20 m/s, and 20 × 3.6 = 72 km/h."],
      ["What is the smallest number bigger than 1 that leaves a remainder of 1 when divided by 2, 3 or 4?", "13", "Think of 12.", [], "12 is divisible by 2, 3 and 4, so 13 leaves 1 each time."],
      ["Two numbers add up to 20 and multiply to 96. What are they?", "8 and 12", "Both are even.", ["12 and 8"], "8 + 12 = 20 and 8 × 12 = 96."],
      ["A three-digit number reads the same backwards. Its first digit is 2 and its digits add up to 5. What is it?", "212", "The last digit is also 2.", [], "2 + 1 + 2 = 5."],
      ["How many is half a dozen dozen?", "72", "A dozen is 12.", [], "Half a dozen is 6, and 6 × 12 = 72."],
      ["How many minutes are there in one week?", "10080", "60 × 24 × 7.", ["10,080"], "60 minutes × 24 hours × 7 days = 10,080."],
      ["A farmer has hens and cows: 10 heads and 28 legs in all. How many cows?", "4", "If all 10 were hens, there would be 20 legs.", ["4 cows"], "The 8 extra legs come from cows having 2 more legs each: 8 ÷ 2 = 4 cows."],
      ["3 tailors stitch 3 shirts in 3 hours. How many shirts can 6 tailors stitch in 6 hours?", "12", "One tailor makes one shirt in 3 hours.", ["12 shirts"], "In 6 hours one tailor makes 2 shirts, so 6 tailors make 12."],
      ["What comes next: 2, 6, 12, 20, 30, …?", "42", "Look at the gaps: 4, 6, 8, 10…", [], "The gaps grow by 2: 30 + 12 = 42."],
      ["What comes next: 1, 1, 2, 3, 5, 8, …?", "13", "Add the two numbers before.", [], "Each number is the sum of the two before it: 5 + 8 = 13."],
      ["What comes next: 3, 9, 27, 81, …?", "243", "Multiply.", [], "Each number is 3 times the last: 81 × 3 = 243."],
      ["What comes next: 100, 96, 88, 76, …?", "60", "Gaps: 4, 8, 12…", [], "The gaps go 4, 8, 12, 16: 76 − 16 = 60."],
      ["A pen and a notebook cost ₹60 together. The notebook costs ₹40 more than the pen. How much is the pen?", "₹10", "It is not ₹20.", ["10", "rs 10", "10 rupees"], "Pen ₹10 and notebook ₹50: together ₹60, and 50 − 10 = 40."],
      ["If today is Wednesday, what day of the week will it be 100 days from today?", "Friday", "100 = 14 weeks and 2 days.", [], "14 full weeks bring you back to Wednesday, and 2 more days make Friday."],
      ["How many squares of any size are there on a 3 × 3 grid?", "14", "Count 1×1, 2×2 and 3×3 squares.", [], "9 small + 4 medium + 1 large = 14."],
      ["In 5 years I will be twice as old as I was 5 years ago. How old am I?", "15", "The gap between the two ages is 10 years.", ["15 years"], "15 + 5 = 20, and 15 − 5 = 10: 20 is twice 10."],
      ["Tap A fills a tank in 6 hours and tap B in 3 hours. How long do both taps together take?", "2 hours", "Add what each fills in one hour.", ["2"], "In one hour A fills ⅙ and B fills ⅓, together ½ of the tank, so 2 hours."],
      ["Add a zero to the right of my number and I grow by 252. What is my number?", "28", "Adding a zero multiplies by 10.", [], "10 × 28 − 28 = 252."],
      ["A rectangle has a perimeter of 30 cm, and its length is twice its width. What is its area?", "50 square cm", "Length + width = 15.", ["50", "50 cm2", "50 sq cm"], "Width 5 and length 10: 5 × 10 = 50 square cm."]]
  };
  var P = R.player(BANK.MATH, { key: 'math' });
  spot.appendChild(T.card([P.el])); spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['riddles-math'] = function () {
    var f = R.checkBank(BANK.MATH, 35), M = BANK.MATH.map(R.item);
    function find(re) { return M.filter(function (x) { return re.test(x.q); })[0]; }
    // the sums behind the answers
    if (2 * 12 + 7 !== 31 || 15 + 16 + 17 !== 48 || 60 * 24 * 7 !== 10080 || 10 * 28 - 28 !== 252 || 8 * 12 !== 96) f.push('arithmetic');
    var n = 0; for (var i = 1; i <= 100; i++) n += String(i).split('9').length - 1; if (n !== 20) f.push('nines ' + n);
    var ones = 0; for (var j = 1; j <= 20; j++) ones += String(j).split('1').length - 1; if (ones !== 12) f.push('ones ' + ones);
    if (!R.match('12, 8', find(/add up to 20/)) || !R.match('Rs. 50', find(/pencils/))) f.push('number matching');
    if (!R.match('10,080', find(/minutes are there/))) f.push('comma number');
    if (R.match('13', find(/remainder of 1/)) !== true || R.match('12', find(/remainder of 1/))) f.push('remainder');
    return Promise.resolve({ ok: !f.length, n: BANK.MATH.length * 3 + 8, fails: f.slice(0, 8) });
  };
});
