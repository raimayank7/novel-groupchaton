/* Infinity by GroupChatOn — probability. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'probability', {
  inputs: [{ k: 'a', label: 'Chance of A', suffix: '(0 to 1, or %)', value: 0.5 }, { k: 'b', label: 'Chance of B', suffix: '(0 to 1, or %)', value: 0.4 }, { k: 'n', label: 'Repeat A this many times', value: 3 }],
  calc: function (v, X) {
    var a = v.a > 1 ? v.a / 100 : v.a, b = v.b > 1 ? v.b / 100 : v.b; X.need(a >= 0 && a <= 1 && b >= 0 && b <= 1, 'Chances must be between 0 and 1 (or 0% and 100%).');
    return { rows: [['A and B both (independent)', a * b, 4], ['A or B (at least one)', a + b - a * b, 4], ['Neither', (1 - a) * (1 - b), 4], ['Exactly one', a + b - 2 * a * b, 4], ['Not A', 1 - a, 4],
      ['A every time in ' + v.n + ' tries', Math.pow(a, v.n), 6], ['A at least once in ' + v.n + ' tries', 1 - Math.pow(1 - a, v.n), 6]] };
  },
  test: [{ in: { a: 0.5, b: 0.4, n: 3 }, expect: { 'A and B both (independent)': 0.2, 'A or B (at least one)': 0.7, 'A at least once in 3 tries': 0.875 } }]
});
