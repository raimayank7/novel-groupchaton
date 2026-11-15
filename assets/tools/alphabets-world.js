/* Infinity by GroupChatOn — alphabets-world. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Alphabets of the world: tap any letter of 14 scripts to hear it and see how it sounds, then try the quiz. */
GCOTools.register('alphabets-world', function (spot, T) {
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
  // name, speech language, right-to-left?, "letter:sound" list (· stands for a space in the sound)
  var A = {
    es: ['Spanish', 'es-ES', 0, 'A:a B:be C:ce D:de E:e F:efe G:ge H:hache I:i J:jota K:ka L:ele M:eme N:ene Ñ:eñe O:o P:pe Q:cu R:erre S:ese T:te U:u V:uve W:uve·doble X:equis Y:ye Z:zeta'],
    fr: ['French', 'fr-FR', 0, 'A:a B:bé C:cé D:dé E:e F:effe G:gé H:ache I:i J:ji K:ka L:elle M:emme N:enne O:o P:pé Q:ku R:erre S:esse T:té U:u V:vé W:double·vé X:iks Y:i·grec Z:zède É:e·accent·aigu È:e·accent·grave Ç:c·cédille'],
    de: ['German', 'de-DE', 0, 'A:a B:be C:ce D:de E:e F:ef G:ge H:ha I:i J:jot K:ka L:el M:em N:en O:o P:pe Q:ku R:er S:es T:te U:u V:fau W:we X:ix Y:ypsilon Z:zett Ä:ä Ö:ö Ü:ü ß:eszett'],
    ru: ['Russian', 'ru-RU', 0, 'А:a Б:b В:v Г:g Д:d Е:ye Ё:yo Ж:zh З:z И:i Й:y К:k Л:l М:m Н:n О:o П:p Р:r С:s Т:t У:u Ф:f Х:kh Ц:ts Ч:ch Ш:sh Щ:shch Ъ:hard·sign Ы:y Ь:soft·sign Э:e Ю:yu Я:ya'],
    el: ['Greek', 'el-GR', 0, 'Α:alpha Β:beta Γ:gamma Δ:delta Ε:epsilon Ζ:zeta Η:eta Θ:theta Ι:iota Κ:kappa Λ:lambda Μ:mu Ν:nu Ξ:xi Ο:omicron Π:pi Ρ:rho Σ:sigma Τ:tau Υ:upsilon Φ:phi Χ:chi Ψ:psi Ω:omega'],
    ar: ['Arabic', 'ar-SA', 1, 'ا:alif ب:baa ت:taa ث:thaa ج:jeem ح:ḥaa خ:khaa د:daal ذ:dhaal ر:raa ز:zay س:seen ش:sheen ص:ṣaad ض:ḍaad ط:ṭaa ظ:ẓaa ع:ain غ:ghain ف:faa ق:qaaf ك:kaaf ل:laam م:meem ن:noon ه:haa و:waaw ي:yaa'],
    ur: ['Urdu', 'ur-PK', 1, 'ا:alif ب:be پ:pe ت:te ٹ:ṭe ث:se ج:jeem چ:che ح:baṛi·he خ:khe د:daal ڈ:ḍaal ذ:zaal ر:re ڑ:ṛe ز:ze ژ:zhe س:seen ش:sheen ص:suaad ض:zuaad ط:toe ظ:zoe ع:ain غ:ghain ف:fe ق:qaaf ک:kaaf گ:gaaf ل:laam م:meem ن:noon و:vaao ہ:chhoṭi·he ھ:do-chashmi·he ء:hamza ی:chhoṭi·ye ے:baṛi·ye'],
    bn: ['Bengali', 'bn-IN', 0, 'অ:o আ:a ই:i ঈ:ii উ:u ঊ:uu ঋ:ri এ:e ঐ:oi ও:o ঔ:ou ক:ko খ:kho গ:go ঘ:gho ঙ:ngo চ:cho ছ:chho জ:jo ঝ:jho ঞ:nyo ট:ṭo ঠ:ṭho ড:ḍo ঢ:ḍho ণ:no ত:to থ:tho দ:do ধ:dho ন:no প:po ফ:pho ব:bo ভ:bho ম:mo য:jo র:ro ল:lo শ:sho ষ:sho স:so হ:ho ড়:ṛo ঢ়:ṛho য়:yo ৎ:t ং:ng ঃ:h ঁ:nasal'],
    ta: ['Tamil', 'ta-IN', 0, 'அ:a ஆ:aa இ:i ஈ:ii உ:u ஊ:uu எ:e ஏ:ee ஐ:ai ஒ:o ஓ:oo ஔ:au ஃ:aytham க:ka ங:nga ச:cha ஞ:nya ட:ṭa ண:ṇa த:tha ந:na ப:pa ம:ma ய:ya ர:ra ல:la வ:va ழ:zha ள:ḷa ற:ṟa ன:ṉa'],
    hira: ['Japanese hiragana', 'ja-JP', 0, 'あ:a い:i う:u え:e お:o か:ka き:ki く:ku け:ke こ:ko さ:sa し:shi す:su せ:se そ:so た:ta ち:chi つ:tsu て:te と:to な:na に:ni ぬ:nu ね:ne の:no は:ha ひ:hi ふ:fu へ:he ほ:ho ま:ma み:mi む:mu め:me も:mo や:ya ゆ:yu よ:yo ら:ra り:ri る:ru れ:re ろ:ro わ:wa を:wo ん:n'],
    ko: ['Korean Hangul', 'ko-KR', 0, 'ㄱ:g/k ㄴ:n ㄷ:d/t ㄹ:r/l ㅁ:m ㅂ:b/p ㅅ:s ㅇ:ng ㅈ:j ㅊ:ch ㅋ:k ㅌ:t ㅍ:p ㅎ:h ㅏ:a ㅑ:ya ㅓ:eo ㅕ:yeo ㅗ:o ㅛ:yo ㅜ:u ㅠ:yu ㅡ:eu ㅣ:i'],
    // pinyin: the letter, then a word that starts with it (said aloud) and its pinyin
    zh: ['Chinese pinyin', 'zh-CN', 0, 'b:八·bā p:爬·pá m:妈·mā f:飞·fēi d:大·dà t:他·tā n:你·nǐ l:来·lái g:哥·gē k:看·kàn h:好·hǎo j:鸡·jī q:七·qī x:西·xī zh:中·zhōng ch:吃·chī sh:山·shān r:日·rì z:字·zì c:菜·cài s:三·sān y:一·yī w:五·wǔ'],
    hi: ['Hindi (Devanagari)', 'hi-IN', 0, 'अ:a आ:aa इ:i ई:ee उ:u ऊ:oo ए:e ऐ:ai ओ:o औ:au क:ka ख:kha ग:ga घ:gha च:cha छ:chha ज:ja झ:jha ट:ṭa ठ:ṭha ड:ḍa ढ:ḍha ण:ṇa त:ta थ:tha द:da ध:dha न:na प:pa फ:pha ब:ba भ:bha म:ma य:ya र:ra ल:la व:va श:sha ष:ṣha स:sa ह:ha'],
    he: ['Hebrew', 'he-IL', 1, 'א:alef ב:bet ג:gimel ד:dalet ה:he ו:vav ז:zayin ח:chet ט:tet י:yod כ:kaf ל:lamed מ:mem נ:nun ס:samekh ע:ayin פ:pe צ:tsadi ק:qof ר:resh ש:shin ת:tav']
  };
  function letters(k) { return A[k][3].split(' ').map(function (p) { var i = p.indexOf(':'); return [p.slice(0, i), p.slice(i + 1).replace(/·/g, ' ')]; }); }
  var key = T.store.get('aw-lang', 'es'); if (!A[key]) key = 'es';
  var pickLang = T.select(Object.keys(A).map(function (k) { return [k, A[k][0] + ' (' + letters(k).length + ')']; }), key);
  var big = h('div', { 'class': 'kbig', 'data-out': '' }), sub = h('div', { 'class': 'kword' }), note = h('div', { 'class': 'ksub' }), grid = h('div', { 'class': 'kgrid' }), cur = null;
  function speak(l) { var zh = key === 'zh'; K.say(zh ? l[1].split(' ')[0] : key === 'es' || key === 'fr' || key === 'de' ? (l[1].length > 1 ? l[1] : l[0]) : l[0], A[key][1], { fallback: zh ? l[1].split(' ')[1] : l[1] }); }
  function show(l, s) { cur = l; big.textContent = l[0]; sub.textContent = l[1]; K.pop(big); var ls = letters(key); K.mark(grid, grid.children[ls.map(function (x) { return x[0]; }).indexOf(l[0])]); if (s) speak(l); }
  function draw() {
    var ls = letters(key); grid.innerHTML = ''; grid.dir = A[key][2] ? 'rtl' : 'ltr';
    ls.forEach(function (l) { grid.appendChild(K.tile(l[0], key === 'zh' ? l[1].split(' ')[0] : l[1].length > 9 ? l[1].slice(0, 8) + '…' : l[1], function () { show(l, true); }, l[0] + ' ' + l[1])); });
    note.textContent = ls.length + ' letters' + (A[key][2] ? ' · written from right to left' : '') + (K.voice(A[key][1]) ? '' : ' · your device has no ' + A[key][0].split(' ')[0] + ' voice, so sounds are read in English letters');
    show(ls[0], false);
  }
  pickLang.addEventListener('change', function () { key = pickLang.value; T.store.set('aw-lang', key); draw(); });
  var learn = h('div', { style: 'display:grid;gap:14px;min-width:0' }, [h('div', { 'class': 'kstage' }, [big, sub, T.button('🔊 Hear it', { primary: true, onclick: function () { speak(cur); } }), note]), grid]);
  var q = K.quiz({ rounds: 10, next: function () {
    var ls = letters(key), l = K.pick(ls);
    return { q: [h('div', { 'class': 'kword', text: '“' + l[1] + '”' }), 'Which ' + A[key][0] + ' letter is this?'], a: l[0], opts: K.choices(l[0], ls.filter(function (x) { return x[1] !== l[1]; }).map(function (x) { return x[0]; }), 4) };
  } });
  var body = h('div', { style: 'display:grid;min-width:0' }, [learn]);
  spot.appendChild(T.card([T.field('Alphabet', pickLang), T.seg([['learn', 'Learn'], ['quiz', 'Quiz']], 'learn', function (v) {
    q.stop(); body.innerHTML = ''; body.appendChild(v === 'quiz' ? q.el : learn); if (v === 'quiz') q.start();
  }), body]));
  K.fit(spot);
  draw();
  T.tests['alphabets-world'] = function () {
    var f = [], want = { es: 27, de: 30, ru: 33, el: 24, ar: 28, ta: 31, hira: 46, ko: 24, zh: 23, he: 22 };
    Object.keys(want).forEach(function (k) { if (letters(k).length !== want[k]) f.push(k + ' has ' + letters(k).length); });
    Object.keys(A).forEach(function (k) { var ls = letters(k); if (K.uniq(ls.map(function (x) { return x[0]; })).length !== ls.length) f.push(k + ' duplicate'); ls.forEach(function (l) { if (!l[0] || !l[1]) f.push(k + ' empty'); }); });
    if (letters('ur').length < 36) f.push('urdu');
    return Promise.resolve({ ok: !f.length, n: 25, fails: f });
  };
});
