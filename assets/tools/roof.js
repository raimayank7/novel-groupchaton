/* Infinity by GroupChatOn — roof. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'roof', {
  inputs: [{ k: 'rise', label: 'Rise (height)', value: 4 }, { k: 'run', label: 'Run (half the width)', value: 12 }, { k: 'fl', label: 'Floor area under the roof (optional)', suffix: 'm² or ft²', value: 100 }],
  calc: function (v, X) { X.pos(v.run, 'the run'); var ang = Math.atan(v.rise / v.run) * 180 / Math.PI, f = Math.sqrt(1 + Math.pow(v.rise / v.run, 2));
    return { rows: [['Roof pitch', ang, 2, 'degrees'], ['Pitch as x / 12', X.num(12 * v.rise / v.run, 2) + ' / 12'], ['Slope factor', f, 4], ['Rafter length', Math.hypot(v.rise, v.run), 3], ['Roof area', (v.fl || 0) * f, 1, 'same unit as the floor area']] }; },
  test: [{ in: { rise: 4, run: 12, fl: 100 }, expect: { 'Roof pitch': 18.4349, 'Slope factor': 1.0541, 'Roof area': 105.409 } }]
});
