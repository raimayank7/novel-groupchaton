/* Infinity by GroupChatOn — fuel-cost. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'fuel-cost', {
  inputs: [{ k: 'u', label: 'Units', options: [['kml', 'km and km per litre'], ['l100', 'km and litres per 100 km'], ['mpg', 'miles and miles per US gallon'], ['mpguk', 'miles and miles per UK gallon']], value: 'kml', wide: true },
    { k: 'd', label: 'Distance', value: 500 }, { k: 'e', label: 'Fuel economy', value: 15 }, { k: 'p', label: 'Fuel price per litre / gallon', money: true, value: 100 }, { k: 'n', label: 'People sharing', value: 1 }],
  calc: function (v, X) {
    X.pos(v.e, 'the fuel economy');
    var fuel = v.u === 'kml' ? v.d / v.e : v.u === 'l100' ? v.d * v.e / 100 : v.d / v.e, unit = v.u.indexOf('mpg') === 0 ? 'gallons' : 'litres';
    return { rows: [['Fuel cost', fuel * v.p, 'money'], ['Fuel needed', X.num(fuel, 2) + ' ' + unit], ['Cost per ' + (unit === 'litres' ? 'km' : 'mile'), fuel * v.p / v.d, 'money'], ['Each person pays', fuel * v.p / (v.n || 1), 'money']] };
  },
  test: [{ in: { u: 'kml', d: 500, e: 15, p: 100, n: 1 }, expect: { 'Fuel cost': 3333.33 } }, { in: { u: 'l100', d: 200, e: 7, p: 1.8, n: 2 }, expect: { 'Fuel cost': 25.2, 'Each person pays': 12.6 } }]
});
