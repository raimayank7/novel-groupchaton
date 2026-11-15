/* Infinity by GroupChatOn — dividend. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'dividend', {
  inputs: [{ k: 'p', label: 'Share price', money: true, value: 250 }, { k: 'd', label: 'Dividend per share in a year', money: true, value: 10 }, { k: 'n', label: 'Shares you own', value: 100 }],
  calc: function (v, X) { X.pos(v.p, 'the share price'); return { rows: [['Dividend yield', 100 * v.d / v.p, 'pct'], ['Your yearly dividend', v.d * v.n, 'money'], ['Value of your shares', v.p * v.n, 'money']] }; },
  test: [{ in: { p: 250, d: 10, n: 100 }, expect: { 'Dividend yield': 4, 'Your yearly dividend': 1000 } }]
});
