/* Infinity by GroupChatOn — rd. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'rd', {
  inputs: [{ k: 'a', label: 'Monthly deposit', money: true, value: 5000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 7, step: 0.05 },
    { k: 'n', label: 'Period', suffix: 'months', value: 12 }, { k: 'start', label: 'Start date', type: 'date', value: 'today', fresh: true }],
  calc: function (v, X) {
    X.pos(v.a, 'the monthly deposit'); var n = Math.round(v.n); X.need(n >= 6, 'Most banks need at least 6 months.');
    var mat = 0, rows = [];   // each instalment earns quarterly-compounded interest for the months it stays in
    for (var i = 1; i <= n; i++) { mat += v.a * Math.pow(1 + v.r / 400, (n - i + 1) / 3); if (i % 12 === 0 || i === n) rows.push([String(i), X.money(v.a * i)]); }
    var end = X.date(v.start); end.setMonth(end.getMonth() + n);
    return { rows: [['Maturity amount', mat, 'money'], ['Total deposited', v.a * n, 'money'], ['Interest earned', mat - v.a * n, 'money'], ['Maturity date', X.fdate(end)]],
      bars: [['Deposited', v.a * n], ['Interest', mat - v.a * n]], note: 'The method Indian banks use for recurring deposits: quarterly compounding on each monthly instalment. RD interest is taxable and TDS rules are the same as for FDs.' };
  },
  test: [{ in: { a: 5000, r: 7, n: 12, start: '2026-01-01' }, expect: { 'Maturity amount': 62310.66, 'Total deposited': 60000 } }]
});
