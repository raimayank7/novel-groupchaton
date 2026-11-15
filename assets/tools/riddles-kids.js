/* Infinity by GroupChatOn — riddles-kids. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Easy riddles for kids: 40+ of our own riddles about animals, food and everyday things, with hints, answer checking and stars for solved ones. */
GCOTools.register('riddles-kids', function (spot, T) {
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
      ["I am blue in the day, full of stars at night and over your head wherever you go. What am I?", "The sky", "Look up!", ["sky", "aasman"]]]
  };
  var P = R.player(BANK.KIDS, { key: 'kids' });
  spot.appendChild(T.card([P.el])); spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['riddles-kids'] = function () {
    var f = R.checkBank(BANK.KIDS, 40), it = R.item(BANK.KIDS[0]);
    if (!R.match('strawberries!', it) || !R.match('It is a STRAWBERRY', it) || R.match('banana', it)) f.push('matching');
    return Promise.resolve({ ok: !f.length, n: BANK.KIDS.length * 3 + 3, fails: f.slice(0, 8) });
  };
});
