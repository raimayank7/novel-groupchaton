/* Infinity by GroupChatOn — brain-teasers. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Brain teasers for adults: harder puzzles in numbers, words, probability and sideways thinking, each with a hint and a clear explanation. */
GCOTools.register('brain-teasers', function (spot, T) {
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
    BRAIN: [
      ["Rearrange the letters of LISTEN to make a word that means “making no sound”.", "Silent", "Same six letters.", [], "L-I-S-T-E-N → S-I-L-E-N-T."],
      ["Find a five-letter word meaning “to begin” that is still a real word when you remove its first letter, and again when you remove the next one.", "Start", "The second word is a kind of pie.", [], "start → tart → art."],
      ["What comes next: 1, 11, 21, 1211, 111221, …?", "312211", "Read each number aloud, describing the one before.", [], "111221 is “three 1s, two 2s, one 1”: 312211."],
      ["A 24-hour digital clock shows hours and minutes. How many times a day do all four digits show the same number?", "3", "00:00 is one.", ["three"], "00:00, 11:11 and 22:22. (33:33 does not exist.)"],
      ["How many times a day do the hour and minute hands of a clock lie exactly on top of each other?", "22", "Not 24.", [], "They overlap 11 times every 12 hours, so 22 times a day."],
      ["Using only addition, how can you add eight 8s to make 1000?", "888 + 88 + 8 + 8 + 8", "Join some 8s together.", ["888+88+8+8+8"], "888 + 88 = 976, and 976 + 24 = 1000."],
      ["Three volumes stand in order on a shelf. Each has 3 cm of pages and covers 0.5 cm thick. A bookworm eats from page 1 of volume 1 to the last page of volume 3. How far does it travel?", "5 cm", "On a shelf, page 1 of volume 1 is on its right-hand side.", ["5"], "It eats only volume 1’s front cover, all of volume 2 (4 cm) and volume 3’s back cover: 0.5 + 4 + 0.5 = 5 cm."],
      ["Sohan is 24. He is twice as old as Mohan was when Sohan was as old as Mohan is now. How old is Mohan?", "18", "The age gap never changes.", ["18 years"], "When Sohan was 18 (6 years ago), Mohan was 12, and 24 is twice 12."],
      ["Which three whole numbers in a row multiply to 120?", "4, 5 and 6", "The middle one is close to the cube root of 120.", ["4 5 6", "4,5,6"], "4 × 5 × 6 = 120."],
      ["Name an English word that contains all five vowels in order: a, e, i, o, u.", "Facetious", "It means joking at the wrong time.", ["abstemious", "arsenious"], "f-A-c-E-t-I-O-U-s."],
      ["If a hen and a half lays an egg and a half in a day and a half, how many eggs do 6 hens lay in 6 days?", "24", "One hen lays one egg in a day and a half.", [], "One hen lays ⅔ egg a day; 6 hens × 6 days × ⅔ = 24."],
      ["In a group of 23 people, is the chance that two share a birthday more or less than 50%?", "More", "Count pairs, not people.", ["more than 50%", "more than half", "more than 50"], "There are 253 pairs among 23 people, and the chance is about 50.7%."],
      ["A prize is hidden in one of three boxes. You pick one. The host, who knows where the prize is, opens an empty box from the other two and offers you a swap. Should you swap?", "Yes, swap", "Your first pick was right only 1 time in 3.", ["swap", "yes", "switch"], "Swapping wins 2 times out of 3, because the host’s choice tells you something."],
      ["Which number, written in English words, has all its letters in alphabetical order?", "Forty", "F, O, R, T, Y.", ["40"], "f < o < r < t < y."],
      ["What is special about the number 8,549,176,320?", "Its digits are in alphabetical order", "Spell each digit.", ["alphabetical order", "alphabetical"], "eight, five, four, nine, one, seven, six, three, two, zero."],
      ["A square has a perimeter of 24 cm. Four of them are joined side by side in a row. What is the perimeter of the new shape?", "60 cm", "Each side is 6 cm.", ["60"], "The new rectangle is 24 cm by 6 cm: 2 × (24 + 6) = 60 cm."],
      ["If 1 = 5, 2 = 25, 3 = 125 and 4 = 625, then 5 = ?", "1", "Read the first line again.", ["one"], "The first line says 1 = 5, so 5 = 1."],
      ["Using four 4s and any maths signs, make the number 1.", "44 ÷ 44", "Two 4s together make 44.", ["44/44", "(4+4)/(4+4)", "4/4*4/4"], "44 ÷ 44 = 1 (or (4 + 4) ÷ (4 + 4))."],
      ["Which is larger: 2 to the power of 10, or 10 to the power of 3?", "2 to the power of 10", "Work them out.", ["2^10", "1024", "2 power 10"], "2¹⁰ = 1024, and 10³ = 1000."],
      ["A father is 4 times as old as his daughter. In 20 years he will be twice her age. How old are they now?", "10 and 40", "Let the daughter be d.", ["40 and 10", "daughter 10 father 40"], "4d + 20 = 2(d + 20), so d = 10 and the father is 40."],
      ["What does this mean?  STAND over I", "I understand", "Where is the I?", ["understand"], "I is under STAND."],
      ["What phrase does this show?  MAN over BOARD", "Man overboard", "Where is the man?", ["man over board"], "MAN is over BOARD."],
      ["What phrase does this show?  ───  reading  ───", "Reading between the lines", "Look at where the word sits.", ["between the lines"], "The word “reading” sits between two lines."],
      ["A clock seen in a mirror seems to show 4:20. What is the real time?", "7:40", "Subtract from 12:00.", ["7.40", "740"], "The mirror time and real time add up to 12:00."],
      ["64 players play a knockout tournament. How many matches are needed to find the champion?", "63", "Each match knocks out one player.", ["63 matches"], "63 players must lose once each."],
      ["You have 9 coins that look the same, and one is lighter. What is the smallest number of weighings on a balance that always finds it?", "2", "Split them into three groups.", ["two"], "Weigh 3 against 3: the light coin is in the lighter group or the 3 left out. Then weigh 1 against 1 from that group."],
      ["How many zeros are at the end of 25 × 24 × 23 × … × 2 × 1?", "6", "Count the factors of 5.", ["six"], "5, 10, 15, 20 give one 5 each, and 25 gives two: six 5s, each paired with a 2."],
      ["A wooden cube is painted red, then cut into 27 equal small cubes. How many small cubes have exactly two red faces?", "12", "They sit along the edges.", ["twelve"], "A cube has 12 edges, and each edge has one middle cube with two painted faces."],
      ["In the same 27-cube puzzle, how many small cubes have no paint at all?", "1", "Look inside.", ["one"], "Only the cube in the very centre is hidden."],
      ["What comes next: Z, X, V, T, R, …?", "P", "Skip one letter each time.", [], "Going backwards through the alphabet, skipping one letter."],
      ["Which word is the odd one out: stone, tones, notes, onset, tense?", "Tense", "Look at the letters, not the meanings.", [], "The others are all made from the letters S, T, O, N, E."],
      ["A train leaves Delhi at 6 am at 60 km/h. Another leaves Agra, 200 km away, at 7 am at 80 km/h towards Delhi. At what time do they meet?", "8 am", "At 7 am they are 140 km apart.", ["8", "8:00", "8am"], "They close 140 km at 140 km/h: one hour after 7 am."],
      ["Which month’s name has only three letters?", "May", "It comes before June.", [], "M-A-Y."]]
  };
  var P = R.player(BANK.BRAIN, { key: 'brain' });
  spot.appendChild(T.card([P.el])); spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['brain-teasers'] = function () {
    var f = R.checkBank(BANK.BRAIN, 30);
    if (888 + 88 + 8 + 8 + 8 !== 1000 || 4 * 5 * 6 !== 120) f.push('sums');
    // look-and-say
    var s = '111221', out = s.replace(/(\d)\1*/g, function (m, d) { return m.length + d; }); if (out !== '312211') f.push('look and say ' + out);
    // birthdays: chance two of 23 share one
    var p = 1; for (var i = 0; i < 23; i++) p *= (365 - i) / 365; if (!(1 - p > 0.5)) f.push('birthday');
    // trailing zeros of 25!
    var z = Math.floor(25 / 5) + Math.floor(25 / 25); if (z !== 6) f.push('zeros');
    var it = R.item(BANK.BRAIN.filter(function (x) { return /eight 8s/.test(x[0]); })[0]);
    if (!R.match('888+88+8+8+8', it)) f.push('sum answer');
    return Promise.resolve({ ok: !f.length, n: BANK.BRAIN.length * 3 + 6, fails: f.slice(0, 8) });
  };
});
