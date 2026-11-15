/* Infinity by GroupChatOn — age. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'age', {
  inputs: [{ k: 'dob', label: 'Date of birth', type: 'date', value: '2000-01-15' }, { k: 'at', label: 'Age on this date', type: 'date', value: 'today', fresh: true }],
  calc: function (v, X) {
    var a = X.date(v.dob), b = X.date(v.at);
    X.need(b >= a, 'The second date must be after the date of birth.');
    var r = X.ymd(a, b), days = X.days(a, b);
    var next = new Date(b.getFullYear(), a.getMonth(), a.getDate()); if (next <= b) next.setFullYear(b.getFullYear() + 1);
    return { rows: [['Age', X.ymdText(r)], ['Total months', r[0] * 12 + r[1], 'int'], ['Total weeks', Math.floor(days / 7), 'int'], ['Total days', days, 'int'],
      ['Days to next birthday', X.days(b, next), 'int'], ['Born on a', a.toLocaleDateString('en', { weekday: 'long' })]] };
  },
  test: [{ in: { dob: '2000-01-15', at: '2026-11-01' }, expect: { 'Age': '26 years 9 months 17 days', 'Total days': 9787, 'Born on a': 'Saturday' } }]
});
