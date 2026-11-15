/* Infinity by GroupChatOn — lumpsum. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'lumpsum', {
  inputs: [{ k: 'p', label: 'Amount invested once', money: true, value: 100000 }, { k: 'r', label: 'Expected return', suffix: '% a year', value: 12 }, { k: 'y', label: 'Years', value: 10 }],
  calc: function (v) { var fv = v.p * Math.pow(1 + v.r / 100, v.y); return { rows: [['Future value', fv, 'money'], ['Gains', fv - v.p, 'money'], ['Money multiplies by', fv / v.p, 2, 'times']], bars: [['Invested', v.p], ['Gains', fv - v.p]] }; },
  test: [{ in: { p: 100000, r: 12, y: 10 }, expect: { 'Future value': 310584.82 } }]
});
