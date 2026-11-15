/* Infinity by GroupChatOn — ac-size. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'ac-size', {
  inputs: [{ k: 'a', label: 'Room area', value: 150 }, { k: 'u', label: 'Unit', options: [['ft', 'Square feet'], ['m', 'Square metres']], value: 'ft' },
    { k: 'sun', label: 'Room gets', options: [['1', 'Normal sun'], ['0.9', 'Mostly shade'], ['1.1', 'Lots of sun / top floor']], value: '1' }, { k: 'p', label: 'People usually in the room', value: 2 },
    { k: 'k', label: 'It is a kitchen', type: 'check', value: false }, { k: 'hot', label: 'Very hot climate (45 °C summers)', type: 'check', value: false }],
  calc: function (v, X) {
    var ft = v.u === 'm' ? v.a * 10.7639 : v.a; X.pos(ft, 'the room area');
    var T = [[150, 5000], [250, 6000], [300, 7000], [350, 8000], [400, 9000], [450, 10000], [550, 12000], [700, 14000], [1000, 18000], [1200, 21000], [1400, 23000], [1500, 24000], [2000, 30000], [2500, 34000]];
    var btu = (T.filter(function (r) { return ft <= r[0]; })[0] || [0, 34000 + (ft - 2500) * 14])[1];
    btu = btu * +v.sun + Math.max(0, (v.p || 0) - 2) * 600 + (v.k ? 4000 : 0); if (v.hot) btu *= 1.3;
    var tons = btu / 12000, pick = [0.75, 1, 1.5, 2, 2.5, 3, 4, 5].filter(function (t) { return t >= tons - 0.05; })[0] || Math.ceil(tons);
    return { rows: [['Suggested AC', pick, null, 'ton'], ['Cooling needed', btu, 'int', 'BTU/hour'], ['In tons', tons, 2], ['Area', ft, 'int', 'sq ft']], note: 'Based on the ENERGY STAR sizing chart with its sun, people and kitchen adjustments. Very hot climates, poor insulation and top floors may need the next size up.' };
  },
  test: [{ in: { a: 200, u: 'ft', sun: '1', p: 2, k: false, hot: false }, expect: { 'Cooling needed': 6000, 'Suggested AC': 0.75 } }]
});
