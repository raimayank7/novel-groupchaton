/* Infinity by GroupChatOn — gear-ratio. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'gear-ratio', {
  inputs: [{ k: 'a', label: 'Teeth on the driving gear', value: 12 }, { k: 'b', label: 'Teeth on the driven gear', value: 36 },
    { k: 'rpm', label: 'Input speed', suffix: 'rpm', value: 1500 }, { k: 'tq', label: 'Input torque', suffix: 'N·m', value: 10 }, { k: 'e', label: 'Efficiency', suffix: '%', value: 100 }],
  calc: function (v, X) {
    X.pos(v.a, 'the driving teeth'); X.pos(v.b, 'the driven teeth');
    var r = v.b / v.a;
    return { rows: [['Gear ratio', r, function (n) { return X.num(n, 3) + ' : 1'; }], ['Output speed', v.rpm / r, function (n) { return X.num(n, 2) + ' rpm'; }],
      ['Output torque', v.tq * r * v.e / 100, function (n) { return X.num(n, 2) + ' N·m'; }], ['Type', r > 1 ? 'Reduction: slower and stronger' : r < 1 ? 'Overdrive: faster, less torque' : 'Same speed']],
      note: 'Ratio = driven teeth ÷ driving teeth. The same works for pulleys (use diameters) and bicycle sprockets.' };
  },
  test: [{ in: { a: 12, b: 36, rpm: 1500, tq: 10, e: 100 }, expect: { 'Gear ratio': 3, 'Output speed': 500, 'Output torque': 30 } }]
});
