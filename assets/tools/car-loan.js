/* Infinity by GroupChatOn — car-loan. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'car-loan', {
  inputs: [{ k: 'price', label: 'Car price (on-road)', money: true, value: 800000 }, { k: 'down', label: 'Down payment', money: true, value: 200000 },
    { k: 'r', label: 'Interest rate', suffix: '% a year', value: 9 }, { k: 'y', label: 'Tenure', suffix: 'years', value: 5 }, { k: 'fee', label: 'Processing fee (optional)', money: true, value: 0 }],
  calc: function (v, X) {
    var p = v.price - v.down; X.need(p > 0, 'The down payment is more than the price.'); var m = Math.round(v.y * 12), e = X.emi(p, v.r, m);
    return { rows: [['Monthly EMI', e, 'money'], ['Loan amount', p, 'money'], ['Total interest', e * m - p, 'money'], ['Total cost of the car', v.down + e * m + (v.fee || 0), 'money']], bars: [['Down payment', v.down], ['Loan principal', p], ['Interest', e * m - p]] };
  },
  test: [{ in: { price: 800000, down: 200000, r: 9, y: 5, fee: 0 }, expect: { 'Monthly EMI': 12455.01, 'Loan amount': 600000 } }]
});
