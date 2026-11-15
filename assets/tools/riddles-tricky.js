/* Infinity by GroupChatOn — riddles-tricky. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Tricky riddles with hints: wordplay and double meanings, 40 of our own, each with a hint and the explanation after you solve it. */
GCOTools.register('riddles-tricky', function (spot, T) {
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
    TRICKY: [
      ["I lie in a bed all day, yet I am wide awake, and bees come to visit me. What am I?", "A flower", "Think of a garden “bed”.", ["flowers", "rose"], "A flower bed is a patch of garden soil, and flowers bloom there all day."],
      ["Take the first two letters off this five-letter word for a small rock and only one remains. What is the word?", "Stone", "Remove S and T.", [], "Stone minus “st” leaves “one”."],
      ["I run all day in the kitchen but I have no legs. Turn my head and I stop. What am I?", "A tap", "Water comes out of me.", ["faucet", "water tap"], "Water “runs” from a tap, and turning the tap’s head shuts it off."],
      ["I have a tongue but I cannot taste, and I get tied up in a bow every morning. What am I?", "A shoe", "You wear me on your foot.", ["shoes", "sneaker", "trainer"], "The flap under a shoe’s laces is called its tongue."],
      ["I have a head and a tail but no body, and I am often tossed in the air before a match. What am I?", "A coin", "Heads or tails?", ["coins"], "Coins are tossed to decide who bats or kicks off first."],
      ["Where does Thursday come before Tuesday, and Friday come first of all the days?", "In a dictionary", "Think of alphabetical order.", ["dictionary", "alphabetical order", "alphabetically"], "In alphabetical order: Friday, Monday, Saturday, Sunday, Thursday, Tuesday, Wednesday."],
      ["I go round your waist every day but I am not a hug. I have a buckle but I am not a shoe. What am I?", "A belt", "It holds your trousers up."],
      ["I am a letter of the alphabet, an insect that buzzes, and a word that means “to exist”. What am I?", "B", "Say the three words aloud.", ["bee", "be", "letter b"], "B, bee and be all sound the same."],
      ["I am a letter of the alphabet, the thing you see with, and the word you use for yourself. What am I?", "I", "Say the three words aloud.", ["eye", "letter i"], "I, eye and I sound the same."],
      ["I am a letter of the alphabet, a huge body of salt water, and what you do with your eyes. What am I?", "C", "Say the three words aloud.", ["sea", "see", "letter c"], "C, sea and see sound the same."],
      ["I follow you all day in the sun and copy every move you make, but I vanish when the clouds roll in. What am I?", "Your shadow", "The sun is behind you.", ["shadow", "shadows"]],
      ["I am a table nobody eats from, and children chant me out loud: “two twos are four”. What am I?", "A times table", "Maths class.", ["multiplication table", "table", "times tables", "pahada"], "Multiplication tables are learned by chanting them."],
      ["I am a bank with no money and no manager, but people sit on me to fish. What am I?", "A river bank", "Water flows beside me.", ["riverbank", "bank of a river", "river"], "The side of a river is called its bank."],
      ["I am a key that opens no door. You find me in the corner of a map, and I explain what the symbols mean. What am I?", "A map key", "It is also called a legend.", ["key", "legend", "map legend"]],
      ["I have bark but I never bite, and birds build their homes in my arms. What am I?", "A tree", "Bark is my skin.", ["trees"], "Trees have bark, and their branches are like arms."],
      ["I have a foot but no toes, I am 12 inches long, and students carry me in their geometry box. What am I?", "A ruler", "You draw straight lines with me.", ["scale", "foot ruler", "foot scale"], "A 12-inch ruler is exactly one foot long."],
      ["I am a palm with no fingers, and coconuts grow at my top. What am I?", "A palm tree", "You see me on beaches.", ["coconut tree", "palm"]],
      ["I am a mouse that eats no cheese and lives next to your keyboard. What am I?", "A computer mouse", "You click me.", ["mouse"]],
      ["I am a jam you cannot spread on bread, and honking horns never make me go faster. What am I?", "A traffic jam", "Think of a busy road.", ["traffic"]],
      ["I give a ring that no finger can wear, and when you hear it someone wants to talk to you. What am I?", "A telephone", "It rings.", ["phone", "mobile", "mobile phone", "cell phone"]],
      ["I am a star that never shines, with five arms, and I live on the sea floor. What am I?", "A starfish", "A sea creature.", ["sea star"]],
      ["I come at the end of “time”, at the start of “everything”, and twice in the middle of “street”. What am I?", "The letter E", "Look at the spellings.", ["e", "letter e"]],
      ["I sound exactly like a number, but I mean “as well”. Which word am I?", "Too", "Think of the number after one.", ["also"], "“Too” sounds like “two”."],
      ["Jumble five letters of “lemonade” to find a round green fruit. What is it?", "Melon", "It is juicy and has many seeds.", ["melons"], "L-E-M-O-N-A-D-E contains M, E, L, O, N."],
      ["I am a cup that never holds tea, and champions lift me high. What am I?", "A trophy", "Winners get me.", ["cup", "world cup", "trophy cup"]],
      ["I am a pen that never writes, and pigs live inside me. What am I?", "A pig pen", "A farm enclosure.", ["pigpen", "pen", "sty", "pigsty"]],
      ["I am a bat that never flies, and I am swung on a cricket pitch. What am I?", "A cricket bat", "Batsmen hold me.", ["bat"]],
      ["I am a deck with no sailors, but I carry kings, queens and jacks. What am I?", "A deck of cards", "People play games with me.", ["cards", "playing cards", "pack of cards"]],
      ["I am a crane that never flies, and I lift steel on building sites. What am I?", "A crane", "A machine, not a bird.", ["construction crane"]],
      ["I have a head and a foot but nothing in between, and you lie on me every night. What am I?", "A bed", "You sleep on me.", ["beds", "cot"]],
      ["I am a chest with no heart and no lungs, and pirates fill me with gold. What am I?", "A treasure chest", "Think of a box.", ["chest", "treasure box"]],
      ["Which letter of the alphabet asks a question?", "Y", "Say the letter aloud.", ["why", "letter y"], "Y sounds like “why”."],
      ["People take me at weddings and birthdays, yet I am never stolen. Say “cheese” and I keep the moment for ever. What am I?", "A photo", "Cameras make me.", ["photograph", "picture", "selfie", "pic"]],
      ["Find an English word with three pairs of double letters one after another.", "Bookkeeper", "Someone who keeps accounts.", ["bookkeeping", "book keeper"], "b-OO-KK-EE-per."],
      ["Your glasses rest on my bridge, but no river flows under it. What am I?", "Your nose", "It is on your face.", ["nose"]],
      ["I am a spring that is not a season, and I bounce inside your mattress. What am I?", "A spring (coil)", "A metal coil.", ["spring", "coil", "springs"]],
      ["I am a pupil who never goes to school, and I sit in the middle of your eye. What am I?", "The pupil of the eye", "The dark circle in your eye.", ["pupil", "eye"]],
      ["I am a game played with a racket against a wall, and I am also a vegetable. What am I?", "Squash", "Think of a pumpkin’s cousin.", ["squash"]],
      ["I am a date that you can eat, and also a day in your diary. What am I?", "A date", "A sweet brown fruit.", ["dates", "khajoor"]],
      ["I have hands but cannot clap, a face but cannot smile, and I hang on the wall of every classroom. What am I?", "A clock", "It ticks.", ["wall clock", "watch"]]]
  };
  var P = R.player(BANK.TRICKY, { key: 'tricky' });
  spot.appendChild(T.card([P.el])); spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['riddles-tricky'] = function () {
    var f = R.checkBank(BANK.TRICKY, 40);
    var dict = BANK.TRICKY.map(R.item).filter(function (x) { return /dictionary/i.test(x.a); })[0];
    if (!dict || !R.match('alphabetical order', dict)) f.push('dictionary alt');
    return Promise.resolve({ ok: !f.length, n: BANK.TRICKY.length * 3 + 1, fails: f.slice(0, 8) });
  };
});
