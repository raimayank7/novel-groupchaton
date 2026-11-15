/* Infinity by GroupChatOn — date-diff. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'date-diff', {
  inputs: [{ k: 'a', label: 'Start date', type: 'date', value: 'today', fresh: true }, { k: 'b', label: 'End date', type: 'date', value: '+30', fresh: true },
    { k: 'inc', label: 'Count the end date too', type: 'check', value: false }, { k: 'h', type: 'heading', label: 'Add or subtract days' },
    { k: 'n', label: 'Days to add to the start date (use − to go back)', value: 100 }],
  calc: function (v, X) {
    var a = X.date(v.a), b = X.date(v.b), d = X.days(a, b) + (v.inc ? (b >= a ? 1 : -1) : 0), r = X.ymd(a < b ? a : b, a < b ? b : a);
    var add = X.addDays(a, v.n || 0);
    return { rows: [['Days between', d, 'int'], ['Weeks and days', Math.floor(Math.abs(d) / 7) + ' weeks ' + Math.abs(d) % 7 + ' days'], ['Years, months, days', X.ymdText(r)],
      ['Hours', d * 24, 'int'], ['Start + ' + (v.n || 0) + ' days', X.fdate(add)]] };
  },
  test: [{ in: { a: '2026-01-01', b: '2026-12-31', inc: false, n: 100 }, expect: { 'Days between': 364, 'Start + 100 days': '2026' } },
         { in: { a: '2026-01-01', b: '2026-12-31', inc: true }, expect: { 'Days between': 365 } }]
});
