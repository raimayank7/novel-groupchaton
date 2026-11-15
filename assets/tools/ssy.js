/* Infinity by GroupChatOn — ssy. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Small savings rates: Oct–Dec 2026 (Ministry of Finance notification, 30 Sep 2026). Update every quarter. */
GCOTools.engine('calc', 'ssy', {
  inputs: [{ k: 'd', label: 'Yearly deposit (₹250 to ₹1,50,000)', money: true, value: 150000 }, { k: 'age', label: 'Girl’s age when the account is opened', suffix: 'years (below 10)', value: 3 },
    { k: 'y0', label: 'Year the account is opened', value: new Date().getFullYear() }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 8.2, step: 0.05, hint: 'Oct–Dec 2026 rate. Revised every quarter.' }],
  calc: function (v, X) {
    X.need(v.d >= 250 && v.d <= 150000, 'Deposit between ₹250 and ₹1,50,000 a year.'); X.need(v.age >= 0 && v.age < 10, 'The account can be opened only before the girl turns 10.');
    var bal = 0, rows = [];
    for (var y = 1; y <= 21; y++) { bal = (bal + (y <= 15 ? v.d : 0)) * (1 + v.r / 100); rows.push([String(v.y0 + y - 1), y <= 15 ? X.money(v.d) : '—', X.money(bal)]); }
    return { rows: [['Maturity value', bal, 'money', 'in ' + (v.y0 + 21) + ', when she is ' + (v.age + 21)], ['Total deposited (15 years)', v.d * 15, 'money'], ['Interest earned (tax-free)', bal - v.d * 15, 'money']],
      bars: [['Deposited', v.d * 15], ['Interest', bal - v.d * 15]], table: { caption: 'Year by year', head: ['Year', 'Deposit', 'Balance at year end'], rows: rows },
      note: 'Deposits are made for 15 years; the account matures 21 years after opening. Up to 50% can be withdrawn for higher education after she turns 18. Assumes the deposit is made by 5 April each year and today’s rate stays the same.' };
  },
  test: [{ in: { d: 150000, age: 3, y0: 2026, r: 8.2 }, expect: { 'Maturity value': 7182119.17, 'Total deposited (15 years)': 2250000 } }]
});
