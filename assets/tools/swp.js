/* Infinity by GroupChatOn — swp. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'swp', {
  inputs: [{ k: 'c', label: 'Starting amount', money: true, value: 1000000 }, { k: 'w', label: 'Withdraw every month', money: true, value: 10000 }, { k: 'r', label: 'Expected return', suffix: '% a year', value: 8 }, { k: 'y', label: 'For how many years', value: 10 }],
  calc: function (v, X) {
    var i = v.r / 1200, bal = v.c, n = Math.round(v.y * 12), out = 0, k, lasts = null;
    for (k = 1; k <= n; k++) { if (bal < v.w) { out += bal; bal = 0; lasts = k; break; } bal -= v.w; out += v.w; bal *= 1 + i; }
    var b2 = v.c, m2 = 0; while (b2 >= v.w && m2 < 1200) { b2 = (b2 - v.w) * (1 + i); m2++; }
    return { rows: [['Balance left after ' + v.y + ' years', bal, 'money'], ['Total withdrawn', out, 'money'], ['Money lasts', m2 >= 1200 ? 'for ever (returns cover it)' : X.ym(m2)]],
      note: lasts ? 'The money runs out in month ' + lasts + '.' : '' };
  },
  test: [{ in: { c: 1000000, w: 10000, r: 0, y: 5 }, expect: { 'Balance left after 5 years': 400000, 'Money lasts': '8 years 4 months' } }]
});
