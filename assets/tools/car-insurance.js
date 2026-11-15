/* Infinity by GroupChatOn — car-insurance. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'car-insurance', {
  inputs: [{ k: 'price', label: 'Ex-showroom price when new', money: true, value: 800000 }, { k: 'age', label: 'Car’s age', options: [['5', 'Under 6 months'], ['15', '6 months – 1 year'], ['20', '1–2 years'], ['30', '2–3 years'], ['40', '3–4 years'], ['50', '4–5 years']], value: '30' },
    { k: 'cc', label: 'Engine', options: [['2094', 'Up to 1,000 cc'], ['3416', '1,000–1,500 cc'], ['7897', 'Above 1,500 cc']], value: '3416' },
    { k: 'ncb', label: 'No-claim bonus', options: [['0', 'None (claim last year or new)'], ['20', '20% (1 claim-free year)'], ['25', '25% (2 years)'], ['35', '35% (3 years)'], ['45', '45% (4 years)'], ['50', '50% (5+ years)']], value: '25' },
    { k: 'od', label: 'Own-damage rate from your quote', suffix: '% of IDV', value: 2.5, hint: 'Usually 1.5%–3.5% depending on city, car and insurer.' }, { k: 'pa', label: 'Personal accident cover for the owner', money: true, value: 375 }],
  calc: function (v) {
    var idv = v.price * (1 - +v.age / 100), odBase = idv * v.od / 100, ncb = odBase * +v.ncb / 100, od = odBase - ncb, tp = +v.cc, net = od + tp + (v.pa || 0), gst = net * 0.18;
    return { rows: [['Estimated premium', net + gst, 'money', 'including 18% GST'], ['IDV (insured value)', idv, 'money'], ['Own damage after NCB', od, 'money'], ['No-claim bonus saved', ncb, 'money'], ['Third-party premium', tp, 'money'], ['GST', gst, 'money']],
      note: 'IDV uses the IRDAI depreciation schedule (5% to 50% by age; older cars are valued by agreement). Third-party premiums are the last rates notified by the government (June 2022); check your quote, as the government revises them. Electric cars get a 15% discount on third-party premium.' };
  },
  test: [{ in: { price: 800000, age: '30', cc: '3416', ncb: '25', od: 2.5, pa: 375 }, expect: { 'IDV (insured value)': 560000, 'Own damage after NCB': 10500, 'Estimated premium': 16863.38 } }]
});
