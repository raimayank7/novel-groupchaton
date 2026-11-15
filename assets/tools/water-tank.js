/* Infinity by GroupChatOn — water-tank. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'water-tank', {
  inputs: [{ k: 's', label: 'Tank shape', options: [['cyl', 'Round (cylinder)'], ['box', 'Rectangular'], ['hcyl', 'Round, lying down (horizontal)']], value: 'cyl' },
    { k: 'd', label: 'Diameter', suffix: 'm', value: 1.2, show: function (v) { return v.s !== 'box'; } }, { k: 'l', label: 'Length', suffix: 'm', value: 2, show: function (v) { return v.s !== 'cyl'; } },
    { k: 'w', label: 'Width', suffix: 'm', value: 1.5, show: function (v) { return v.s === 'box'; } }, { k: 'h', label: 'Height', suffix: 'm', value: 1.5, show: function (v) { return v.s !== 'hcyl'; } },
    { k: 'f', label: 'Water level (optional)', suffix: '% full', value: 100 }],
  calc: function (v) {
    var m3 = v.s === 'box' ? v.l * v.w * v.h : v.s === 'cyl' ? Math.PI * v.d * v.d / 4 * v.h : Math.PI * v.d * v.d / 4 * v.l, now = m3 * (v.f || 0) / 100;
    return { rows: [['Capacity', m3 * 1000, 'int', 'litres'], ['Water now', now * 1000, 'int', 'litres'], ['US gallons', m3 * 264.172, 'int'], ['UK gallons', m3 * 219.969, 'int'], ['Cubic feet', m3 * 35.3147, 1]],
      note: v.s === 'hcyl' && v.f < 100 ? 'For a horizontal tank the water level is not proportional to the volume; this uses the fill share you enter.' : '' };
  },
  test: [{ in: { s: 'cyl', d: 1.2, h: 1.5, f: 100 }, expect: { 'Capacity': 1696.46 } }, { in: { s: 'box', l: 2, w: 1.5, h: 1, f: 100 }, expect: { 'Capacity': 3000 } }]
});
