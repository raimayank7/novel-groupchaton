/* Infinity by GroupChatOn — trig. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'trig', {
  inputs: [{ k: 'x', label: 'Angle', value: 30 }, { k: 'u', label: 'Unit', options: [['deg', 'Degrees'], ['rad', 'Radians']], value: 'deg' }, { k: 'y', label: 'Value for inverse (asin, acos, atan)', value: 0.5 }],
  calc: function (v) {
    var r = v.u === 'deg' ? v.x * Math.PI / 180 : v.x, c = function (n) { return Math.abs(n) < 1e-12 ? 0 : n; }, t = Math.abs(Math.cos(r)) < 1e-12 ? Infinity : c(Math.tan(r));
    var d = function (rad) { return v.u === 'deg' ? rad * 180 / Math.PI : rad; };
    return { rows: [['sin', c(Math.sin(r)), 10], ['cos', c(Math.cos(r)), 10], ['tan', t === Infinity ? 'not defined (infinite)' : t, 10], ['cot', Math.abs(Math.sin(r)) < 1e-12 ? 'not defined (infinite)' : c(1 / Math.tan(r)), 10],
      ['asin(' + v.y + ')', Math.abs(v.y) <= 1 ? d(Math.asin(v.y)) : '—', 8], ['acos(' + v.y + ')', Math.abs(v.y) <= 1 ? d(Math.acos(v.y)) : '—', 8], ['atan(' + v.y + ')', d(Math.atan(v.y)), 8]] };
  },
  test: [{ in: { x: 30, u: 'deg', y: 0.5 }, expect: { 'sin': 0.5, 'cos': 0.8660254038, 'asin(0.5)': 30 } }]
});
