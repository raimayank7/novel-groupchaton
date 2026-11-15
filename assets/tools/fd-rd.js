/* Infinity by GroupChatOn — fd-rd. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'fd-rd', {
  inputs: [{ k: 'kind', label: 'Deposit type', options: [['fd', 'Fixed deposit (FD): one amount'], ['rd', 'Recurring deposit (RD): every month']], value: 'fd' },
    { k: 'p', label: 'Amount deposited', money: true, value: 100000, show: function (v) { return v.kind === 'fd'; } },
    { k: 'm', label: 'Deposit every month', money: true, value: 5000, show: function (v) { return v.kind === 'rd'; } },
    { k: 'r', label: 'Interest rate', suffix: '% a year', value: 7, step: 0.05 }, { k: 'y', label: 'Years', value: 5, min: 0 }, { k: 'mo', label: 'Plus months', value: 0, min: 0, max: 11 },
    { k: 'c', label: 'Interest added', options: [['4', 'Every quarter (most banks)'], ['12', 'Every month'], ['2', 'Every half year'], ['1', 'Every year'], ['0', 'Paid out, not added (simple interest)']], value: '4' }],
  calc: function (v, X) {
    X.need(v.r >= 0 && v.r < 50, 'Enter an interest rate between 0 and 50%.');
    var months = Math.round((v.y || 0) * 12 + (v.mo || 0)), c = +v.c, i = v.r / 100, rows = [];
    X.need(months >= 1 && months <= 1200, 'Choose a period of at least 1 month.');
    function fdAt(p, k) { return c ? p * Math.pow(1 + i / c, c * k / 12) : p * (1 + i * k / 12); }
    var put, mat;
    if (v.kind === 'fd') {
      X.pos(v.p, 'the amount');
      put = v.p; mat = fdAt(v.p, months);
      for (var y = 1; y <= Math.ceil(months / 12); y++) { var k = Math.min(months, y * 12); rows.push([X.ym(k), X.money(fdAt(v.p, k)), X.money(fdAt(v.p, k) - v.p)]); }
    } else {
      X.pos(v.m, 'the monthly deposit');
      var rd = function (n) { var s = 0; for (var j = 1; j <= n; j++) s += fdAt(v.m, j); return s; };   // the deposit made j months before maturity grows for j months
      put = v.m * months;
      mat = 0; for (var j = 1; j <= months; j++) mat += c ? v.m * Math.pow(1 + i / c, c * j / 12) : v.m * (1 + i * j / 12);
      for (var y2 = 1; y2 <= Math.ceil(months / 12); y2++) { var k2 = Math.min(months, y2 * 12), d2 = v.m * k2, val = rd(k2); rows.push([X.ym(k2), X.money(d2), X.money(val)]); }
    }
    var eff = put > 0 && v.kind === 'fd' ? (Math.pow(mat / put, 12 / months) - 1) * 100 : null;
    return { rows: [['Maturity value', mat, 'money'], ['Total deposited', put, 'money'], ['Interest earned', mat - put, 'money'], eff !== null ? ['Effective yearly yield', eff, 'pct'] : ['Period', X.ym(months), 'text']],
      bars: [['Deposited', put], ['Interest', mat - put]],
      table: { caption: 'Year by year', head: v.kind === 'fd' ? ['After', 'Value', 'Interest so far'] : ['After', 'Deposited', 'Value'], rows: rows },
      note: 'Banks in India usually add FD and RD interest every quarter. Interest is taxable; in India banks deduct TDS when your interest in a year crosses the limit set in the Budget (higher for senior citizens), unless you submit Form 15G / 15H if eligible. Deposits are insured by DICGC up to ₹5 lakh per bank per person.' };
  },
  test: [{ in: { kind: 'fd', p: 100000, r: 7, y: 5, mo: 0, c: '4' }, expect: { 'Maturity value': 141477.82, 'Interest earned': 41477.82 } },
    { in: { kind: 'rd', m: 1000, r: 7.5, y: 1, mo: 0, c: '4' }, expect: { 'Maturity value': 12495.69, 'Total deposited': 12000 } },
    { in: { kind: 'rd', m: 5000, r: 7, y: 5, mo: 0, c: '4' }, expect: { 'Maturity value': 359663.95 } },
    { in: { kind: 'fd', p: 250000, r: 6.5, y: 2, mo: 6, c: '0' }, expect: { 'Interest earned': 40625 } },
    { in: { kind: 'fd', p: 250000, r: 6.5, y: 2, mo: 6, c: '12' }, expect: { 'Maturity value': 293983.13 } }]
});
