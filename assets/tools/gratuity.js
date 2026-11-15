/* Infinity by GroupChatOn — gratuity. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'gratuity', {
  inputs: [{ k: 's', label: 'Last basic salary + DA a month', money: true, value: 50000 }, { k: 'y', label: 'Years of service', value: 10 }, { k: 'mo', label: 'and extra months', value: 0 },
    { k: 'act', label: 'Employer is covered by the Payment of Gratuity Act', type: 'check', value: true }],
  calc: function (v, X) {
    var yrs = v.act ? (v.y || 0) + ((v.mo || 0) >= 6 ? 1 : 0) : (v.y || 0);
    var g = v.act ? v.s * 15 / 26 * yrs : v.s * 15 / 30 * yrs;
    return { rows: [['Gratuity', g, 'money'], ['Years counted', yrs, 'int'], ['Tax-free limit', 2000000, 'money']],
      note: (v.y < 5 ? 'Gratuity is usually paid only after 5 years of continuous service (except on death or disability). ' : '') + 'Formula: last salary × 15 ÷ ' + (v.act ? '26' : '30') + ' × years. Up to ₹20 lakh is tax-free for private-sector employees.' };
  },
  test: [{ in: { s: 50000, y: 10, mo: 0, act: true }, expect: { 'Gratuity': 288461.54 } }, { in: { s: 50000, y: 10, mo: 7, act: true }, expect: { 'Years counted': 11 } }]
});
