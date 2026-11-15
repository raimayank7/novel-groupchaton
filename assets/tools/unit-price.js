/* Infinity by GroupChatOn — unit-price. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'unit-price', {
  inputs: [{ k: 'h1', type: 'heading', label: 'Pack A' }, { k: 'pa', label: 'Price', money: true, value: 100 }, { k: 'qa', label: 'Quantity (g, ml, pieces…)', value: 500 },
    { k: 'h2', type: 'heading', label: 'Pack B' }, { k: 'pb', label: 'Price', money: true, value: 180 }, { k: 'qb', label: 'Quantity', value: 1000 },
    { k: 'h3', type: 'heading', label: 'Pack C (optional)' }, { k: 'pc', label: 'Price', money: true, value: 0 }, { k: 'qc', label: 'Quantity', value: 0 }],
  calc: function (v, X) {
    var packs = [['A', v.pa, v.qa], ['B', v.pb, v.qb], ['C', v.pc, v.qc]].filter(function (p) { return p[1] > 0 && p[2] > 0; }); X.need(packs.length >= 2, 'Fill in at least two packs.');
    packs.forEach(function (p) { p.push(p[1] / p[2]); }); var best = packs.slice().sort(function (a, b) { return a[3] - b[3]; })[0], worst = packs.slice().sort(function (a, b) { return b[3] - a[3]; })[0];
    return { rows: [['Cheapest', 'Pack ' + best[0], null, 'saves ' + X.num(100 * (1 - best[3] / worst[3]), 1) + '% per unit']].concat(packs.map(function (p) { return ['Pack ' + p[0] + ' per 100 units', p[3] * 100, 'money']; })) };
  },
  test: [{ in: { pa: 100, qa: 500, pb: 180, qb: 1000, pc: 0, qc: 0 }, expect: { 'Cheapest': 'Pack B', 'Pack A per 100 units': 20 } }]
});
