/* Infinity by GroupChatOn — depreciation. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'depreciation', {
  inputs: [{ k: 'c', label: 'Cost of the asset', money: true, value: 100000 }, { k: 's', label: 'Value at the end (salvage)', money: true, value: 10000 }, { k: 'n', label: 'Useful life', suffix: 'years', value: 5 },
    { k: 'm', label: 'Method', options: [['sl', 'Straight line (same every year)'], ['wdv', 'Written-down value (reducing balance)'], ['ddb', 'Double declining balance']], value: 'sl' },
    { k: 'p', label: 'WDV rate (leave 0 to work it out)', suffix: '%', value: 0, show: function (v) { return v.m === 'wdv'; } }],
  calc: function (v, X) {
    X.pos(v.n, 'the useful life'); var rows = [], bv = v.c, first = 0;
    var rate = v.m === 'wdv' ? (v.p > 0 ? v.p / 100 : 1 - Math.pow(Math.max(v.s, 1) / v.c, 1 / v.n)) : v.m === 'ddb' ? 2 / v.n : 0;
    for (var y = 1; y <= Math.ceil(v.n); y++) {
      var d = v.m === 'sl' ? (v.c - v.s) / v.n : Math.min(bv * rate, Math.max(0, bv - v.s));
      if (v.m !== 'sl' && y === Math.ceil(v.n)) d = Math.max(0, bv - v.s);
      bv -= d; if (y === 1) first = d; rows.push([String(y), X.money(d), X.money(bv)]);
    }
    return { rows: [['Depreciation in year 1', first, 'money'], ['Total depreciation', v.c - v.s, 'money'], rate ? ['Rate', rate * 100, 'pct'] : ['Each year', (v.c - v.s) / v.n, 'money']],
      table: { caption: 'Year by year', head: ['Year', 'Depreciation', 'Book value at year end'], rows: rows, open: true } };
  },
  test: [{ in: { c: 100000, s: 10000, n: 5, m: 'sl' }, expect: { 'Depreciation in year 1': 18000 } }, { in: { c: 100000, s: 10000, n: 5, m: 'ddb' }, expect: { 'Depreciation in year 1': 40000 } }]
});
