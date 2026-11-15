/* Infinity by GroupChatOn — matrix. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'matrix', {
  inputs: [{ k: 'a', label: 'Matrix A (one row per line)', type: 'textarea', value: '1 2\n3 4' }, { k: 'b', label: 'Matrix B (one row per line)', type: 'textarea', value: '5 6\n7 8' }],
  calc: function (v, X) {
    var parse = function (s) { return String(s).trim().split('\n').map(function (r) { return X.nums(r); }).filter(function (r) { return r.length; }); };
    var A = parse(v.a), B = parse(v.b), ok = function (M) { return M.length && M.every(function (r) { return r.length === M[0].length; }); };
    X.need(ok(A), 'Every row of A needs the same number of values.');
    var show = function (M) { return M ? M.map(function (r) { return '[' + r.map(function (n) { return X.num(Math.abs(n) < 1e-12 ? 0 : n, 6); }).join(', ') + ']'; }).join(' ') : '—'; };
    var det = function (M) { var n = M.length, m = M.map(function (r) { return r.slice(); }), d = 1;
      for (var i = 0; i < n; i++) { var p = i; for (var k = i + 1; k < n; k++) if (Math.abs(m[k][i]) > Math.abs(m[p][i])) p = k; if (Math.abs(m[p][i]) < 1e-12) return 0; if (p !== i) { var t = m[p]; m[p] = m[i]; m[i] = t; d = -d; } d *= m[i][i];
        for (k = i + 1; k < n; k++) { var f = m[k][i] / m[i][i]; for (var j = i; j < n; j++) m[k][j] -= f * m[i][j]; } } return d; };
    var inv = function (M) { var n = M.length, m = M.map(function (r, i) { return r.concat(r.map(function (_, j) { return i === j ? 1 : 0; })); });
      for (var i = 0; i < n; i++) { var p = i; for (var k = i + 1; k < n; k++) if (Math.abs(m[k][i]) > Math.abs(m[p][i])) p = k; if (Math.abs(m[p][i]) < 1e-12) return null; var t = m[p]; m[p] = m[i]; m[i] = t;
        var q = m[i][i]; for (var j = 0; j < 2 * n; j++) m[i][j] /= q; for (k = 0; k < n; k++) if (k !== i) { var f = m[k][i]; for (j = 0; j < 2 * n; j++) m[k][j] -= f * m[i][j]; } }
      return m.map(function (r) { return r.slice(n); }); };
    var sq = A.length === A[0].length, rows = [['Transpose of A', show(A[0].map(function (_, j) { return A.map(function (r) { return r[j]; }); }))]];
    if (sq) rows.unshift(['Determinant of A', det(A)], ['Inverse of A', inv(A) ? show(inv(A)) : 'none (determinant is 0)']);
    if (ok(B)) {
      rows.push(['A × B', A[0].length === B.length ? show(A.map(function (r) { return B[0].map(function (_, j) { return r.reduce(function (s, x, k) { return s + x * B[k][j]; }, 0); }); })) : 'not possible (columns of A ≠ rows of B)']);
      var same = A.length === B.length && A[0].length === B[0].length;
      rows.push(['A + B', same ? show(A.map(function (r, i) { return r.map(function (x, j) { return x + B[i][j]; }); })) : 'different sizes'], ['A − B', same ? show(A.map(function (r, i) { return r.map(function (x, j) { return x - B[i][j]; }); })) : 'different sizes']);
    }
    return { rows: rows };
  },
  test: [{ in: { a: '1 2\n3 4', b: '5 6\n7 8' }, expect: { 'Determinant of A': -2, 'A × B': '[19, 22] [43, 50]', 'Inverse of A': '[-2, 1] [1.5, -0.5]' } }]
});
