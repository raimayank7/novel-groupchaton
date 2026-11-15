/* Infinity by GroupChatOn — po-td. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'po-td', {
  inputs: [{ k: 'p', label: 'Amount', money: true, value: 100000 }, { k: 't', label: 'Period', options: [['1', '1 year (6.9%)'], ['2', '2 years (7.0%)'], ['3', '3 years (7.1%)'], ['5', '5 years (7.5%)']], value: '5' }],
  calc: function (v) {
    var r = { 1: 6.9, 2: 7.0, 3: 7.1, 5: 7.5 }[v.t], yr = v.p * (Math.pow(1 + r / 400, 4) - 1), n = +v.t;
    return { rows: [['Interest every year', yr, 'money'], ['Total interest', yr * n, 'money'], ['Total you receive', v.p + yr * n, 'money'], ['Rate', r, 'pct']],
      note: 'Post Office Time Deposit: interest is worked out quarterly and paid once a year. The 5-year deposit counts under 80C (old regime). Rates for Oct–Dec 2026.' };
  },
  test: [{ in: { p: 100000, t: '5' }, expect: { 'Interest every year': 7713.59, 'Total interest': 38567.93 } }]
});
