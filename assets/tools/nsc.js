/* Infinity by GroupChatOn — nsc. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'nsc', {
  inputs: [{ k: 'p', label: 'Amount invested (from ₹1,000)', money: true, value: 100000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 7.7, step: 0.05, hint: 'Oct–Dec 2026 rate, fixed for the whole 5 years once you buy.' }],
  calc: function (v, X) {
    var bal = v.p, rows = [];
    for (var y = 1; y <= 5; y++) { var i = bal * v.r / 100; bal += i; rows.push([String(y), X.money(i), X.money(bal)]); }
    return { rows: [['Maturity value after 5 years', bal, 'money'], ['Interest earned', bal - v.p, 'money']], bars: [['Invested', v.p], ['Interest', bal - v.p]],
      table: { caption: 'Interest each year (added back to the certificate)', head: ['Year', 'Interest', 'Value'], rows: rows, open: true },
      note: 'Interest is compounded yearly and paid at maturity. The investment counts under Section 80C (old regime), and the yearly interest of the first four years is treated as reinvested.' };
  },
  test: [{ in: { p: 100000, r: 7.7 }, expect: { 'Maturity value after 5 years': 144903.38 } }]
});
