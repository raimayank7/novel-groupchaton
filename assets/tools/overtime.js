/* Infinity by GroupChatOn — overtime. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'overtime', {
  inputs: [{ k: 'r', label: 'Hourly rate', money: true, value: 20 }, { k: 'h', label: 'Regular hours', value: 40 }, { k: 'o', label: 'Overtime hours', value: 5 }, { k: 'x', label: 'Overtime pays', options: [['1.5', '1.5× (time and a half)'], ['2', '2× (double time)'], ['1.25', '1.25×']], value: '1.5' }],
  calc: function (v) { var reg = v.r * v.h, ot = v.r * +v.x * v.o; return { rows: [['Total pay', reg + ot, 'money'], ['Overtime pay', ot, 'money'], ['Regular pay', reg, 'money'], ['Overtime hourly rate', v.r * +v.x, 'money']] }; },
  test: [{ in: { r: 20, h: 40, o: 5, x: '1.5' }, expect: { 'Total pay': 950, 'Overtime pay': 150 } }]
});
