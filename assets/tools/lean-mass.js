/* Infinity by GroupChatOn — lean-mass. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'lean-mass', {
  inputs: [{ k: 's', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: 'm' }, { k: 'kg', label: 'Weight', suffix: 'kg', value: 70 }, { k: 'cm', label: 'Height', suffix: 'cm', value: 175 }],
  calc: function (v) { var l = v.s === 'm' ? 0.407 * v.kg + 0.267 * v.cm - 19.2 : 0.252 * v.kg + 0.473 * v.cm - 48.3;
    return { rows: [['Lean body mass', l, 1, 'kg'], ['Share of weight', 100 * l / v.kg, 'pct'], ['Body fat (by difference)', 100 - 100 * l / v.kg, 'pct']], note: 'Boer formula: an estimate from height and weight.' }; },
  test: [{ in: { s: 'm', kg: 70, cm: 175 }, expect: { 'Lean body mass': 56.015 } }]
});
