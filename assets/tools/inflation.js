/* Infinity by GroupChatOn — inflation. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'inflation', {
  inputs: [{ k: 'a', label: 'Amount today', money: true, value: 100000 }, { k: 'r', label: 'Inflation', suffix: '% a year', value: 6 }, { k: 'y', label: 'Years', value: 10 }],
  calc: function (v) { var f = Math.pow(1 + v.r / 100, v.y); return { rows: [['Will cost in ' + v.y + ' years', v.a * f, 'money'], ['Today’s money will be worth', v.a / f, 'money', 'in today’s prices'], ['Prices rise by', (f - 1) * 100, 'pct']] }; },
  test: [{ in: { a: 100000, r: 6, y: 10 }, expect: { 'Will cost in 10 years': 179084.77, 'Today’s money will be worth': 55839.48 } }]
});
