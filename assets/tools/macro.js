/* Infinity by GroupChatOn — macro. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'macro', {
  inputs: [{ k: 'c', label: 'Calories a day', value: 2000 }, { k: 'p', label: 'Plan', options: [['30-40-30', 'Balanced (30% protein, 40% carbs, 30% fat)'], ['40-30-30', 'High protein (40/30/30)'], ['25-55-20', 'High carb, for endurance (25/55/20)'], ['30-20-50', 'Low carb (30/20/50)'], ['20-5-75', 'Keto (20/5/75)']], value: '30-40-30', wide: true }],
  calc: function (v, X) {
    X.pos(v.c, 'your calories'); var s = v.p.split('-').map(Number);
    return { rows: [['Protein', v.c * s[0] / 400, 'int', 'grams a day'], ['Carbohydrates', v.c * s[1] / 400, 'int', 'grams a day'], ['Fat', v.c * s[2] / 900, 'int', 'grams a day']],
      bars: [['Protein', s[0]], ['Carbs', s[1]], ['Fat', s[2]]], note: 'Protein and carbs have 4 calories a gram; fat has 9.' };
  },
  test: [{ in: { c: 2000, p: '30-40-30' }, expect: { 'Protein': 150, 'Carbohydrates': 200, 'Fat': 66.667 } }]
});
