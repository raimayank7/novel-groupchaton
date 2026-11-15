/* Infinity by GroupChatOn — freelance-rate. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'freelance-rate', {
  inputs: [{ k: 'i', label: 'Yearly income you want (after costs)', money: true, value: 60000 }, { k: 'e', label: 'Business costs a year (software, internet, equipment)', money: true, value: 10000 },
    { k: 'h', label: 'Billable hours a week', value: 25 }, { k: 'off', label: 'Weeks off a year (holidays, sick, quiet)', value: 6 }, { k: 't', label: 'Tax set aside', suffix: '%', value: 0 }],
  calc: function (v, X) { var hrs = v.h * (52 - v.off); X.pos(hrs, 'your hours'); var need = (v.i + v.e) / (1 - (v.t || 0) / 100);
    return { rows: [['Minimum hourly rate', need / hrs, 'money'], ['Day rate (8 h)', need / hrs * 8, 'money'], ['Billable hours a year', hrs, 'int'], ['Revenue needed a year', need, 'money']] }; },
  test: [{ in: { i: 60000, e: 10000, h: 25, off: 6, t: 0 }, expect: { 'Minimum hourly rate': 60.8696 } }]
});
