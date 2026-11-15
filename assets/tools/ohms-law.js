/* Infinity by GroupChatOn — ohms-law. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'ohms-law', {
  inputs: [{ k: 'v', label: 'Voltage', suffix: 'V (volts)', value: 12 }, { k: 'i', label: 'Current', suffix: 'A (amps)', value: 2 },
    { k: 'r', label: 'Resistance', suffix: 'Ω (ohms)', value: '' }, { k: 'p', label: 'Power', suffix: 'W (watts)', value: '' }],
  calc: function (v, X) {
    var V = v.v, I = v.i, R = v.r, P = v.p, ok = function (n) { return n > 0; };
    var n = [V, I, R, P].filter(ok).length;
    X.need(n === 2, 'Fill in exactly two of the four boxes and leave the other two empty.');
    if (ok(V) && ok(I)) { R = V / I; P = V * I; }
    else if (ok(V) && ok(R)) { I = V / R; P = V * V / R; }
    else if (ok(V) && ok(P)) { I = P / V; R = V * V / P; }
    else if (ok(I) && ok(R)) { V = I * R; P = I * I * R; }
    else if (ok(I) && ok(P)) { V = P / I; R = P / (I * I); }
    else { I = Math.sqrt(P / R); V = I * R; }
    return { rows: [['Resistance', R, function (n) { return X.num(n, 4) + ' Ω'; }], ['Voltage', V, function (n) { return X.num(n, 4) + ' V'; }],
      ['Current', I, function (n) { return X.num(n, 4) + ' A'; }], ['Power', P, function (n) { return X.num(n, 4) + ' W'; }]],
      note: 'Ohm’s law: V = I × R, and power P = V × I. Fill in any two values; the other two are worked out.' };
  },
  test: [{ in: { v: 12, i: 2, r: '', p: '' }, expect: { Resistance: 6, Power: 24 } }, { in: { v: '', i: '', r: 100, p: 1 }, expect: { Current: 0.1, Voltage: 10 } }]
});
