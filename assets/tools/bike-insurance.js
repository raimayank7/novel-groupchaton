/* Infinity by GroupChatOn — bike-insurance. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'bike-insurance', {
  inputs: [{ k: 'price', label: 'Ex-showroom price when new', money: true, value: 100000 }, { k: 'age', label: 'Bike’s age', options: [['5', 'Under 6 months'], ['15', '6 months – 1 year'], ['20', '1–2 years'], ['30', '2–3 years'], ['40', '3–4 years'], ['50', '4–5 years']], value: '20' },
    { k: 'cc', label: 'Engine', options: [['538', 'Up to 75 cc'], ['714', '75–150 cc'], ['1366', '150–350 cc'], ['2804', 'Above 350 cc']], value: '714' },
    { k: 'ncb', label: 'No-claim bonus', options: [['0', 'None'], ['20', '20%'], ['25', '25%'], ['35', '35%'], ['45', '45%'], ['50', '50%']], value: '20' }, { k: 'od', label: 'Own-damage rate', suffix: '% of IDV', value: 1.8 }],
  calc: function (v) {
    var idv = v.price * (1 - +v.age / 100), od = idv * v.od / 100 * (1 - +v.ncb / 100), tp = +v.cc, net = od + tp;
    return { rows: [['Estimated premium', net * 1.18, 'money', 'including GST'], ['IDV', idv, 'money'], ['Own damage after NCB', od, 'money'], ['Third-party premium (1 year)', tp, 'money']],
      note: 'Third-party rates for 2026-27 (IRDAI; same as notified in 2022). New two-wheelers need a 5-year third-party cover when bought.' };
  },
  test: [{ in: { price: 100000, age: '20', cc: '714', ncb: '20', od: 1.8 }, expect: { 'IDV': 80000, 'Own damage after NCB': 1152 } }]
});
