/* Infinity by GroupChatOn — net-worth. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'net-worth', {
  inputs: [{ k: 'h1', type: 'heading', label: 'What you own' }, { k: 'cash', label: 'Cash and bank', money: true, value: 100000 }, { k: 'inv', label: 'Investments (FDs, funds, shares, PF)', money: true, value: 500000 },
    { k: 'prop', label: 'Property', money: true, value: 0 }, { k: 'gold', label: 'Gold and jewellery', money: true, value: 0 }, { k: 'veh', label: 'Vehicles', money: true, value: 0 }, { k: 'oth', label: 'Other things you own', money: true, value: 0 },
    { k: 'h2', type: 'heading', label: 'What you owe' }, { k: 'home', label: 'Home loan', money: true, value: 0 }, { k: 'car', label: 'Car / personal loans', money: true, value: 0 }, { k: 'cc', label: 'Credit cards', money: true, value: 0 }, { k: 'ol', label: 'Other money owed', money: true, value: 0 }],
  calc: function (v) {
    var s = function (k) { return k.reduce(function (a, x) { return a + (v[x] || 0); }, 0); }, own = s(['cash', 'inv', 'prop', 'gold', 'veh', 'oth']), owe = s(['home', 'car', 'cc', 'ol']);
    return { rows: [['Net worth', own - owe, 'money'], ['Total assets', own, 'money'], ['Total debts', owe, 'money'], ['Debt to assets', own ? 100 * owe / own : NaN, 'pct']] };
  },
  test: [{ in: { cash: 100000, inv: 500000, prop: 0, gold: 0, veh: 0, oth: 0, home: 0, car: 150000, cc: 0, ol: 0 }, expect: { 'Net worth': 450000, 'Debt to assets': 25 } }]
});
