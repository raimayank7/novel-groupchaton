/* Infinity by GroupChatOn — kvp. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'kvp', {
  inputs: [{ k: 'p', label: 'Amount invested (from ₹1,000)', money: true, value: 100000 }, { k: 'd', label: 'Date of purchase', type: 'date', value: 'today', fresh: true },
    { k: 'r', label: 'Interest rate', suffix: '% a year', value: 7.5, step: 0.05, hint: 'At 7.5% (Oct–Dec 2026) money doubles in 115 months.' }],
  calc: function (v, X) {
    var months = Math.round(12 * Math.log(2) / Math.log(1 + v.r / 100)), d = X.date(v.d); d.setMonth(d.getMonth() + months);
    return { rows: [['Maturity value', v.p * 2, 'money'], ['Money doubles in', X.ym(months), null, months + ' months'], ['Maturity date', X.fdate(d)]],
      note: 'Kisan Vikas Patra doubles your money in a fixed period set by the rate when you buy (115 months at 7.5%). Interest is taxable; there is no 80C benefit.' };
  },
  test: [{ in: { p: 100000, d: '2026-11-01', r: 7.5 }, expect: { 'Maturity value': 200000, 'Money doubles in': '9 years 7 months', 'Maturity date': '2036' } }]
});
