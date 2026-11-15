/* Infinity by GroupChatOn — animals. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Animals and their names: 45 animals with the sound they make, baby name, home, a fact and the Hindi name; plus three kinds of quiz. */
GCOTools.register('animals', function (spot, T) {
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
  // picture, name, Hindi, sound word, baby, home, group, fact
  var A = ['🐄|cow|गाय|moo|calf|farm|farm|Cows give us milk and spend hours chewing their food.', '🐖|pig|सूअर|oink|piglet|farm|farm|Pigs roll in mud to keep cool because they cannot sweat much.',
    '🐑|sheep|भेड़|baa|lamb|farm|farm|Wool from sheep is spun into yarn for jumpers.', '🐐|goat|बकरी|maa|kid|farm|farm|Goats are great climbers and can stand on steep rocks.',
    '🐎|horse|घोड़ा|neigh|foal|stable|farm|Horses can sleep standing up.', '🐔|hen|मुर्गी|cluck|chick|hen house|farm|A hen can lay an egg almost every day.',
    '🐓|rooster|मुर्गा|cock-a-doodle-doo|chick|hen house|farm|Roosters crow loudly early in the morning.', '🦆|duck|बत्तख|quack|duckling|pond|farm|Ducks have waterproof feathers.',
    '🐃|buffalo|भैंस|moo|calf|farm|farm|Water buffalo love to wallow in rivers and ponds.',
    '🐕|dog|कुत्ता|woof|puppy|kennel|pets|Dogs can smell thousands of times better than people.', '🐈|cat|बिल्ली|meow|kitten|house|pets|Cats spend more than half the day sleeping.',
    '🐇|rabbit|खरगोश||kit|burrow|pets|A rabbit’s teeth never stop growing.', '🐹|hamster|हैम्स्टर|squeak|pup|cage|pets|Hamsters carry food in their stretchy cheek pouches.',
    '🦜|parrot|तोता|squawk|chick|nest|birds|Some parrots can copy words they hear.', '🐟|goldfish|सुनहरी मछली||fry|fish tank|pets|Goldfish can learn to recognise the person who feeds them.',
    '🦁|lion|शेर|roar|cub|grassland|wild|A family of lions is called a pride.', '🐅|tiger|बाघ|growl|cub|jungle|wild|No two tigers have the same stripes. It is India’s national animal.',
    '🐘|elephant|हाथी|trumpet|calf|forest|wild|Elephants are the biggest animals that live on land.', '🐒|monkey|बंदर|ooh-ooh-aah|infant|trees|wild|Many monkeys use their tails to hold on to branches.',
    '🦒|giraffe|जिराफ़|hum|calf|savanna|wild|The giraffe is the tallest animal in the world.', '🦓|zebra|ज़ेबरा|bark|foal|grassland|wild|Every zebra has its own stripe pattern.',
    '🐻|bear|भालू|grrr|cub|den|wild|Some bears sleep through the cold winter.', '🐺|wolf|भेड़िया|howl|pup|den|wild|Wolves live and hunt in groups called packs.',
    '🦊|fox|लोमड़ी|yip|kit|den|wild|Foxes use their bushy tails as a warm blanket.', '🦌|deer|हिरण|bellow|fawn|forest|wild|Male deer grow new antlers every year.',
    '🦘|kangaroo|कंगारू|chuff|joey|grassland|wild|A baby kangaroo grows in its mother’s pouch.', '🐪|camel|ऊँट|grunt|calf|desert|wild|A camel’s hump stores fat, not water.',
    '🐍|snake|साँप|hiss|hatchling|grass|wild|Snakes smell with their tongues.', '🐸|frog|मेंढक|croak|tadpole|pond|wild|Frogs start life as tadpoles that swim with tails.',
    '🐊|crocodile|मगरमच्छ|hiss|hatchling|river|wild|Crocodiles have lived on Earth since the time of the dinosaurs.',
    '🐋|whale|व्हेल|sing|calf|ocean|sea|The blue whale is the biggest animal that has ever lived.', '🐬|dolphin|डॉल्फ़िन|click|calf|ocean|sea|Dolphins call each other with whistles.',
    '🦈|shark|शार्क||pup|ocean|sea|Sharks keep growing new teeth all their lives.', '🐙|octopus|ऑक्टोपस||hatchling|ocean|sea|An octopus has eight arms and three hearts.',
    '🐢|turtle|कछुआ||hatchling|sea and land|sea|A turtle carries its home, its shell, everywhere.', '🦀|crab|केकड़ा||larva|seashore|sea|Crabs walk sideways.',
    '🐧|penguin|पेंगुइन|squawk|chick|icy shores|birds|Penguins cannot fly, but they are brilliant swimmers.',
    '🦉|owl|उल्लू|hoot|owlet|tree hole|birds|Owls can turn their heads a very long way round.', '🦅|eagle|चील|screech|eaglet|high nest|birds|Eagles can spot food from far up in the sky.',
    '🦚|peacock|मोर|may-awe|peachick|forest|birds|The peacock is India’s national bird.', '🦢|swan|हंस|honk|cygnet|lake|birds|Swans often stay with the same partner for life.',
    '🐦|sparrow|गौरैया|chirp|chick|nest|birds|Sparrows like to live near people.',
    '🐝|bee|मधुमक्खी|buzz|larva|hive|insects|Bees make honey from the nectar of flowers.', '🦋|butterfly|तितली||caterpillar|garden|insects|A butterfly starts life as a caterpillar.',
    '🐜|ant|चींटी||larva|anthill|insects|Ants can carry things much heavier than themselves.', '🦟|mosquito|मच्छर|buzz|larva|still water|insects|Only female mosquitoes bite.'
  ].map(function (s) { var p = s.split('|'); return { pic: p[0], name: p[1], hi: p[2], sound: p[3], baby: p[4], home: p[5], group: p[6], fact: p[7] }; });
  var GROUPS = [['all', 'All'], ['farm', 'Farm'], ['pets', 'Pets'], ['wild', 'Wild'], ['sea', 'Sea'], ['birds', 'Birds'], ['insects', 'Insects']];
  function line(a) { return 'This is a ' + a.name + '. ' + (a.sound ? 'A ' + a.name + ' says ' + a.sound + '. ' : '') + 'A baby ' + a.name + ' is called a ' + a.baby + '.'; }
  var group = 'all', stage = h('div', { 'class': 'kstage' }), grid = h('div', { 'class': 'kgrid', style: 'grid-template-columns:repeat(auto-fill,minmax(78px,1fr))' });
  function show(a, speak) {
    stage.innerHTML = '';
    stage.appendChild(h('div', { 'class': 'kpic', style: 'font-size:clamp(64px,18vw,110px)', text: a.pic }));
    stage.appendChild(h('div', { 'class': 'kword', 'data-out': '', text: a.name + ' · ' + a.hi }));
    stage.appendChild(h('div', { 'class': 'tkv', style: 'width:100%;max-width:420px;text-align:left' }, [['Says', a.sound ? '“' + a.sound + '”' : 'mostly quiet'], ['Baby', a.baby], ['Lives', a.home]].map(function (r) {
      return h('div', { style: 'grid-template-columns:80px minmax(0,1fr)' }, [h('span', { text: r[0] }), h('b', { text: r[1] })]); })));
    stage.appendChild(h('p', { style: 'margin:0', text: a.fact }));
    K.pop(stage.firstChild); if (speak) K.say(line(a) + ' ' + a.fact);
  }
  function draw() {
    grid.innerHTML = '';
    A.filter(function (a) { return group === 'all' || a.group === group; }).forEach(function (a) { var b = K.tile(a.pic, a.name, function () { show(a, true); K.mark(grid, b); }, a.name); grid.appendChild(b); });
  }
  var q = K.quiz({ rounds: 10, label: function (v) { return v; }, next: function () {
    var kind = K.rnd(3), a = K.pick(A.filter(function (x) { return kind !== 0 || x.sound; }));
    if (kind === 0) return { q: ['Who says “' + a.sound + '”?'], a: a.pic, opts: K.choices(a.pic, A.filter(function (x) { return x.sound !== a.sound; }).map(function (x) { return x.pic; }), 4), why: 'The ' + a.name + ' says ' + a.sound + '.' };
    if (kind === 1) return { q: [h('div', { 'class': 'kpic', text: a.pic }), 'What is a baby ' + a.name + ' called?'], a: a.baby, opts: K.choices(a.baby, A.filter(function (x) { return x.baby !== a.baby; }).map(function (x) { return x.baby; }), 4) };
    return { q: ['Which one is the ' + a.name + '?'], a: a.pic, opts: K.choices(a.pic, A.map(function (x) { return x.pic; }), 4), say: function () { K.say('Which one is the ' + a.name + '?'); } };
  } });
  var learn = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [T.seg(GROUPS, 'all', function (v) { group = v; draw(); }), stage, grid]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [learn]);
  spot.appendChild(T.card([T.seg([['learn', 'Animals'], ['quiz', 'Quiz']], 'learn', function (v) { q.stop(); body.innerHTML = ''; body.appendChild(v === 'quiz' ? q.el : learn); if (v === 'quiz') q.start(); }), body]));
  K.fit(spot);
  draw(); show(A[0], false);
  T.tests['animals'] = function () {
    var f = [];
    if (A.length < 45) f.push('only ' + A.length);
    A.forEach(function (a) { ['pic', 'name', 'hi', 'baby', 'home', 'group', 'fact'].forEach(function (k) { if (!a[k]) f.push(a.name + ' missing ' + k); }); });
    if (K.uniq(A.map(function (a) { return a.pic; })).length !== A.length) f.push('duplicate picture');
    if (line(A[0]) !== 'This is a cow. A cow says moo. A baby cow is called a calf.') f.push('line ' + line(A[0]));
    return Promise.resolve({ ok: !f.length, n: A.length * 7 + 2, fails: f });
  };
});
