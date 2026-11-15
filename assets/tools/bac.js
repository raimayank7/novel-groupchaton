/* Infinity by GroupChatOn — bac. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'bac', {
  inputs: [{ k: 'n', label: 'Number of drinks', value: 3 }, { k: 'g', label: 'Size of one drink', options: [['10', 'Standard drink 10 g alcohol (India, UK 8 g, Australia)'], ['14', 'US standard drink 14 g (a can of beer, a glass of wine, a shot)'], ['8', 'UK unit 8 g']], value: '14', wide: true },
    { k: 'kg', label: 'Your weight', suffix: 'kg', value: 80 }, { k: 's', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: 'm' }, { k: 'h', label: 'Hours since the first drink', value: 1 }],
  calc: function (v, X) {
    X.pos(v.kg, 'your weight'); var b = Math.max(0, v.n * +v.g / (v.kg * 1000 * (v.s === 'm' ? 0.68 : 0.55)) * 100 - 0.015 * (v.h || 0));
    return { rows: [['Estimated blood alcohol', b, 3, '% BAC'], ['Hours until about zero', b / 0.015, 1], ['Legal driving limit in India', b > 0.03 ? 'Over the 0.03% limit: do not drive' : 'Below 0.03%, but still impaired: best not to drive']],
      note: 'A rough Widmark estimate only. Food, health, medicine and tiredness change it a lot. Never use it to decide whether to drive; the safe level for driving is zero.' };
  },
  test: [{ in: { n: 3, g: '14', kg: 80, s: 'm', h: 1 }, expect: { 'Estimated blood alcohol': 0.06221 } }]
});
