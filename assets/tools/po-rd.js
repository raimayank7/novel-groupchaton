/* Infinity by GroupChatOn — po-rd. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'po-rd', {
  inputs: [{ k: 'm', label: 'Monthly deposit (from ₹100)', money: true, value: 1000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 6.7, step: 0.05, hint: 'Oct–Dec 2026 rate.' }],
  calc: function (v) {
    var mat = 0; for (var i = 1; i <= 60; i++) mat += v.m * Math.pow(1 + v.r / 400, (60 - i + 1) / 3);
    return { rows: [['Maturity value after 5 years', mat, 'money'], ['Total deposited', v.m * 60, 'money'], ['Interest earned', mat - v.m * 60, 'money']], bars: [['Deposited', v.m * 60], ['Interest', mat - v.m * 60]],
      note: 'Post Office Recurring Deposit runs for 5 years with interest compounded every quarter. India Post’s own table may differ by a few rupees because of rounding.' };
  },
  test: [{ in: { m: 1000, r: 6.7 }, expect: { 'Total deposited': 60000, 'Maturity value after 5 years': 71365.83 } }]
});
