/* Infinity by GroupChatOn — unicode-converter. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Kruti Dev ↔ Unicode converter: turn old Kruti Dev 010 Hindi typing into Unicode that works everywhere, and back. */
GCOTools.register('unicode-converter', function (spot, T) {
  // Kruti Dev 010 → Unicode pairs, longest first. Half letters end in ् and join with a following ा to make the full letter.
  var K2U = [['vkS', 'औ'], ['vks', 'ओ'], ['vk', 'आ'], ['bZ', 'ई'], [',s', 'ऐ'], ['Ã', 'ऋ'], ['ks', 'ो'], ['kS', 'ौ'], ['{k', 'क्ष'], ['=k', 'त्र'], ['K', 'ज्ञ'], ['J', 'श्र'], ['Ø', 'क्र'], ['ç', 'प्र'], ['Ù', 'त्त'], ['Ë', 'द्ध'], ['í', 'द्द'], ['Ì', 'द्व'], ['ê', 'ह्य'], ['ã', 'ह्म'],
    ['[', 'ख्'], ['?', 'घ्'], ['.', 'ण्'], ['/', 'ध्'], ["'", 'श्'], ['"', 'ष्'], ['Q', 'फ'], ['H', 'भ्'], ['F', 'थ्'],
    ['d', 'क'], ['D', 'क्'], ['x', 'ग'], ['X', 'ग्'], ['³', 'ङ'], ['p', 'च'], ['P', 'च्'], ['N', 'छ'], ['t', 'ज'], ['T', 'ज्'], ['>', 'झ'], ['V', 'ट'], ['B', 'ठ'], ['M', 'ड'], ['<', 'ढ'],
    ['r', 'त'], ['R', 'त्'], ['n', 'द'], ['u', 'न'], ['U', 'न्'], ['i', 'प'], ['I', 'प्'], ['c', 'ब'], ['C', 'ब्'], ['e', 'म'], ['E', 'म्'], [';', 'य'], ['¸', 'य्'], ['j', 'र'], ['y', 'ल'], ['Y', 'ल्'], ['G', 'ळ'],
    ['o', 'व'], ['O', 'व्'], ['l', 'स'], ['L', 'स्'], ['g', 'ह'], ['v', 'अ'], ['b', 'इ'], ['m', 'उ'], ['Å', 'ऊ'], [',', 'ए'], ['_', 'ऋ'],
    ['k', 'ा'], ['h', 'ी'], ['q', 'ु'], ['w', 'ू'], ['`', 'ृ'], ['s', 'े'], ['S', 'ै'], ['a', 'ं'], ['¡', 'ँ'], ['%', 'ः'], ['~', '्'], ['z', '्र'], ['+', '़'], ['A', '।'], ['Z', 'र्Z']];
  var MATRA = 'ािीुूृेैोौंँःॅ़', HAL = '्';
  function isCons(c) { return c >= 'क' && c <= 'ह' || c === 'ळ'; }
  function k2u(s) {
    var out = '', i = 0;
    outer: while (i < s.length) {
      for (var k = 0; k < K2U.length; k++) if (s.substr(i, K2U[k][0].length) === K2U[k][0]) { out += K2U[k][1]; i += K2U[k][0].length; continue outer; }
      out += s[i] === 'f' ? '\u0000' : s[i]; i++;
    }
    out = out.replace(/्ा/g, '');
    // ि is typed BEFORE its consonant cluster in Kruti Dev: move it after the cluster
    out = out.replace(/\u0000((?:[क-हळ]़?्)*[क-हळ]़?)/g, '$1ि').replace(/\u0000/g, 'ि');
    // reph: Z (here र्Z) is typed AFTER the syllable; put र् before that syllable's consonant cluster
    for (var guard = 0; out.indexOf('र्Z') >= 0 && guard < 5000; guard++) {
      var p = out.indexOf('र्Z'), j = p;
      while (j > 0 && MATRA.indexOf(out[j - 1]) >= 0) j--;
      while (j > 0 && isCons(out[j - 1])) { j--; if (j > 1 && out[j - 1] === HAL && isCons(out[j - 2])) j--; else break; }
      out = out.slice(0, j) + 'र्' + out.slice(j, p) + out.slice(p + 3);
    }
    return out;
  }
  var U2K = K2U.filter(function (p) { return p[0] !== 'Z' && p[0] !== 'b' + 'Z'; }).map(function (p) { return [p[1], p[0]]; }).concat([['ई', 'bZ'], ['ा', 'k']]).sort(function (a, b) { return b[0].length - a[0].length; });
  var FULL = { 'ख्': '[k', 'घ्': '?k', 'ण्': '.k', 'ध्': '/k', 'श्': "'k", 'ष्': '"k', 'भ्': 'Hk', 'थ्': 'Fk' };
  function u2k(s) {
    // reph र् + cluster + matras → cluster + matras + Z
    s = s.replace(/र्((?:[क-हळ]़?्)*[क-हळ]़?[ािीुूृेैोौ]?[ंँ]?)/g, '$1Z');
    // ि after its cluster → f before it
    s = s.replace(/((?:[क-हळ]़?्)*[क-हळ]़?)ि/g, 'f$1');
    var out = '', i = 0;
    outer: while (i < s.length) {
      for (var k = 0; k < U2K.length; k++) {
        var u = U2K[k][0];
        if (s.substr(i, u.length) === u) {
          if (u.length === 2 && u[1] === HAL && !isCons(s[i + 2] || '') && s[i + 2] !== 'f') continue;   // a half letter only before another letter
          out += U2K[k][1]; i += u.length; continue outer;
        }
      }
      var c = s[i];
      if (isCons(c)) { var full = FULL[c + HAL]; if (full) { out += full; i++; continue; } }
      out += c; i++;
    }
    return out;
  }
  function detect(s) { return /[ऀ-ॿ]/.test(s) ? 'u2k' : 'k2u'; }
  var tr = T.transformer(spot, { id: 'unicode-converter', inLabel: 'Kruti Dev text or Unicode Hindi', rows: 8, outLabel: 'Converted text',
    sample: 'Hkkjr esjk ns\'k gS A fgUnh gekjh Hkk"kk gS A /keZ vkSj deZ',
    options: [T.opt.select('dir', 'Direction', [['auto', 'Detect automatically'], ['k2u', 'Kruti Dev → Unicode'], ['u2k', 'Unicode → Kruti Dev']], 'auto')],
    note: function (a) { return (detect(a) === 'k2u' ? 'Read as Kruti Dev 010.' : 'Read as Unicode Hindi.') + ' Rare conjuncts may need a manual touch-up: check important documents.'; },
    run: function (t, o) { var d = o.dir === 'auto' ? detect(t) : o.dir; return d === 'u2k' ? u2k(t) : k2u(t); } });
  tr.output.style.fontFamily = '"Kruti Dev 010", "Nirmala UI", "Noto Sans Devanagari", sans-serif';
  T.tests['unicode-converter'] = function () {
    var f = [], c = [['fgUnh', 'हिन्दी'], ['Hkkjr', 'भारत'], ['/keZ', 'धर्म'], ['iz/kku', 'प्रधान'], ['fdrkc', 'किताब'], ['eSa', 'मैं'], ['{kek', 'क्षमा'], ['jke', 'राम'], ['vkvks', 'आओ'], ['deZ', 'कर्म'], ['Hkk"kk', 'भाषा']];
    c.forEach(function (x) { if (k2u(x[0]) !== x[1]) f.push(x[0] + ' → ' + k2u(x[0])); });
    ['भारत', 'हिन्दी', 'धर्म', 'प्रधान', 'किताब', 'मैं', 'क्षमा', 'राम', 'आओ', 'कर्म', 'भाषा', 'स्कूल', 'विद्यालय'].forEach(function (w) { if (k2u(u2k(w)) !== w) f.push('round trip ' + w + ' → ' + u2k(w) + ' → ' + k2u(u2k(w))); });
    return Promise.resolve({ ok: !f.length, n: 24, fails: f });
  };
});
