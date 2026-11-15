/* Infinity by GroupChatOn — invisible-char. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Invisible characters: copy blank text for names, empty messages and spacing, and find or remove hidden characters in any text. */
GCOTools.register('invisible-char', function (spot, T) {
  var h = T.h, status = T.status();
  var CHARS = [
    ['ㅤ', 'Hangul filler', 'U+3164', 'Looks like a blank space and is accepted as a “name” by many apps and games.'],
    ['⠀', 'Braille blank', 'U+2800', 'A blank Braille cell: a reliable “empty message” in most chat apps.'],
    ['​', 'Zero-width space', 'U+200B', 'Takes no space at all; lets long words break; often stripped by apps.'],
    [' ', 'No-break space', 'U+00A0', 'A normal-width space that keeps two words on the same line.'],
    [' ', 'Em space', 'U+2003', 'A wide space, as wide as the letter M.'],
    [' ', 'Figure space', 'U+2007', 'As wide as a digit: lines up numbers.'],
    ['‎', 'Left-to-right mark', 'U+200E', 'Invisible direction mark used in mixed English–Arabic text.']
  ];
  var HIDDEN = { '​': 'ZWSP', '‌': 'ZWNJ', '‍': 'ZWJ', '⁠': 'WJ', '﻿': 'BOM', ' ': 'NBSP', 'ㅤ': 'HANGUL FILLER', '⠀': 'BRAILLE BLANK', 'ᅟ': 'HANGUL FILLER', 'ᅠ': 'HANGUL FILLER', '‎': 'LRM', '‏': 'RLM', '‪': 'LRE', '‫': 'RLE', '‬': 'PDF', '‭': 'LRO', '‮': 'RLO', '­': 'SOFT HYPHEN', '⁡': 'FUNCTION', '⁢': 'TIMES', '⁣': 'SEPARATOR', '⁤': 'PLUS', '᠎': 'MVS', ' ': 'EN SPACE', ' ': 'EM SPACE', ' ': 'FIGURE SPACE', ' ': 'THIN SPACE', ' ': 'HAIR SPACE', ' ': 'NARROW NBSP', '　': 'IDEOGRAPHIC SPACE' };
  var RE = new RegExp('[' + Object.keys(HIDDEN).join('') + ']', 'g');
  // emoji joiners (ZWJ, U+200D) and the variation selector are kept when they sit between emoji, so 👨‍👩‍👧 survives cleaning
  function reveal(s) { return s.replace(RE, function (c) { return '[' + HIDDEN[c] + ']'; }); }
  function count(s) { var m = s.match(RE) || [], by = {}; m.forEach(function (c) { by[HIDDEN[c]] = (by[HIDDEN[c]] || 0) + 1; }); return { n: m.length, by: by }; }
  function clean(s, keepNbsp) { return s.replace(RE, function (c, i) { if (c === '‍' && /\p{Extended_Pictographic}/u.test(s.slice(Math.max(0, i - 2), i))) return c; if (c === ' ' || /[ -  　]/.test(c)) return keepNbsp ? c : ' '; return ''; }); }
  var which = T.select(CHARS.map(function (c, i) { return [i, c[1] + ' (' + c[2] + ')']; }), 0), many = h('input', { type: 'number', min: '1', max: '1000', value: '1', 'aria-label': 'How many' });
  var about = h('p', { 'class': 'tnote' }), out = h('textarea', { rows: '2', 'class': 'tout', readonly: true, 'aria-label': 'Blank text', style: 'min-height:60px' });
  function make() { var c = CHARS[+which.value], n = Math.max(1, Math.min(1000, Math.round(+many.value) || 1)); out.value = new Array(n + 1).join(c[0]); about.textContent = c[3]; }
  var cp = T.button('Copy blank text', { primary: true, onclick: function () { make(); T.copy(out.value, cp); } });
  var check = h('textarea', { rows: '5', placeholder: 'Paste any text to find hidden characters in it', 'aria-label': 'Text to check' }), shown = h('textarea', { rows: '5', 'class': 'tout', readonly: true, 'aria-label': 'Hidden characters shown' });
  var keep = h('input', { type: 'checkbox' });
  function scan() {
    var r = count(check.value); shown.value = reveal(check.value);
    if (!check.value) { status.clear(); return; }
    status.info(r.n ? r.n + ' hidden character' + (r.n === 1 ? '' : 's') + ' found: ' + Object.keys(r.by).map(function (k) { return r.by[k] + ' × ' + k; }).join(', ') + '.' : 'No hidden characters found.');
  }
  check.addEventListener('input', scan);
  var cpc = T.button('Copy cleaned text', { onclick: function () { T.copy(clean(check.value, keep.checked), cpc); } });
  which.addEventListener('change', make); many.addEventListener('input', make);
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Character', which), T.field('How many', many)]), about, T.field('Blank text (it is there, just invisible)', out), T.row([cp]),
    h('hr', { style: 'border:0;border-top:1px solid var(--line);margin:4px 0' }), h('b', { text: 'Find hidden characters' }), T.field('Your text', check),
    T.row([T.button('Try a sample', { small: true, onclick: function () { check.value = 'Hello​ world, this has hidden‍ bits﻿.'; scan(); } }), cpc, h('label', { 'class': 'tcheck' }, [keep, ' Keep special spaces'])]),
    status.el, T.field('Text with hidden characters shown in [brackets]', shown)]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  make();
  T.tests['invisible-char'] = function () {
    var f = [];
    if (reveal('a​b') !== 'a[ZWSP]b') f.push('reveal');
    if (clean('a​b﻿ c d') !== 'ab c d') f.push('clean ' + JSON.stringify(clean('a​b﻿ c d')));
    if (clean('👨‍👩') !== '👨‍👩') f.push('emoji joiner removed');
    if (count('ㅤㅤx').n !== 2) f.push('count');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
