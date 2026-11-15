/* Infinity by GroupChatOn — statistics. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'statistics', {
  inputs: [{ k: 'x', label: 'X values', type: 'textarea', value: '1 2 3 4 5' }, { k: 'y', label: 'Y values (optional, for regression)', type: 'textarea', value: '2 4 5 4 5' }],
  calc: function (v, X) {
    var x = X.nums(v.x), y = X.nums(v.y), n = x.length; X.need(n >= 2, 'Enter at least two X values.');
    var mean = function (a) { return a.reduce(function (s, q) { return s + q; }, 0) / a.length; }, mx = mean(x);
    var vx = x.reduce(function (s, q) { return s + (q - mx) * (q - mx); }, 0);
    var rows = [['Mean of X', mx], ['Variance (sample)', vx / (n - 1)], ['Variance (population)', vx / n], ['Standard deviation (sample)', Math.sqrt(vx / (n - 1))]];
    if (y.length) {
      X.need(y.length === n, 'X and Y need the same number of values.');
      var my = mean(y), sxy = 0, vy = 0; for (var i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); vy += (y[i] - my) * (y[i] - my); }
      var b = sxy / vx, a = my - b * mx, r = sxy / Math.sqrt(vx * vy);
      rows = [['Line of best fit', 'y = ' + X.num(b, 4) + 'x ' + (a < 0 ? '− ' : '+ ') + X.num(Math.abs(a), 4)], ['Slope', b], ['Intercept', a], ['Correlation (r)', r], ['R²', r * r]].concat(rows);
    }
    return { rows: rows };
  },
  test: [{ in: { x: '1 2 3 4 5', y: '2 4 5 4 5' }, expect: { 'Slope': 0.6, 'Intercept': 2.2, 'Correlation (r)': 0.774597 } }]
});
