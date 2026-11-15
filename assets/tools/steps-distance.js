/* Infinity by GroupChatOn — steps-distance. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'steps-distance', {
  inputs: [{ k: 'n', label: 'Steps', value: 10000 }, { k: 'h', label: 'Your height', suffix: 'cm', value: 170 }, { k: 's', label: 'Sex', options: [['0.415', 'Male'], ['0.413', 'Female']], value: '0.415' },
    { k: 'w', label: 'Your weight', suffix: 'kg', value: 70 }],
  calc: function (v, X) {
    X.pos(v.h, 'your height');
    var stride = v.h / 100 * +v.s, km = v.n * stride / 1000;
    return { rows: [['Distance', km, function (n) { return X.num(n, 2) + ' km'; }], ['In miles', km / 1.609344, function (n) { return X.num(n, 2) + ' mi'; }], ['Your step length (about)', stride * 100, function (n) { return X.num(n, 1) + ' cm'; }],
      ['Calories burned walking (about)', km * v.w * 0.5, function (n) { return X.num(n, 0) + ' kcal'; }], ['Steps in 1 km', 1000 / stride, 'int'], ['Walking time at an easy pace', v.n / 100, function (n) { return X.dur(n * 60); }]],
      note: 'Step length is estimated as 41.5% of height for men and 41.3% for women. Walking burns about 0.5 kcal per kg of body weight per km.' };
  },
  test: [{ in: { n: 10000, h: 170, s: '0.415', w: 70 }, expect: { Distance: 7.055, 'Calories burned walking (about)': 246.925 } }]
});
