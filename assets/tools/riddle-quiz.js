/* Infinity by GroupChatOn — riddle-quiz. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Riddle quiz: 10 multiple-choice riddles against the clock, from easy to brain teasers, with your score, time and best result. */
GCOTools.register('riddle-quiz', function (spot, T) {
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
    KIDS: [
      ["I wear a red coat with tiny seeds on the outside. Children dip me in cream in the summer. What am I?", "A strawberry", "A small red fruit with a green leafy cap.", ["strawberries"]],
      ["I carry my nose like a long hose and spray water on my back on hot days. Who am I?", "An elephant", "The biggest animal on land."],
      ["I come out at night with a silver face. Some nights I am round, some nights I am thin like a smile. What am I?", "The moon", "Look up at the night sky.", ["moon", "chanda"]],
      ["You put us on your feet before your shoes, and we always come in pairs. What are we?", "Socks", "They keep your toes warm.", ["sock"]],
      ["I have a round face, two hands and twelve numbers, but I never say a word. What am I?", "A clock", "It tells you the time.", ["watch"]],
      ["I am yellow, I bend like a smile, and monkeys love to peel me. What am I?", "A banana", "A long fruit you peel.", ["bananas"]],
      ["I fall from the sky but never get hurt, and I make puddles that children love to jump in. What am I?", "Rain", "Clouds send it down.", ["rainwater", "rain drops", "raindrop"]],
      ["I have pages but I am not a tree. I have a spine but I am not an animal. Open me and I tell you a story. What am I?", "A book", "You read it.", ["storybook", "story book"]],
      ["I open up when the rain comes down and close when the sun comes out. What am I?", "An umbrella", "You hold it over your head.", ["umbrella", "brolly"]],
      ["I am round and bouncy. You kick me, throw me and chase me across the field. What am I?", "A ball", "Used in football and cricket.", ["football"]],
      ["I say “moo”, eat grass all day and give you milk. Who am I?", "A cow", "A farm animal."],
      ["I am cold and white. I melt in your warm hand, and you can build a man out of me. What am I?", "Snow", "It falls in winter on the mountains.", ["ice"]],
      ["I have bristles instead of hair, and I visit your mouth twice a day. What am I?", "A toothbrush", "You use it with toothpaste.", ["tooth brush", "brush"]],
      ["I hop instead of walking and carry my baby in a pocket on my tummy. Who am I?", "A kangaroo", "An animal from Australia."],
      ["Flip a switch and I fill the room with light. What am I?", "A light bulb", "It glows when the electricity is on.", ["bulb", "lamp", "light", "tube light", "tubelight"]],
      ["I soak up water in the bath and give it all back when you squeeze me. What am I?", "A sponge", "It is soft and full of tiny holes."],
      ["I have four legs and a back, but I never go for a walk. You sit on me at dinner. What am I?", "A chair", "A piece of furniture.", ["stool"]],
      ["I build a house of thread in the corner and wait for flies to visit. Who am I?", "A spider", "It has eight legs."],
      ["I am orange, I grow under the ground, and rabbits love to crunch me. What am I?", "A carrot", "A crunchy vegetable.", ["carrots", "gajar"]],
      ["I am a bird who cannot fly. I wear a black-and-white suit and slide on the ice. Who am I?", "A penguin", "It lives where it is very cold."],
      ["I ring every morning to wake you up, and you tap me for five more minutes of sleep. What am I?", "An alarm clock", "It makes a loud noise at a set time.", ["alarm"]],
      ["I have a long tail on a string, and I dance in the sky when the wind blows. What am I?", "A kite", "You fly it on a windy day.", ["patang"]],
      ["I am a long row of rooms on wheels. I run on tracks and stop at stations. What am I?", "A train", "You buy a ticket at the station.", ["railway", "rail"]],
      ["I wear black and white stripes and run with horses, but I am not a horse. Who am I?", "A zebra", "An African animal."],
      ["Busy bees make me, I am sweet and golden, and you spread me on toast. What am I?", "Honey", "It is sticky and comes from a hive.", ["shahad"]],
      ["I wiggle in the water, breathe through gills and sleep with my eyes open. Who am I?", "A fish", "It lives in rivers, ponds and the sea.", ["fishes", "goldfish"]],
      ["I shine all day and make your shadow. Never look straight at me! What am I?", "The sun", "It rises in the east.", ["sun", "suraj"]],
      ["I am a big box that keeps food cold, and a little light turns on when you open my door. What am I?", "A fridge", "It is in the kitchen.", ["refrigerator", "freezer"]],
      ["I have eight arms but no elbows, and I squirt ink when I am scared. Who am I?", "An octopus", "It lives in the sea."],
      ["I have a page for every month and a box for every day. What am I?", "A calendar", "It hangs on the wall and shows dates."],
      ["I carry my house on my back and go everywhere very, very slowly. Who am I?", "A snail", "It leaves a shiny trail.", ["tortoise", "turtle"]],
      ["I am soft and fluffy, and at night you rest your head on me. What am I?", "A pillow", "It is on your bed.", ["cushion"]],
      ["I have black and white keys and I sing when you press me. What am I?", "A piano", "A musical instrument.", ["keyboard", "harmonium"]],
      ["I am green, I hop, and I say “ribbit” by the pond. Who am I?", "A frog", "It starts life as a tadpole.", ["toad"]],
      ["My needle never sews, but it always points north. What am I?", "A compass", "Explorers use it to find their way."],
      ["I am a coloured arch in the sky after the rain, with seven colours. What am I?", "A rainbow", "Red, orange, yellow, green, blue, indigo, violet."],
      ["I start as a crawling caterpillar and end with painted wings. Who am I?", "A butterfly", "It visits flowers."],
      ["Today I am a tiny seed, but give me water and sunlight and one day you can sit in my shade. What am I?", "A tree", "It has a trunk, branches and leaves.", ["plant"]],
      ["I have a lid, a spout and a handle, and I whistle on the stove when the water boils. What am I?", "A kettle", "You use it to make tea.", ["pressure cooker", "cooker"]],
      ["I wear a crown of green leaves and a bumpy golden coat, and I am sweet and juicy inside. What am I?", "A pineapple", "A tropical fruit.", ["ananas"]],
      ["I have two wheels, two pedals and a bell, and you must balance to ride me. What am I?", "A bicycle", "You ride it to school.", ["cycle", "bike"]],
      ["I am blue in the day, full of stars at night and over your head wherever you go. What am I?", "The sky", "Look up!", ["sky", "aasman"]]],
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
      ["I have hands but cannot clap, a face but cannot smile, and I hang on the wall of every classroom. What am I?", "A clock", "It ticks.", ["wall clock", "watch"]]],
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
      ["A rectangle has a perimeter of 30 cm, and its length is twice its width. What is its area?", "50 square cm", "Length + width = 15.", ["50", "50 cm2", "50 sq cm"], "Width 5 and length 10: 5 × 10 = 50 square cm."]],
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
      ["What comes next: M, T, W, T, F, S, …?", "S", "Think of the week.", ["sunday"], "Monday to Sunday."]],
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
  var KIND = [['mix', 'Mixed'], ['KIDS', 'Easy'], ['TRICKY', 'Tricky'], ['MATH', 'Maths'], ['LOGIC', 'Logic'], ['BRAIN', 'Brain teasers']];
  var opts = T.store.get('riddle-quiz', { kind: 'mix', time: 30 }), Q = null, timer = 0, status = T.status();
  function pool(kind) { return (kind === 'mix' ? ['KIDS', 'TRICKY', 'MATH', 'LOGIC', 'BRAIN'] : [kind]).reduce(function (a, k) { return a.concat(BANK[k].map(function (x) { var it = R.item(x); it.c = k; return it; })); }, []); }
  function points(ok, left, limit) { return ok ? 100 + (limit ? Math.round(50 * left / limit) : 0) : 0; }
  var stage = h('div', { 'class': 'rd-stage' }), head = h('p', { 'class': 'rd-num', 'data-out': '' });
  function start() {
    var all = pool(opts.kind);
    Q = { list: R.shuffle(all).slice(0, 10), all: all, i: -1, score: 0, right: 0, t0: Date.now() }; status.clear(); ask();
  }
  function ask() {
    clearInterval(timer); Q.i++;
    if (Q.i >= Q.list.length) return finish();
    var it = Q.list[Q.i], left = opts.time, same = Q.all.filter(function (x) { return x.c === it.c; }), done = false;
    stage.innerHTML = '';
    var clock = h('div', { 'class': 'rd-num', text: opts.time ? '⏱ ' + left + ' s' : '' });
    var box = h('div', { 'class': 'rd-opts' }), after = h('div', { style: 'display:grid;gap:8px;justify-items:center;width:100%' });
    function pickA(a, b) {
      if (done) return; done = true; clearInterval(timer);
      var ok = a === it.a, pts = points(ok, left, opts.time);
      Q.score += pts; if (ok) Q.right++;
      [].forEach.call(box.children, function (x) { if (x.textContent === it.a) x.className = 'is-ok'; else if (x === b) x.className = 'is-no'; x.disabled = true; });
      after.appendChild(h('div', { 'class': 'rd-ans' }, [ok ? '✅ Right! +' + pts : a == null ? '⏰ Time is up.' : '❌ The answer is ' + it.a + '.', it.x ? h('small', { text: it.x }) : null]));
      after.appendChild(T.button(Q.i < Q.list.length - 1 ? 'Next riddle ▶' : 'See my score', { primary: true, onclick: ask }));
      drawHead();
    }
    R.choices(it, same, 4).forEach(function (a) { var b = h('button', { type: 'button', text: a, onclick: function () { pickA(a, b); } }); box.appendChild(b); });
    stage.appendChild(h('div', { 'class': 'rd-num', text: 'Riddle ' + (Q.i + 1) + ' of ' + Q.list.length }));
    stage.appendChild(h('div', { 'class': 'rd-q', text: it.q }));
    stage.appendChild(clock); stage.appendChild(box); stage.appendChild(after);
    if (opts.time) timer = setInterval(function () { left--; clock.textContent = '⏱ ' + Math.max(0, left) + ' s'; if (left <= 0) pickA(null, null); }, 1000);
    drawHead();
  }
  function finish() {
    var best = T.store.get('riddle-quiz-best', {}), key = opts.kind + '-' + opts.time, prev = best[key] || 0, sec = Math.round((Date.now() - Q.t0) / 1000);
    if (Q.score > prev) { best[key] = Q.score; T.store.set('riddle-quiz-best', best); }
    stage.innerHTML = '';
    stage.appendChild(h('div', { 'class': 'rd-q', text: (Q.right >= 9 ? '🏆 ' : Q.right >= 6 ? '🌟 ' : '👍 ') + Q.right + ' of ' + Q.list.length + ' right · ' + Q.score + ' points' }));
    stage.appendChild(h('p', { 'class': 'rd-hint', text: 'Time: ' + Math.floor(sec / 60) + ' min ' + sec % 60 + ' s' + (Q.score > prev ? ' · New best score!' : ' · Best: ' + prev) }));
    stage.appendChild(T.button('Play again', { primary: true, onclick: start }));
    drawHead();
  }
  function drawHead() { head.textContent = Q ? 'Score: ' + Q.score + ' · Right: ' + Q.right + (Q.i >= 0 && Q.i < Q.list.length ? ' · Question ' + (Q.i + 1) + ' / ' + Q.list.length : '') : ''; }
  function save() { T.store.set('riddle-quiz', opts); }
  spot.appendChild(T.card([T.field('Riddles', T.seg(KIND, opts.kind, function (v) { opts.kind = v; save(); start(); })),
    T.field('Time for each riddle', T.seg([[15, '15 s'], [30, '30 s'], [60, '60 s'], [0, 'No timer']], opts.time, function (v) { opts.time = v; save(); start(); })), head, stage, status.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  start();
  T.tests['riddle-quiz'] = function () {
    var f = [];
    if (pool('mix').length < 150 || pool('MATH').length < 30) f.push('pools');
    if (points(true, 30, 30) !== 150 || points(true, 0, 30) !== 100 || points(false, 20, 30) !== 0 || points(true, 5, 0) !== 100) f.push('points');
    pool('mix').forEach(function (it) {
      var c = R.choices(it, pool(it.c), 4);
      if (c.indexOf(it.a) < 0 || c.length !== 4 || new Set(c.map(R.norm)).size !== 4) f.push('choices for ' + it.a);
    });
    return Promise.resolve({ ok: !f.length, n: pool('mix').length + 6, fails: f.slice(0, 8) });
  };
});
