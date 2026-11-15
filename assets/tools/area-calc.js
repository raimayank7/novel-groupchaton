/* Infinity by GroupChatOn — area-calc. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var SH = [['rect', 'Rectangle / plot'], ['square', 'Square'], ['circle', 'Circle'], ['tri', 'Triangle (base and height)'], ['tri3', 'Triangle (three sides)'], ['trap', 'Trapezium'],
    ['para', 'Parallelogram'], ['ellipse', 'Ellipse'], ['sector', 'Sector of a circle'], ['rhombus', 'Rhombus (diagonals)'], ['quad', 'Irregular plot (four sides + one diagonal)']];
  var U = [['1', 'metres'], ['0.3048', 'feet'], ['0.9144', 'yards / gaj'], ['0.01', 'centimetres'], ['0.0254', 'inches']];
  var S = function () { var s = [].slice.call(arguments); return function (v) { return s.indexOf(v.sh) >= 0; }; };
  function heron(a, b, c) { var s = (a + b + c) / 2, x = s * (s - a) * (s - b) * (s - c); if (!(x > 0)) throw new Error('Those three sides cannot make a triangle.'); return Math.sqrt(x); }
  GCOTools.engine('calc', 'area-calc', {
    inputs: [{ k: 'sh', label: 'Shape', options: SH, value: 'rect', wide: true }, { k: 'u', label: 'Measured in', options: U, value: '1' },
      { k: 'a', label: 'Length / side a / base', value: 20, show: S('rect', 'square', 'tri', 'tri3', 'trap', 'para', 'quad') },
      { k: 'b', label: 'Width / side b', value: 30, show: S('rect', 'tri3', 'trap', 'quad') },
      { k: 'c', label: 'Side c', value: 25, show: S('tri3', 'quad') }, { k: 'd', label: 'Side d', value: 22, show: S('quad') },
      { k: 'e', label: 'Diagonal (a–b corner to c–d corner)', value: 32, show: S('quad') },
      { k: 'hh', label: 'Height', value: 10, show: S('tri', 'trap', 'para') },
      { k: 'r', label: 'Radius', value: 7, show: S('circle', 'sector') }, { k: 'ang', label: 'Angle', suffix: 'degrees', value: 60, show: S('sector') },
      { k: 'x', label: 'Semi-axis a / diagonal 1', value: 5, show: S('ellipse', 'rhombus') }, { k: 'y', label: 'Semi-axis b / diagonal 2', value: 3, show: S('ellipse', 'rhombus') }],
    calc: function (v, X) {
      var A;
      switch (v.sh) {
        case 'rect': A = v.a * v.b; break;
        case 'square': A = v.a * v.a; break;
        case 'circle': A = Math.PI * v.r * v.r; break;
        case 'tri': A = v.a * v.hh / 2; break;
        case 'tri3': A = heron(v.a, v.b, v.c); break;
        case 'trap': A = (v.a + v.b) / 2 * v.hh; break;
        case 'para': A = v.a * v.hh; break;
        case 'ellipse': A = Math.PI * v.x * v.y; break;
        case 'sector': A = Math.PI * v.r * v.r * v.ang / 360; break;
        case 'rhombus': A = v.x * v.y / 2; break;
        case 'quad': A = heron(v.a, v.b, v.e) + heron(v.c, v.d, v.e); break;
      }
      X.need(A > 0, 'Enter the measurements.');
      var sqm = A * +v.u * +v.u, unit = U.filter(function (x) { return x[0] === v.u; })[0][1];
      return { rows: [['Area', A, function (n) { return X.num(n, 3) + ' square ' + unit; }], ['Square metres', sqm, 3], ['Square feet', sqm / 0.09290304, 2], ['Square yards (gaj)', sqm / 0.83612736, 2],
        ['Acres', sqm / 4046.8564224, 5], ['Hectares', sqm / 1e4, 5]], note: 'For an irregular four-sided plot, measure the four sides and one diagonal: the plot is split into two triangles (Heron’s formula).' };
    },
    test: [{ in: { sh: 'rect', u: '1', a: 20, b: 30 }, expect: { Area: 600, 'Square feet': 6458.34625 } }, { in: { sh: 'circle', u: '1', r: 7 }, expect: { Area: 153.93804 } },
      { in: { sh: 'tri3', u: '1', a: 3, b: 4, c: 5 }, expect: { Area: 6 } }, { in: { sh: 'trap', u: '1', a: 5, b: 7, hh: 4 }, expect: { Area: 24 } },
      { in: { sh: 'rect', u: '0.3048', a: 30, b: 40 }, expect: { 'Square yards (gaj)': 133.33333 } }, { in: { sh: 'tri3', u: '1', a: 1, b: 2, c: 5 }, expect: { _error: 'cannot make a triangle' } }]
  });
})();
