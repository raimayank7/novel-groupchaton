/* Infinity by GroupChatOn — travel-cost. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'travel-cost', {
  inputs: [{ k: 'km', label: 'Total distance (both ways)', suffix: 'km', value: 600 }, { k: 'kml', label: 'Mileage', suffix: 'km per litre', value: 15 }, { k: 'fp', label: 'Fuel price per litre', money: true, value: 100 },
    { k: 'toll', label: 'Tolls and parking', money: true, value: 800 }, { k: 'n', label: 'Nights', value: 2 }, { k: 'stay', label: 'Stay per night', money: true, value: 2500 },
    { k: 'food', label: 'Food per person per day', money: true, value: 600 }, { k: 'days', label: 'Days', value: 3 }, { k: 'ppl', label: 'People', value: 4 }, { k: 'oth', label: 'Other (tickets, shopping)', money: true, value: 2000 }],
  calc: function (v, X) {
    X.pos(v.ppl, 'the number of people'); var fuel = v.kml ? v.km / v.kml * v.fp : 0, stay = v.n * v.stay, food = v.food * v.days * v.ppl, total = fuel + (v.toll || 0) + stay + food + (v.oth || 0);
    return { rows: [['Total trip cost', total, 'money'], ['Per person', total / v.ppl, 'money'], ['Fuel', fuel, 'money'], ['Stay', stay, 'money'], ['Food', food, 'money']], bars: [['Fuel', fuel], ['Tolls', v.toll || 0], ['Stay', stay], ['Food', food], ['Other', v.oth || 0]] };
  },
  test: [{ in: { km: 600, kml: 15, fp: 100, toll: 800, n: 2, stay: 2500, food: 600, days: 3, ppl: 4, oth: 2000 }, expect: { 'Total trip cost': 19000, 'Per person': 4750 } }]
});
