/* Infinity by GroupChatOn — hra. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'hra', {
  inputs: [{ k: 'b', label: 'Basic salary + DA a month', money: true, value: 50000 }, { k: 'h', label: 'HRA received a month', money: true, value: 20000 }, { k: 'r', label: 'Rent paid a month', money: true, value: 18000 },
    { k: 'metro', label: 'I live in Delhi, Mumbai, Kolkata or Chennai', type: 'check', value: true }],
  calc: function (v) {
    var a = v.h, b = v.r - 0.1 * v.b, c = (v.metro ? 0.5 : 0.4) * v.b, ex = Math.max(0, Math.min(a, b, c));
    return { rows: [['HRA exempt a year', ex * 12, 'money'], ['HRA taxable a year', (v.h - ex) * 12, 'money'], ['Exempt a month', ex, 'money']],
      table: { caption: 'How it is worked out (the lowest of three, per month)', head: ['Rule', 'Amount'], open: true, rows: [['Actual HRA received', T().money(a)], ['Rent paid − 10% of basic', T().money(Math.max(0, b))], [(v.metro ? '50%' : '40%') + ' of basic', T().money(c)]] },
      note: 'HRA exemption is only in the old tax regime. Under the new regime HRA is fully taxable.' };
    function T() { return window.GCOTools; }
  },
  test: [{ in: { b: 50000, h: 20000, r: 18000, metro: true }, expect: { 'HRA exempt a year': 156000, 'HRA taxable a year': 84000 } }]
});
