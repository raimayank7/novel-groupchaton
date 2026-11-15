/* Infinity by GroupChatOn — square-root. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'square-root', {
  inputs: [{ k: 'x', label: 'Number', value: 2 }, { k: 'n', label: 'nth root (optional)', value: 5 }],
  calc: function (v) {
    var nth = v.x < 0 && v.n % 2 === 1 ? -Math.pow(-v.x, 1 / v.n) : Math.pow(v.x, 1 / v.n);
    return { rows: [['Square root √', Math.sqrt(v.x), 10], ['Cube root ∛', Math.cbrt(v.x), 10], [v.n + 'th root', nth, 10], ['Square x²', v.x * v.x], ['Cube x³', v.x * v.x * v.x]] };
  },
  test: [{ in: { x: 2, n: 5 }, expect: { 'Square root √': 1.4142135624, 'Cube root ∛': 1.2599210499 } }, { in: { x: 144, n: 2 }, expect: { 'Square root √': 12 } }]
});
