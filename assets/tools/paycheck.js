/* Infinity by GroupChatOn — paycheck. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'paycheck', {
  inputs: [{ k: 'g', label: 'Yearly gross pay', money: true, value: 1200000 }, { k: 't', label: 'Income tax (your estimate)', suffix: '% of pay', value: 8 },
    { k: 'ss', label: 'Social security / provident fund', suffix: '% of pay', value: 6 }, { k: 'o', label: 'Other deductions a month (insurance, loans)', money: true, value: 0 },
    { k: 'p', label: 'Paid', options: [['12', 'Monthly'], ['26', 'Every two weeks'], ['52', 'Weekly']], value: '12' }],
  calc: function (v) { var tax = v.g * v.t / 100, ss = v.g * v.ss / 100, oth = (v.o || 0) * 12, net = v.g - tax - ss - oth;
    return { rows: [['Take-home each pay', net / +v.p, 'money'], ['Take-home a year', net, 'money'], ['Tax a year', tax, 'money'], ['Social security / PF a year', ss, 'money']], bars: [['Take-home', net], ['Tax', tax], ['Social / PF', ss], ['Other', oth]] }; },
  test: [{ in: { g: 1200000, t: 8, ss: 6, o: 0, p: '12' }, expect: { 'Take-home each pay': 86000 } }]
});
