/* Infinity by GroupChatOn — budget. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'budget', {
  inputs: [{ k: 'i', label: 'Monthly take-home income', money: true, value: 60000 }, { k: 'n', label: 'Needs', suffix: '%', value: 50 }, { k: 'w', label: 'Wants', suffix: '%', value: 30 }, { k: 's', label: 'Savings and debt payoff', suffix: '%', value: 20 }],
  calc: function (v, X) {
    X.need(Math.abs(v.n + v.w + v.s - 100) < 0.01, 'The three shares must add up to 100% (now ' + (v.n + v.w + v.s) + '%).');
    return { rows: [['Needs: rent, food, bills, EMIs', v.i * v.n / 100, 'money'], ['Wants: eating out, shopping, trips', v.i * v.w / 100, 'money'], ['Savings and extra debt payments', v.i * v.s / 100, 'money']],
      bars: [['Needs', v.n], ['Wants', v.w], ['Savings', v.s]], note: 'The 50/30/20 rule is a starting point. In expensive cities needs may take more; try to keep savings at 20% or above.' };
  },
  test: [{ in: { i: 60000, n: 50, w: 30, s: 20 }, expect: { 'Needs: rent, food, bills, EMIs': 30000, 'Savings and extra debt payments': 12000 } }]
});
