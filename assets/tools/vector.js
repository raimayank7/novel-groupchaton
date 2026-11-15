/* Infinity by GroupChatOn — vector. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'vector', {
  inputs: [{ k: 'a', label: 'Vector A (x, y, z)', type: 'text', value: '1, 2, 3' }, { k: 'b', label: 'Vector B (x, y, z)', type: 'text', value: '4, 5, 6' }],
  calc: function (v, X) {
    var A = X.nums(v.a), B = X.nums(v.b); while (A.length < 3) A.push(0); while (B.length < 3) B.push(0);
    var f = function (p) { return '(' + p.map(function (n) { return X.num(n, 6); }).join(', ') + ')'; }, mag = function (p) { return Math.hypot(p[0], p[1], p[2]); };
    var dot = A[0] * B[0] + A[1] * B[1] + A[2] * B[2], cr = [A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0]];
    return { rows: [['Dot product A·B', dot], ['Cross product A×B', f(cr)], ['A + B', f([A[0] + B[0], A[1] + B[1], A[2] + B[2]])], ['A − B', f([A[0] - B[0], A[1] - B[1], A[2] - B[2]])],
      ['|A|', mag(A)], ['|B|', mag(B)], ['Angle between', mag(A) && mag(B) ? Math.acos(Math.max(-1, Math.min(1, dot / (mag(A) * mag(B))))) * 180 / Math.PI : NaN, 4, 'degrees']] };
  },
  test: [{ in: { a: '1, 2, 3', b: '4, 5, 6' }, expect: { 'Dot product A·B': 32, 'Cross product A×B': '(-3, 6, -3)' } }]
});
