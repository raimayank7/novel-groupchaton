/* Infinity by GroupChatOn — split-bill. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'split-bill', {
  inputs: [{ k: 'x', label: 'Who paid what, one person per line (name and amount)', type: 'textarea', rows: 6, value: 'Asha 1200\nRavi 300\nMeena 0' }],
  calc: function (v, X) {
    var ppl = []; String(v.x).split('\n').forEach(function (l) { var m = l.trim().match(/^(.+?)\s+(-?[\d,]*\.?\d+)$/); if (m) ppl.push([m[1], parseFloat(m[2].replace(/,/g, ''))]); else if (l.trim()) ppl.push([l.trim(), 0]); });
    X.need(ppl.length >= 2, 'Add at least two people.');
    var total = ppl.reduce(function (s, p) { return s + p[1]; }, 0), share = total / ppl.length;
    var cred = ppl.map(function (p) { return [p[0], p[1] - share]; }).filter(function (p) { return p[1] > 0.005; }).sort(function (a, b) { return b[1] - a[1]; });
    var debt = ppl.map(function (p) { return [p[0], share - p[1]]; }).filter(function (p) { return p[1] > 0.005; }).sort(function (a, b) { return b[1] - a[1]; });
    var moves = [];
    while (cred.length && debt.length) { var amt = Math.min(cred[0][1], debt[0][1]); moves.push(debt[0][0] + ' pays ' + cred[0][0] + ' ' + T().money(amt)); cred[0][1] -= amt; debt[0][1] -= amt; if (cred[0][1] < 0.005) cred.shift(); if (debt[0][1] < 0.005) debt.shift(); }
    function T() { return window.GCOTools; }
    return { rows: [['Each person’s share', share, 'money'], ['Total spent', total, 'money'], ['Payments to settle', moves.length, 'int']], note: moves.length ? moves.join('<br>') : 'Everyone is settled.' };
  },
  test: [{ in: { x: 'Asha 1200\nRavi 300\nMeena 0' }, expect: { 'Each person’s share': 500, '_note': 'Meena pays Asha' } }]
});
