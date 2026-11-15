/* Infinity by GroupChatOn — beam-load. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'beam-load', {
  inputs: [{ k: 's', label: 'Beam support', options: [['ss', 'Simply supported (both ends)'], ['cant', 'Cantilever (fixed at one end)']], value: 'ss', wide: true },
    { k: 'lt', label: 'Load', options: [['p', 'One point load (centre / free end)'], ['w', 'Spread evenly along the beam (UDL)']], value: 'p', wide: true },
    { k: 'L', label: 'Span', suffix: 'm', value: 4 }, { k: 'P', label: 'Point load', suffix: 'kN', value: 10, show: function (v) { return v.lt === 'p'; } },
    { k: 'w', label: 'Load per metre', suffix: 'kN/m', value: 5, show: function (v) { return v.lt === 'w'; } },
    { k: 'E', label: 'Elastic modulus (E)', suffix: 'GPa', value: 200, hint: 'steel 200, aluminium 69, concrete ~25, timber ~10' },
    { k: 'I', label: 'Moment of inertia (I)', suffix: 'cm⁴', value: 2000 }],
  calc: function (v, X) {
    X.pos(v.L, 'the span'); X.pos(v.E, 'E'); X.pos(v.I, 'I');
    var L = v.L, EI = v.E * 1e9 * v.I * 1e-8, M, V, d;
    if (v.lt === 'p') { var P = v.P * 1000; if (v.s === 'ss') { M = P * L / 4; V = P / 2; d = P * L * L * L / (48 * EI); } else { M = P * L; V = P; d = P * L * L * L / (3 * EI); } }
    else { var w = v.w * 1000; if (v.s === 'ss') { M = w * L * L / 8; V = w * L / 2; d = 5 * w * Math.pow(L, 4) / (384 * EI); } else { M = w * L * L / 2; V = w * L; d = w * Math.pow(L, 4) / (8 * EI); } }
    var lim = L * 1000 / (v.s === 'ss' ? 360 : 180);
    return { rows: [['Maximum deflection', d * 1000, function (n) { return X.num(n, 3) + ' mm'; }], ['Maximum bending moment', M / 1000, function (n) { return X.num(n, 3) + ' kN·m'; }],
      ['Maximum shear force', V / 1000, function (n) { return X.num(n, 3) + ' kN'; }], ['Common deflection limit', lim, function (n) { return X.num(n, 2) + ' mm'; }, d * 1000 <= lim ? 'passes' : 'too bendy: use a deeper beam']],
      note: 'Standard formulas for a straight beam of one material. Beam self-weight is not added. For any real building work, have a structural engineer check the design.' };
  },
  test: [{ in: { s: 'ss', lt: 'p', L: 4, P: 10, E: 200, I: 2000 }, expect: { 'Maximum deflection': 3.33333, 'Maximum bending moment': 10, 'Maximum shear force': 5 } },
    { in: { s: 'ss', lt: 'w', L: 4, w: 5, E: 200, I: 2000 }, expect: { 'Maximum deflection': 4.16667, 'Maximum bending moment': 10, 'Maximum shear force': 10 } },
    { in: { s: 'cant', lt: 'p', L: 2, P: 1, E: 200, I: 2000 }, expect: { 'Maximum deflection': 0.666667, 'Maximum bending moment': 2 } }]
});
