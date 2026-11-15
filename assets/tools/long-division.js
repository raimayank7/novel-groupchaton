/* Infinity by GroupChatOn — long-division. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'long-division', {
  inputs: [{ k: 'a', label: 'Dividend (number to divide)', value: 1234 }, { k: 'b', label: 'Divisor', value: 7 }],
  calc: function (v, X) {
    X.need(v.b > 0 && v.b % 1 === 0 && v.a >= 0 && v.a % 1 === 0, 'Use whole numbers, with a divisor above 0.');
    var digits = String(v.a).split(''), cur = 0, q = '', rows = [];
    digits.forEach(function (d, i) { cur = cur * 10 + +d; var k = Math.floor(cur / v.b); q += k;
      rows.push([String(i + 1), 'Bring down ' + d + ' → ' + cur, cur + ' ÷ ' + v.b + ' = ' + k, k + ' × ' + v.b + ' = ' + k * v.b, String(cur - k * v.b)]); cur -= k * v.b; });
    var quo = parseInt(q, 10);
    return { rows: [['Answer', quo + ' remainder ' + cur], ['Quotient', quo, 'int'], ['Remainder', cur, 'int'], ['As a decimal', v.a / v.b, 8]], table: { caption: 'Step by step', head: ['Step', 'Number', 'Divide', 'Multiply', 'Subtract'], rows: rows, open: true } };
  },
  test: [{ in: { a: 1234, b: 7 }, expect: { 'Answer': '176 remainder 2', 'Quotient': 176 } }]
});
