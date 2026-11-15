/* Infinity by GroupChatOn — mortgage. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'mortgage', {
  inputs: [{ k: 'price', label: 'Home price', money: true, value: 400000 }, { k: 'dp', label: 'Down payment', suffix: '%', value: 20 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 6.5, step: 0.05 },
    { k: 'y', label: 'Term', options: [['30', '30 years'], ['25', '25 years'], ['20', '20 years'], ['15', '15 years'], ['10', '10 years']], value: '30' },
    { k: 'tax', label: 'Property tax a year', money: true, value: 4800 }, { k: 'ins', label: 'Home insurance a year', money: true, value: 1500 }, { k: 'hoa', label: 'HOA / maintenance a month', money: true, value: 0 }],
  calc: function (v, X) {
    var loan = v.price * (1 - v.dp / 100), m = +v.y * 12, pi = X.emi(loan, v.r, m), extra = (v.tax || 0) / 12 + (v.ins || 0) / 12 + (v.hoa || 0);
    return { rows: [['Monthly payment', pi + extra, 'money'], ['Principal & interest', pi, 'money'], ['Taxes, insurance, HOA', extra, 'money'], ['Loan amount', loan, 'money'], ['Total interest', pi * m - loan, 'money']],
      bars: [['Principal & interest', pi], ['Tax', (v.tax || 0) / 12], ['Insurance', (v.ins || 0) / 12], ['HOA', v.hoa || 0]],
      note: v.dp < 20 ? 'With less than 20% down, US lenders usually add mortgage insurance (PMI), about 0.5–1% of the loan a year.' : '' };
  },
  test: [{ in: { price: 400000, dp: 20, r: 6.5, y: '30', tax: 0, ins: 0, hoa: 0 }, expect: { 'Principal & interest': 2022.62, 'Loan amount': 320000 } }]
});
