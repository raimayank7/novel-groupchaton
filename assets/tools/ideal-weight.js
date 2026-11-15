/* Infinity by GroupChatOn — ideal-weight. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'ideal-weight', {
  inputs: [{ k: 'h', label: 'Height', suffix: 'cm', value: 175 }, { k: 's', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: 'm' }],
  calc: function (v, X) {
    X.pos(v.h, 'your height');
    var i = v.h / 2.54 - 60, m = v.s === 'm', hm = v.h / 100;
    var r = { d: (m ? 50 : 45.5) + 2.3 * i, rb: (m ? 52 : 49) + (m ? 1.9 : 1.7) * i, mi: (m ? 56.2 : 53.1) + (m ? 1.41 : 1.36) * i, ha: (m ? 48 : 45.5) + (m ? 2.7 : 2.2) * i };
    var kg = function (n) { return X.num(n, 1) + ' kg'; };
    return { rows: [['Healthy weight range (BMI 18.5–24.9)', X.num(18.5 * hm * hm, 1) + ' – ' + X.num(24.9 * hm * hm, 1) + ' kg'], ['Devine formula', r.d, kg], ['Robinson formula', r.rb, kg], ['Miller formula', r.mi, kg], ['Hamwi formula', r.ha, kg]],
      note: 'These formulas were made for adults of average build and are less accurate below 152 cm (5 ft). The BMI range is the most widely used guide; muscle, age and body shape also matter.' };
  },
  test: [{ in: { h: 175, s: 'm' }, expect: { 'Devine formula': 70.46457, 'Robinson formula': 68.90551, 'Miller formula': 68.74567, 'Hamwi formula': 72.02362, 'Healthy weight range (BMI 18.5–24.9)': '56.7 – 76.3 kg' } }]
});
