/* Infinity by GroupChatOn — home-loan. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'home-loan', {
  inputs: [{ k: 'p', label: 'Loan amount', money: true, value: 5000000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 8.5, step: 0.05 },
    { k: 'y', label: 'Tenure', suffix: 'years', value: 20 }, { k: 'x', label: 'Extra payment every month (prepayment)', money: true, value: 5000 },
    { k: 'ly', label: 'Lump-sum prepayment (optional)', money: true, value: 0 }, { k: 'lm', label: 'Lump sum paid after', suffix: 'months', value: 12 }],
  calc: function (v, X) {
    var m = Math.round(v.y * 12), e = X.emi(v.p, v.r, m), bal = v.p, n = 0, paidInt = 0;
    while (bal > 0.005 && n < 1200) { n++; var int = bal * v.r / 1200; paidInt += int; bal = bal + int - e - (v.x || 0); if (n === Math.round(v.lm) && v.ly) bal -= v.ly; }
    var base = e * m - v.p;
    return { rows: [['Monthly EMI', e, 'money'], ['Loan closes in', X.ym(n), null, 'instead of ' + X.ym(m)], ['Interest saved', base - paidInt, 'money'], ['Total interest with prepayment', paidInt, 'money'], ['Total interest without', base, 'money']],
      bars: [['Interest paid', paidInt], ['Interest saved', base - paidInt]] };
  },
  test: [{ in: { p: 5000000, r: 8.5, y: 20, x: 0, ly: 0 }, expect: { 'Monthly EMI': 43391.16, 'Interest saved': 0 } }, { in: { p: 1200000, r: 12, y: 1, x: 0, ly: 0 }, expect: { 'Loan closes in': '1 year' } }]
});
