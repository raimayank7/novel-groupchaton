/* Infinity by GroupChatOn — pythagoras. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'pythagoras', {
  inputs: [{ k: 'a', label: 'Side a', value: 3 }, { k: 'b', label: 'Side b', value: 4 }, { k: 'c', label: 'Hypotenuse c (longest side)', value: '' },
    { k: 'h', type: 'heading', label: 'Fill in any two sides and leave one empty.' }],
  calc: function (v, X) {
    var ok = function (n) { return n > 0; }, a = v.a, b = v.b, c = v.c;
    X.need([a, b, c].filter(ok).length === 2, 'Fill in exactly two sides.');
    if (!ok(c)) c = Math.hypot(a, b);
    else { X.need(c > (ok(a) ? a : b), 'The hypotenuse must be the longest side.'); if (!ok(a)) a = Math.sqrt(c * c - b * b); else b = Math.sqrt(c * c - a * a); }
    var A = Math.atan2(a, b) * 180 / Math.PI;
    return { rows: [['Hypotenuse c', c, 4], ['Side a', a, 4], ['Side b', b, 4], ['Angle A (opposite a)', A, function (n) { return X.num(n, 4) + '°'; }], ['Angle B (opposite b)', 90 - A, function (n) { return X.num(n, 4) + '°'; }],
      ['Area', a * b / 2, 4], ['Perimeter', a + b + c, 4]], note: 'a² + b² = c². Builders use 3-4-5 to check a corner is square.' };
  },
  test: [{ in: { a: 3, b: 4, c: '' }, expect: { 'Hypotenuse c': 5, 'Angle A (opposite a)': 36.8699, Area: 6 } }, { in: { a: 5, b: '', c: 13 }, expect: { 'Side b': 12 } }]
});
