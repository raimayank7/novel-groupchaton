/* Infinity by GroupChatOn — force. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'force', {
  inputs: [{ k: 'm', label: 'Mass', suffix: 'kg', value: 10 }, { k: 'a', label: 'Acceleration', suffix: 'm/s²', value: 2 },
    { k: 'd', label: 'Distance moved', suffix: 'm', value: 5 }, { k: 'th', label: 'Angle between force and movement', suffix: 'degrees', value: 0 }, { k: 't', label: 'Time taken', suffix: 's', value: 4 }],
  calc: function (v, X) {
    var F = v.m * v.a, W = F * v.d * Math.cos(v.th * Math.PI / 180);
    return { rows: [['Force', F, function (n) { return X.num(n, 3) + ' N'; }], ['Work done', W, function (n) { return X.num(n, 3) + ' J'; }],
      ['Power', v.t > 0 ? W / v.t : 0, function (n) { return X.num(n, 3) + ' W'; }], ['Weight of the mass on Earth', v.m * 9.80665, function (n) { return X.num(n, 3) + ' N'; }],
      ['Force in kilogram-force', F / 9.80665, function (n) { return X.num(n, 3) + ' kgf'; }]],
      note: 'Newton’s second law F = m × a; work W = F × d × cos θ; power P = W ÷ t.' };
  },
  test: [{ in: { m: 10, a: 2, d: 5, th: 0, t: 4 }, expect: { Force: 20, 'Work done': 100, Power: 25, 'Weight of the mass on Earth': 98.0665 } }]
});
