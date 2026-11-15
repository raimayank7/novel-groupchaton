/* Infinity by GroupChatOn — roman-numerals. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Roman numerals: numbers to Roman and back, one per line, with a check that the Roman number is written correctly. */
GCOTools.register('roman-numerals', function (spot, T) {
  var V = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  function toRoman(n) { var s = ''; V.forEach(function (p) { while (n >= p[0]) { s += p[1]; n -= p[0]; } }); return s; }
  function fromRoman(r) {
    var m = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }, n = 0;
    for (var i = 0; i < r.length; i++) { var a = m[r[i]], b = m[r[i + 1]] || 0; n += a < b ? -a : a; }
    return n;
  }
  function one(line) {
    var s = line.trim().replace(/,/g, '');
    if (!s) return '';
    if (/^\d+$/.test(s)) { var n = +s; return n >= 1 && n <= 3999 ? s + ' = ' + toRoman(n) : s + ' → Roman numerals go from 1 to 3999'; }
    var r = s.toUpperCase();
    if (!/^[IVXLCDM]+$/.test(r)) return s + ' → not a number or Roman numeral';
    var v = fromRoman(r);
    return toRoman(v) === r ? r + ' = ' + v : r + ' → not written the standard way (did you mean ' + toRoman(v) + ' = ' + v + '?)';
  }
  function run(t) { return t.split(/\r?\n/).map(one).join('\n'); }
  T.transformer(spot, { id: 'roman-numerals', inLabel: 'Numbers or Roman numerals (one per line)', sample: '2026\nXIV\nMCMXCIX\n49\nIIII', run: run });
  T.tests['roman-numerals'] = function () {
    var f = [], c = [['2026', '2026 = MMXXVI'], ['xiv', 'XIV = 14'], ['MCMXCIX', 'MCMXCIX = 1999'], ['3999', '3999 = MMMCMXCIX'], ['49', '49 = XLIX']];
    c.forEach(function (x) { if (one(x[0]) !== x[1]) f.push(x[0] + ' → ' + one(x[0])); });
    if (one('IIII').indexOf('IV = 4') < 0) f.push('IIII not flagged');
    if (one('4000').indexOf('1 to 3999') < 0) f.push('4000 not refused');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
