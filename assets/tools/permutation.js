/* Infinity by GroupChatOn — permutation. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'permutation', {
  inputs: [{ k: 'n', label: 'n (total items)', value: 10 }, { k: 'r', label: 'r (items chosen)', value: 3 }],
  calc: function (v, X) {
    X.need(v.n >= 0 && v.r >= 0 && v.r <= v.n && v.n % 1 === 0 && v.r % 1 === 0, 'Use whole numbers with r ≤ n.'); X.need(v.n <= 1000, 'Keep n at 1,000 or less.');
    var n = BigInt(v.n), r = BigInt(v.r), P = 1n, C;
    for (var i = n; i > n - r; i--) P *= i;
    var f = 1n; for (var j = 2n; j <= r; j++) f *= j; C = P / f;
    var s = function (b) { var t = b.toString(); return t.length > 15 ? t.slice(0, 1) + '.' + t.slice(1, 7) + ' × 10^' + (t.length - 1) : Number(b).toLocaleString('en'); };
    return { rows: [['Combinations nCr', s(C), null, 'order does not matter'], ['Permutations nPr', s(P), null, 'order matters'], ['With repetition (n^r)', s(n ** r)]] };
  },
  test: [{ in: { n: 10, r: 3 }, expect: { 'Combinations nCr': '120', 'Permutations nPr': '720' } }, { in: { n: 52, r: 5 }, expect: { 'Combinations nCr': '2,598,960' } }]
});
