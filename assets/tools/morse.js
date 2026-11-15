/* Infinity by GroupChatOn — morse. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Morse code: text to dots and dashes and back (detected automatically). */
GCOTools.register('morse', function (spot, T) {
  var M = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
    S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.',
    '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.' };
  var R = {}; Object.keys(M).forEach(function (k) { R[M[k]] = k; });
  function norm(s) { return s.replace(/[•·∙]/g, '.').replace(/[−–—_]/g, '-'); }
  function isMorse(s) { s = norm(s); return /^[.\-\/|\s]+$/.test(s) && /[.\-]/.test(s); }
  function enc(s) {
    return s.split(/\r?\n/).map(function (l) {
      return l.trim().split(/\s+/).map(function (w) { return Array.from(w.toUpperCase()).map(function (c) { return M[c] || ''; }).filter(Boolean).join(' '); }).filter(Boolean).join(' / ');
    }).join('\n');
  }
  function dec(s) {
    return norm(s).split(/\r?\n/).map(function (l) {
      return l.trim().split(/\s*[\/|]\s*/).map(function (w) { return w.split(/\s+/).map(function (c) { return R[c] || (c ? '?' : ''); }).join(''); }).join(' ');
    }).join('\n');
  }
  function run(t, o) { var d = o.dir === 'auto' ? (isMorse(t) ? 'dec' : 'enc') : o.dir; return d === 'dec' ? dec(t) : enc(t); }
  T.transformer(spot, { id: 'morse', inLabel: 'Text or Morse code', sample: 'SOS Help is on the way', mono: true,
    options: [T.opt.select('dir', 'Direction', [['auto', 'Detect automatically'], ['enc', 'Text → Morse'], ['dec', 'Morse → Text']], 'auto')],
    note: function (a) { return isMorse(a) ? 'Read as Morse code: letters split by spaces, words by /' : 'Letters are split by a space and words by /'; },
    run: run });
  T.tests['morse'] = function () {
    var f = [], c = [['SOS', '... --- ...'], ['Hi there', '.... .. / - .... . .-. .'], ['A1?', '.- .---- ..--..']];
    c.forEach(function (x) { if (enc(x[0]) !== x[1]) f.push('enc ' + x[0] + ' → ' + enc(x[0])); if (dec(x[1]) !== x[0].toUpperCase()) f.push('dec ' + x[1] + ' → ' + dec(x[1])); });
    if (run('•••  −−− •••', { dir: 'auto' }) !== 'SOS') f.push('auto/bullets');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
