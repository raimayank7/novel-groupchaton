/* Infinity by GroupChatOn — scss. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'scss', {
  inputs: [{ k: 'p', label: 'Amount (₹1,000 to ₹30 lakh)', money: true, value: 1500000 }, { k: 'r', label: 'Interest rate', suffix: '% a year', value: 8.2, step: 0.05, hint: 'Oct–Dec 2026 rate, fixed for 5 years once you invest.' }],
  calc: function (v, X) {
    X.need(v.p >= 1000 && v.p <= 3000000, 'SCSS accepts ₹1,000 to ₹30 lakh per person.');
    var q = v.p * v.r / 400;
    return { rows: [['Interest every quarter', q, 'money'], ['Interest a year', q * 4, 'money'], ['Total interest in 5 years', q * 20, 'money'], ['Monthly equivalent', q / 3, 'money']],
      note: 'For people aged 60+ (55+ for retired civilians, 50+ for retired defence staff). Interest is paid on the first working day of April, July, October and January and is taxable; TDS applies above ₹1 lakh a year. The deposit counts under 80C (old regime). It can be extended by 3 years.' };
  },
  test: [{ in: { p: 1500000, r: 8.2 }, expect: { 'Interest every quarter': 30750, 'Total interest in 5 years': 615000 } }]
});
