/* Infinity by GroupChatOn — wa-fonts. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* WhatsApp fancy fonts: Unicode letter styles that work in any chat, bio or name. */
GCOTools.register('wa-fonts', function (spot, T) {
  var h = T.h;
  // [name, capital A, small a, digit 0] in the Unicode maths letters; exceptions fill the holes in some styles
  var MATH = [['Bold', 0x1D400, 0x1D41A, 0x1D7CE], ['Italic', 0x1D434, 0x1D44E], ['Bold italic', 0x1D468, 0x1D482], ['Script', 0x1D49C, 0x1D4B6], ['Bold script', 0x1D4D0, 0x1D4EA],
    ['Gothic', 0x1D504, 0x1D51E], ['Double-struck', 0x1D538, 0x1D552, 0x1D7D8], ['Sans', 0x1D5A0, 0x1D5BA, 0x1D7E2], ['Sans bold', 0x1D5D4, 0x1D5EE, 0x1D7EC], ['Sans italic', 0x1D608, 0x1D622],
    ['Monospace', 0x1D670, 0x1D68A, 0x1D7F6]];
  var HOLES = { 0x1D455: 'ℎ', 0x1D49D: 'ℬ', 0x1D4A0: 'ℰ', 0x1D4A1: 'ℱ', 0x1D4A3: 'ℋ', 0x1D4A4: 'ℐ', 0x1D4A7: 'ℒ', 0x1D4A8: 'ℳ', 0x1D4AD: 'ℛ', 0x1D4BA: 'ℯ', 0x1D4BC: 'ℊ', 0x1D4C4: 'ℴ',
    0x1D506: 'ℭ', 0x1D50B: 'ℌ', 0x1D50C: 'ℑ', 0x1D515: 'ℜ', 0x1D51D: 'ℨ', 0x1D53A: 'ℂ', 0x1D53F: 'ℍ', 0x1D545: 'ℕ', 0x1D547: 'ℙ', 0x1D548: 'ℚ', 0x1D549: 'ℝ', 0x1D551: 'ℤ' };
  function math(s, st) {
    return Array.from(s).map(function (c) {
      var k = c.charCodeAt(0), cp = 0;
      if (k >= 65 && k <= 90) cp = st[1] + k - 65; else if (k >= 97 && k <= 122) cp = st[2] + k - 97; else if (k >= 48 && k <= 57 && st[3]) cp = st[3] + k - 48;
      return cp ? HOLES[cp] || String.fromCodePoint(cp) : c;
    }).join('');
  }
  var SMALL = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ', FLIP = { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z', '.': '˙', ',': "'", '?': '¿', '!': '¡', '(': ')', ')': '(' };
  var OTHER = [['Small caps', function (s) { return s.replace(/[a-z]/gi, function (c) { return SMALL[c.toLowerCase().charCodeAt(0) - 97]; }); }],
    ['Bubbles', function (s) { return Array.from(s).map(function (c) { var k = c.charCodeAt(0); return k >= 65 && k <= 90 ? String.fromCodePoint(0x24B6 + k - 65) : k >= 97 && k <= 122 ? String.fromCodePoint(0x24D0 + k - 97) : k >= 49 && k <= 57 ? String.fromCodePoint(0x2460 + k - 49) : c; }).join(''); }],
    ['Squares', function (s) { return Array.from(s.toUpperCase()).map(function (c) { var k = c.charCodeAt(0); return k >= 65 && k <= 90 ? String.fromCodePoint(0x1F130 + k - 65) : c; }).join(''); }],
    ['Wide', function (s) { return Array.from(s).map(function (c) { var k = c.charCodeAt(0); return k >= 33 && k <= 126 ? String.fromCharCode(k + 0xFEE0) : c === ' ' ? '　' : c; }).join(''); }],
    ['Underline', function (s) { return Array.from(s).map(function (c) { return c + '̲'; }).join(''); }], ['Strike', function (s) { return Array.from(s).map(function (c) { return c + '̶'; }).join(''); }],
    ['Upside down', function (s) { return Array.from(s.toLowerCase()).reverse().map(function (c) { return FLIP[c] || c; }).join(''); }]];
  var STYLES = MATH.map(function (m) { return [m[0], function (s) { return math(s, m); }]; }).concat(OTHER);
  var input = h('input', { type: 'text', value: T.store.get('wa-fonts', 'Happy Birthday 2026'), 'aria-label': 'Your text' }), list = h('div', { 'class': 'tfonts' });
  function draw() {
    T.store.set('wa-fonts', input.value); list.innerHTML = '';
    STYLES.forEach(function (st) {
      var v = st[1](input.value || 'Type something');
      list.appendChild(h('button', { type: 'button', 'class': 'tfont', title: 'Copy', onclick: function (e) { T.copy(v, e.currentTarget.lastChild); } }, [h('small', { text: st[0] }), h('span', { text: v })]));
    });
  }
  input.addEventListener('input', draw);
  spot.appendChild(T.card([T.field('Your text', input), list, h('p', { 'class': 'tnote', text: 'Tap a style to copy it, then paste into WhatsApp, Instagram or your name. These are special Unicode letters: screen readers may read them oddly, so keep important messages plain.' })]));
  draw();
  T.tests['wa-fonts'] = function () {
    var f = function (n, s) { return STYLES.filter(function (x) { return x[0] === n; })[0][1](s); }, fails = [];
    [['Bold', 'A1', '𝐀𝟏'], ['Italic', 'h', 'ℎ'], ['Script', 'B', 'ℬ'], ['Double-struck', 'R', 'ℝ'], ['Monospace', 'a', '𝚊'], ['Small caps', 'Hi', 'ʜɪ'], ['Bubbles', 'A1', 'Ⓐ①'], ['Upside down', 'hi!', '¡ᴉɥ'], ['Wide', 'A', 'Ａ']]
      .forEach(function (t) { if (f(t[0], t[1]) !== t[2]) fails.push(t[0] + ' ' + t[1] + ' → ' + f(t[0], t[1])); });
    return Promise.resolve({ ok: !fails.length, n: 9, fails: fails });
  };
});
