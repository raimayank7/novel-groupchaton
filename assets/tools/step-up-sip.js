/* Infinity by GroupChatOn — step-up-sip. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'step-up-sip', {
  inputs: [{ k: 'm', label: 'Starting monthly investment', money: true, value: 5000 }, { k: 's', label: 'Increase every year', suffix: '%', value: 10 }, { k: 'r', label: 'Expected return', suffix: '% a year', value: 12 }, { k: 'y', label: 'Years', value: 10 }],
  calc: function (v, X) {
    var i = v.r / 1200, bal = 0, put = 0, amt = v.m, n = Math.round(v.y * 12);
    for (var k = 1; k <= n; k++) { bal = (bal + amt) * (1 + i); put += amt; if (k % 12 === 0) amt *= 1 + v.s / 100; }
    var flat = X.fv(v.m, v.r, n, true);
    return { rows: [['Future value', bal, 'money'], ['Total invested', put, 'money'], ['Estimated gains', bal - put, 'money'], ['Without step-up you would have', flat, 'money']], bars: [['Invested', put], ['Gains', bal - put]] };
  },
  test: [{ in: { m: 5000, s: 0, r: 12, y: 10 }, expect: { 'Future value': 1161695.38 } }, { in: { m: 5000, s: 10, r: 12, y: 10 }, expect: { 'Total invested': 956245.48 } }]
});
