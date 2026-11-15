/* Infinity by GroupChatOn — emi. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'emi', {
  inputs: [{ k: 'p', label: 'Loan amount', money: true, value: 500000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 9, step: 0.05 },
    { k: 'n', label: 'Tenure', value: 5 }, { k: 'u', label: 'Tenure in', options: [['y', 'Years'], ['m', 'Months']], value: 'y' }],
  calc: function (v, X) {
    X.pos(v.p, 'the loan amount'); var m = Math.round(v.u === 'y' ? v.n * 12 : v.n); X.need(m > 0, 'Enter the tenure.');
    var e = X.emi(v.p, v.r, m), bal = v.p, rows = [], yi = 0, yp = 0;
    for (var i = 1; i <= m; i++) { var int = bal * v.r / 1200, pr = e - int; bal -= pr; yi += int; yp += pr;
      if (i % 12 === 0 || i === m) { rows.push([String(Math.ceil(i / 12)), X.money(yp), X.money(yi), X.money(Math.max(0, bal))]); yi = yp = 0; } }
    return { rows: [['Monthly EMI', e, 'money'], ['Total interest', e * m - v.p, 'money'], ['Total payment', e * m, 'money']], bars: [['Principal', v.p], ['Interest', e * m - v.p]],
      table: { caption: 'Year-by-year repayment', head: ['Year', 'Principal paid', 'Interest paid', 'Balance'], rows: rows } };
  },
  test: [{ in: { p: 500000, r: 9, n: 5, u: 'y' }, expect: { 'Monthly EMI': 10379.18, 'Total interest': 122750.66 } }, { in: { p: 120000, r: 0, n: 12, u: 'm' }, expect: { 'Monthly EMI': 10000 } }]
});
