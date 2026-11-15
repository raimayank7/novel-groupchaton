/* Infinity by GroupChatOn — quadratic. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'quadratic', {
  inputs: [{ k: 'a', label: 'a', value: 1 }, { k: 'b', label: 'b', value: -3 }, { k: 'c', label: 'c', value: 2, hint: 'Solves ax² + bx + c = 0' }],
  calc: function (v, X) {
    X.need(v.a !== 0, 'a cannot be 0 (then it is not quadratic).');
    var d = v.b * v.b - 4 * v.a * v.c, rows;
    if (d >= 0) { var r1 = (-v.b + Math.sqrt(d)) / (2 * v.a), r2 = (-v.b - Math.sqrt(d)) / (2 * v.a); rows = [['x₁', r1], ['x₂', r2]]; }
    else { var re = -v.b / (2 * v.a), im = Math.sqrt(-d) / (2 * Math.abs(v.a)); rows = [['x₁', X.num(re, 6) + ' + ' + X.num(im, 6) + 'i'], ['x₂', X.num(re, 6) + ' − ' + X.num(im, 6) + 'i']]; }
    return { rows: rows.concat([['Discriminant (b² − 4ac)', d], ['Vertex', '(' + X.num(-v.b / (2 * v.a), 6) + ', ' + X.num(v.c - v.b * v.b / (4 * v.a), 6) + ')'], ['Roots are', d > 0 ? 'two real roots' : d === 0 ? 'one repeated real root' : 'two complex roots']]) };
  },
  test: [{ in: { a: 1, b: -3, c: 2 }, expect: { 'x₁': 2, 'x₂': 1, 'Discriminant (b² − 4ac)': 1 } }, { in: { a: 1, b: 2, c: 5 }, expect: { 'x₁': '-1 + 2i' } }]
});
