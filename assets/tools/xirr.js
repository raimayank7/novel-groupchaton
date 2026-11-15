/* Infinity by GroupChatOn — xirr. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'xirr', {
  inputs: [{ k: 'f', label: 'One cash flow per line: date and amount (money out with −, money in with +)', type: 'textarea', rows: 7, value: '2025-01-01 -10000\n2026-01-01 11000', hint: 'Dates as YYYY-MM-DD or DD/MM/YYYY.' }],
  calc: function (v, X) {
    var flows = [];
    String(v.f).split('\n').forEach(function (line) {
      var m = line.trim().match(/^(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})[\s,;]+(-?[\d,]*\.?\d+)$/); if (!m) return;
      var d = m[1].indexOf('-') === 4 ? new Date(m[1] + 'T00:00:00') : (function (p) { return new Date(+p[2], +p[1] - 1, +p[0]); })(m[1].split(/[\/.-]/));
      flows.push([d, parseFloat(m[2].replace(/,/g, ''))]);
    });
    X.need(flows.length >= 2, 'Add at least two lines: a date and an amount.');
    X.need(flows.some(function (f) { return f[1] < 0; }) && flows.some(function (f) { return f[1] > 0; }), 'You need at least one negative (invested) and one positive (received) amount.');
    var t0 = flows[0][0];
    function f(r) { return flows.reduce(function (s, x) { return s + x[1] / Math.pow(1 + r, (x[0] - t0) / 864e5 / 365); }, 0); }
    var lo = -0.9999, hi = 10, r = 0.1;
    for (var i = 0; i < 200; i++) { r = (lo + hi) / 2; if (f(r) > 0) lo = r; else hi = r; }
    var out = flows.reduce(function (s, x) { return s + (x[1] < 0 ? -x[1] : 0); }, 0), inn = flows.reduce(function (s, x) { return s + (x[1] > 0 ? x[1] : 0); }, 0);
    return { rows: [['XIRR (yearly return)', r * 100, 'pct'], ['Total invested', out, 'money'], ['Total received', inn, 'money'], ['Gain', inn - out, 'money']], note: 'Same method as Excel’s XIRR: days ÷ 365.' };
  },
  test: [{ in: { f: '2025-01-01 -10000\n2026-01-01 11000' }, expect: { 'XIRR (yearly return)': 10 } }, { in: { f: '01/01/2024 -1000\n01/01/2025 -1000\n01/01/2026 2300' }, expect: { 'XIRR (yearly return)': 9.6777 } }]
});
