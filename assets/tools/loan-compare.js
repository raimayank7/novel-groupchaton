/* Infinity by GroupChatOn — loan-compare. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'loan-compare', {
  inputs: [{ k: 'h1', type: 'heading', label: 'Loan A' }, { k: 'pa', label: 'Amount', money: true, value: 1000000 }, { k: 'ra', label: 'Rate', suffix: '%', value: 9 }, { k: 'ya', label: 'Years', value: 10 }, { k: 'fa', label: 'Fees', money: true, value: 10000 },
    { k: 'h2', type: 'heading', label: 'Loan B' }, { k: 'pb', label: 'Amount', money: true, value: 1000000 }, { k: 'rb', label: 'Rate', suffix: '%', value: 8.5 }, { k: 'yb', label: 'Years', value: 10 }, { k: 'fb', label: 'Fees', money: true, value: 25000 }],
  calc: function (v, X) {
    var ea = X.emi(v.pa, v.ra, v.ya * 12), eb = X.emi(v.pb, v.rb, v.yb * 12), ca = ea * v.ya * 12 + (v.fa || 0), cb = eb * v.yb * 12 + (v.fb || 0);
    return { rows: [['Cheaper overall', ca <= cb ? 'Loan A' : 'Loan B', null, 'by ' + X.money(Math.abs(ca - cb))], ['Loan A EMI', ea, 'money'], ['Loan B EMI', eb, 'money'], ['Loan A total cost', ca, 'money'], ['Loan B total cost', cb, 'money']] };
  },
  test: [{ in: { pa: 1000000, ra: 9, ya: 10, fa: 10000, pb: 1000000, rb: 8.5, yb: 10, fb: 25000 }, expect: { 'Cheaper overall': 'Loan B', 'Loan A EMI': 12667.58 } }]
});
