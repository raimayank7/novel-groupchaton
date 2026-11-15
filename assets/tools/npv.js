/* Infinity by GroupChatOn — npv. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'npv', {
  inputs: [{ k: 'r', label: 'Discount rate', suffix: '% a year', value: 10 }, { k: 'f', label: 'Cash flows, one per year, starting today (investment with −)', type: 'textarea', value: '-1000\n500\n500\n500' }],
  calc: function (v, X) {
    var cf = X.nums(v.f); X.need(cf.length >= 2, 'Add at least two cash flows.');
    var npv = function (r) { return cf.reduce(function (s, c, t) { return s + c / Math.pow(1 + r, t); }, 0); };
    var lo = -0.99, hi = 10, irr = NaN;
    if (npv(lo) * npv(hi) < 0) { for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (npv(lo) * npv(m) <= 0) hi = m; else lo = m; } irr = (lo + hi) / 2 * 100; }
    var n = npv(v.r / 100);
    return { rows: [['NPV', n, 'money', n >= 0 ? 'Worth doing at this rate' : 'Loses value at this rate'], ['IRR', irr, 'pct'], ['Total of cash flows', cf.reduce(function (a, b) { return a + b; }, 0), 'money']] };
  },
  test: [{ in: { r: 10, f: '-1000\n500\n500\n500' }, expect: { 'NPV': 243.43, 'IRR': 23.375 } }]
});
