/* Infinity by GroupChatOn — rounding. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'rounding', {
  inputs: [{ k: 'x', label: 'Number', type: 'text', value: '3.14159' }, { k: 'd', label: 'Decimal places', value: 2 }, { k: 's', label: 'Significant figures', value: 3 }],
  calc: function (v, X) {
    var x = parseFloat(v.x); X.need(!isNaN(x), 'Enter a number.'); var f = Math.pow(10, v.d);
    var even = function (n) { var r = Math.round(n * f), diff = Math.abs(n * f % 1); if (Math.abs(diff - 0.5) < 1e-9) r = 2 * Math.round(n * f / 2); return r / f; };
    return { rows: [['Rounded (' + v.d + ' dp)', Math.round(x * f) / f, String], ['Significant figures (' + v.s + ')', Number(x.toPrecision(Math.max(1, Math.min(21, v.s)))), String], ['Round down (floor)', Math.floor(x * f) / f, String],
      ['Round up (ceiling)', Math.ceil(x * f) / f, String], ['Banker’s rounding (half to even)', even(x), String], ['Nearest 10', Math.round(x / 10) * 10, String], ['Nearest 100', Math.round(x / 100) * 100, String]] };
  },
  test: [{ in: { x: '3.14159', d: 2, s: 3 }, expect: { 'Rounded (2 dp)': 3.14, 'Significant figures (3)': 3.14 } }, { in: { x: '2.5', d: 0, s: 1 }, expect: { 'Banker’s rounding (half to even)': 2, 'Rounded (0 dp)': 3 } }]
});
