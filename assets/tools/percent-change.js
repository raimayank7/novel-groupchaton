/* Infinity by GroupChatOn — percent-change. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'percent-change', {
  inputs: [{ k: 'a', label: 'Old value', value: 80 }, { k: 'b', label: 'New value', value: 100 }],
  calc: function (v, X) { X.need(v.a !== 0, 'The old value cannot be 0.'); var c = 100 * (v.b - v.a) / Math.abs(v.a);
    return { rows: [[c >= 0 ? 'Increase' : 'Decrease', Math.abs(c), 'pct'], ['Difference', v.b - v.a], ['Percentage difference (vs average)', 100 * Math.abs(v.b - v.a) / ((Math.abs(v.a) + Math.abs(v.b)) / 2), 'pct'], ['New as % of old', 100 * v.b / v.a, 'pct']] }; },
  test: [{ in: { a: 80, b: 100 }, expect: { 'Increase': 25, 'New as % of old': 125 } }, { in: { a: 100, b: 75 }, expect: { 'Decrease': 25 } }]
});
