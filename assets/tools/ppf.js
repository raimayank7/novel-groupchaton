/* Infinity by GroupChatOn — ppf. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'ppf', {
  inputs: [{ k: 'd', label: 'Yearly deposit (₹500 to ₹1,50,000)', money: true, value: 150000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 7.1, step: 0.05, hint: 'Set by the government every quarter.' }, { k: 'y', label: 'Years', value: 15, min: 15 }],
  calc: function (v, X) {
    X.need(v.d <= 150000, 'The PPF limit is ₹1,50,000 a year.');
    var bal = 0, rows = [];
    for (var y = 1; y <= v.y; y++) { bal = (bal + v.d) * (1 + v.r / 100); rows.push([String(y), X.money(v.d * y), X.money(bal)]); }
    return { rows: [['Maturity value', bal, 'money'], ['Total deposited', v.d * v.y, 'money'], ['Interest (tax-free)', bal - v.d * v.y, 'money']], bars: [['Deposited', v.d * v.y], ['Interest', bal - v.d * v.y]],
      table: { caption: 'Year by year', head: ['Year', 'Deposited', 'Balance'], rows: rows }, note: 'Assumes you deposit before the 5th of April each year. PPF matures after 15 years and can be extended in 5-year blocks.' };
  },
  test: [{ in: { d: 150000, r: 7.1, y: 15 }, expect: { 'Maturity value': 4068209.22 } }]
});
