/* Infinity by GroupChatOn — emergency-fund. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'emergency-fund', {
  inputs: [{ k: 'e', label: 'Essential monthly expenses (rent, food, EMIs, bills)', money: true, value: 40000 }, { k: 'm', label: 'Months to cover', options: [['3', '3 months (steady job, two incomes)'], ['6', '6 months (recommended)'], ['9', '9 months'], ['12', '12 months (business owner, one income)']], value: '6' },
    { k: 's', label: 'Saved so far', money: true, value: 50000 }, { k: 'k', label: 'Months to build it', value: 12 }],
  calc: function (v) { var t = v.e * +v.m, gap = Math.max(0, t - (v.s || 0)); return { rows: [['Emergency fund target', t, 'money'], ['Still to save', gap, 'money'], ['Save every month', v.k > 0 ? gap / v.k : NaN, 'money']], bars: [['Saved', Math.min(t, v.s || 0)], ['To go', gap]], note: 'Keep it somewhere safe and quick to reach: a savings account, sweep-in FD or liquid fund.' }; },
  test: [{ in: { e: 40000, m: '6', s: 50000, k: 12 }, expect: { 'Emergency fund target': 240000, 'Still to save': 190000 } }]
});
