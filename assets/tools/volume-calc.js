/* Infinity by GroupChatOn — volume-calc. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var SH = [['box', 'Box / room / tank (rectangular)'], ['cube', 'Cube'], ['cyl', 'Cylinder / round tank'], ['sphere', 'Sphere / ball'], ['hemi', 'Hemisphere / bowl'], ['cone', 'Cone'],
    ['pyr', 'Pyramid (rectangular base)'], ['cap', 'Capsule'], ['ring', 'Pipe / hollow cylinder']];
  var U = [['1', 'metres'], ['0.01', 'centimetres'], ['0.3048', 'feet'], ['0.0254', 'inches']];
  var S = function () { var s = [].slice.call(arguments); return function (v) { return s.indexOf(v.sh) >= 0; }; };
  GCOTools.engine('calc', 'volume-calc', {
    inputs: [{ k: 'sh', label: 'Shape', options: SH, value: 'cyl', wide: true }, { k: 'u', label: 'Measured in', options: U, value: '1' },
      { k: 'l', label: 'Length / side', value: 2, show: S('box', 'cube', 'pyr') }, { k: 'w', label: 'Width', value: 1, show: S('box', 'pyr') },
      { k: 'r', label: 'Radius (half the width)', value: 0.5, show: S('cyl', 'sphere', 'hemi', 'cone', 'cap', 'ring') }, { k: 'ri', label: 'Inner radius', value: 0.4, show: S('ring') },
      { k: 'hh', label: 'Height / depth / length', value: 2, show: S('box', 'cyl', 'cone', 'pyr', 'cap', 'ring') }],
    calc: function (v, X) {
      var V, P = Math.PI;
      switch (v.sh) {
        case 'box': V = v.l * v.w * v.hh; break;
        case 'cube': V = Math.pow(v.l, 3); break;
        case 'cyl': V = P * v.r * v.r * v.hh; break;
        case 'sphere': V = 4 / 3 * P * Math.pow(v.r, 3); break;
        case 'hemi': V = 2 / 3 * P * Math.pow(v.r, 3); break;
        case 'cone': V = P * v.r * v.r * v.hh / 3; break;
        case 'pyr': V = v.l * v.w * v.hh / 3; break;
        case 'cap': V = P * v.r * v.r * (4 / 3 * v.r + v.hh); break;
        case 'ring': X.need(v.ri < v.r, 'The inner radius must be smaller.'); V = P * (v.r * v.r - v.ri * v.ri) * v.hh; break;
      }
      X.need(V > 0, 'Enter the measurements.');
      var m3 = V * Math.pow(+v.u, 3), unit = U.filter(function (x) { return x[0] === v.u; })[0][1];
      return { rows: [['Volume', m3 * 1000, function (n) { return X.num(n, 2) + ' litres'; }], ['In cubic ' + unit, V, 4], ['Cubic metres', m3, 4], ['Cubic feet', m3 / 0.028316846592, 3],
        ['US gallons', m3 * 1000 / 3.785411784, 2], ['UK gallons', m3 * 1000 / 4.54609, 2]], note: 'For a cylinder (capsule) the height is the straight part between the rounded ends.' };
    },
    test: [{ in: { sh: 'cyl', u: '1', r: 0.5, hh: 2 }, expect: { Volume: 1570.79633 } }, { in: { sh: 'box', u: '1', l: 2, w: 1, hh: 1 }, expect: { Volume: 2000 } },
      { in: { sh: 'sphere', u: '0.01', r: 10 }, expect: { Volume: 4.18879 } }, { in: { sh: 'cone', u: '1', r: 1, hh: 3 }, expect: { 'Cubic metres': 3.14159 } }]
  });
})();
