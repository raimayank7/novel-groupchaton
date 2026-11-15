/* Infinity by GroupChatOn — salary. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'salary', {
  inputs: [{ k: 'a', label: 'Pay', money: true, value: 50000 }, { k: 'p', label: 'per', options: [['h', 'Hour'], ['d', 'Day'], ['w', 'Week'], ['m', 'Month'], ['y', 'Year']], value: 'y' },
    { k: 'hw', label: 'Hours a week', value: 40 }, { k: 'dw', label: 'Days a week', value: 5 }],
  calc: function (v, X) {
    X.pos(v.hw, 'hours a week'); X.pos(v.dw, 'days a week');
    var perYear = { h: 52 * v.hw, d: 52 * v.dw, w: 52, m: 12, y: 1 }, y = v.a * perYear[v.p];
    return { rows: [['Yearly', y, 'money'], ['Monthly', y / 12, 'money'], ['Every two weeks', y / 26, 'money'], ['Weekly', y / 52, 'money'], ['Daily', y / 52 / v.dw, 'money'], ['Hourly', y / 52 / v.hw, 'money']],
      note: 'Before tax, with 52 paid weeks a year.' };
  },
  test: [{ in: { a: 50000, p: 'y', hw: 40, dw: 5 }, expect: { 'Hourly': 24.0385, 'Monthly': 4166.67, 'Weekly': 961.54 } }]
});
