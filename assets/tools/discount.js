/* Infinity by GroupChatOn — discount. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'discount', {
  inputs: [{ k: 'p', label: 'Original price', money: true, value: 2000 }, { k: 'd', label: 'Discount', suffix: '%', value: 20 }, { k: 'e', label: 'Extra discount (optional)', suffix: '%', value: 0 }],
  calc: function (v) { var f = v.p * (1 - v.d / 100) * (1 - (v.e || 0) / 100); return { rows: [['You pay', f, 'money'], ['You save', v.p - f, 'money'], ['Total discount', 100 * (v.p - f) / v.p, 'pct']] }; },
  test: [{ in: { p: 2000, d: 20, e: 10 }, expect: { 'You pay': 1440, 'You save': 560, 'Total discount': 28 } }]
});
