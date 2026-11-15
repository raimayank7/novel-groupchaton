/* Infinity by GroupChatOn — tds. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'tds', {
  inputs: [{ k: 'a', label: 'Payment amount', money: true, value: 100000 },
    { k: 's', label: 'Type of payment (section)', wide: true, options: [['194J-p', '194J: professional fees (10%)'], ['194J-t', '194J: technical services, royalty for films (2%)'], ['194C-i', '194C: contractor, individual / HUF (1%)'], ['194C-o', '194C: contractor, company / firm (2%)'],
      ['194H', '194H: commission or brokerage (2%)'], ['194I-b', '194I: rent of land, building, furniture (10%)'], ['194I-m', '194I: rent of plant and machinery (2%)'], ['194A', '194A: interest other than on securities (10%)'], ['194', '194: dividend (10%)'], ['194Q', '194Q: purchase of goods (0.1%)']], value: '194J-p' },
    { k: 'pan', label: 'The payee has given their PAN', type: 'check', value: true }],
  calc: function (v) {
    var R = { '194J-p': [10, 50000, 'a year'], '194J-t': [2, 50000, 'a year'], '194C-i': [1, 30000, 'per payment, or ₹1,00,000 a year'], '194C-o': [2, 30000, 'per payment, or ₹1,00,000 a year'], '194H': [2, 20000, 'a year'],
      '194I-b': [10, 50000, 'a month'], '194I-m': [2, 50000, 'a month'], '194A': [10, 10000, 'a year (₹50,000 for bank deposits; ₹1,00,000 for senior citizens)'], '194': [10, 10000, 'a year'], '194Q': [0.1, 5000000, 'a year (on the amount above it)'] }[v.s];
    var rate = v.pan ? R[0] : Math.max(R[0], 20), t = v.a * rate / 100;
    return { rows: [['TDS to deduct', t, 'money'], ['Rate', rate, 'pct'], ['Pay to the payee', v.a - t, 'money']],
      note: 'TDS applies when payments cross the limit: ₹' + R[1].toLocaleString('en-IN') + ' ' + R[2] + '. Without PAN, TDS is at least 20%. Rates for FY 2025-26 and 2026-27; check the Income Tax Department for changes.' };
  },
  test: [{ in: { a: 100000, s: '194J-p', pan: true }, expect: { 'TDS to deduct': 10000 } }, { in: { a: 100000, s: '194C-i', pan: false }, expect: { 'TDS to deduct': 20000 } }]
});
