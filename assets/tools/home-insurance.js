/* Infinity by GroupChatOn — home-insurance. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'home-insurance', {
  inputs: [{ k: 'area', label: 'Built-up area', suffix: 'sq ft', value: 1200 }, { k: 'rate', label: 'Construction cost per sq ft', money: true, value: 2200, hint: 'What it would cost to rebuild today (not the market price of the flat).' },
    { k: 'cont', label: 'Value of contents (furniture, appliances, jewellery)', money: true, value: 800000 }, { k: 'prem', label: 'Premium rate (from your quote)', suffix: 'per ₹1,000 a year', value: 0.25 }],
  calc: function (v) { var b = v.area * v.rate, total = b + v.cont;
    return { rows: [['Sum insured needed', total, 'money'], ['Building (rebuild cost)', b, 'money'], ['Contents', v.cont, 'money'], ['Premium (about)', total / 1000 * v.prem * 1.18, 'money', 'a year with GST']],
      note: 'Insure the building for its rebuild cost: land does not burn. Under-insuring means claims are cut in proportion (the “average clause”).' }; },
  test: [{ in: { area: 1200, rate: 2200, cont: 800000, prem: 0.25 }, expect: { 'Sum insured needed': 3440000 } }]
});
