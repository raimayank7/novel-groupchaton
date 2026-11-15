/* Infinity by GroupChatOn — emoji-riddles. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Emoji riddles: guess the word, film, place, food or saying from a few emoji. Type your guess or open four choices; 75+ puzzles. */
GCOTools.register('emoji-riddles', function (spot, T) {
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
    EMOJI: [
      ["☀️🌻", "Sunflower", "A tall yellow flower.", [], "word"],
      ["🌧️🎀", "Rainbow", "Rain + bow.", [], "word"],
      ["🔥🪰", "Firefly", "An insect that glows.", [], "word"],
      ["⭐🐟", "Starfish", "A sea creature.", ["sea star"], "word"],
      ["🧈🪰", "Butterfly", "Butter + fly.", [], "word"],
      ["🦶⚽", "Football", "Foot + ball.", ["soccer"], "word"],
      ["🥚🌱", "Eggplant", "Also called brinjal.", ["brinjal", "baingan", "aubergine"], "word"],
      ["🌙💡", "Moonlight", "Moon + light.", [], "word"],
      ["❄️⛄", "Snowman", "Built in winter.", [], "word"],
      ["🧠🌪️", "Brainstorm", "Many ideas at once.", ["brain storm"], "word"],
      ["🦷🖌️", "Toothbrush", "Used twice a day.", ["tooth brush"], "word"],
      ["🍯🌙", "Honeymoon", "A holiday after a wedding.", ["honey moon"], "word"],
      ["🔑🕳️", "Keyhole", "Key + hole.", ["key hole"], "word"],
      ["🛏️⏰", "Bedtime", "Time to sleep.", ["bed time"], "word"],
      ["🐱🐟", "Catfish", "A fish with whiskers.", [], "word"],
      ["💧🍉", "Watermelon", "A big summer fruit.", ["water melon"], "word"],
      ["🌊🐴", "Seahorse", "A tiny fish shaped like a horse.", ["sea horse"], "word"],
      ["🌽🍿", "Popcorn", "Eaten at the cinema.", ["pop corn"], "word"],
      ["📖🐛", "Bookworm", "Someone who loves reading.", ["book worm"], "word"],
      ["☁️🏙️🖐️", "Skyscraper", "Sky + scraper: a very tall building.", ["sky scraper"], "word"],
      ["🦁👑", "The Lion King", "An animated film about Simba.", ["lion king"], "film"],
      ["🕷️🧑", "Spider-Man", "A superhero who climbs walls.", ["spiderman", "spider man"], "film"],
      ["❄️👸⛄", "Frozen", "Let it go!", [], "film"],
      ["🚢🧊💔", "Titanic", "A ship hits an iceberg.", [], "film"],
      ["🦖🦕🏞️", "Jurassic Park", "Dinosaurs come back.", [], "film"],
      ["🐠🔍", "Finding Nemo", "A father fish searches for his son.", ["nemo"], "film"],
      ["💍🌋🧙", "The Lord of the Rings", "One ring to rule them all.", ["lord of the rings"], "film"],
      ["👻🚫", "Ghostbusters", "Who you gonna call?", ["ghost busters"], "film"],
      ["🏏🌾👑", "Lagaan", "Villagers play cricket against the British.", [], "film"],
      ["🤼‍♀️👨‍👧‍👧🥇", "Dangal", "A father trains his daughters to wrestle.", [], "film"],
      ["🚂➡️🌴", "Chennai Express", "A train journey to the south.", [], "film"],
      ["3️⃣🤪🎓", "3 Idiots", "All is well!", ["three idiots"], "film"],
      ["👽📻🌍", "PK", "An alien loses his remote.", ["p k"], "film"],
      ["🦈🌊😱", "Jaws", "A shark film.", [], "film"],
      ["🐼🥋", "Kung Fu Panda", "A panda learns martial arts.", ["kungfu panda"], "film"],
      ["🐀👨‍🍳🇫🇷", "Ratatouille", "A rat who cooks in Paris.", [], "film"],
      ["🏠🎈🎈👴", "Up", "A house flies away with balloons.", [], "film"],
      ["🤖🌱🌍", "WALL-E", "A little robot cleans up the Earth.", ["wall e", "walle"], "film"],
      ["🦇🦸‍♂️🌃", "Batman", "The dark knight.", ["the dark knight", "bat man"], "film"],
      ["⭐⚔️🌌", "Star Wars", "A galaxy far, far away.", [], "film"],
      ["🧞🪔🧕", "Aladdin", "A lamp and three wishes.", [], "film"],
      ["🐘👂🎪", "Dumbo", "An elephant who flies with his big ears.", [], "film"],
      ["🍎👸💤", "Snow White", "A poisoned apple.", [], "film"],
      ["👠🕛🎃", "Cinderella", "A glass slipper at midnight.", [], "film"],
      ["🗽🍎", "New York", "The Big Apple.", ["new york city", "nyc"], "place"],
      ["🗼🥖", "Paris", "The city of the Eiffel Tower.", ["france"], "place"],
      ["🕌💕🇮🇳", "Agra", "Home of the Taj Mahal.", ["taj mahal"], "place"],
      ["🗻🍣🌸", "Japan", "Mount Fuji and cherry blossoms.", ["tokyo"], "place"],
      ["🦘🏄🐨", "Australia", "Kangaroos and koalas.", ["sydney"], "place"],
      ["🌉🌁🚋", "San Francisco", "A famous red bridge in fog.", [], "place"],
      ["🩷🏙️🐪", "Jaipur", "The Pink City of Rajasthan.", ["pink city"], "place"],
      ["🍵🏔️🚂", "Darjeeling", "Tea gardens and a toy train.", [], "place"],
      ["🏖️🥥🎉", "Goa", "India’s smallest state, famous for beaches.", [], "place"],
      ["🕰️🎡☔", "London", "Big Ben and the London Eye.", ["england", "uk"], "place"],
      ["🍕↘️🗼", "Pisa", "A tower that leans.", ["italy", "leaning tower of pisa"], "place"],
      ["🐫🔺☀️", "Egypt", "Pyramids in the desert.", ["cairo", "giza"], "place"],
      ["🛕🌅🚣", "Varanasi", "Ghats on the Ganga.", ["banaras", "benaras", "kashi"], "place"],
      ["🍁🏒", "Canada", "Maple leaf and ice hockey.", [], "place"],
      ["🌷🚲🧀", "Netherlands", "Tulips, bikes and cheese.", ["holland", "amsterdam"], "place"],
      ["🐉🧱", "China", "A very long wall.", ["great wall of china", "great wall"], "place"],
      ["🛕✨🙏", "Amritsar", "Home of the Golden Temple.", ["golden temple", "harmandir sahib"], "place"],
      ["🥔🫓🧈", "Aloo paratha", "A stuffed flatbread with butter.", ["aloo parantha", "paratha", "parantha"], "food"],
      ["🫘🍚", "Rajma chawal", "Kidney beans with rice.", ["rajma rice", "rajma"], "food"],
      ["🌽🫓🥬", "Makki di roti and sarson da saag", "A Punjabi winter meal.", ["makki ki roti", "sarson ka saag", "makki di roti", "sarson da saag"], "food"],
      ["🍋💧🧂", "Nimbu pani", "A lemon drink for summer.", ["lemonade", "shikanji", "lemon water", "nimbu paani"], "food"],
      ["🍚🥛🍬", "Kheer", "Rice cooked in sweet milk.", ["rice pudding", "payasam"], "food"],
      ["🍞🧈", "Bread and butter", "A simple breakfast.", ["bread butter"], "food"],
      ["🥛🥭", "Mango shake", "A summer drink.", ["mango lassi", "mango milkshake"], "food"],
      ["🌧️🐱🐶", "Raining cats and dogs", "It is raining very hard.", ["its raining cats and dogs"], "phrase"],
      ["🧩🍰", "Piece of cake", "Something very easy.", ["a piece of cake"], "phrase"],
      ["⏰💰", "Time is money", "Do not waste time.", [], "phrase"],
      ["🐘🛋️", "Elephant in the room", "An obvious problem nobody talks about.", ["the elephant in the room"], "phrase"],
      ["1️⃣🔵🌙", "Once in a blue moon", "Very rarely.", [], "phrase"],
      ["2️⃣🐦1️⃣🪨", "Kill two birds with one stone", "Do two things with one action.", ["two birds one stone"], "phrase"],
      ["🔝🧊🏔️", "Tip of the iceberg", "A small part of a bigger problem.", [], "phrase"],
      ["🔨🧊", "Break the ice", "Start a conversation.", [], "phrase"],
      ["🛒🐴", "Cart before the horse", "Doing things in the wrong order.", ["put the cart before the horse"], "phrase"],
      ["💡🧠", "Bright idea", "A clever thought.", ["bright idea"], "phrase"]]
  };
  var KIND = [['all', 'All'], ['word', 'Words'], ['film', 'Films'], ['place', 'Places'], ['food', 'Food'], ['phrase', 'Sayings']];
  var LABEL = { word: 'Guess the word', film: 'Guess the film', place: 'Guess the place', food: 'Guess the food', phrase: 'Guess the saying' };
  // stored as [emoji, answer, hint, alts, kind] → [question, answer, hint, alts, explanation, kind]
  var RAW = BANK.EMOJI.map(function (x) { return [x[0], x[1], x[2], x[3], '', x[4]]; });
  var kind = T.store.get('emoji-riddles-kind', 'all'), box = h('div', { style: 'display:grid;gap:10px;min-width:0' }), label = h('p', { 'class': 'rd-num', style: 'text-align:center;font-size:15px' }), P;
  function load() {
    var list = kind === 'all' ? RAW : RAW.filter(function (x) { return x[5] === kind; });
    P = R.player(list, { key: 'emoji-' + kind, emoji: true, choices: '🔤 Choices', sameKind: true, onView: function (it) { label.textContent = LABEL[it.c] || ''; } });
    box.innerHTML = ''; box.appendChild(P.el);
  }
  spot.appendChild(T.card([T.field('Category', T.seg(KIND, kind, function (v) { kind = v; T.store.set('emoji-riddles-kind', v); load(); })), label, box]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  load();
  T.tests['emoji-riddles'] = function () {
    var f = R.checkBank(RAW, 60), c = {};
    RAW.forEach(function (x) { c[x[5]] = (c[x[5]] || 0) + 1; if (!LABEL[x[5]]) f.push('kind ' + x[5]); if (/[a-z]/i.test(x[0])) f.push('letters in ' + x[0]); });
    Object.keys(LABEL).forEach(function (k) { if ((c[k] || 0) < 5) f.push('few ' + k); });
    var spider = R.item(RAW.filter(function (x) { return x[1] === 'Spider-Man'; })[0]);
    if (!R.match('spiderman', spider) || !R.match('Spider Man', spider)) f.push('spider-man');
    return Promise.resolve({ ok: !f.length, n: RAW.length * 3 + 4, fails: f.slice(0, 8) });
  };
});
