/* Infinity by GroupChatOn — height-convert. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'height-convert', {
  inputs: [{ k: 'mode', label: 'Convert', options: [['ft', 'Feet & inches → cm'], ['cm', 'Centimetres → feet & inches']], value: 'ft', wide: true },
    { k: 'f', label: 'Feet', value: 5, show: function (v) { return v.mode === 'ft'; } }, { k: 'i', label: 'Inches', value: 9, show: function (v) { return v.mode === 'ft'; } },
    { k: 'c', label: 'Centimetres', value: 175, show: function (v) { return v.mode === 'cm'; } }],
  calc: function (v, X) {
    var cm = v.mode === 'ft' ? ((v.f || 0) * 12 + (v.i || 0)) * 2.54 : v.c;
    X.pos(cm, 'a height');
    var tin = cm / 2.54, ft = Math.floor(tin / 12), inch = tin - ft * 12;
    if (Math.round(inch * 10) / 10 >= 12) { ft++; inch = 0; }
    return { rows: [[v.mode === 'ft' ? 'Height in cm' : 'Height in feet and inches', v.mode === 'ft' ? cm : ft + ' ft ' + (Math.round(inch * 10) / 10) + ' in', v.mode === 'ft' ? function (n) { return X.num(n, 2) + ' cm'; } : 'text'],
      ['Centimetres', cm, 2], ['Metres', cm / 100, 3], ['Total inches', tin, 2], ['Feet (decimal)', tin / 12, 3]] };
  },
  test: [{ in: { mode: 'ft', f: 5, i: 9 }, expect: { 'Height in cm': 175.26 } }, { in: { mode: 'cm', c: 180 }, expect: { 'Height in feet and inches': '5 ft 10.9 in', 'Total inches': 70.86614 } }]
});
