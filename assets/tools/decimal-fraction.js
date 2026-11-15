/* Infinity by GroupChatOn — decimal-fraction. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'decimal-fraction', {
  inputs: [{ k: 'x', label: 'A decimal (0.75) or a fraction (3/4)', type: 'text', value: '0.75' }],
  calc: function (v, X) {
    var s = String(v.x).trim(), g = function (p, q) { while (q) { var t = p % q; p = q; q = t; } return Math.abs(p); };
    var m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (m) {
      var n = +m[1], d = +m[2]; X.need(d, 'The bottom number cannot be 0.');
      var rem = Math.abs(n) % d, seen = {}, digits = '', pos = 0, rep = -1;
      while (rem && pos < 60) { if (seen[rem] !== undefined) { rep = seen[rem]; break; } seen[rem] = pos++; rem *= 10; digits += Math.floor(rem / d); rem %= d; }
      var whole = (n < 0 ? '-' : '') + Math.floor(Math.abs(n) / d), dec = rep >= 0 ? digits.slice(0, rep) + '(' + digits.slice(rep) + ')' : digits;
      return { rows: [['Decimal', whole + (dec ? '.' + dec : ''), null, rep >= 0 ? 'digits in brackets repeat for ever' : ''], ['Simplest fraction', n / g(n, d) + '/' + d / g(n, d)], ['Percent', 100 * n / d, 'pct']] };
    }
    var x = parseFloat(s); X.need(!isNaN(x), 'Enter a decimal like 0.75 or a fraction like 3/4.');
    var h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;   // continued fractions: the closest simple fraction
    for (var i = 0; i < 40; i++) { var a = Math.floor(b), h2 = a * h1 + h0, k2 = a * k1 + k0; h0 = h1; h1 = h2; k0 = k1; k1 = k2; if (Math.abs(x - h1 / k1) < 1e-12 || k1 > 1e9) break; b = 1 / (b - a); }
    var w = Math.trunc(h1 / k1), r = Math.abs(h1 - w * k1);
    return { rows: [['Fraction', h1 + '/' + k1], ['Mixed number', w && r ? w + ' ' + r + '/' + k1 : h1 + '/' + k1], ['Percent', x * 100, 'pct']] };
  },
  test: [{ in: { x: '0.75' }, expect: { 'Fraction': '3/4' } }, { in: { x: '1/3' }, expect: { 'Decimal': '0.(3)' } }, { in: { x: '1.125' }, expect: { 'Mixed number': '1 1/8' } }]
});
