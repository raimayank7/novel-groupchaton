/* Infinity by GroupChatOn — triangle. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'triangle', {
  inputs: [{ k: 'm', label: 'I know', options: [['sss', 'Three sides'], ['sas', 'Two sides and the angle between'], ['asa', 'Two angles and the side between']], value: 'sss', wide: true },
    { k: 'a', label: 'Side a', value: 3, show: function (v) { return v.m !== 'asa'; } }, { k: 'b', label: 'Side b', value: 4, show: function (v) { return v.m !== 'asa'; } },
    { k: 'c', label: 'Side c', value: 5, show: function (v) { return v.m !== 'sas'; } }, { k: 'C', label: 'Angle C (between a and b), degrees', value: 90, show: function (v) { return v.m === 'sas'; } },
    { k: 'A', label: 'Angle A, degrees', value: 30, show: function (v) { return v.m === 'asa'; } }, { k: 'B', label: 'Angle B, degrees', value: 60, show: function (v) { return v.m === 'asa'; } }],
  calc: function (v, X) {
    var R = Math.PI / 180, a, b, c, A, B, C;
    if (v.m === 'sss') { a = v.a; b = v.b; c = v.c; X.need(a + b > c && a + c > b && b + c > a, 'These sides cannot make a triangle.');
      A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) / R; B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) / R; C = 180 - A - B; }
    else if (v.m === 'sas') { a = v.a; b = v.b; C = v.C; X.need(C > 0 && C < 180, 'The angle must be between 0 and 180.'); c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C * R));
      A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) / R; B = 180 - A - C; }
    else { A = v.A; B = v.B; C = 180 - A - B; c = v.c; X.need(C > 0, 'The two angles must add up to less than 180.'); a = c * Math.sin(A * R) / Math.sin(C * R); b = c * Math.sin(B * R) / Math.sin(C * R); }
    var s = (a + b + c) / 2, area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    var kind = Math.abs(C - 90) < 1e-9 || Math.abs(A - 90) < 1e-9 || Math.abs(B - 90) < 1e-9 ? 'right-angled' : Math.max(A, B, C) > 90 ? 'obtuse' : 'acute';
    return { rows: [['Area', area], ['Sides a, b, c', X.num(a, 4) + ', ' + X.num(b, 4) + ', ' + X.num(c, 4)], ['Angles A, B, C', X.num(A, 4) + '°, ' + X.num(B, 4) + '°, ' + X.num(C, 4) + '°'], ['Perimeter', a + b + c], ['Type', kind]] };
  },
  test: [{ in: { m: 'sss', a: 3, b: 4, c: 5 }, expect: { 'Area': 6, 'Perimeter': 12, 'Type': 'right' } }, { in: { m: 'sas', a: 3, b: 4, C: 90 }, expect: { 'Area': 6 } }]
});
