/* Infinity by GroupChatOn — protein. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'protein', {
  inputs: [{ k: 'kg', label: 'Weight', suffix: 'kg', value: 70 }, { k: 'g', label: 'You are', options: [['0.8', 'Mostly sitting (0.8 g per kg)'], ['1.0', 'Over 65, or lightly active (1.0)'], ['1.3', 'Active / regular exercise (1.3)'], ['1.8', 'Building muscle (1.8)'], ['1.1', 'Pregnant or breastfeeding (1.1)']], value: '0.8', wide: true }],
  calc: function (v, X) { X.pos(v.kg, 'your weight'); var g = v.kg * +v.g; return { rows: [['Protein a day', g, 'int', 'grams'], ['Eggs (6 g each) to get it all', g / 6, 'int'], ['Dal / lentils (cooked, 9 g a cup)', g / 9, 1, 'cups'], ['Paneer (18 g per 100 g)', g / 18 * 100, 'int', 'grams']], note: 'Spread protein over your meals. People with kidney disease should follow their doctor’s advice.' }; },
  test: [{ in: { kg: 70, g: '0.8' }, expect: { 'Protein a day': 56 } }]
});
