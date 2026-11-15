/* Infinity by GroupChatOn — lens. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'lens', {
  inputs: [{ k: 'f', label: 'Focal length', suffix: 'mm', value: 50, hint: 'negative for a diverging (concave) lens' }, { k: 'o', label: 'Object distance', suffix: 'mm', value: 200 },
    { k: 'ho', label: 'Object height', suffix: 'mm', value: 10 }],
  calc: function (v, X) {
    X.need(v.f, 'Enter the focal length.'); X.pos(v.o, 'the object distance');
    X.need(Math.abs(v.o - v.f) > 1e-9, 'The object is at the focal point: the image forms at infinity.');
    var di = 1 / (1 / v.f - 1 / v.o), m = -di / v.o;
    return { rows: [['Image distance', di, function (n) { return X.num(n, 3) + ' mm'; }], ['Magnification', m, function (n) { return X.num(n, 4) + '×'; }],
      ['Image height', m * v.ho, function (n) { return X.num(n, 3) + ' mm'; }], ['Lens power', 1000 / v.f, function (n) { return X.num(n, 2) + ' D (dioptres)'; }],
      ['Image', (di > 0 ? 'Real, upside down' : 'Virtual, upright') + ', ' + (Math.abs(m) > 1 ? 'larger' : Math.abs(m) < 1 ? 'smaller' : 'same size')]],
      note: 'Thin-lens equation 1/f = 1/u + 1/v (real-is-positive). A negative image distance means the image is on the same side as the object.' };
  },
  test: [{ in: { f: 50, o: 200, ho: 10 }, expect: { 'Image distance': 66.66667, Magnification: -0.333333, 'Lens power': 20, Image: 'Real, upside down, smaller' } },
    { in: { f: 50, o: 25, ho: 10 }, expect: { 'Image distance': -50, Magnification: 2, Image: 'Virtual, upright, larger' } }]
});
