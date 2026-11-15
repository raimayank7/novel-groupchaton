/* Infinity by GroupChatOn — fd. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'fd', {
  inputs: [{ k: 'p', label: 'Deposit amount', money: true, value: 100000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 7, step: 0.05 },
    { k: 'sr', label: 'Senior citizen (most banks add 0.25%–0.50%)', type: 'check', value: false }, { k: 'x', label: 'Extra rate for seniors', suffix: '%', value: 0.5, show: function (v) { return v.sr; } },
    { k: 'y', label: 'Years', value: 5 }, { k: 'm', label: 'Months', value: 0 }, { k: 'd', label: 'Days', value: 0 },
    { k: 'po', label: 'Interest payout', options: [['cum', 'At maturity (cumulative, compounded quarterly)'], ['q', 'Every quarter'], ['mo', 'Every month']], value: 'cum', wide: true },
    { k: 'start', label: 'Start date', type: 'date', value: 'today', fresh: true }],
  calc: function (v, X) {
    X.pos(v.p, 'the deposit'); var r = (v.r + (v.sr ? v.x || 0 : 0)) / 100, months = Math.round((v.y || 0) * 12 + (v.m || 0)), s = X.date(v.start);
    var end = new Date(s); end.setMonth(end.getMonth() + months); end.setDate(end.getDate() + Math.round(v.d || 0));
    var days = X.days(s, end); X.need(days >= 7, 'An FD must be for at least 7 days.');
    var q = Math.floor(months / 3), afterQ = new Date(s); afterQ.setMonth(afterQ.getMonth() + q * 3);
    var left = X.days(afterQ, end), rows;
    if (v.po === 'cum') {
      var mat = days < 182 ? v.p * (1 + r * days / 365) : v.p * Math.pow(1 + r / 4, q) * (1 + r * left / 365);   // banks: simple interest below 6 months, quarterly compounding above
      rows = [['Maturity amount', mat, 'money'], ['Interest earned', mat - v.p, 'money'], ['Effective yearly yield', (Math.pow(1 + r / 4, 4) - 1) * 100, 'pct']];
    } else {
      var per = v.po === 'q' ? v.p * r / 4 : v.p * r / 12, total = v.p * r * days / 365;
      rows = [[v.po === 'q' ? 'Interest every quarter' : 'Interest every month', per, 'money'], ['Total interest', total, 'money'], ['Deposit back at maturity', v.p, 'money']];
    }
    rows.push(['Rate applied', r * 100, 'pct'], ['Maturity date', X.fdate(end)], ['Tenure', days + ' days']);
    return { rows: rows, note: (v.po === 'mo' ? 'Many banks pay monthly interest at a slightly discounted rate, so the bank’s figure can be a little lower. ' : '') +
      'FD interest is taxable. In India banks deduct TDS when interest in a year crosses ₹50,000 (₹1,00,000 for senior citizens); submit Form 15G/15H if your income is below the taxable limit.' };
  },
  test: [{ in: { p: 100000, r: 7, sr: false, y: 5, m: 0, d: 0, po: 'cum', start: '2026-01-01' }, expect: { 'Maturity amount': 141477.82 } },
         { in: { p: 100000, r: 7, sr: false, y: 1, m: 0, d: 15, po: 'cum', start: '2026-01-01' }, expect: { 'Maturity amount': 107494.25 } },
         { in: { p: 100000, r: 7, sr: true, x: 0.5, y: 1, m: 0, d: 0, po: 'q', start: '2026-01-01' }, expect: { 'Interest every quarter': 1875 } }]
});
