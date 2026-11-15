/* Infinity by GroupChatOn — roi. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'roi', {
  inputs: [{ k: 'i', label: 'Amount invested', money: true, value: 1000 }, { k: 'r', label: 'Amount returned', money: true, value: 1500 }, { k: 'y', label: 'Over how many years', value: 3 }],
  calc: function (v, X) { X.pos(v.i, 'the amount invested'); return { rows: [['Return on investment', 100 * (v.r - v.i) / v.i, 'pct'], ['Gain', v.r - v.i, 'money'], ['Yearly return (annualised)', v.y > 0 ? 100 * (Math.pow(v.r / v.i, 1 / v.y) - 1) : NaN, 'pct']] }; },
  test: [{ in: { i: 1000, r: 1500, y: 3 }, expect: { 'Return on investment': 50, 'Yearly return (annualised)': 14.4714 } }]
});
