/* Infinity by GroupChatOn — projectile. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'projectile', {
  inputs: [{ k: 'v', label: 'Launch speed', suffix: 'm/s', value: 20 }, { k: 'a', label: 'Launch angle', suffix: 'degrees', value: 45 },
    { k: 'h', label: 'Launch height', suffix: 'm', value: 0 }, { k: 'g', label: 'Gravity', suffix: 'm/s²', value: 9.81, hint: 'Earth 9.81, Moon 1.62, Mars 3.71' }],
  calc: function (v, X) {
    X.pos(v.v, 'the speed'); X.pos(v.g, 'gravity');
    var r = v.a * Math.PI / 180, vx = v.v * Math.cos(r), vy = v.v * Math.sin(r), h0 = v.h || 0;
    var t = (vy + Math.sqrt(vy * vy + 2 * v.g * h0)) / v.g, R = vx * t, H = h0 + Math.max(0, vy) * Math.max(0, vy) / (2 * v.g);
    var rows = [];
    for (var k = 0; k <= 10; k++) { var tt = t * k / 10; rows.push([X.num(tt, 2) + ' s', X.num(vx * tt, 2) + ' m', X.num(Math.max(0, h0 + vy * tt - v.g * tt * tt / 2), 2) + ' m']); }
    return { rows: [['Range', R, function (n) { return X.num(n, 2) + ' m'; }], ['Time in the air', t, function (n) { return X.num(n, 3) + ' s'; }], ['Highest point', H, function (n) { return X.num(n, 2) + ' m'; }],
      ['Speed on landing', Math.sqrt(vx * vx + Math.pow(vy - v.g * t, 2)), function (n) { return X.num(n, 2) + ' m/s'; }]],
      table: { caption: 'Position along the path', head: ['Time', 'Distance', 'Height'], rows: rows }, note: 'Ignores air resistance. From the ground, 45° gives the longest range.' };
  },
  test: [{ in: { v: 20, a: 45, h: 0, g: 9.81 }, expect: { Range: 40.7747, 'Time in the air': 2.88321, 'Highest point': 10.19368 } },
    { in: { v: 20, a: 45, h: 10, g: 9.81 }, expect: { Range: 49.08216, 'Time in the air': 3.47063, 'Highest point': 20.19368 } }]
});
