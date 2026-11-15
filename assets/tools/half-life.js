/* Infinity by GroupChatOn — half-life. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'half-life', {
  inputs: [{ k: 'n0', label: 'Starting amount', value: 100, hint: 'grams, atoms, % or any unit' }, { k: 'th', label: 'Half-life', value: 5730 },
    { k: 't', label: 'Time passed', value: 10000, hint: 'same unit as the half-life' }],
  calc: function (v, X) {
    X.pos(v.th, 'the half-life');
    var n = v.n0 * Math.pow(0.5, v.t / v.th), lam = Math.LN2 / v.th;
    return { rows: [['Amount left', n, 4], ['Share left', n / v.n0 * 100, 'pct'], ['Half-lives passed', v.t / v.th, 3], ['Decay constant (λ)', lam, function (x) { return x.toExponential(4); }],
      ['Time to fall to 10%', v.th * Math.log2(10), 2], ['Time to fall to 1%', v.th * Math.log2(100), 2]],
      table: { caption: 'Amount after each half-life', head: ['Half-lives', 'Time', 'Amount left'], rows: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (k) { return [String(k), X.num(k * v.th, 2), X.num(v.n0 / Math.pow(2, k), 4)]; }) },
      note: 'N = N₀ × (½)^(t ÷ half-life). Carbon-14’s half-life is 5,730 years.' };
  },
  test: [{ in: { n0: 100, th: 5730, t: 10000 }, expect: { 'Amount left': 29.8292, 'Decay constant (λ)': 0.000120968, 'Time to fall to 10%': 19034.648 } }]
});
