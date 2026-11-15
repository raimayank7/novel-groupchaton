/* Infinity by GroupChatOn — uk-tax. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'uk-tax', {
  inputs: [{ k: 'g', label: 'Yearly salary (£)', value: 50000 }, { k: 'pen', label: 'Pension (salary sacrifice / net pay)', suffix: '% of salary', value: 0 }],
  calc: function (v, X) {
    var gross = v.g, adj = gross * (1 - (v.pen || 0) / 100);
    var pa = Math.max(0, 12570 - Math.max(0, adj - 100000) / 2), taxable = Math.max(0, adj - pa);
    var basic = Math.min(taxable, 37700), higher = Math.min(Math.max(0, taxable - 37700), 125140 - 37700 - 0), add = Math.max(0, adj - 125140);
    higher = Math.max(0, taxable - basic - add);
    var tax = basic * 0.2 + higher * 0.4 + add * 0.45;
    var ni = Math.max(0, Math.min(adj, 50270) - 12570) * 0.08 + Math.max(0, adj - 50270) * 0.02;
    var net = gross - (gross - adj) - tax - ni;
    var f = function (n) { return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    return { rows: [['Take-home pay a year', net, f], ['Take-home a month', net / 12, f], ['Income Tax', tax, f], ['National Insurance', ni, f], ['Personal Allowance', pa, f]],
      note: '2026/27 rates for England, Wales and Northern Ireland: £12,570 allowance, 20% / 40% / 45%, employee NI 8% then 2% above £50,270. Scotland has its own Income Tax bands. Student loans are not included.' };
  },
  test: [{ in: { g: 50000, pen: 0 }, expect: { 'Income Tax': 7486, 'National Insurance': 2994.4, 'Take-home pay a year': 39519.6 } }, { in: { g: 130000, pen: 0 }, expect: { 'Personal Allowance': 0, 'Income Tax': 44703 } }]
});
