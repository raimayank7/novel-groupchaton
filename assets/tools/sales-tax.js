/* Infinity by GroupChatOn — sales-tax. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'sales-tax', {
  inputs: [{ k: 'a', label: 'Price', money: true, value: 50 }, { k: 'r', label: 'Sales tax rate (state + local)', suffix: '%', value: 8.25, hint: 'For example California 7.25% state rate, plus your city or county.' },
    { k: 'm', label: 'The price is', options: [['ex', 'Before tax'], ['in', 'Including tax']], value: 'ex' }],
  calc: function (v) { var base = v.m === 'ex' ? v.a : v.a / (1 + v.r / 100), t = base * v.r / 100; return { rows: [['Total with tax', base + t, 'money'], ['Sales tax', t, 'money'], ['Price before tax', base, 'money']] }; },
  test: [{ in: { a: 50, r: 8.25, m: 'ex' }, expect: { 'Sales tax': 4.125, 'Total with tax': 54.125 } }]
});
