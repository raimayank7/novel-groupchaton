/* Infinity by GroupChatOn — waist-hip. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'waist-hip', {
  inputs: [{ k: 's', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: 'm' }, { k: 'w', label: 'Waist', suffix: 'cm or inches', value: 85 }, { k: 'h', label: 'Hips', suffix: 'same unit', value: 100 }],
  calc: function (v, X) { X.pos(v.h, 'your hip size'); var r = v.w / v.h, lim = v.s === 'm' ? 0.90 : 0.85;
    return { rows: [['Waist-to-hip ratio', r, 2], ['Health risk', r > lim ? 'Higher (above ' + lim + ')' : 'Lower (at or below ' + lim + ')']], note: 'The WHO uses 0.90 for men and 0.85 for women as the point where the risk of heart disease and diabetes rises.' }; },
  test: [{ in: { s: 'm', w: 85, h: 100 }, expect: { 'Waist-to-hip ratio': 0.85, 'Health risk': 'Lower' } }]
});
