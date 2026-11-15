/* Infinity by GroupChatOn — solar. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'solar', {
  inputs: [{ k: 'u', label: 'Electricity used a month', suffix: 'units (kWh)', value: 300 }, { k: 'sun', label: 'Peak sun hours a day', value: 4.5, hint: 'About 4–5.5 in most of India, 3–4 in northern Europe, 5–6 in deserts.' },
    { k: 'w', label: 'Panel size', suffix: 'watts', value: 550 }, { k: 'r', label: 'Electricity price per unit', money: true, value: 8 }, { k: 'cost', label: 'Installed cost per kW', money: true, value: 60000 }],
  calc: function (v, X) {
    X.pos(v.sun, 'sun hours'); var kw = v.u / 30 / v.sun / 0.8, n = Math.ceil(kw * 1000 / v.w), size = n * v.w / 1000, save = Math.min(v.u, size * v.sun * 30 * 0.8) * v.r * 12, cost = size * v.cost;
    return { rows: [['Panels needed', n, 'int', v.w + ' W each'], ['System size', size, 2, 'kW'], ['Roof space (about)', n * 2.6, 'int', 'm²'], ['Savings a year', save, 'money'], ['System cost (about)', cost, 'money'], ['Pays back in', cost / save, 1, 'years']],
      note: 'Assumes 80% overall efficiency. In India the PM Surya Ghar scheme gives a subsidy on home rooftop systems up to 3 kW; check pmsuryaghar.gov.in.' };
  },
  test: [{ in: { u: 300, sun: 4.5, w: 550, r: 8, cost: 60000 }, expect: { 'Panels needed': 6, 'System size': 3.3 } }]
});
