/* Infinity by GroupChatOn — compound-interest. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'compound-interest', {
  inputs: [{ k: 'p', label: 'Starting amount', money: true, value: 100000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 8 }, { k: 't', label: 'Time', suffix: 'years', value: 10 },
    { k: 'n', label: 'Compounded', options: [['1', 'Yearly'], ['2', 'Half-yearly'], ['4', 'Quarterly'], ['12', 'Monthly'], ['365', 'Daily']], value: '1' },
    { k: 'm', label: 'Add every month (optional)', money: true, value: 0 }],
  calc: function (v, X) {
    var n = +v.n, r = v.r / 100, rows = [], bal = v.p, put = v.p, months = Math.round(v.t * 12);
    X.need(months > 0, 'Enter the time in years.');
    for (var mo = 1; mo <= months; mo++) {   // month by month so monthly additions work with any compounding
      bal = bal * Math.pow(1 + r / n, n / 12) + (v.m || 0); put += v.m || 0;
      if (mo % 12 === 0 || mo === months) rows.push([String(Math.ceil(mo / 12)), X.money(put), X.money(bal - put), X.money(bal)]);
    }
    return { rows: [['Final amount', bal, 'money'], ['Total put in', put, 'money'], ['Interest earned', bal - put, 'money']], bars: [['Put in', put], ['Interest', bal - put]],
      table: { caption: 'Year by year', head: ['Year', 'Put in', 'Interest', 'Balance'], rows: rows } };
  },
  test: [{ in: { p: 100000, r: 8, t: 10, n: '1', m: 0 }, expect: { 'Final amount': 215892.50 } }, { in: { p: 1000, r: 12, t: 1, n: '12', m: 0 }, expect: { 'Final amount': 1126.83 } }]
});
