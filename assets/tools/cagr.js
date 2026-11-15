/* Infinity by GroupChatOn — cagr. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'cagr', {
  inputs: [{ k: 'a', label: 'Starting value', money: true, value: 100000 }, { k: 'b', label: 'Ending value', money: true, value: 200000 }, { k: 'y', label: 'Years', value: 5 }],
  calc: function (v, X) { X.pos(v.a, 'the starting value'); X.pos(v.y, 'the years'); return { rows: [['CAGR', 100 * (Math.pow(v.b / v.a, 1 / v.y) - 1), 'pct'], ['Total growth', 100 * (v.b / v.a - 1), 'pct'], ['Doubles every', Math.log(2) / Math.log(Math.pow(v.b / v.a, 1 / v.y)), 1, 'years']] }; },
  test: [{ in: { a: 100000, b: 200000, y: 5 }, expect: { 'CAGR': 14.8698, 'Doubles every': 5 } }]
});
