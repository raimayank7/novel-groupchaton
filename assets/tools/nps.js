/* Infinity by GroupChatOn — nps. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'nps', {
  inputs: [{ k: 'age', label: 'Your age now', value: 30 }, { k: 'm', label: 'Monthly contribution', money: true, value: 5000 }, { k: 'r', label: 'Expected return', suffix: '% a year', value: 10 },
    { k: 'a', label: 'Share used to buy a pension (annuity)', suffix: '% (minimum 40)', value: 40 }, { k: 'ar', label: 'Annuity rate', suffix: '% a year', value: 6 }],
  calc: function (v, X) {
    var n = (60 - v.age) * 12; X.need(n > 0, 'NPS contributions run until 60.'); X.need(v.a >= 40 && v.a <= 100, 'At least 40% must buy an annuity.');
    var corpus = X.fv(v.m, v.r, n, false), ann = corpus * v.a / 100;
    return { rows: [['Monthly pension', ann * v.ar / 1200, 'money'], ['Total at 60', corpus, 'money'], ['Lump sum you can take (tax-free)', corpus - ann, 'money'], ['Total contributed', v.m * n, 'money']],
      bars: [['Contributed', v.m * n], ['Growth', corpus - v.m * n]], note: 'NPS returns depend on markets. Up to 60% can be taken tax-free at 60; the rest buys a pension (annuity), which is taxable.' };
  },
  test: [{ in: { age: 30, m: 5000, r: 10, a: 40, ar: 6 }, expect: { 'Total at 60': 11302439.62 } }]
});
