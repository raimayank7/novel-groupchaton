/* Infinity by GroupChatOn — kinetic. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'kinetic', {
  inputs: [{ k: 'm', label: 'Mass', suffix: 'kg', value: 1000 }, { k: 'v', label: 'Speed', value: 72 }, { k: 'u', label: 'Speed in', options: [['3.6', 'km/h'], ['1', 'm/s'], ['2.236936', 'mph']], value: '3.6' },
    { k: 'h', label: 'Height', suffix: 'm', value: 10 }],
  calc: function (v, X) {
    var s = v.v / +v.u, ke = 0.5 * v.m * s * s, pe = v.m * 9.80665 * v.h;
    return { rows: [['Kinetic energy', ke, function (n) { return X.num(n, 1) + ' J'; }], ['Potential energy', pe, function (n) { return X.num(n, 1) + ' J'; }],
      ['Total energy', ke + pe, function (n) { return X.num(n / 1000, 3) + ' kJ'; }], ['Speed in m/s', s, 3], ['Speed after falling that height', Math.sqrt(2 * 9.80665 * v.h) * 3.6, function (n) { return X.num(n, 2) + ' km/h'; }],
      ['Same energy as falling from', ke / (v.m * 9.80665), function (n) { return X.num(n, 2) + ' m'; }]],
      note: 'KE = ½ m v², PE = m g h (g = 9.80665 m/s²). Doubling speed gives four times the energy, which is why speed matters so much in a crash.' };
  },
  test: [{ in: { m: 1000, v: 72, u: '3.6', h: 10 }, expect: { 'Kinetic energy': 200000, 'Potential energy': 98066.5, 'Speed in m/s': 20 } }]
});
