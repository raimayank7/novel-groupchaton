/* Infinity by GroupChatOn — braille. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Braille (Grade 1, English): text to Unicode braille dots and back, with capital and number signs. */
GCOTools.register('braille', function (spot, T) {
  var L = 'a⠁b⠃c⠉d⠙e⠑f⠋g⠛h⠓i⠊j⠚k⠅l⠇m⠍n⠝o⠕p⠏q⠟r⠗s⠎t⠞u⠥v⠧w⠺x⠭y⠽z⠵,⠂;⠆:⠒.⠲!⠖?⠦\'⠄-⠤', B = {}, R = {};
  for (var i = 0; i < L.length; i += 2) { B[L[i]] = L[i + 1]; R[L[i + 1]] = L[i]; }
  var CAP = '⠠', NUM = '⠼', DIG = 'jabcdefghi';   // digits 1–9, 0 use the letters a–j after the number sign
  function enc(s) {
    var out = '', inNum = false;
    Array.from(s).forEach(function (c) {
      if (/[0-9]/.test(c)) { if (!inNum) { out += NUM; inNum = true; } out += B[DIG[+c]]; return; }
      if (inNum && c !== '.' && c !== ',') inNum = false;
      if (/[A-Z]/.test(c)) out += CAP + B[c.toLowerCase()];
      else out += B[c] || c;
    });
    return out;
  }
  function dec(s) {
    var out = '', cap = false, num = false;
    Array.from(s).forEach(function (c) {
      if (c === CAP) { cap = true; return; }
      if (c === NUM) { num = true; return; }
      var x = R[c];
      if (x === undefined) { out += c === '⠀' ? ' ' : c; if (/\s/.test(c)) num = false; return; }
      if (num && /[a-j]/.test(x)) { out += String(DIG.indexOf(x)); return; }
      if (num && x !== '.' && x !== ',') num = false;
      out += cap ? x.toUpperCase() : x; cap = false;
    });
    return out;
  }
  function isBraille(s) { return /[\u2800-\u28FF]/.test(s); }
  T.transformer(spot, { id: 'braille', inLabel: 'Text or braille', sample: 'Hello, World! Room 204.',
    options: [T.opt.select('dir', 'Direction', [['auto', 'Detect automatically'], ['enc', 'Text → Braille'], ['dec', 'Braille → Text']], 'auto')],
    note: function () { return 'Grade 1 (uncontracted) English braille. ⠠ marks a capital letter and ⠼ starts a number.'; },
    run: function (t, o) { var d = o.dir === 'auto' ? (isBraille(t) ? 'dec' : 'enc') : o.dir; return d === 'dec' ? dec(t) : enc(t); } });
  T.tests['braille'] = function () {
    var f = [];
    if (enc('abc') !== '⠁⠃⠉') f.push('abc ' + enc('abc'));
    if (enc('Hi 42') !== '⠠⠓⠊ ⠼⠙⠃') f.push('Hi 42 ' + enc('Hi 42'));
    ['Hello, World! Room 204.', 'braille is fun?', 'Call 1990 now'].forEach(function (s) { if (dec(enc(s)) !== s) f.push('round trip ' + s + ' → ' + dec(enc(s))); });
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
