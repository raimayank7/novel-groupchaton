/* Infinity by GroupChatOn — resistor. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var C = [['0', 'Black'], ['1', 'Brown'], ['2', 'Red'], ['3', 'Orange'], ['4', 'Yellow'], ['5', 'Green'], ['6', 'Blue'], ['7', 'Violet'], ['8', 'Grey'], ['9', 'White']];
  var M = [['1', 'Black ×1'], ['10', 'Brown ×10'], ['100', 'Red ×100'], ['1000', 'Orange ×1k'], ['10000', 'Yellow ×10k'], ['100000', 'Green ×100k'], ['1000000', 'Blue ×1M'],
    ['10000000', 'Violet ×10M'], ['0.1', 'Gold ×0.1'], ['0.01', 'Silver ×0.01']];
  var TOL = [['1', 'Brown ±1%'], ['2', 'Red ±2%'], ['0.5', 'Green ±0.5%'], ['0.25', 'Blue ±0.25%'], ['0.1', 'Violet ±0.1%'], ['5', 'Gold ±5%'], ['10', 'Silver ±10%'], ['20', 'None ±20%']];
  function ohm(n) { var u = [[1e9, 'GΩ'], [1e6, 'MΩ'], [1e3, 'kΩ']]; for (var i = 0; i < u.length; i++) if (n >= u[i][0]) return +(n / u[i][0]).toPrecision(4) + ' ' + u[i][1]; return +n.toPrecision(4) + ' Ω'; }
  GCOTools.engine('calc', 'resistor', {
    inputs: [{ k: 'n', label: 'Number of bands', options: [['4', '4 bands'], ['5', '5 bands']], value: '4' },
      { k: 'a', label: '1st band', options: C, value: '4' }, { k: 'b', label: '2nd band', options: C, value: '7' },
      { k: 'c', label: '3rd band', options: C, value: '0', show: function (v) { return v.n === '5'; } },
      { k: 'm', label: 'Multiplier band', options: M, value: '100' }, { k: 't', label: 'Tolerance band', options: TOL, value: '5' }],
    calc: function (v) {
      var digits = v.n === '5' ? v.a + v.b + v.c : v.a + v.b, r = +digits * +v.m, t = +v.t / 100;
      return { rows: [['Resistance', ohm(r)], ['Resistance (ohms)', r, 'num'], ['Lowest', r * (1 - t), 'num', ohm(r * (1 - t))], ['Highest', r * (1 + t), 'num', ohm(r * (1 + t))], ['Tolerance', '±' + v.t + '%']],
        note: 'Read the bands from the end that has the bands closer together. Gold or silver is always the last (tolerance) band.' };
    },
    test: [{ in: { n: '4', a: '4', b: '7', m: '100', t: '5' }, expect: { Resistance: '4.7 kΩ', 'Resistance (ohms)': 4700, Lowest: 4465, Highest: 4935 } },
      { in: { n: '5', a: '1', b: '0', c: '0', m: '1000', t: '1' }, expect: { Resistance: '100 kΩ' } }]
  });
})();
