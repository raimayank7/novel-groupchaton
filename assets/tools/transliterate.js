/* Infinity by GroupChatOn — transliterate. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Transliteration: type words in English letters (like “namaste” or “privet”) and get them in Hindi, Marathi, Punjabi, Bengali, Gujarati, Tamil, Telugu, Kannada, Malayalam, Odia, Russian, Greek, Arabic or Urdu script. Rules run on the device. */
GCOTools.register('transliterate', function (spot, T) {
  var h = T.h;
  // Indian scripts share one Unicode layout, so Devanagari letters are moved into the other blocks by a fixed offset
  var IND = { hi: [0, 'Hindi'], mr: [0, 'Marathi'], ne: [0, 'Nepali'], sa: [0, 'Sanskrit'], bn: [0x80, 'Bengali / Assamese'], pa: [0x100, 'Punjabi (Gurmukhi)'], gu: [0x180, 'Gujarati'],
    or: [0x200, 'Odia'], ta: [0x280, 'Tamil'], te: [0x300, 'Telugu'], kn: [0x380, 'Kannada'], ml: [0x400, 'Malayalam'] };
  var FINAL_VIRAMA = { ta: 1, te: 1, kn: 1, ml: 1 };
  var VOW = [['aa', 0x906, 0x93E], ['A', 0x906, 0x93E], ['ai', 0x910, 0x948], ['au', 0x914, 0x94C], ['ii', 0x908, 0x940], ['ee', 0x908, 0x940], ['I', 0x908, 0x940], ['uu', 0x90A, 0x942],
    ['oo', 0x90A, 0x942], ['U', 0x90A, 0x942], ['Ri', 0x90B, 0x943], ['R', 0x90B, 0x943], ['a', 0x905, 0], ['i', 0x907, 0x93F], ['u', 0x909, 0x941], ['e', 0x90F, 0x947], ['o', 0x913, 0x94B], ['O', 0x911, 0x949]];
  var CON = [['chh', [0x91B]], ['Ch', [0x91B]], ['ch', [0x91A]], ['c', [0x91A]], ['kh', [0x916]], ['k', [0x915]], ['gh', [0x918]], ['g', [0x917]], ['~N', [0x919]], ['~n', [0x91E]],
    ['jh', [0x91D]], ['j', [0x91C]], ['.Dh', [0x922, 0x93C]], ['.D', [0x921, 0x93C]], ['Th', [0x920]], ['T', [0x91F]], ['Dh', [0x922]], ['D', [0x921]], ['N', [0x923]], ['th', [0x925]], ['t', [0x924]],
    ['dh', [0x927]], ['d', [0x926]], ['n', [0x928]], ['ph', [0x92B]], ['p', [0x92A]], ['f', [0x92B, 0x93C]], ['bh', [0x92D]], ['b', [0x92C]], ['m', [0x92E]], ['y', [0x92F]], ['r', [0x930]],
    ['L', [0x933]], ['l', [0x932]], ['v', [0x935]], ['w', [0x935]], ['Sh', [0x937]], ['shh', [0x937]], ['sh', [0x936]], ['s', [0x938]], ['h', [0x939]], ['x', [0x915, 0x94D, 0x937]],
    ['GY', [0x91C, 0x94D, 0x91E]], ['zh', [0x934]], ['z', [0x91C, 0x93C]], ['q', [0x915, 0x93C]], ['K', [0x916, 0x93C]], ['G', [0x917, 0x93C]]];
  var MOD = [['M', [0x902]], ['.n', [0x902]], ['.N', [0x901]], ['H', [0x903]], ['||', [0x965]], ['|', [0x964]], ['.a', [0x93D]], ['OM', [0x950]]];
  var TOK = [];
  VOW.forEach(function (v) { TOK.push({ s: v[0], k: 'v', ind: v[1], mat: v[2] }); });
  CON.forEach(function (c) { TOK.push({ s: c[0], k: 'c', cps: c[1] }); });
  MOD.forEach(function (m) { TOK.push({ s: m[0], k: 'm', cps: m[1] }); });
  TOK.sort(function (a, b) { return b.s.length - a.s.length; });
  var CN = /\p{Cn}/u;
  function assigned(cp) { return !CN.test(String.fromCodePoint(cp)); }
  var FALL = { 0x937: [0x936], 0x935: [0x92C], 0x90B: [0x930, 0x93F], 0x943: [0x94D, 0x930, 0x93F], 0x911: [0x913], 0x949: [0x94B], 0x901: [0x902], 0x933: [0x932], 0x934: [0x933], 0x919: [0x928], 0x91E: [0x928] };
  function put(cp, off) {
    if (cp < 0x900 || cp > 0x97F || cp === 0x964 || cp === 0x965) return String.fromCodePoint(cp);
    if (!off || assigned(cp + off)) return String.fromCodePoint(cp + off);
    if (FALL[cp]) return FALL[cp].map(function (x) { return put(x, off); }).join('');
    if (cp >= 0x915 && cp <= 0x92E && cp !== 0x929) { var base = cp >= 0x92A ? 0x92A : 0x915 + 5 * Math.floor((cp - 0x915) / 5); if (base !== cp && cp - base !== 4) return put(base, off); }
    if (cp === 0x950) return 'ॐ';
    return '';
  }
  function indic(text, lang, digits) {
    var off = IND[lang][0], out = '', i = 0, prev = null, prevLen = 0, nasalAfterVowel = false, beforePrev = 'start';
    function emit(cps) { var s = cps.map(function (c) { return put(c, off); }).join(''); out += s; return s.length; }
    function endWord() { if (prev && FINAL_VIRAMA[lang]) emit([0x94D]); prev = null; }
    while (i < text.length) {
      var t = null;
      for (var k = 0; k < TOK.length; k++) if (text.substr(i, TOK[k].s.length) === TOK[k].s) { t = TOK[k]; break; }
      if (!t) {
        var ch = text[i];
        if (ch === '{') { var e = text.indexOf('}', i); endWord(); out += text.slice(i + 1, e < 0 ? text.length : e); i = e < 0 ? text.length : e + 1; beforePrev = 'start'; continue; }
        endWord();
        out += digits && /\d/.test(ch) ? put(0x966 + +ch, off) : ch;
        i++; beforePrev = 'start'; continue;
      }
      i += t.s.length;
      if (t.k === 'c') {
        if (prev) {
          if (lang === 'pa') {
            if (prev.s === t.s) { out = out.slice(0, out.length - prevLen); emit([0xA71 - off]); prevLen = emit(t.cps); prev = t; beforePrev = 'c'; continue; }
            if ((prev.s === 'n' || prev.s === 'm' || prev.s === 'N') && nasalAfterVowel) { out = out.slice(0, out.length - prevLen); emit([0xA70 - off]); prevLen = emit(t.cps); prev = t; nasalAfterVowel = false; beforePrev = 'c'; continue; }
            if (/^(r|v|w|h)$/.test(t.s)) emit([0x94D]);
          } else emit([0x94D]);
        }
        nasalAfterVowel = beforePrev === 'v';
        prevLen = emit(t.cps); prev = t; beforePrev = 'c';
      } else if (t.k === 'v') {
        if (prev) { if (t.mat) emit([t.mat]); } else emit([t.ind]);
        prev = null; beforePrev = 'v';
      } else { emit(t.cps); prev = null; beforePrev = 'v'; }
    }
    endWord();
    return out;
  }
  // other scripts: longest match first; ar / ur write short vowels only at the start or end of a word
  var TAB = {
    ru: { name: 'Russian (Cyrillic)', caseful: true, map: [['shch', 'щ'], ['sch', 'щ'], ['zh', 'ж'], ['kh', 'х'], ['ts', 'ц'], ['ch', 'ч'], ['sh', 'ш'], ['yu', 'ю'], ['ju', 'ю'], ['ya', 'я'], ['ja', 'я'],
      ['yo', 'ё'], ['jo', 'ё'], ['ye', 'е'], ["''", 'ъ'], ["'", 'ь'], ['a', 'а'], ['b', 'б'], ['v', 'в'], ['w', 'в'], ['g', 'г'], ['d', 'д'], ['e', 'е'], ['z', 'з'], ['i', 'и'], ['j', 'й'], ['y', 'ы'],
      ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['f', 'ф'], ['h', 'х'], ['c', 'ц'], ['x', 'кс'], ['q', 'к']] },
    el: { name: 'Greek', caseful: true, map: [['th', 'θ'], ['ch', 'χ'], ['ps', 'ψ'], ['ks', 'ξ'], ['ph', 'φ'], ['a', 'α'], ['b', 'β'], ['v', 'β'], ['g', 'γ'], ['d', 'δ'], ['e', 'ε'], ['z', 'ζ'], ['h', 'η'],
      ['i', 'ι'], ['k', 'κ'], ['l', 'λ'], ['m', 'μ'], ['n', 'ν'], ['x', 'ξ'], ['o', 'ο'], ['p', 'π'], ['r', 'ρ'], ['s', 'σ'], ['t', 'τ'], ['y', 'υ'], ['u', 'υ'], ['f', 'φ'], ['w', 'ω'], ['c', 'κ'], ['j', 'ι'], ['q', 'κ']] },
    ar: { name: 'Arabic', rtl: true, start: { a: 'ا', i: 'إ', u: 'أ', aa: 'آ', e: 'إي', ai: 'أي' }, end: { a: 'ا', i: 'ي', u: 'و', e: 'ي', ai: 'ي' }, mid: { a: '', i: '', u: '', e: 'ي', ai: 'ي' },
      map: [['aa', 'ا'], ['ii', 'ي'], ['ee', 'ي'], ['uu', 'و'], ['oo', 'و'], ['th', 'ث'], ['kh', 'خ'], ['dh', 'ذ'], ['sh', 'ش'], ['gh', 'غ'], ['b', 'ب'], ['t', 'ت'], ['j', 'ج'], ['H', 'ح'], ['7', 'ح'],
        ['5', 'خ'], ['d', 'د'], ['r', 'ر'], ['z', 'ز'], ['s', 'س'], ['S', 'ص'], ['9', 'ص'], ['D', 'ض'], ['T', 'ط'], ['6', 'ط'], ['Z', 'ظ'], ['3', 'ع'], ['f', 'ف'], ['q', 'ق'], ['8', 'ق'], ['k', 'ك'],
        ['l', 'ل'], ['m', 'م'], ['n', 'ن'], ['h', 'ه'], ['w', 'و'], ['y', 'ي'], ['2', 'ء'], ["'", 'ء'], ['o', 'و'], ['v', 'ف'], ['p', 'ب'], ['g', 'ج'], ['c', 'ك'], ['x', 'كس']], punct: { '?': '؟', ',': '،', ';': '؛' } },
    ur: { name: 'Urdu', rtl: true, start: { a: 'ا', i: 'ا', u: 'ا', aa: 'آ', e: 'ای', ai: 'ای' }, end: { a: 'ا', i: 'ی', u: 'و', e: 'ے', ai: 'ے' }, mid: { a: '', i: '', u: '', e: 'ی', ai: 'ی' },
      map: [['chh', 'چھ'], ['bh', 'بھ'], ['ph', 'پھ'], ['th', 'تھ'], ['Th', 'ٹھ'], ['dh', 'دھ'], ['Dh', 'ڈھ'], ['jh', 'جھ'], ['kh', 'خ'], ['gh', 'غ'], ['sh', 'ش'], ['ch', 'چ'], ['zh', 'ژ'],
        ['aa', 'ا'], ['ii', 'ی'], ['ee', 'ی'], ['uu', 'و'], ['oo', 'و'], ['au', 'و'], ['b', 'ب'], ['p', 'پ'], ['t', 'ت'], ['T', 'ٹ'], ['j', 'ج'], ['H', 'ح'], ['d', 'د'], ['D', 'ڈ'], ['r', 'ر'], ['R', 'ڑ'],
        ['z', 'ز'], ['s', 'س'], ['S', 'ص'], ['f', 'ف'], ['q', 'ق'], ['k', 'ک'], ['g', 'گ'], ['l', 'ل'], ['m', 'م'], ['n', 'ن'], ['N', 'ں'], ['w', 'و'], ['v', 'و'], ['h', 'ہ'], ['y', 'ی'], ['o', 'و'], ['c', 'ک'], ['x', 'کس']],
      punct: { '?': '؟', ',': '،', ';': '؛', '.': '۔' } }
  };
  function table(text, lang) {
    var d = TAB[lang], out = '', i = 0, VOWELS = /^(a|i|u|e|ai|aa)$/;
    var list = d.map.slice();
    if (d.mid) list = list.concat([['ai', null], ['a', null], ['i', null], ['u', null], ['e', null]]);
    list.sort(function (a, b) { return b[0].length - a[0].length; });
    while (i < text.length) {
      var ch = text[i];
      if (ch === '{') { var e = text.indexOf('}', i); out += text.slice(i + 1, e < 0 ? text.length : e); i = e < 0 ? text.length : e + 1; continue; }
      var word = /^[A-Za-z0-9']+/.exec(text.slice(i));
      if (!word || (/^\d+$/.test(word[0]))) { out += d.punct && d.punct[ch] ? d.punct[ch] : ch; i++; continue; }
      var w = word[0], j = 0, res = '';
      while (j < w.length) {
        var hit = null, src = d.caseful ? w.slice(j).toLowerCase() : w.slice(j);
        for (var k = 0; k < list.length; k++) if (src.substr(0, list[k][0].length) === list[k][0]) { hit = list[k]; break; }
        if (!hit && !d.caseful) { var low = w.slice(j).toLowerCase(); for (k = 0; k < list.length; k++) if (low.substr(0, list[k][0].length) === list[k][0]) { hit = list[k]; break; } }
        if (!hit) { res += w[j]; j++; continue; }
        var s = hit[1], at0 = j === 0, atEnd = j + hit[0].length === w.length;
        if (d.mid && (s === null || VOWELS.test(hit[0]))) s = at0 && d.start[hit[0]] != null ? d.start[hit[0]] : atEnd && d.end[hit[0]] != null ? d.end[hit[0]] : d.mid[hit[0]] != null ? d.mid[hit[0]] : s;
        if (lang === 'ru' && hit[0] === 'y' && /[аеёиоуыэюя]$/.test(res)) s = 'й';
        if (d.caseful && /[A-Z]/.test(w[j])) s = s.charAt(0).toUpperCase() + s.slice(1);
        res += s == null ? '' : s; j += hit[0].length;
      }
      if (lang === 'el') res = res.replace(/σ$/, 'ς');
      out += res; i += w.length;
    }
    return out;
  }
  function translit(text, lang, digits) { return IND[lang] ? indic(text, lang, digits) : table(text, lang); }
  var LANGS = Object.keys(IND).map(function (k) { return [k, IND[k][1]]; }).concat(Object.keys(TAB).map(function (k) { return [k, TAB[k].name]; }));
  var langSel = T.opt.select('lang', 'Script', LANGS, T.store.get('translit-lang', 'hi'));
  var tr = T.transformer(spot, { id: 'transliterate', inLabel: 'Type in English letters', outLabel: 'Result', rows: 6, download: 'transliterated.txt',
    placeholder: 'namaste, aap kaise hain?', run: function (t, o) { T.store.set('translit-lang', o.lang); tr && (tr.output.dir = TAB[o.lang] && TAB[o.lang].rtl ? 'rtl' : 'auto'); return translit(t, o.lang, o.digits); },
    options: [langSel, T.opt.check('digits', 'Use local digits (१२३)', false)],
    sample: 'namaste! meraa naam {Asha} hai. dhanyavaad.' });
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  var help = h('details', { 'class': 'tcalc-details' }, [h('summary', { text: 'How to type (cheat sheet)' }), h('div', { 'class': 'tnote', style: 'font-size:14px;line-height:1.6', html:
    '<b>Indian scripts:</b> a आ = <code>aa</code>, ई = <code>ii</code> or <code>ee</code>, ऊ = <code>uu</code> or <code>oo</code>, ऋ = <code>Ri</code>, ऑ = <code>O</code>. Capitals are the “hard” letters: ट <code>T</code>, ठ <code>Th</code>, ड <code>D</code>, ढ <code>Dh</code>, ण <code>N</code>, ष <code>Sh</code>. ' +
    'त <code>t</code>, थ <code>th</code>, द <code>d</code>, ध <code>dh</code>, श <code>sh</code>, छ <code>chh</code>, क्ष <code>x</code>, ज्ञ <code>GY</code>, ज़ <code>z</code>, फ़ <code>f</code>, ड़ <code>.D</code>, ं <code>M</code>, ँ <code>.N</code>, ः <code>H</code>, । <code>|</code>.<br>' +
    '<b>Russian:</b> ж <code>zh</code>, х <code>kh</code>, ц <code>ts</code>, ч <code>ch</code>, ш <code>sh</code>, щ <code>shch</code>, ю <code>yu</code>, я <code>ya</code>, ё <code>yo</code>, ы <code>y</code>, й <code>j</code> (or y after a vowel), ь <code>\'</code>.<br>' +
    '<b>Arabic and Urdu:</b> write long vowels twice (<code>aa</code>, <code>ee</code>, <code>oo</code>); short vowels show only at the start or end of a word. Arabic chat numbers work: <code>3</code> ع, <code>7</code> ح, <code>5</code> خ, <code>9</code> ص, <code>2</code> ء.<br>' +
    'Put names or English words in {curly braces} to keep them as they are.' })]);
  spot.lastChild.appendChild(help);
  T.tests['transliterate'] = function () {
    var f = [];
    [['namaste', 'hi', 'नमस्ते'], ['dhanyavaad', 'hi', 'धन्यवाद'], ['bhaarat', 'hi', 'भारत'], ['kRiShNa', 'hi', 'कृष्ण'], ['hindii', 'hi', 'हिन्दी'], ['meraa naam {Asha} hai.', 'hi', 'मेरा नाम Asha है.'], ['mera', 'hi', 'मेर'],
      ['sat srii akaal', 'pa', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ'], ['panjaab', 'pa', 'ਪੰਜਾਬ'], ['pakkaa', 'pa', 'ਪੱਕਾ'], ['vaNakkam', 'ta', 'வணக்கம்'], ['aami', 'bn', 'আমি'], ['kem chho', 'gu', 'કેમ છો'],
      ['privet', 'ru', 'привет'], ['zdravstvuyte', 'ru', 'здравствуйте'], ['Moskva', 'ru', 'Москва'], ['kalimera', 'el', 'καλιμερα'], ['logos', 'el', 'λογος'],
      ['mar7aba', 'ar', 'مرحبا'], ['salaam', 'ar', 'سلام'], ['aap kaise', 'ur', 'آپ کیسے'], ['ghar 2024', 'hi', 'घर 2024']].forEach(function (x) {
      var r = translit(x[0], x[1]);
      if (r !== x[2]) f.push(x[0] + ' (' + x[1] + ') → ' + r);
    });
    if (translit('2024', 'hi', true) !== '२०२४') f.push('digits ' + translit('2024', 'hi', true));
    return Promise.resolve({ ok: !f.length, n: 22, fails: f });
  };
});
