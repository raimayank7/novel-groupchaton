/* Infinity by GroupChatOn — bmr. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'bmr', {
  inputs: [{ k: 's', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: 'm' }, { k: 'a', label: 'Age', suffix: 'years', value: 30 },
    { k: 'kg', label: 'Weight', suffix: 'kg', value: 70 }, { k: 'cm', label: 'Height', suffix: 'cm', value: 175 }],
  calc: function (v, X) {
    X.pos(v.kg, 'your weight'); X.pos(v.cm, 'your height');
    var b = 10 * v.kg + 6.25 * v.cm - 5 * v.a + (v.s === 'm' ? 5 : -161);
    return { rows: [['BMR (calories a day at rest)', b, 'int'], ['Little or no exercise', b * 1.2, 'int'], ['Light exercise 1–3 days a week', b * 1.375, 'int'],
      ['Moderate exercise 3–5 days', b * 1.55, 'int'], ['Hard exercise 6–7 days', b * 1.725, 'int'], ['Very hard / physical job', b * 1.9, 'int']], note: 'Mifflin-St Jeor equation, the one most dietitians use.' };
  },
  test: [{ in: { s: 'm', a: 30, kg: 70, cm: 175 }, expect: { 'BMR (calories a day at rest)': 1648.75, 'Moderate exercise 3–5 days': 2555.5625 } }, { in: { s: 'f', a: 30, kg: 60, cm: 165 }, expect: { 'BMR (calories a day at rest)': 1320.25 } }]
});
