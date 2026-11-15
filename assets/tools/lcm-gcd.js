/* Infinity by GroupChatOn — lcm-gcd. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'lcm-gcd', {
  inputs: [{ k: 'x', label: 'Numbers', type: 'textarea', value: '12 18 30' }],
  calc: function (v, X) {
    var a = X.nums(v.x).map(Math.abs).filter(function (n) { return n % 1 === 0 && n > 0; }); X.need(a.length >= 2, 'Enter two or more whole numbers.');
    var g = function (p, q) { while (q) { var t = p % q; p = q; q = t; } return p; }, G = a.reduce(g), L = a.reduce(function (p, q) { return p / g(p, q) * q; });
    return { rows: [['HCF / GCD', G, 'int'], ['LCM', L, 'int']] };
  },
  test: [{ in: { x: '12 18 30' }, expect: { 'HCF / GCD': 6, 'LCM': 180 } }]
});
