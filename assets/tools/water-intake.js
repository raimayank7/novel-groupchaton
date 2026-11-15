/* Infinity by GroupChatOn — water-intake. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'water-intake', {
  inputs: [{ k: 'kg', label: 'Your weight', suffix: 'kg', value: 70 }, { k: 'ex', label: 'Exercise a day', suffix: 'minutes', value: 0 }, { k: 'hot', label: 'I live in a hot or humid place', type: 'check', value: false }],
  calc: function (v, X) { X.pos(v.kg, 'your weight'); var l = v.kg * 0.033 + (v.ex || 0) / 30 * 0.35 + (v.hot ? 0.5 : 0); return { rows: [['Water a day', l, 2, 'litres'], ['Glasses (250 ml)', Math.ceil(l / 0.25), 'int'], ['US fluid ounces', l * 33.814, 0]], note: 'About a fifth of this usually comes from food. Ask your doctor if you have kidney or heart conditions.' }; },
  test: [{ in: { kg: 70, ex: 0, hot: false }, expect: { 'Water a day': 2.31 } }, { in: { kg: 70, ex: 60, hot: true }, expect: { 'Water a day': 3.51 } }]
});
