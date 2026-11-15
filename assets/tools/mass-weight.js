/* Infinity by GroupChatOn — mass-weight. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var G = [['Mercury', 3.70], ['Venus', 8.87], ['Earth', 9.80665], ['Moon', 1.62], ['Mars', 3.71], ['Jupiter', 24.79], ['Saturn', 10.44], ['Uranus', 8.69], ['Neptune', 11.15], ['Pluto', 0.62], ['Sun', 274]];
  GCOTools.engine('calc', 'mass-weight', {
    inputs: [{ k: 'm', label: 'Mass', suffix: 'kg', value: 70 }],
    calc: function (v, X) {
      X.pos(v.m, 'a mass');
      return { rows: [['Weight on Earth', v.m * 9.80665, function (n) { return X.num(n, 2) + ' N'; }], ['Weight on the Moon', v.m * 1.62, function (n) { return X.num(n, 2) + ' N'; }],
        ['A scale on the Moon would show', v.m * 1.62 / 9.80665, function (n) { return X.num(n, 2) + ' kg'; }]],
        table: { caption: 'Your weight across the Solar System', open: true, head: ['Place', 'Gravity (m/s²)', 'Weight (N)', 'Scale shows (kg)'], rows: G.map(function (g) { return [g[0], String(g[1]), X.num(v.m * g[1], 1), X.num(v.m * g[1] / 9.80665, 1)]; }) },
        note: 'Mass (kg) is the amount of matter and never changes. Weight is the force of gravity on it, in newtons: W = m × g.' };
    },
    test: [{ in: { m: 70 }, expect: { 'Weight on Earth': 686.4655, 'Weight on the Moon': 113.4, 'A scale on the Moon would show': 11.56358 } }]
  });
})();
