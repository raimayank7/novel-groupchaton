/* Infinity by GroupChatOn — health-cover. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'health-cover', {
  inputs: [{ k: 'city', label: 'Where you live', options: [['1', 'Metro city (Delhi, Mumbai, Bengaluru…)'], ['0.75', 'Big city (tier 2)'], ['0.55', 'Small town (tier 3)']], value: '1', wide: true },
    { k: 'ad', label: 'Adults covered', value: 2 }, { k: 'ch', label: 'Children covered', value: 1 }, { k: 'old', label: 'Oldest person’s age', value: 38 },
    { k: 'ill', label: 'Someone has diabetes, BP or a heart condition', type: 'check', value: false }, { k: 'have', label: 'Cover you already have (e.g. from work)', money: true, value: 300000 }],
  calc: function (v, X) {
    var base = 500000 * +v.city * (1 + 0.5 * Math.max(0, v.ad - 1) + 0.25 * (v.ch || 0)) * (v.old >= 60 ? 2 : v.old >= 45 ? 1.5 : 1) * (v.ill ? 1.5 : 1);
    var need = Math.ceil(base / 500000) * 500000, gap = Math.max(0, need - (v.have || 0));
    return { rows: [['Health cover we suggest', need, 'money', 'for the family'], ['Extra to buy', gap, 'money', 'a family floater or super top-up'], ['A big surgery in a metro hospital can cost', 500000 * +v.city * 1.6, 'money']],
      note: 'A rule of thumb based on hospital costs where you live, family size and age. Employer cover ends when you change or lose your job, so it is wise to have your own policy too. A super top-up is a cheap way to raise cover.' };
  },
  test: [{ in: { city: '1', ad: 2, ch: 1, old: 38, ill: false, have: 300000 }, expect: { 'Health cover we suggest': 1000000, 'Extra to buy': 700000 } }]
});
