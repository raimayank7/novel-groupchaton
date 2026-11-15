/* Infinity by GroupChatOn — perimeter. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var SH = [['rect', 'Rectangle'], ['square', 'Square'], ['circle', 'Circle (circumference)'], ['tri', 'Triangle'], ['poly', 'Regular polygon'], ['ellipse', 'Ellipse'], ['arc', 'Sector / arc']];
  var S = function () { var s = [].slice.call(arguments); return function (v) { return s.indexOf(v.sh) >= 0; }; };
  GCOTools.engine('calc', 'perimeter', {
    inputs: [{ k: 'sh', label: 'Shape', options: SH, value: 'circle', wide: true },
      { k: 'a', label: 'Length / side a', value: 10, show: S('rect', 'square', 'tri', 'poly') }, { k: 'b', label: 'Width / side b', value: 6, show: S('rect', 'tri') },
      { k: 'c', label: 'Side c', value: 8, show: S('tri') }, { k: 'n', label: 'Number of sides', value: 6, show: S('poly') },
      { k: 'r', label: 'Radius', value: 7, show: S('circle', 'arc') }, { k: 'ang', label: 'Angle', suffix: 'degrees', value: 90, show: S('arc') },
      { k: 'x', label: 'Semi-axis a', value: 5, show: S('ellipse') }, { k: 'y', label: 'Semi-axis b', value: 3, show: S('ellipse') }],
    calc: function (v, X) {
      var P, P2 = Math.PI, extra = [];
      switch (v.sh) {
        case 'rect': P = 2 * (v.a + v.b); break;
        case 'square': P = 4 * v.a; break;
        case 'circle': P = 2 * P2 * v.r; extra.push(['Diameter', 2 * v.r, 3], ['Area', P2 * v.r * v.r, 3]); break;
        case 'tri': X.need(v.a + v.b > v.c && v.a + v.c > v.b && v.b + v.c > v.a, 'Those three sides cannot make a triangle.'); P = v.a + v.b + v.c; break;
        case 'poly': X.need(v.n >= 3, 'A polygon has 3 or more sides.'); P = v.n * v.a; extra.push(['Each inside angle', (v.n - 2) * 180 / v.n, function (n) { return X.num(n, 2) + '°'; }]); break;
        case 'ellipse': P = P2 * (3 * (v.x + v.y) - Math.sqrt((3 * v.x + v.y) * (v.x + 3 * v.y))); break;
        case 'arc': var arc = 2 * P2 * v.r * v.ang / 360; P = arc + 2 * v.r; extra.push(['Arc length only', arc, 3]); break;
      }
      X.need(P > 0, 'Enter the measurements.');
      return { rows: [['Perimeter', P, 4]].concat(extra), note: v.sh === 'ellipse' ? 'Ellipse perimeter by Ramanujan’s formula (very accurate).' : 'Same unit as your measurements.' };
    },
    test: [{ in: { sh: 'circle', r: 7 }, expect: { Perimeter: 43.98230, Area: 153.93804 } }, { in: { sh: 'ellipse', x: 5, y: 3 }, expect: { Perimeter: 25.52699 } }, { in: { sh: 'rect', a: 10, b: 6 }, expect: { Perimeter: 32 } },
      { in: { sh: 'poly', a: 10, n: 6 }, expect: { Perimeter: 60, 'Each inside angle': 120 } }]
  });
})();
