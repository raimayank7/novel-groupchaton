/* Infinity by GroupChatOn — pomis. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'pomis', {
  inputs: [{ k: 'p', label: 'Amount invested', money: true, value: 900000 }, { k: 'j', label: 'Account type', options: [['s', 'Single (up to ₹9 lakh)'], ['j', 'Joint (up to ₹15 lakh)']], value: 's' },
    { k: 'r', label: 'Interest rate', suffix: '% a year', value: 7.4, step: 0.05, hint: 'Oct–Dec 2026 rate, fixed for 5 years.' }],
  calc: function (v, X) {
    X.need(v.p <= (v.j === 'j' ? 1500000 : 900000), 'The limit is ' + (v.j === 'j' ? '₹15 lakh for a joint' : '₹9 lakh for a single') + ' account.');
    var m = v.p * v.r / 1200;
    return { rows: [['Monthly income', m, 'money'], ['Yearly income', m * 12, 'money'], ['Total interest in 5 years', m * 60, 'money'], ['Money back at the end', v.p, 'money']],
      note: 'Post Office Monthly Income Scheme: interest is paid every month for 5 years, then the deposit is returned. Interest is taxable.' };
  },
  test: [{ in: { p: 900000, j: 's', r: 7.4 }, expect: { 'Monthly income': 5550, 'Total interest in 5 years': 333000 } }]
});
