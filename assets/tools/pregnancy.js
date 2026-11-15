/* Infinity by GroupChatOn — pregnancy. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'pregnancy', {
  inputs: [{ k: 'lmp', label: 'First day of your last period', type: 'date', value: '-60', fresh: true }, { k: 'c', label: 'Usual cycle length', suffix: 'days', value: 28 }],
  calc: function (v, X) {
    var l = X.date(v.lmp), due = X.addDays(l, 280 + ((v.c || 28) - 28)), now = new Date(), d = X.days(l, now);
    var wk = Math.floor(d / 7), tri = wk < 13 ? 'First trimester' : wk < 27 ? 'Second trimester' : 'Third trimester';
    return { rows: [['Estimated due date', X.fdate(due)], ['Today you are', d >= 0 && d < 300 ? wk + ' weeks ' + d % 7 + ' days' : '—', null, d >= 0 && d < 300 ? tri : ''],
      ['Conception was around', X.fdate(X.addDays(l, (v.c || 28) - 14))], ['Days to go', Math.max(0, X.days(now, due)), 'int']],
      note: 'Only about 1 in 20 babies arrive on the due date; most come within two weeks of it. Your doctor or midwife may adjust it after a scan.' };
  },
  test: [{ in: { lmp: '2026-01-01', c: 28 }, expect: { 'Estimated due date': '8' } }]
});
