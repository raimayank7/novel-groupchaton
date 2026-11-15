/* Infinity by GroupChatOn — period. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'period', {
  inputs: [{ k: 'l', label: 'First day of your last period', type: 'date', value: '-20', fresh: true }, { k: 'c', label: 'Cycle length', suffix: 'days', value: 28 }, { k: 'p', label: 'Period lasts', suffix: 'days', value: 5 }],
  calc: function (v, X) {
    var l = X.date(v.l), c = v.c || 28, rows = [], f = function (d) { return X.fdate(d, { weekday: 'short', day: 'numeric', month: 'short' }); };
    for (var i = 1; i <= 6; i++) { var s = X.addDays(l, i * c); rows.push([f(s) + ' – ' + f(X.addDays(s, (v.p || 5) - 1)), f(X.addDays(s, -14))]); }
    var next = X.addDays(l, c), now = new Date(), left = X.days(now, next);
    return { rows: [['Next period starts', X.fdate(next)], ['Days left', Math.max(0, left), 'int'], ['Likely ovulation', X.fdate(X.addDays(next, -14))]], table: { caption: 'Next 6 periods', head: ['Period', 'Ovulation (about)'], rows: rows, open: true },
      note: 'Dates are estimates from your average cycle. See a doctor if your cycle is very irregular, shorter than 21 days or longer than 35.' };
  },
  test: [{ in: { l: '2026-01-01', c: 28, p: 5 }, expect: { 'Next period starts': '29' } }]
});
