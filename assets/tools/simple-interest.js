/* Infinity by GroupChatOn — simple-interest. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'simple-interest', {
  inputs: [{ k: 'p', label: 'Principal', money: true, value: 10000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 5 }, { k: 't', label: 'Time', suffix: 'years', value: 3 }],
  calc: function (v, X) { var si = v.p * v.r * v.t / 100; return { rows: [['Interest', si, 'money'], ['Total amount', v.p + si, 'money']], bars: [['Principal', v.p], ['Interest', si]] }; },
  test: [{ in: { p: 10000, r: 5, t: 3 }, expect: { 'Interest': 1500, 'Total amount': 11500 } }]
});
