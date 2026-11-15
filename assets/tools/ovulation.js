/* Infinity by GroupChatOn — ovulation. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'ovulation', {
  inputs: [{ k: 'lmp', label: 'First day of your last period', type: 'date', value: '-10', fresh: true }, { k: 'c', label: 'Cycle length', suffix: 'days', value: 28 }],
  calc: function (v, X) {
    var l = X.date(v.lmp), c = v.c || 28, rows = [], f = function (d) { return X.fdate(d, { day: 'numeric', month: 'short', year: 'numeric' }); };
    for (var i = 0; i < 6; i++) { var s = X.addDays(l, i * c), o = X.addDays(s, c - 14); rows.push([f(s), f(X.addDays(o, -5)) + ' – ' + f(X.addDays(o, 1)), f(o)]); }
    var o1 = X.addDays(l, c - 14);
    return { rows: [['Ovulation day (about)', X.fdate(o1)], ['Most fertile days', f(X.addDays(o1, -5)) + ' – ' + f(X.addDays(o1, 1))], ['Next period', X.fdate(X.addDays(l, c))]],
      table: { caption: 'Next 6 cycles', head: ['Period starts', 'Fertile window', 'Ovulation'], rows: rows, open: true }, note: 'An estimate from the calendar method. Cycles vary; it is not a method of birth control.' };
  },
  test: [{ in: { lmp: '2026-01-01', c: 28 }, expect: { 'Ovulation day (about)': '15' } }]
});
