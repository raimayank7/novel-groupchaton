/* Infinity by GroupChatOn — wire-size. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
  // current a PVC-insulated cable can carry, two loaded conductors clipped to a wall (IEC 60364-5-52, method C, 30 °C)
  var AMPS = { cu: [19.5, 27, 36, 46, 63, 85, 112, 138, 168, 213, 258, 299, 344, 392, 461, 530], al: [15, 21, 28, 36, 49, 66, 83, 103, 125, 160, 195, 226, 261, 298, 352, 406] };
  var RHO = { cu: 0.0172, al: 0.0282 };
  GCOTools.engine('calc', 'wire-size', {
    inputs: [{ k: 's', label: 'Supply', options: [['2', 'Single-phase AC or DC'], ['1.7320508', 'Three-phase AC']], value: '2' },
      { k: 'm', label: 'Wire metal', options: [['cu', 'Copper'], ['al', 'Aluminium']], value: 'cu' },
      { k: 'V', label: 'Supply voltage', suffix: 'V', value: 230 }, { k: 'I', label: 'Load current', suffix: 'A', value: 32 },
      { k: 'L', label: 'Cable length (one way)', suffix: 'metres', value: 25 }, { k: 'p', label: 'Voltage drop allowed', suffix: '%', value: 3 }],
    calc: function (v, X) {
      X.pos(v.I, 'the current'); X.pos(v.p, 'the allowed drop');
      var rho = RHO[v.m], min = +v.s * rho * v.L * v.I / (v.V * v.p / 100), pick = -1;
      for (var i = 0; i < SIZES.length; i++) if (SIZES[i] >= min && AMPS[v.m][i] >= v.I) { pick = i; break; }
      X.need(pick >= 0, 'That needs more than 300 mm²: use parallel cables or ask an electrician.');
      var a = SIZES[pick], d = +v.s * rho * v.L * v.I / a;
      return { rows: [['Cable size', a + ' mm²'], ['Smallest size for the voltage drop', min, function (n) { return X.num(n, 2) + ' mm²'; }],
        ['This cable can carry (about)', AMPS[v.m][pick], function (n) { return X.num(n, 1) + ' A'; }], ['Voltage drop with it', d, function (n) { return X.num(n, 2) + ' V'; }], ['Drop %', d / v.V * 100, 'pct']],
        note: 'Checks both the voltage drop and how much current the cable can safely carry (PVC cable on a wall at 30 °C). Cables in conduit, bunched or in hot places need a bigger size. Always follow your local wiring rules and a licensed electrician.' };
    },
    test: [{ in: { s: '2', m: 'cu', V: 230, I: 32, L: 25, p: 3 }, expect: { 'Cable size': '4 mm²', 'Smallest size for the voltage drop': 3.98841, 'Voltage drop with it': 6.88 } }]
  });
})();
