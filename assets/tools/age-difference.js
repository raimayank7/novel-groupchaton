/* Infinity by GroupChatOn — age-difference. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'age-difference', {
  inputs: [{ k: 'a', label: 'First person’s date of birth', type: 'date', value: '1990-05-10' }, { k: 'b', label: 'Second person’s date of birth', type: 'date', value: '1995-08-20' }],
  calc: function (v, X) { var a = X.date(v.a), b = X.date(v.b), o = a < b ? [a, b] : [b, a]; var r = X.ymd(o[0], o[1]);
    return { rows: [['Age difference', X.ymdText(r)], ['In days', Math.abs(X.days(a, b)), 'int'], ['In weeks', Math.floor(Math.abs(X.days(a, b)) / 7), 'int'], ['Older', a < b ? 'First person' : a > b ? 'Second person' : 'Same day']] }; },
  test: [{ in: { a: '1990-05-10', b: '1995-08-20' }, expect: { 'Age difference': '5 years 3 months 10 days', 'Older': 'First' } }]
});
