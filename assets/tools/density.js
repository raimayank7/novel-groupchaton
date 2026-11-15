/* Infinity by GroupChatOn — density. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'density', {
  inputs: [{ k: 'd', label: 'Density', suffix: 'kg/m³', value: '' }, { k: 'm', label: 'Mass', suffix: 'kg', value: 7.85 }, { k: 'v', label: 'Volume', suffix: 'litres', value: 1 },
    { k: 'h', type: 'heading', label: 'Leave the one you want to find empty. Water is 1,000 kg/m³, steel 7,850, aluminium 2,700, wood 400–900.' }],
  calc: function (v, X) {
    var ok = function (n) { return n > 0; }, n = [v.d, v.m, v.v].filter(ok).length;
    X.need(n === 2, 'Fill in exactly two of the three boxes.');
    var d = v.d, m = v.m, L = v.v;
    if (!ok(d)) d = m / (L / 1000); else if (!ok(m)) m = d * L / 1000; else L = m / d * 1000;
    return { rows: [['Density', d, function (x) { return X.num(x, 3) + ' kg/m³'; }], ['Mass', m, function (x) { return X.num(x, 4) + ' kg'; }], ['Volume', L, function (x) { return X.num(x, 4) + ' L'; }],
      ['Density in g/cm³', d / 1000, 4], ['Floats in water?', d < 1000 ? 'Yes (lighter than water)' : d > 1000 ? 'No, it sinks' : 'Neither: same as water']] };
  },
  test: [{ in: { d: '', m: 7.85, v: 1 }, expect: { Density: 7850, 'Floats in water?': 'sinks' } }, { in: { d: 1000, m: '', v: 2.5 }, expect: { Mass: 2.5 } }, { in: { d: 700, m: 14, v: '' }, expect: { Volume: 20 } }]
});
