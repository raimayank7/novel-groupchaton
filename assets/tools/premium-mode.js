/* Infinity by GroupChatOn — premium-mode. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'premium-mode', {
  inputs: [{ k: 'y', label: 'Yearly premium', money: true, value: 20000 }, { k: 'm', label: 'Monthly premium for the same policy', money: true, value: 1750 }],
  calc: function (v, X) {
    X.pos(v.y, 'the yearly premium'); var extra = v.m * 12 - v.y, lo = 0, hi = 5, f = function (r) { var s = 0; for (var i = 0; i < 12; i++) s += v.m / Math.pow(1 + r, i / 12); return s - v.y; };
    for (var k = 0; k < 200; k++) { var mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
    return { rows: [['Paying monthly costs you', mid * 100, 'pct', 'a year, like a loan rate'], ['Extra paid in a year', extra, 'money'], ['Monthly × 12', v.m * 12, 'money']],
      note: 'Paying yearly is cheaper. If the monthly option costs more than you earn on savings, pay once a year.' };
  },
  test: [{ in: { y: 20000, m: 1750 }, expect: { 'Extra paid in a year': 1000 } }]
});
