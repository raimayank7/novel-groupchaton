/* Infinity by GroupChatOn — power-calc. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'power-calc', {
  inputs: [{ k: 's', label: 'Supply', options: [['dc', 'DC'], ['1', 'Single-phase AC'], ['3', 'Three-phase AC']], value: '1' },
    { k: 'V', label: 'Voltage', suffix: 'V', value: 230 }, { k: 'I', label: 'Current', suffix: 'A', value: 10 },
    { k: 'pf', label: 'Power factor', value: 0.9, step: 0.01, show: function (v) { return v.s !== 'dc'; }, hint: '1 for heaters and bulbs; 0.8–0.9 for motors' }],
  calc: function (v, X) {
    var pf = v.s === 'dc' ? 1 : v.pf, k = v.s === '3' ? Math.sqrt(3) : 1;
    X.need(pf > 0 && pf <= 1, 'Power factor is between 0 and 1.');
    var va = k * v.V * v.I, w = va * pf;
    return { rows: [['Power', w, function (n) { return X.num(n, 1) + ' W'; }], ['Kilowatts', w / 1000, function (n) { return X.num(n, 3) + ' kW'; }],
      ['Horsepower', w / 746, function (n) { return X.num(n, 2) + ' HP'; }], ['Apparent power', va / 1000, function (n) { return X.num(n, 3) + ' kVA'; }],
      ['Units used in one hour', w / 1000, function (n) { return X.num(n, 3) + ' kWh'; }]],
      note: 'DC: P = V × I. Single phase: P = V × I × PF. Three phase: P = √3 × V × I × PF (V is the line-to-line voltage). 1 HP = 746 W.' };
  },
  test: [{ in: { s: '1', V: 230, I: 10, pf: 0.9 }, expect: { Power: 2070, Horsepower: 2.77480, 'Apparent power': 2.3 } }, { in: { s: '3', V: 415, I: 20, pf: 0.85 }, expect: { Power: 12219.618 } }]
});
