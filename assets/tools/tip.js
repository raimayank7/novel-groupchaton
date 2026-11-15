/* Infinity by GroupChatOn — tip. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'tip', {
  inputs: [{ k: 'b', label: 'Bill amount', money: true, value: 1200 }, { k: 't', label: 'Tip', suffix: '%', value: 10 }, { k: 'n', label: 'People sharing', value: 4, min: 1 }],
  calc: function (v, X) { X.pos(v.n, 'the number of people'); var tip = v.b * v.t / 100; return { rows: [['Each person pays', (v.b + tip) / v.n, 'money'], ['Tip', tip, 'money'], ['Total with tip', v.b + tip, 'money'], ['Tip per person', tip / v.n, 'money']] }; },
  test: [{ in: { b: 1200, t: 10, n: 4 }, expect: { 'Each person pays': 330, 'Tip': 120, 'Total with tip': 1320 } }]
});
