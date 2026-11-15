/* Infinity by GroupChatOn — scale. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var U = [['1', 'mm'], ['10', 'cm'], ['1000', 'm'], ['1000000', 'km'], ['25.4', 'inches'], ['304.8', 'feet'], ['1609344', 'miles']];
  GCOTools.engine('calc', 'scale', {
    inputs: [{ k: 'n', label: 'Scale 1 :', value: 50000, hint: 'e.g. 1:50,000 map, 1:24 model car, 1:100 floor plan' },
      { k: 'mode', label: 'I have', options: [['map', 'A length on the map / model'], ['real', 'A real-world length']], value: 'map', wide: true },
      { k: 'x', label: 'Length', value: 4 }, { k: 'ui', label: 'In', options: U, value: '10' }, { k: 'uo', label: 'Show the answer in', options: U, value: '1000000' }],
    calc: function (v, X) {
      X.pos(v.n, 'the scale');
      var mm = v.x * +v.ui, out = v.mode === 'map' ? mm * v.n : mm / v.n;
      var lab = U.filter(function (u) { return u[0] === v.uo; })[0][1];
      return { rows: [[v.mode === 'map' ? 'Real length' : 'Length on the map / model', out / +v.uo, function (n) { return X.num(n, 4) + ' ' + lab; }], ['In metres', out / 1000, 4],
        ['1 cm on the map is', v.n / 100, function (n) { return X.num(n, 2) + ' m in real life'; }]] };
    },
    test: [{ in: { n: 50000, mode: 'map', x: 4, ui: '10', uo: '1000000' }, expect: { 'Real length': 2 } }, { in: { n: 24, mode: 'real', x: 4.5, ui: '1000', uo: '10' }, expect: { 'Length on the map / model': 18.75 } }]
  });
})();
