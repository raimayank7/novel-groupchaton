/* Infinity by GroupChatOn — percentage. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'percentage', {
  inputs: [
    { k: 'm', label: 'What do you want to know?', wide: true, options: [['of', 'What is X% of Y?'], ['is', 'X is what % of Y?'], ['chg', 'Percentage change from X to Y'], ['add', 'Y plus X%'], ['sub', 'Y minus X%']], value: 'of' },
    { k: 'x', label: 'X', value: 15 }, { k: 'y', label: 'Y', value: 200 }],
  calc: function (v, X) {
    X.need(!isNaN(v.x) && !isNaN(v.y), 'Enter both numbers.');
    if (v.m === 'of') return { rows: [[v.x + '% of ' + v.y, v.x * v.y / 100]] };
    if (v.m === 'is') { X.need(v.y !== 0, 'Y cannot be 0.'); return { rows: [[v.x + ' is this % of ' + v.y, 100 * v.x / v.y, 'pct']] }; }
    if (v.m === 'chg') { X.need(v.x !== 0, 'X cannot be 0.'); var c = 100 * (v.y - v.x) / Math.abs(v.x); return { rows: [[c >= 0 ? 'Increase' : 'Decrease', Math.abs(c), 'pct'], ['Difference', v.y - v.x]] }; }
    if (v.m === 'add') return { rows: [[v.y + ' + ' + v.x + '%', v.y * (1 + v.x / 100)], ['Amount added', v.y * v.x / 100]] };
    return { rows: [[v.y + ' − ' + v.x + '%', v.y * (1 - v.x / 100)], ['Amount taken off', v.y * v.x / 100]] };
  },
  test: [{ in: { m: 'of', x: 15, y: 200 }, expect: { '15% of 200': 30 } }, { in: { m: 'is', x: 30, y: 120 }, expect: { '30 is this % of 120': 25 } },
         { in: { m: 'chg', x: 80, y: 100 }, expect: { 'Increase': 25 } }]
});
