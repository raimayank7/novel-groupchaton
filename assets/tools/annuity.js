/* Infinity by GroupChatOn — annuity. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'annuity', {
  inputs: [{ k: 'p', label: 'Purchase price (lump sum)', money: true, value: 2000000 }, { k: 'r', label: 'Annuity rate from the insurer', suffix: '% a year', value: 7 },
    { k: 'f', label: 'Paid', options: [['12', 'Monthly'], ['4', 'Quarterly'], ['2', 'Half-yearly'], ['1', 'Yearly']], value: '12' }, { k: 't', label: 'Your tax slab', suffix: '%', value: 0 }],
  calc: function (v) { var y = v.p * v.r / 100, each = y / +v.f;
    return { rows: [['Pension each time', each, 'money'], ['Pension a year', y, 'money'], ['After tax, a year', y * (1 - (v.t || 0) / 100), 'money']],
      note: 'For an immediate life annuity with return of purchase price, the pension continues for life and the lump sum goes to your nominee. Annuity income is taxed at your slab rate.' }; },
  test: [{ in: { p: 2000000, r: 7, f: '12', t: 0 }, expect: { 'Pension each time': 11666.67 } }]
});
