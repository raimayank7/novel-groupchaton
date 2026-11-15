/* Infinity by GroupChatOn — molarity. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'molarity', {
  inputs: [{ k: 'mode', label: 'I want to', options: [['m', 'Find molarity from mass'], ['need', 'Find the mass to weigh out'], ['d', 'Dilute a solution (C1V1 = C2V2)']], value: 'm', wide: true },
    { k: 'g', label: 'Mass dissolved', suffix: 'g', value: 5.844, show: function (v) { return v.mode === 'm'; } },
    { k: 'mw', label: 'Molar mass', suffix: 'g/mol', value: 58.44, show: function (v) { return v.mode !== 'd'; }, hint: 'find it with our Molar Mass Calculator' },
    { k: 'M', label: 'Molarity wanted', suffix: 'mol/L (M)', value: 0.5, show: function (v) { return v.mode === 'need'; } },
    { k: 'vol', label: 'Volume of solution', suffix: 'mL', value: 1000, show: function (v) { return v.mode !== 'd'; } },
    { k: 'c1', label: 'Stock concentration (C1)', suffix: 'M', value: 1, show: function (v) { return v.mode === 'd'; } },
    { k: 'c2', label: 'Concentration wanted (C2)', suffix: 'M', value: 0.1, show: function (v) { return v.mode === 'd'; } },
    { k: 'v2', label: 'Volume wanted (V2)', suffix: 'mL', value: 500, show: function (v) { return v.mode === 'd'; } }],
  calc: function (v, X) {
    if (v.mode === 'd') {
      X.pos(v.c1, 'the stock concentration'); X.need(v.c2 < v.c1, 'The concentration wanted must be lower than the stock.');
      var v1 = v.c2 * v.v2 / v.c1;
      return { rows: [['Stock solution to take (V1)', v1, function (n) { return X.num(n, 3) + ' mL'; }], ['Water to add', v.v2 - v1, function (n) { return X.num(n, 3) + ' mL'; }], ['Dilution factor', v.c1 / v.c2, function (n) { return X.num(n, 2) + '×'; }]],
        note: 'C1 × V1 = C2 × V2. Take V1 of the stock and make it up to V2 with water.' };
    }
    X.pos(v.mw, 'the molar mass'); X.pos(v.vol, 'the volume');
    if (v.mode === 'need') {
      var g = v.M * v.vol / 1000 * v.mw;
      return { rows: [['Mass to weigh out', g, function (n) { return X.num(n, 4) + ' g'; }], ['Moles', v.M * v.vol / 1000, function (n) { return X.num(n, 5) + ' mol'; }]], note: 'Mass = molarity × volume (L) × molar mass. Dissolve, then make it up to the final volume.' };
    }
    var mol = v.g / v.mw, M = mol / (v.vol / 1000);
    return { rows: [['Molarity', M, function (n) { return X.num(n, 5) + ' M (mol/L)'; }], ['Moles', mol, function (n) { return X.num(n, 5) + ' mol'; }], ['Millimolar', M * 1000, function (n) { return X.num(n, 3) + ' mM'; }]],
      note: 'Molarity = moles of solute ÷ litres of solution; moles = mass ÷ molar mass.' };
  },
  test: [{ in: { mode: 'm', g: 5.844, mw: 58.44, vol: 1000 }, expect: { Molarity: 0.1 } }, { in: { mode: 'need', mw: 58.44, M: 0.5, vol: 250 }, expect: { 'Mass to weigh out': 7.305 } },
    { in: { mode: 'd', c1: 1, c2: 0.1, v2: 500 }, expect: { 'Stock solution to take (V1)': 50, 'Water to add': 450 } }]
});
