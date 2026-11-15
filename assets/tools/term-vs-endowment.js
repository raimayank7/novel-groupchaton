/* Infinity by GroupChatOn — term-vs-endowment. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'term-vs-endowment', {
  inputs: [{ k: 'ep', label: 'Endowment / money-back premium a year', money: true, value: 50000 }, { k: 'em', label: 'Its estimated maturity amount', money: true, value: 1500000 },
    { k: 'tp', label: 'Term plan premium a year (same cover)', money: true, value: 8000 }, { k: 'y', label: 'Policy term', suffix: 'years', value: 20 }, { k: 'r', label: 'Return if you invest the difference', suffix: '% a year', value: 10 }],
  calc: function (v, X) {
    var diff = v.ep - v.tp, fv = 0; for (var i = 0; i < v.y; i++) fv = (fv + diff) * (1 + v.r / 100);
    return { rows: [['Better choice', fv > v.em ? 'Term plan + invest the rest' : 'The endowment plan', null, 'by ' + X.money(Math.abs(fv - v.em))], ['Term + investing gives', fv, 'money'], ['Endowment gives', v.em, 'money'], ['Amount invested each year', diff, 'money']],
      note: 'Both give the same life cover; the difference is where the savings go. Check the endowment’s real return with the LIC Maturity Calculator.' };
  },
  test: [{ in: { ep: 50000, em: 1500000, tp: 8000, y: 20, r: 10 }, expect: { 'Term + investing gives': 2646104.98 } }]
});
