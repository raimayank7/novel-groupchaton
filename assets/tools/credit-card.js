/* Infinity by GroupChatOn — credit-card. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'credit-card', {
  inputs: [{ k: 'b', label: 'Card balance', money: true, value: 50000 }, { k: 'apr', label: 'Interest rate (APR)', suffix: '% a year', value: 36 }, { k: 'p', label: 'You pay every month', money: true, value: 3000 }],
  calc: function (v, X) {
    var bal = v.b, i = v.apr / 1200, n = 0, paid = 0;
    X.need(v.p > bal * i, 'This payment does not even cover the monthly interest (' + X.money(bal * i) + '): the balance would never go down.');
    while (bal > 0.005 && n < 1200) { bal *= 1 + i; var pay = Math.min(v.p, bal); bal -= pay; paid += pay; n++; }
    return { rows: [['Debt-free in', X.ym(n)], ['Total interest', paid - v.b, 'money'], ['Total paid', paid, 'money'], ['Interest this month', v.b * i, 'money']], bars: [['Balance', v.b], ['Interest', paid - v.b]],
      note: 'Card interest is among the costliest debt. Paying even a little more each month cuts the interest a lot.' };
  },
  test: [{ in: { b: 50000, apr: 36, p: 3000 }, expect: { 'Debt-free in': '2 years', 'Total interest': 20360.29 } }, { in: { b: 12000, apr: 0, p: 1000 }, expect: { 'Debt-free in': '1 year', 'Total interest': 0 } }]
});
