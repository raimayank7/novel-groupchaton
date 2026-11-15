/* Infinity by GroupChatOn — number-names. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Number names 0–100 in nine languages, with each language's own digits and a speak button for every row. */
GCOTools.register('number-names', function (spot, T) {
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
  var EN1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var EN10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  var HI = ('शून्य एक दो तीन चार पाँच छह सात आठ नौ दस ग्यारह बारह तेरह चौदह पंद्रह सोलह सत्रह अठारह उन्नीस बीस इक्कीस बाईस तेईस चौबीस पच्चीस छब्बीस सत्ताईस अट्ठाईस उनतीस तीस ' +
    'इकतीस बत्तीस तैंतीस चौंतीस पैंतीस छत्तीस सैंतीस अड़तीस उनतालीस चालीस इकतालीस बयालीस तैंतालीस चवालीस पैंतालीस छियालीस सैंतालीस अड़तालीस उनचास पचास इक्यावन बावन तिरपन चौवन पचपन छप्पन ' +
    'सत्तावन अट्ठावन उनसठ साठ इकसठ बासठ तिरसठ चौंसठ पैंसठ छियासठ सड़सठ अड़सठ उनहत्तर सत्तर इकहत्तर बहत्तर तिहत्तर चौहत्तर पचहत्तर छिहत्तर सतहत्तर अठहत्तर उन्यासी अस्सी इक्यासी बयासी ' +
    'तिरासी चौरासी पचासी छियासी सत्तासी अट्ठासी नवासी नब्बे इक्यानवे बानवे तिरानवे चौरानवे पंचानवे छियानवे सत्तानवे अट्ठानवे निन्यानवे सौ').split(' ');
  var ES = ('cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte veintiuno veintidós veintitrés ' +
    'veinticuatro veinticinco veintiséis veintisiete veintiocho veintinueve').split(' '), ES10 = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var FR = 'zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept dix-huit dix-neuf'.split(' '), FR10 = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
  var DE = 'null eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn'.split(' '), DE10 = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  var AR = 'صفر واحد اثنان ثلاثة أربعة خمسة ستة سبعة ثمانية تسعة عشرة'.split(' '), AR10 = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  var RU = 'ноль один два три четыре пять шесть семь восемь девять десять одиннадцать двенадцать тринадцать четырнадцать пятнадцать шестнадцать семнадцать восемнадцать девятнадцать'.split(' '),
    RU10 = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  var ZH = '零一二三四五六七八九'.split(''), JA = ['ゼロ', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
  // name, speech language, words, digits in that script
  var L = {
    en: ['English', 'en-US', function (n) { return n === 100 ? 'one hundred' : n < 20 ? EN1[n] : EN10[Math.floor(n / 10)] + (n % 10 ? '-' + EN1[n % 10] : ''); }, String],
    hi: ['Hindi', 'hi-IN', function (n) { return HI[n]; }, function (n) { return String(n).replace(/\d/g, function (d) { return '०१२३४५६७८९'[d]; }); }],
    es: ['Spanish', 'es-ES', function (n) { return n === 100 ? 'cien' : n < 30 ? ES[n] : ES10[Math.floor(n / 10)] + (n % 10 ? ' y ' + ES[n % 10] : ''); }, String],
    fr: ['French', 'fr-FR', function (n) {
      if (n < 20) return FR[n]; if (n === 100) return 'cent'; if (n === 80) return 'quatre-vingts';
      var t = Math.floor(n / 10), u = n % 10;
      if (t === 7 || t === 9) return (t === 7 ? 'soixante' : 'quatre-vingt') + (t === 7 && u === 1 ? ' et ' : '-') + FR[10 + u];
      if (t === 8) return 'quatre-vingt-' + FR[u];
      return FR10[t] + (u === 1 ? ' et un' : u ? '-' + FR[u] : '');
    }, String],
    de: ['German', 'de-DE', function (n) { if (n < 20) return DE[n]; if (n === 100) return 'hundert'; var u = n % 10; return (u ? (u === 1 ? 'ein' : DE[u]) + 'und' : '') + DE10[Math.floor(n / 10)]; }, String],
    ar: ['Arabic', 'ar-SA', function (n) {
      if (n <= 10) return AR[n]; if (n === 100) return 'مائة'; if (n === 11) return 'أحد عشر'; if (n === 12) return 'اثنا عشر';
      if (n < 20) return AR[n - 10] + ' عشر'; var u = n % 10; return (u ? AR[u] + ' و' : '') + AR10[Math.floor(n / 10)];
    }, function (n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); }],
    ru: ['Russian', 'ru-RU', function (n) { if (n < 20) return RU[n]; if (n === 100) return 'сто'; var u = n % 10; return RU10[Math.floor(n / 10)] + (u ? ' ' + RU[u] : ''); }, String],
    zh: ['Chinese', 'zh-CN', function (n) { if (n <= 10) return n === 10 ? '十' : ZH[n]; if (n === 100) return '一百'; var t = Math.floor(n / 10), u = n % 10; return (t > 1 ? ZH[t] : '') + '十' + (u ? ZH[u] : ''); }, String],
    ja: ['Japanese', 'ja-JP', function (n) {
      if (n === 0) return 'ゼロ'; if (n === 100) return '百 (ひゃく)';
      var t = Math.floor(n / 10), u = n % 10, k = (t > 1 ? ZH[t] : '') + (t ? '十' : '') + (u ? ZH[u] : ''), r = (t > 1 ? JA[t] : '') + (t ? 'じゅう' : '') + (u ? JA[u] : '');
      return k + ' (' + r + ')';
    }, String] };
  var n = T.store.get('nn-n', 21);
  var inp = h('input', { type: 'number', min: '0', max: '100', value: String(n), 'aria-label': 'Number from 0 to 100', style: 'font:800 32px var(--ui);text-align:center' });
  var table = h('div', { 'class': 'tkv', 'data-out': '' });
  function draw() {
    n = Math.max(0, Math.min(100, Math.round(+inp.value) || 0)); T.store.set('nn-n', n); table.innerHTML = '';
    Object.keys(L).forEach(function (k) {
      var l = L[k], w = l[2](n), digits = l[3](n);
      table.appendChild(h('div', { style: 'grid-template-columns:minmax(0,80px) minmax(0,1fr) auto' }, [h('span', { text: l[0] }),
        h('b', { lang: l[1], dir: k === 'ar' ? 'rtl' : null, style: 'font-size:19px;overflow-wrap:anywhere', text: w + (digits !== String(n) ? '  ·  ' + digits : '') }),
        T.button('🔊', { small: true, onclick: function () { K.say(k === 'ja' ? w.split(' ')[0] : w, l[1], { fallback: '' }); } })]));
    });
  }
  inp.addEventListener('input', draw);
  function step(d) { inp.value = String(Math.max(0, Math.min(100, n + d))); draw(); }
  spot.appendChild(T.card([T.field('Number (0 to 100)', inp),
    T.row([T.button('−1', { onclick: function () { step(-1); } }), T.button('+1', { onclick: function () { step(1); } }), T.button('+10', { onclick: function () { step(10); } }),
      T.button('Try a sample', { small: true, onclick: function () { inp.value = String(K.rnd(101)); draw(); } })]), table,
    h('p', { 'class': 'ksub', text: 'Tap 🔊 to hear a language. It stays silent when your device has no voice for that language.' })]));
  K.fit(spot);
  draw();
  T.tests['number-names'] = function () {
    var f = [], C = [['en', 21, 'twenty-one'], ['en', 100, 'one hundred'], ['hi', 45, 'पैंतालीस'], ['hi', 99, 'निन्यानवे'], ['es', 16, 'dieciséis'], ['es', 21, 'veintiuno'], ['es', 47, 'cuarenta y siete'],
      ['fr', 21, 'vingt et un'], ['fr', 71, 'soixante et onze'], ['fr', 77, 'soixante-dix-sept'], ['fr', 80, 'quatre-vingts'], ['fr', 81, 'quatre-vingt-un'], ['fr', 99, 'quatre-vingt-dix-neuf'],
      ['de', 21, 'einundzwanzig'], ['de', 37, 'siebenunddreißig'], ['ar', 21, 'واحد وعشرون'], ['ar', 15, 'خمسة عشر'], ['ru', 42, 'сорок два'], ['zh', 21, '二十一'], ['zh', 15, '十五'],
      ['ja', 14, '十四 (じゅうよん)'], ['ja', 30, '三十 (さんじゅう)']];
    C.forEach(function (c) { var w = L[c[0]][2](c[1]); if (w !== c[2]) f.push(c[0] + ' ' + c[1] + ' → ' + w); });
    if (HI.length !== 101) f.push('hindi list ' + HI.length);
    for (var k = 0; k <= 100; k++) Object.keys(L).forEach(function (l) { if (!L[l][2](k)) f.push(l + ' empty ' + k); });
    if (L.hi[3](42) !== '४२' || L.ar[3](42) !== '٤٢') f.push('digits');
    return Promise.resolve({ ok: !f.length, n: C.length + 3, fails: f });
  };
});
