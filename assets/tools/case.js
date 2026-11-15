/* Case Converter — UPPER, lower, Title, Sentence, aLtErNaTiNg, iNVERSE, camelCase, snake_case, kebab-case.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('case', function (spot, T) {
  var h = T.h;
  var text = h('textarea', { rows: '8', placeholder: 'Type or paste text, then pick a case…', 'aria-label': 'Text' });
  var SMALL = /^(a|an|and|as|at|but|by|for|in|nor|of|on|or|so|the|to|up|yet|vs)$/i;
  function words(s) { return s.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean); }
  var CASES = [
    ['UPPER CASE', function (s) { return s.toUpperCase(); }],
    ['lower case', function (s) { return s.toLowerCase(); }],
    ['Title Case', function (s) {
      return s.toLowerCase().replace(/[\p{L}\p{N}'’]+/gu, function (w, i) { return i > 0 && SMALL.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1); });
    }],
    ['Sentence case', function (s) { return s.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); }).replace(/\bi\b/g, 'I'); }],
    ['aLtErNaTiNg', function (s) { var k = 0; return s.replace(/\p{L}/gu, function (c) { return k++ % 2 ? c.toUpperCase() : c.toLowerCase(); }); }],
    ['iNVERSE cASE', function (s) { return s.replace(/\p{L}/gu, function (c) { return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); }); }],
    ['camelCase', function (s) { return words(s).map(function (w, i) { w = w.toLowerCase(); return i ? w.charAt(0).toUpperCase() + w.slice(1) : w; }).join(''); }],
    ['snake_case', function (s) { return words(s).join('_').toLowerCase(); }],
    ['kebab-case', function (s) { return words(s).join('-').toLowerCase(); }]
  ];
  var copy = T.button('Copy result', { primary: true, onclick: function () { T.copy(text.value, copy); } });
  var undoStack = [];
  var undo = T.button('Undo', { onclick: function () { if (undoStack.length) text.value = undoStack.pop(); undo.disabled = !undoStack.length; } });
  undo.disabled = true;
  spot.appendChild(T.card([text,
    h('div', { 'class': 'trow' }, CASES.map(function (c) {
      return T.button(c[0], { small: true, onclick: function () { undoStack.push(text.value); undo.disabled = false; text.value = c[1](text.value); } });
    })),
    T.row([copy, undo, T.button('Clear', { onclick: function () { undoStack.push(text.value); undo.disabled = false; text.value = ''; } })])]));
});
