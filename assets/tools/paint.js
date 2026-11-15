/* Infinity by GroupChatOn — paint. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'paint', {
  inputs: [{ k: 'l', label: 'Room length', suffix: 'm', value: 4 }, { k: 'w', label: 'Room width', suffix: 'm', value: 5 }, { k: 'h', label: 'Wall height', suffix: 'm', value: 3 },
    { k: 'd', label: 'Doors', value: 1 }, { k: 'win', label: 'Windows', value: 1 }, { k: 'ceil', label: 'Paint the ceiling too', type: 'check', value: false },
    { k: 'c', label: 'Coats', value: 2 }, { k: 'cov', label: 'Coverage of the paint', suffix: 'm² per litre per coat', value: 10 }],
  calc: function (v, X) {
    var area = 2 * (v.l + v.w) * v.h - (v.d || 0) * 1.9 - (v.win || 0) * 1.5 + (v.ceil ? v.l * v.w : 0); X.pos(area, 'the room size');
    var L = area * (v.c || 1) / (v.cov || 10);
    return { rows: [['Paint needed', L, 1, 'litres'], ['Area to paint', area, 1, 'm²'], ['Area in sq ft', area * 10.7639, 'int'], ['Primer (one coat)', area / 12, 1, 'litres']],
      note: 'Doors counted as 1.9 m² and windows as 1.5 m². Check the coverage on your paint tin: emulsions cover about 8–12 m² per litre per coat.' };
  },
  test: [{ in: { l: 4, w: 5, h: 3, d: 1, win: 1, ceil: false, c: 2, cov: 10 }, expect: { 'Paint needed': 10.12, 'Area to paint': 50.6 } }]
});
