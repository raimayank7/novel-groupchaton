/* Infinity by GroupChatOn — tile. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'tile', {
  inputs: [{ k: 'l', label: 'Floor / wall length', suffix: 'm', value: 4 }, { k: 'w', label: 'Width (or height)', suffix: 'm', value: 5 },
    { k: 'ts', label: 'Tile size', options: [['60x60', '60 × 60 cm (2 × 2 ft)'], ['80x80', '80 × 80 cm'], ['60x120', '60 × 120 cm'], ['30x30', '30 × 30 cm (1 × 1 ft)'], ['30x60', '30 × 60 cm'], ['40x40', '40 × 40 cm'], ['20x20', '20 × 20 cm']], value: '60x60' },
    { k: 'box', label: 'Tiles in a box', value: 4 }, { k: 'waste', label: 'Extra for cutting and breakage', suffix: '%', value: 10 }],
  calc: function (v, X) {
    var t = v.ts.split('x').map(Number), ta = t[0] * t[1] / 10000, area = v.l * v.w; X.pos(area, 'the area');
    var n = Math.ceil(area / ta * (1 + (v.waste || 0) / 100));
    return { rows: [['Tiles needed', n, 'int'], ['Boxes', v.box ? Math.ceil(n / v.box) : NaN, 'int'], ['Area', area, 2, 'm²'], ['Area in sq ft', area * 10.7639, 'int'], ['Tiles without extra', area / ta, 1]] };
  },
  test: [{ in: { l: 4, w: 5, ts: '60x60', box: 4, waste: 10 }, expect: { 'Tiles needed': 62, 'Boxes': 16 } }]
});
