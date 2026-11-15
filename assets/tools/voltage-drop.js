/* Infinity by GroupChatOn — voltage-drop. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'voltage-drop', {
  inputs: [{ k: 's', label: 'Supply', options: [['2', 'Single-phase AC or DC (2 wires)'], ['1.7320508', 'Three-phase AC']], value: '2', wide: true },
    { k: 'm', label: 'Wire metal', options: [['0.0172', 'Copper'], ['0.0282', 'Aluminium']], value: '0.0172' },
    { k: 'V', label: 'Supply voltage', suffix: 'V', value: 230 }, { k: 'I', label: 'Current', suffix: 'A', value: 16 },
    { k: 'L', label: 'Cable length (one way)', suffix: 'metres', value: 30 }, { k: 'A', label: 'Wire size', suffix: 'mm²', value: 2.5 }],
  calc: function (v, X) {
    X.pos(v.A, 'the wire size'); X.pos(v.V, 'the voltage');
    var d = +v.s * +v.m * v.L * v.I / v.A, pct = d / v.V * 100;
    return { rows: [['Voltage drop', d, function (n) { return X.num(n, 3) + ' V'; }], ['Drop as % of supply', pct, 'pct', pct <= 3 ? 'within the usual 3% limit for lighting' : pct <= 5 ? 'within 5%: fine for most power circuits' : 'too high: use a thicker wire'],
      ['Voltage at the far end', v.V - d, function (n) { return X.num(n, 2) + ' V'; }], ['Power lost in the cable', d * v.I, function (n) { return X.num(n, 1) + ' W'; }]],
      note: 'Drop = factor × resistivity × length × current ÷ wire size (copper 0.0172, aluminium 0.0282 Ω·mm²/m at 20 °C). Factor is 2 for single phase, √3 for three phase.' };
  },
  test: [{ in: { s: '2', m: '0.0172', V: 230, I: 16, L: 30, A: 2.5 }, expect: { 'Voltage drop': 6.6048, 'Drop as % of supply': 2.87165 } },
    { in: { s: '1.7320508', m: '0.0172', V: 415, I: 20, L: 50, A: 6 }, expect: { 'Voltage drop': 4.96521 } }]
});
