/* Infinity by GroupChatOn — sip. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'sip', {
  inputs: [{ k: 'm', label: 'Monthly investment', money: true, value: 5000 }, { k: 'r', label: 'Expected return', suffix: '% a year', value: 12 }, { k: 'y', label: 'Years', value: 10 }],
  calc: function (v, X) {
    var n = Math.round(v.y * 12), fv = X.fv(v.m, v.r, n, true), put = v.m * n, rows = [];
    for (var y = 1; y <= Math.ceil(v.y); y++) { var k = Math.min(n, y * 12); rows.push([String(y), X.money(v.m * k), X.money(X.fv(v.m, v.r, k, true))]); }
    return { rows: [['Future value', fv, 'money'], ['Total invested', put, 'money'], ['Estimated gains', fv - put, 'money']], bars: [['Invested', put], ['Gains', fv - put]],
      table: { caption: 'Year by year', head: ['Year', 'Invested', 'Value'], rows: rows }, note: 'Returns from mutual funds are not guaranteed; this assumes a steady yearly return, compounded monthly.' };
  },
  test: [{ in: { m: 5000, r: 12, y: 10 }, expect: { 'Future value': 1161695.38, 'Total invested': 600000 } }]
});
