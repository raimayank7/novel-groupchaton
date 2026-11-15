/* Infinity by GroupChatOn — life-cover. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'life-cover', {
  inputs: [{ k: 'inc', label: 'Your yearly income', money: true, value: 1200000 }, { k: 'age', label: 'Your age', value: 32 }, { k: 'ret', label: 'Retirement age', value: 60 },
    { k: 'exp', label: 'Family’s yearly expenses without you', money: true, value: 600000 }, { k: 'loans', label: 'Loans outstanding', money: true, value: 2500000 },
    { k: 'goals', label: 'Future goals (children’s education, marriage)', money: true, value: 3000000 }, { k: 'have', label: 'Savings and existing life cover', money: true, value: 1000000 },
    { k: 'inf', label: 'Inflation', suffix: '% a year', value: 6 }, { k: 'ret2', label: 'Return on the money', suffix: '% a year', value: 7 }],
  calc: function (v, X) {
    var yrs = v.ret - v.age; X.need(yrs > 0, 'Check your age and retirement age.');
    var rr = (1 + v.ret2 / 100) / (1 + v.inf / 100) - 1, pv = rr ? v.exp * (1 - Math.pow(1 + rr, -yrs)) / rr * (1 + rr) : v.exp * yrs;
    var need = Math.max(0, pv + v.loans + v.goals - v.have);
    return { rows: [['Life cover you need', Math.ceil(need / 500000) * 500000, 'money', 'rounded up to the next ₹5 lakh step'], ['Family expenses until your retirement (today’s value)', pv, 'money'],
      ['Quick rule: 10–15 × income', 10 * v.inc + '–' + 15 * v.inc, function (s) { var p = String(s).split('–'); return T().money(+p[0]) + ' – ' + T().money(+p[1]); }], ['Years to cover', yrs, 'int']],
      note: 'Needs method: the money your family would need to replace your support, clear loans and meet goals, minus what you already have. A pure term plan is the cheapest way to buy this cover.' };
    function T() { return window.GCOTools; }
  },
  test: [{ in: { inc: 1200000, age: 32, ret: 60, exp: 600000, loans: 2500000, goals: 3000000, have: 1000000, inf: 6, ret2: 7 }, expect: { 'Family expenses until your retirement (today’s value)': 14842462.94, 'Life cover you need': 19500000 } }]
});
