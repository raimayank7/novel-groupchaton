/* Infinity by GroupChatOn — break-even. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'break-even', {
  inputs: [{ k: 'f', label: 'Fixed costs (rent, salaries…)', money: true, value: 10000 }, { k: 'p', label: 'Price per unit', money: true, value: 50 }, { k: 'v', label: 'Variable cost per unit', money: true, value: 30 }],
  calc: function (v, X) { X.need(v.p > v.v, 'The price must be more than the cost per unit.'); var u = v.f / (v.p - v.v); return { rows: [['Break-even units', Math.ceil(u), 'int'], ['Break-even sales', u * v.p, 'money'], ['Profit per unit', v.p - v.v, 'money'], ['Contribution margin', 100 * (v.p - v.v) / v.p, 'pct']] }; },
  test: [{ in: { f: 10000, p: 50, v: 30 }, expect: { 'Break-even units': 500, 'Break-even sales': 25000 } }]
});
