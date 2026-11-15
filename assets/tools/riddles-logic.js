/* Infinity by GroupChatOn — riddles-logic. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Logic and lateral-thinking puzzles: seating, ages, truth-tellers and liars, codes and sideways-thinking stories, each with a full explanation. */
GCOTools.register('riddles-logic', function (spot, T) {
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
    LOGIC: [
      ["Two guards stand at two doors. One always tells the truth and one always lies. You ask guard A: “Which door would B say is safe?” He points to the left door. Which door is safe?", "The right door", "Whoever answers, one lie is in the chain.", ["right", "right door"], "If A is truthful, he truly reports B’s lie. If A lies, he twists B’s true answer. Either way the answer points to the unsafe door."],
      ["Three boxes are labelled “Blue pens”, “Red pens” and “Both”, and every label is wrong. You may take out one pen from one box without looking in. Which box should you pick from to fix all the labels?", "The box labelled Both", "That box cannot really have both.", ["both", "both box"], "The “Both” box holds only one colour. The pen you take shows which, and the other two labels follow."],
      ["Five friends sit in a row. Dev sits at the far left and Esha at the far right. Bina sits exactly in the middle, and Aman sits next to Dev. Who sits between Bina and Esha?", "Chetan", "Fill the seats 1 to 5.", [], "Dev, Aman, Bina, Chetan, Esha."],
      ["Riya is older than Sam. Tara is younger than Sam. Uma is older than Riya. Who is the youngest?", "Tara", "Put them in a line by age.", [], "From oldest: Uma, Riya, Sam, Tara."],
      ["In a race of 10 runners you are 7th. You overtake two runners, and then one runner overtakes you. What place are you in now?", "6th", "Move up two, down one.", ["6", "sixth"], "7th → 5th → 6th."],
      ["Mould on a slice of bread doubles in size every hour, and it covers the whole slice at 6 pm. At what time did it cover half the slice?", "5 pm", "One hour before it was full…", ["5", "5pm", "5:00"], "It doubles every hour, so one hour earlier it was half."],
      ["Nikhil, Owen and Priya have a cat, a dog and a parrot. Nikhil is allergic to fur. Owen’s pet barks. Who has the cat?", "Priya", "Fur rules out two pets for Nikhil.", [], "Nikhil has the parrot and Owen the dog, so Priya has the cat."],
      ["Four houses in a row are red, blue, green and yellow. The red house is at the left end. Green is right next to yellow. Blue is not next to red, and yellow is not next to blue. Which colour is second from the left?", "Yellow", "Blue must be at the far right.", [], "Red, yellow, green, blue is the only order that fits."],
      ["A clock shows 3:15. What is the angle between the hour and minute hands?", "7.5 degrees", "The hour hand has moved past 3.", ["7.5", "7.5°", "7½"], "The minute hand is on 3. The hour hand has moved a quarter of the way to 4: a quarter of 30° is 7.5°."],
      ["A drawer has 10 white socks and 10 black socks. In the dark, how many must you take out to be sure of getting two black socks?", "12", "Think of the unluckiest case.", ["12 socks"], "You might take all 10 white ones first; then 2 more are surely black."],
      ["If the day after tomorrow is Sunday, what day was yesterday?", "Thursday", "Count back from Sunday.", [], "Sunday is two days ahead, so today is Friday and yesterday was Thursday."],
      ["Ali is taller than Babu, and Chirag is shorter than Babu. Is Ali taller than Chirag?", "Yes", "Line them up.", ["yes he is", "ali"], "Ali > Babu > Chirag."],
      ["Every rose in this garden is red. Here is a yellow flower from this garden. What do you know about it?", "It is not a rose", "All the roses here are red.", ["not a rose", "no rose"], "If it were a rose from this garden, it would be red."],
      ["Which is the odd one out: 2, 3, 5, 9, 11?", "9", "Think about prime numbers.", [], "9 = 3 × 3 is the only one that is not prime."],
      ["A cyclist rides 20 km north, then 20 km east, then 20 km south. How far is she from where she started?", "20 km", "Draw the route.", ["20"], "North and south cancel out, leaving her 20 km east of the start."],
      ["Rohan’s phone showed 100% battery at night and still showed 100% in the morning, though he watched films all night. How?", "It was charging", "Something was plugged in.", ["charging", "charger", "plugged in", "it was plugged in"]],
      ["A train is due at 9:00. The station clock shows 8:55 as the train pulls in, yet the train is exactly on time. How?", "The clock is slow", "Is the clock right?", ["clock is 5 minutes slow", "slow clock", "the clock is wrong"], "The station clock is 5 minutes slow."],
      ["Pooja dropped a coin into an empty bottle and pushed a cork into its neck. How can she get the coin out without pulling the cork or breaking the bottle?", "Push the cork into the bottle", "Think about where else the cork can go.", ["push the cork in", "push cork inside", "push the cork inside"], "Push the cork all the way in, then tip the coin out."],
      ["A shop sign says “Free ice cream tomorrow!” Raju comes back every day but never gets a free ice cream. Why?", "It is always tomorrow", "When he comes back, what day is it?", ["tomorrow never comes", "the sign never changes", "always tomorrow"], "Each day the sign still says “tomorrow”."],
      ["Gita fills a glass to the brim with water and floating ice cubes. When all the ice melts, does the water overflow?", "No", "Floating ice pushes aside its own weight in water.", ["no it does not", "it does not overflow", "no overflow"], "Melted ice takes exactly the space the floating ice was pushing aside."],
      ["A frog at the bottom of 5 steps jumps up 2 steps and then slips back 1 step each time. How many jumps does it take to reach the top step?", "4", "On the last jump it does not slip.", ["4 jumps", "four"], "After jumps 1–3 it rests on steps 1, 2 and 3. Jump 4 takes it from 3 to 5."],
      ["A pot of water stands on a scale. You add a live fish that swims without touching the bottom. Does the scale show more, less or the same?", "More", "Where does the fish’s weight go?", ["heavier", "more weight", "it shows more"], "The fish’s weight is carried by the water, which presses on the pot."],
      ["The 1st of a month is a Monday. What day is the 29th?", "Monday", "28 days is exactly 4 weeks.", [], "29 − 1 = 28 days later: 4 whole weeks."],
      ["If CAT is written in code as DBU, how is DOG written?", "EPH", "Each letter moves one step.", [], "Each letter is replaced by the next one: D→E, O→P, G→H."],
      ["If MANGO is written in code as OGNAM, how is APPLE written?", "ELPPA", "Read it in a mirror.", [], "The word is written backwards."],
      ["Raj has as many sisters as brothers, but each of his sisters has twice as many brothers as sisters. How many children are in the family?", "7", "Try 4 boys.", ["7 children", "seven"], "4 boys and 3 girls: Raj has 3 brothers and 3 sisters; each girl has 4 brothers and 2 sisters."],
      ["A rectangle’s length is doubled and its width is halved. What happens to its area?", "It stays the same", "2 × ½ = ?", ["same", "no change", "unchanged"], "Area = length × width, and 2 × ½ = 1."],
      ["Which is more: the number of seconds in an hour, or the number of minutes in a week?", "Minutes in a week", "Work both out.", ["minutes in a week", "the minutes", "minutes"], "3,600 seconds in an hour; 10,080 minutes in a week."],
      ["A diary says: “Today is the day after the day before yesterday’s tomorrow.” If yesterday was Sunday, what day is it?", "Monday", "Unpick it from the inside.", [], "The day before yesterday’s tomorrow is yesterday, and the day after that is today."],
      ["A painter paints the numbers 1 to 50 on hotel room doors. How many times does he paint the digit 4?", "15", "Count 40 to 49 carefully.", [], "5 times in the units place (4, 14, 24, 34, 44) and 10 times in the tens place (40–49)."],
      ["Ankit says “Beena is lying.” Beena says “Chandu is lying.” Chandu says “Ankit and Beena are both lying.” Who is telling the truth?", "Beena", "Try assuming Chandu is truthful.", ["only beena", "beena only"], "If Chandu were truthful, Beena would be lying, so Chandu is honest after all: a contradiction. So Chandu lies, which makes Beena truthful and Ankit a liar."],
      ["Look at this pattern: J, F, M, A, M, J, J, … Which letter comes next?", "A", "Think of the year.", ["august"], "They are the months: January, February … July, August."],
      ["What comes next: M, T, W, T, F, S, …?", "S", "Think of the week.", ["sunday"], "Monday to Sunday."]]
  };
  var P = R.player(BANK.LOGIC, { key: 'logic' });
  spot.appendChild(T.card([P.el])); spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['riddles-logic'] = function () {
    var f = R.checkBank(BANK.LOGIC, 32);
    // the truth-teller puzzle: only one assignment fits
    var ok = [];
    [0, 1].forEach(function (a) { [0, 1].forEach(function (b) { [0, 1].forEach(function (c) { if ((a === (b ? 0 : 1)) && (b === (c ? 0 : 1)) && (c === (!a && !b ? 1 : 0))) ok.push('' + a + b + c); }); }); });
    if (ok.join() !== '010') f.push('truth puzzle ' + ok.join());
    // the house puzzle: only red-yellow-green-blue fits
    var fits = [];
    ['RBGY', 'RBYG', 'RGBY', 'RGYB', 'RYBG', 'RYGB'].forEach(function (s) {
      var p = function (c) { return s.indexOf(c); };
      if (Math.abs(p('G') - p('Y')) === 1 && Math.abs(p('B') - p('R')) !== 1 && Math.abs(p('Y') - p('B')) !== 1) fits.push(s);
    });
    if (fits.join() !== 'RYGB') f.push('houses ' + fits.join());
    if ('CAT'.replace(/./g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 1); }) !== 'DBU') f.push('code');
    return Promise.resolve({ ok: !f.length, n: BANK.LOGIC.length * 3 + 3, fails: f.slice(0, 8) });
  };
});
