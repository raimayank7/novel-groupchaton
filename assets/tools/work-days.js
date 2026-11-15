/* Infinity by GroupChatOn — work-days. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'work-days', {
  inputs: [{ k: 'a', label: 'Start date', type: 'date', value: 'today', fresh: true }, { k: 'b', label: 'End date', type: 'date', value: '+30', fresh: true },
    { k: 'we', label: 'Weekend', options: [['06', 'Saturday and Sunday'], ['0', 'Sunday only'], ['56', 'Friday and Saturday (Gulf)'], ['5', 'Friday only']], value: '06' },
    { k: 'hol', label: 'Holidays to skip (one date per line, YYYY-MM-DD)', type: 'textarea', value: '' }],
  calc: function (v, X) {
    var a = X.date(v.a), b = X.date(v.b); X.need(b >= a, 'The end date must be after the start date.');
    var hol = {}; String(v.hol).split(/\s+/).forEach(function (d) { if (/^\d{4}-\d{2}-\d{2}$/.test(d)) hol[d] = 1; });
    var work = 0, we = 0, hd = 0;
    for (var d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) { if (v.we.indexOf(String(d.getDay())) >= 0) we++; else if (hol[X.iso(d)]) hd++; else work++; }
    return { rows: [['Working days', work, 'int', 'start and end dates included'], ['Weekend days', we, 'int'], ['Holidays skipped', hd, 'int'], ['Calendar days', X.days(a, b) + 1, 'int']] };
  },
  test: [{ in: { a: '2026-11-02', b: '2026-11-15', we: '06', hol: '' }, expect: { 'Working days': 10, 'Weekend days': 4 } }, { in: { a: '2026-11-02', b: '2026-11-15', we: '06', hol: '2026-11-04' }, expect: { 'Working days': 9 } }]
});
