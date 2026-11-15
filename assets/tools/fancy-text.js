/* Fancy Text — 20+ Unicode styles (bold, italic, script, bubble, small caps…) to copy into Instagram, WhatsApp or any app.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('fancy-text', function (spot, T) {
  var h = T.h;
  var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', a = 'abcdefghijklmnopqrstuvwxyz', D = '0123456789';
  // a style from Unicode "mathematical" letters: start code points for A, a and 0 (with the few letters Unicode keeps elsewhere)
  function math(up, low, dig, holes) {
    return function (c) {
      var i;
      if (holes && holes[c]) return holes[c];
      if ((i = A.indexOf(c)) >= 0 && up) return String.fromCodePoint(up + i);
      if ((i = a.indexOf(c)) >= 0 && low) return String.fromCodePoint(low + i);
      if ((i = D.indexOf(c)) >= 0 && dig) return String.fromCodePoint(dig + i);
      return c;
    };
  }
  function table(from, to) { var f = Array.from(from), t = Array.from(to); return function (c) { var i = f.indexOf(c); return i >= 0 ? t[i] : c; }; }
  var STYLES = [
    ['Bold', math(0x1D400, 0x1D41A, 0x1D7CE)],
    ['Italic', math(0x1D434, 0x1D44E, 0, { h: 'ℎ' })],
    ['Bold italic', math(0x1D468, 0x1D482)],
    ['Script', math(0x1D49C, 0x1D4B6, 0, { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' })],
    ['Bold script', math(0x1D4D0, 0x1D4EA)],
    ['Fraktur', math(0x1D504, 0x1D51E, 0, { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' })],
    ['Bold fraktur', math(0x1D56C, 0x1D586)],
    ['Double-struck', math(0x1D538, 0x1D552, 0x1D7D8, { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' })],
    ['Sans', math(0x1D5A0, 0x1D5BA, 0x1D7E2)],
    ['Sans bold', math(0x1D5D4, 0x1D5EE, 0x1D7EC)],
    ['Sans italic', math(0x1D608, 0x1D622)],
    ['Monospace', math(0x1D670, 0x1D68A, 0x1D7F6)],
    ['Bubble', table(A + a + D, 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨')],
    ['Squares', math(0x1F130, 0x1F130)],
    ['Dark squares', math(0x1F170, 0x1F170)],
    ['Full width', function (c) { var k = c.charCodeAt(0); return k > 32 && k < 127 ? String.fromCharCode(k + 0xFEE0) : c === ' ' ? '　' : c; }],
    ['Small caps', table(a, 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘꞯʀꜱᴛᴜᴠᴡxʏᴢ')],
    ['Superscript', table(a + D, 'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹')],
    ['Upside down', null],
    ['Strike', function (c) { return c === ' ' ? c : c + '̶'; }],
    ['Underline', function (c) { return c + '̲'; }],
    ['Spaced', function (c) { return c === ' ' ? '   ' : c + ' '; }]
  ];
  var FLIP_MAP = {"a": "ɐ", "b": "q", "c": "ɔ", "d": "p", "e": "ǝ", "f": "ɟ", "g": "ƃ", "h": "ɥ", "i": "ᴉ", "j": "ɾ", "k": "ʞ", "l": "l", "m": "ɯ", "n": "u", "o": "o", "p": "d", "q": "b", "r": "ɹ", "s": "s", "t": "ʇ", "u": "n", "v": "ʌ", "w": "ʍ", "x": "x", "y": "ʎ", "z": "z", "A": "∀", "B": "ꓭ", "C": "Ɔ", "D": "ꓷ", "E": "Ǝ", "F": "Ⅎ", "G": "⅁", "H": "H", "I": "I", "J": "ſ", "K": "ꓘ", "L": "˥", "M": "W", "N": "N", "O": "O", "P": "Ԁ", "Q": "Ό", "R": "ꓤ", "S": "S", "T": "⊥", "U": "∩", "V": "Λ", "W": "M", "X": "X", "Y": "⅄", "Z": "Z", "0": "0", "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "ㄥ", "8": "8", "9": "6", ".": "˙", ",": "'", "?": "¿", "!": "¡", "'": ",", "\"": "„", "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<", "&": "⅋", "_": "‾"};
  var FLIP = function (c) { return FLIP_MAP[c] || c; };
  var input = h('input', { type: 'text', 'class': 'tin', placeholder: 'Type your text', 'aria-label': 'Your text', maxlength: '300' });
  input.value = T.store.get('fancy-text', 'Infinity Tools');
  var list = h('div', { 'class': 'tfancy' });
  spot.appendChild(T.card([T.field('Your text', input), list]));
  function draw() {
    T.store.set('fancy-text', input.value);
    var src = input.value || 'Infinity Tools';
    list.innerHTML = '';
    STYLES.forEach(function (st) {
      var out = st[0] === 'Upside down' ? Array.from(src).reverse().map(FLIP).join('') : Array.from(src).map(st[1]).join('');
      var btn = T.button('Copy', { small: true, onclick: function () { T.copy(out, btn); } });
      list.appendChild(h('div', { 'class': 'tfancy-row' }, [h('small', { text: st[0] }), h('span', { 'class': 'tfancy-out', text: out }), btn]));
    });
  }
  input.addEventListener('input', draw);
  draw();
});
