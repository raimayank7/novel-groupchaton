/* Infinity by GroupChatOn — fraction. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'fraction', {
  inputs: [{ k: 'a', label: 'First fraction (e.g. 1/2 or 1 1/2)', type: 'text', value: '1/2' }, { k: 'op', label: 'Operation', options: [['+', '+ add'], ['-', '− subtract'], ['*', '× multiply'], ['/', '÷ divide']], value: '+' },
    { k: 'b', label: 'Second fraction', type: 'text', value: '1/3' }],
  calc: function (v, X) {
    var g = function (p, q) { p = Math.abs(p); q = Math.abs(q); while (q) { var t = p % q; p = q; q = t; } return p || 1; };
    var parse = function (s) { s = String(s).trim(); var m = s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/); if (m) return [(m[1] ? -1 : 1) * (+m[2] * +m[4] + +m[3]), +m[4]];
      m = s.match(/^(-?\d+)\/(\d+)$/); if (m) return [+m[1], +m[2]]; m = s.match(/^-?\d+$/); if (m) return [+s, 1]; throw new Error('Could not read “' + s + '”. Write fractions like 3/4 or 1 1/2.'); };
    var p = parse(v.a), q = parse(v.b); X.need(p[1] && q[1], 'The bottom number cannot be 0.');
    var n, d; if (v.op === '+') { n = p[0] * q[1] + q[0] * p[1]; d = p[1] * q[1]; } else if (v.op === '-') { n = p[0] * q[1] - q[0] * p[1]; d = p[1] * q[1]; }
    else if (v.op === '*') { n = p[0] * q[0]; d = p[1] * q[1]; } else { X.need(q[0], 'Cannot divide by zero.'); n = p[0] * q[1]; d = p[1] * q[0]; }
    if (d < 0) { n = -n; d = -d; } var k = g(n, d); n /= k; d /= k;
    var w = Math.trunc(n / d), r = Math.abs(n % d);
    return { rows: [['Answer', d === 1 ? String(n) : n + '/' + d], ['Mixed number', d === 1 || !w ? (d === 1 ? String(n) : n + '/' + d) : w + ' ' + r + '/' + d], ['Decimal', n / d, 10]] };
  },
  test: [{ in: { a: '1/2', op: '+', b: '1/3' }, expect: { 'Answer': '5/6' } }, { in: { a: '1 1/2', op: '*', b: '2/3' }, expect: { 'Answer': '1' } }, { in: { a: '3/4', op: '/', b: '1/8' }, expect: { 'Answer': '6' } }]
});
