/* Infinity by GroupChatOn — brick. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'brick', {
  inputs: [{ k: 'l', label: 'Wall length', suffix: 'm', value: 10 }, { k: 'h', label: 'Wall height', suffix: 'm', value: 3 },
    { k: 't', label: 'Wall thickness', options: [['0.23', '9 inch (230 mm, full brick)'], ['0.115', '4.5 inch (115 mm, half brick)']], value: '0.23' },
    { k: 'b', label: 'Brick size (with 10 mm mortar)', options: [['0.2x0.1x0.1', 'India modular 190 × 90 × 90 mm'], ['0.24x0.115x0.08', 'India standard 230 × 110 × 70 mm'], ['0.225x0.1125x0.075', 'UK 215 × 102.5 × 65 mm'], ['0.2032x0.1016x0.0677', 'US modular 194 × 92 × 57 mm']], value: '0.2x0.1x0.1', wide: true },
    { k: 'w', label: 'Extra for breakage', suffix: '%', value: 5 }],
  calc: function (v) {
    var vol = v.l * v.h * +v.t, s = v.b.split('x').map(Number), each = s[0] * s[1] * s[2], n = vol / each, mortar = vol - n * each * 0.7;
    return { rows: [['Bricks needed', Math.ceil(n * (1 + (v.w || 0) / 100)), 'int'], ['Wall volume', vol, 3, 'm³'], ['Bricks per m³', 1 / each, 'int'], ['Cement bags (1:6 mortar, about)', vol * 0.25 * 1.33 / 7 / 0.0347, 1]],
      note: 'An estimate: subtract doors and windows from the wall size first. Mortar is about a quarter of the wall volume.' };
  },
  test: [{ in: { l: 10, h: 3, t: '0.23', b: '0.2x0.1x0.1', w: 5 }, expect: { 'Bricks needed': 3623, 'Bricks per m³': 500 } }]
});
