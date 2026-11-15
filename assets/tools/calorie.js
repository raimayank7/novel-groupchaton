/* Infinity by GroupChatOn — calorie. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'calorie', {
  inputs: [{ k: 's', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: 'm' }, { k: 'a', label: 'Age', suffix: 'years', value: 30 }, { k: 'kg', label: 'Weight', suffix: 'kg', value: 70 }, { k: 'cm', label: 'Height', suffix: 'cm', value: 175 },
    { k: 'act', label: 'Activity', options: [['1.2', 'Little or no exercise'], ['1.375', 'Light: 1–3 days a week'], ['1.55', 'Moderate: 3–5 days'], ['1.725', 'Hard: 6–7 days'], ['1.9', 'Very hard or physical job']], value: '1.55' }],
  calc: function (v, X) {
    X.pos(v.kg, 'your weight'); var b = 10 * v.kg + 6.25 * v.cm - 5 * v.a + (v.s === 'm' ? 5 : -161), t = b * +v.act;
    return { rows: [['Calories to keep your weight', t, 'int', 'a day'], ['Lose 0.5 kg a week', t - 550, 'int'], ['Lose 1 kg a week', Math.max(v.s === 'm' ? 1500 : 1200, t - 1100), 'int'], ['Gain 0.5 kg a week', t + 550, 'int'], ['BMR (at rest)', b, 'int']],
      note: 'Mifflin-St Jeor equation. Do not go below about 1,200 (women) or 1,500 (men) calories a day without medical advice.' };
  },
  test: [{ in: { s: 'm', a: 30, kg: 70, cm: 175, act: '1.55' }, expect: { 'Calories to keep your weight': 2555.5625, 'Lose 0.5 kg a week': 2005.5625 } }]
});
