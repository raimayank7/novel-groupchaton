/* Infinity by GroupChatOn — profit-margin. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'profit-margin', {
  inputs: [{ k: 'm', label: 'I know', options: [['cp', 'Cost and selling price'], ['cm', 'Cost and the margin I want'], ['ck', 'Cost and the markup I want']], value: 'cp', wide: true },
    { k: 'c', label: 'Cost', money: true, value: 80 }, { k: 's', label: 'Selling price', money: true, value: 100, show: function (v) { return v.m === 'cp'; } },
    { k: 'g', label: 'Margin or markup', suffix: '%', value: 20, show: function (v) { return v.m !== 'cp'; } }],
  calc: function (v, X) {
    var s = v.m === 'cp' ? v.s : v.m === 'cm' ? v.c / (1 - v.g / 100) : v.c * (1 + v.g / 100);
    X.need(s > 0, 'Enter a selling price.');
    return { rows: [['Profit', s - v.c, 'money'], ['Selling price', s, 'money'], ['Margin (profit ÷ price)', 100 * (s - v.c) / s, 'pct'], ['Markup (profit ÷ cost)', v.c ? 100 * (s - v.c) / v.c : NaN, 'pct']] };
  },
  test: [{ in: { m: 'cp', c: 80, s: 100 }, expect: { 'Profit': 20, 'Margin (profit ÷ price)': 20, 'Markup (profit ÷ cost)': 25 } }, { in: { m: 'cm', c: 80, g: 20 }, expect: { 'Selling price': 100 } }]
});
