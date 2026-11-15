/* Infinity by GroupChatOn — electricity. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'electricity', {
  inputs: [{ k: 'w', label: 'Power of the appliance', suffix: 'watts', value: 1000 }, { k: 'q', label: 'How many', value: 1 }, { k: 'h', label: 'Hours used a day', value: 8 },
    { k: 'd', label: 'Days', value: 30 }, { k: 'r', label: 'Price per unit (kWh)', money: true, value: 8 }],
  calc: function (v) { var kwh = v.w * v.q * v.h * v.d / 1000; return { rows: [['Bill', kwh * v.r, 'money'], ['Units (kWh)', kwh, 2], ['Per day', kwh * v.r / v.d, 'money'], ['Per year at this use', kwh * v.r * 365 / v.d, 'money']], note: 'A unit on your bill is one kilowatt-hour: 1,000 watts for one hour. Many tariffs have slabs and fixed charges, so your bill can differ.' }; },
  test: [{ in: { w: 1000, q: 1, h: 8, d: 30, r: 8 }, expect: { 'Units (kWh)': 240, 'Bill': 1920 } }]
});
