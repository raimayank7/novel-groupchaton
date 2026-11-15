/* Infinity by GroupChatOn — logarithm. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'logarithm', {
  inputs: [{ k: 'x', label: 'Number', value: 1000 }, { k: 'b', label: 'Base', value: 10 }],
  calc: function (v, X) { X.need(v.x > 0, 'The number must be more than 0.'); X.need(v.b > 0 && v.b !== 1, 'The base must be more than 0 and not 1.');
    return { rows: [['log base ' + v.b, Math.log(v.x) / Math.log(v.b), 10], ['Natural log ln', Math.log(v.x), 10], ['log₁₀', Math.log10(v.x), 10], ['log₂', Math.log2(v.x), 10], ['e^x', Math.exp(v.x)]] }; },
  test: [{ in: { x: 1000, b: 10 }, expect: { 'log base 10': 3, 'log₂': 9.9657842847 } }]
});
