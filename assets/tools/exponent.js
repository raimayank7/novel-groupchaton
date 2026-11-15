/* Infinity by GroupChatOn — exponent. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'exponent', {
  inputs: [{ k: 'b', label: 'Base', value: 2 }, { k: 'e', label: 'Exponent (power)', value: 10 }],
  calc: function (v) { var r = Math.pow(v.b, v.e); return { rows: [[v.b + '^' + v.e, r], ['Scientific notation', r.toExponential(6).replace('e+', ' × 10^').replace('e-', ' × 10^-')], [v.b + '^−' + v.e, Math.pow(v.b, -v.e)]] }; },
  test: [{ in: { b: 2, e: 10 }, expect: { '2^10': 1024 } }, { in: { b: 9, e: 0.5 }, expect: { '9^0.5': 3 } }]
});
