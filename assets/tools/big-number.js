/* Infinity by GroupChatOn — big-number. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'big-number', {
  inputs: [{ k: 'a', label: 'First number (any length, whole)', type: 'textarea', rows: 2, value: '123456789012345678901234567890' }, { k: 'b', label: 'Second number', type: 'textarea', rows: 2, value: '987654321' }],
  calc: function (v, X) {
    var clean = function (s) { s = String(s).replace(/[\s,_]/g, ''); X.need(/^-?\d+$/.test(s), 'Use whole numbers only (digits, with an optional minus sign).'); return BigInt(s); };
    var a = clean(v.a), b = clean(v.b), g = function (p, q) { p = p < 0n ? -p : p; q = q < 0n ? -q : q; while (q) { var t = p % q; p = q; q = t; } return p; };
    return { rows: [['a × b', (a * b).toString()], ['a + b', (a + b).toString()], ['a − b', (a - b).toString()], ['a ÷ b (whole part)', b ? (a / b).toString() : '—'], ['Remainder (a mod b)', b ? (a % b).toString() : '—'],
      ['GCD', g(a, b).toString()], ['Digits in a × b', (a * b).toString().replace('-', '').length, 'int']] };
  },
  test: [{ in: { a: '123456789012345678901234567890', b: '2' }, expect: { 'a × b': '246913578024691357802469135780' } }, { in: { a: '99999999999999999999', b: '1' }, expect: { 'a + b': '100000000000000000000' } }]
});
