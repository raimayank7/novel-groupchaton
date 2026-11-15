/* Infinity by GroupChatOn — ratio. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'ratio', {
  inputs: [{ k: 'a', label: 'A', value: 2 }, { k: 'b', label: 'B', value: 3 }, { k: 'c', label: 'C', value: 10, hint: 'A : B = C : ?' }],
  calc: function (v, X) {
    X.need(v.a, 'A cannot be 0.');
    function g(p, q) { p = Math.abs(p); q = Math.abs(q); while (q > 1e-9) { var t = p % q; p = q; q = t; } return p; }
    var sc = Math.pow(10, Math.max(dp(v.a), dp(v.b))); function dp(n) { var s = String(n).split('.')[1]; return s ? s.length : 0; }
    var A = Math.round(v.a * sc), B = Math.round(v.b * sc), k = g(A, B);
    return { rows: [['? = ', v.b * v.c / v.a, null, v.a + ' : ' + v.b + ' = ' + v.c + ' : ' + X.num(v.b * v.c / v.a)], ['Simplest form', A / k + ' : ' + B / k], ['As 1 : n', '1 : ' + X.num(v.b / v.a)], ['A as a share of the total', 100 * v.a / (v.a + v.b), 'pct']] };
  },
  test: [{ in: { a: 2, b: 3, c: 10 }, expect: { '? = ': 15, 'Simplest form': '2 : 3' } }, { in: { a: 12, b: 18, c: 1 }, expect: { 'Simplest form': '2 : 3' } }]
});
